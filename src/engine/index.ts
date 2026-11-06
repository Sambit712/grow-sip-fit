/**
 * index.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Public API for the engine. Exports all individual modules and provides
 * a single `runFullEngine()` orchestrator that produces a complete
 * FinancialReport from a FinancialProfile.
 *
 * Also exports `validateProfileCompleteness()` used by the report layer
 * and by the scenario engine.
 */

export { calculateConservativeIncome } from './incomeCalculator';
export type { IncomeResult } from './incomeCalculator';

export { calculateObligations } from './obligationsCalculator';
export type { ObligationsResult } from './obligationsCalculator';

export { calculateSurplus } from './surplusCalculator';
export type { SurplusResult } from './surplusCalculator';

export { calculateReserve } from './reserveCalculator';
export type { ReserveResult } from './reserveCalculator';

export { calculateSipCapacity } from './sipCapacityCalculator';
export type { SipCapacityResult } from './sipCapacityCalculator';

export { classifyReadinessTier } from './readinessTierClassifier';
export type { ReadinessTierResult, ReadinessTierInput } from './readinessTierClassifier';

export { detectCashflowConflicts } from './cashflowConflictDetector';

export { analyzeGoalCompatibility } from './goalCompatibilityAnalyzer';
export type { GoalCompatibilityResult } from './goalCompatibilityAnalyzer';

export { runScenario } from './scenarioEngine';

import type { FinancialProfile } from '../types/FinancialProfile';
import type { CashflowEvent } from '../types/CashflowEvent';
import type { FinancialReport } from '../types/FinancialReport';

import { calculateConservativeIncome } from './incomeCalculator';
import { calculateObligations } from './obligationsCalculator';
import { calculateSurplus } from './surplusCalculator';
import { calculateReserve } from './reserveCalculator';
import { calculateSipCapacity } from './sipCapacityCalculator';
import { classifyReadinessTier } from './readinessTierClassifier';
import { detectCashflowConflicts } from './cashflowConflictDetector';
import { analyzeGoalCompatibility } from './goalCompatibilityAnalyzer';

export const ENGINE_VERSION = '1.0.0';

/** Fields that are essential for a meaningful assessment */
const CRITICAL_FIELDS: Array<{ key: string; check: (p: FinancialProfile) => boolean }> = [
  { key: 'Monthly income', check: p => p.income?.monthlyTakeHome > 0 || (p.income?.variableLowMonth ?? 0) > 0 },
  { key: 'Income type',    check: p => !!p.income?.type },
  { key: 'Rent / housing', check: p => p.expenses?.rent >= 0 },
  { key: 'Goal purpose',   check: p => !!p.goal?.purpose },
];

/**
 * Check which critical fields are missing.
 * Returns `{ missing: string[]; isComplete: boolean }`.
 */
export function validateProfileCompleteness(profile: FinancialProfile): {
  missing: string[];
  isComplete: boolean;
} {
  const missing = CRITICAL_FIELDS
    .filter(f => {
      try {
        return !f.check(profile);
      } catch {
        return true;
      }
    })
    .map(f => f.key);

  return { missing, isComplete: missing.length === 0 };
}

/**
 * Run the complete deterministic engine pipeline.
 *
 * @param profile  - The user's financial profile (may be partial)
 * @param events   - Cashflow events for the month (optional)
 * @param reportId - ID to assign to the generated report
 * @param sessionId - Assessment session ID
 * @returns FinancialReport
 */
export function runFullEngine(
  profile: FinancialProfile,
  events: CashflowEvent[] = [],
  reportId: string = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  sessionId: string = ''
): FinancialReport {
  const { missing } = validateProfileCompleteness(profile);

  // ── Layer 3 pipeline ──────────────────────────────────────────────────
  const incomeResult = calculateConservativeIncome(profile.income);
  const obligationsResult = calculateObligations(
    profile.expenses,
    profile.liabilities,
    profile.existingInvestments
  );
  const surplusResult = calculateSurplus(
    incomeResult.conservativeMonthlyIncome,
    obligationsResult.totalObligations
  );
  const reserveResult = calculateReserve(
    obligationsResult.essentialExpenses,
    profile.savings.accessibleEmergencyFund,
    profile.savings.reserveMonthsTarget,
    surplusResult.availableSurplus
  );
  const sipResult = calculateSipCapacity(
    surplusResult.availableSurplus,
    reserveResult.plannedMonthlyReserveContribution
  );
  const tierResult = classifyReadinessTier({
    availableSurplus: surplusResult.availableSurplus,
    reserveGap: reserveResult.reserveGap,
    essentialExpenses: obligationsResult.essentialExpenses,
    emiObligations: obligationsResult.emiObligations,
    totalObligations: obligationsResult.totalObligations,
    conservativeMonthlyIncome: incomeResult.conservativeMonthlyIncome,
    hasMissingCriticalData: missing.length > 0,
    missingFields: missing,
  });
  const conflicts = detectCashflowConflicts(
    profile.income.creditDay,
    events,
    profile.savings.accessibleEmergencyFund
  );
  const goalResult = analyzeGoalCompatibility(
    profile.goal,
    sipResult.indicativeSipMin,
    sipResult.indicativeSipMax
  );

  // ── Collect all assumptions ───────────────────────────────────────────
  const assumptions: string[] = [
    `Conservative income method: ${incomeResult.method}`,
    `Emergency reserve target: ${reserveResult.reserveMonthsUsed} months of essential expenses`,
    `Irregular expense buffer: 10% of post-reserve surplus`,
    'SIP range rounded to nearest ₹500',
    'Goal compatibility uses 0% real return (no market return projection)',
    'All amounts in Indian Rupees (₹)',
  ];

  // ── Derive next steps from tier ───────────────────────────────────────
  const nextSteps: Record<string, string[]> = {
    READY: [
      `Explore an SIP amount in the ₹${sipResult.indicativeSipMin.toLocaleString('en-IN')}–₹${sipResult.indicativeSipMax.toLocaleString('en-IN')} range.`,
      'Review the cash-flow calendar for SIP debit date conflicts.',
      'Revisit this assessment if your income or expenses change significantly.',
    ],
    LIMITED_FLEXIBILITY: [
      'Consider a conservative SIP at the lower end of your indicative range.',
      'Review discretionary expenses to increase your monthly surplus.',
      'Avoid increasing EMI obligations until your surplus improves.',
    ],
    LIQUIDITY_NEEDS_ATTENTION: [
      'Prioritise building your emergency fund before committing to new investments.',
      'Target 3 months of essential expenses as accessible liquid savings.',
      'Revisit SIP affordability once your reserve gap is reduced.',
    ],
    MORE_INFO_REQUIRED: [
      'Complete the missing assessment sections to generate an accurate evaluation.',
      ...missing.map(f => `Provide: ${f}`),
    ],
  };

  return {
    id: reportId,
    sessionId,
    userId: profile.userId,
    readinessTier: tierResult.tier,
    breakdown: {
      conservativeMonthlyIncome: incomeResult.conservativeMonthlyIncome,
      incomeMethod: incomeResult.method,
      essentialExpenses: obligationsResult.essentialExpenses,
      emiObligations: obligationsResult.emiObligations,
      familySupport: obligationsResult.familySupport,
      existingSipTotal: obligationsResult.existingSipTotal,
      discretionaryMinimum: obligationsResult.discretionaryMinimum,
      otherRecurring: obligationsResult.otherRecurring,
      totalObligations: obligationsResult.totalObligations,
      availableSurplus: surplusResult.availableSurplus,
      targetEmergencyReserve: reserveResult.targetReserve,
      existingEmergencyFund: reserveResult.existingEmergencyFund,
      emergencyReserveGap: reserveResult.reserveGap,
      plannedMonthlyReserveContribution: reserveResult.plannedMonthlyReserveContribution,
      irregularExpenseBuffer: sipResult.irregularExpenseBuffer,
      uncommittedSurplus: sipResult.uncommittedSurplus,
      indicativeSipMin: sipResult.indicativeSipMin,
      indicativeSipMax: sipResult.indicativeSipMax,
      reserveMonthsUsed: reserveResult.reserveMonthsUsed,
      assumptions,
    },
    goalCompatibility: {
      goalPurpose: goalResult.goalPurpose,
      targetAmount: goalResult.targetAmount,
      horizonYears: goalResult.horizonYears,
      alreadySaved: goalResult.alreadySaved,
      savingsGap: goalResult.savingsGap,
      requiredMonthlySaving: goalResult.requiredMonthlySaving,
      isHorizonShort: goalResult.isHorizonShort,
      compatibilityNote: goalResult.compatibilityNote,
    },
    cashflowConflicts: conflicts,
    nextSteps: nextSteps[tierResult.tier] ?? [],
    missingFields: missing,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
  };
}

