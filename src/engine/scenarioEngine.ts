/**
 * scenarioEngine.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Applies a ScenarioModification to a FinancialProfile and re-runs the
 * complete engine pipeline to produce a ScenarioResult with before/after
 * comparisons. Used by the Financial Scenario Simulator (Phase 5).
 *
 * This module orchestrates all other engine modules — it must remain pure.
 */

import type { FinancialProfile } from '../types/FinancialProfile';
import type { CashflowEvent, ScenarioModification, ScenarioResult } from '../types/CashflowEvent';
import { calculateConservativeIncome } from './incomeCalculator';
import { calculateObligations } from './obligationsCalculator';
import { calculateSurplus } from './surplusCalculator';
import { calculateReserve } from './reserveCalculator';
import { calculateSipCapacity } from './sipCapacityCalculator';
import { classifyReadinessTier } from './readinessTierClassifier';
import { detectCashflowConflicts } from './cashflowConflictDetector';
import { validateProfileCompleteness } from './index';

/** Produce a deep clone of a FinancialProfile to avoid mutating the original */
function cloneProfile(profile: FinancialProfile): FinancialProfile {
  return JSON.parse(JSON.stringify(profile)) as FinancialProfile;
}

/**
 * Run the entire engine pipeline for a given profile and return key metrics.
 */
function runPipeline(
  profile: FinancialProfile,
  events: CashflowEvent[]
) {
  const { missing } = validateProfileCompleteness(profile);
  const hasMissing = missing.length > 0;

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
    hasMissingCriticalData: hasMissing,
    missingFields: missing,
  });
  const conflicts = detectCashflowConflicts(
    profile.income.creditDay,
    events,
    profile.savings.accessibleEmergencyFund
  );

  return {
    surplus: surplusResult.availableSurplus,
    tier: tierResult.tier,
    conflicts,
    sipMin: sipResult.indicativeSipMin,
    sipMax: sipResult.indicativeSipMax,
    reserveGap: reserveResult.reserveGap,
  };
}

/**
 * Apply a scenario modification to a profile copy and re-run the engine.
 * Supports a single modification or an array of stacked modifications.
 *
 * @param profile      - The user's current financial profile
 * @param modification - Single ScenarioModification or array of stacked modifications
 * @param events       - Current cashflow events (for conflict detection)
 * @returns ScenarioResult with before/after comparison
 */
export function runScenario(
  profile: FinancialProfile,
  modification: ScenarioModification | ScenarioModification[],
  events: CashflowEvent[] = []
): ScenarioResult {
  const mods = Array.isArray(modification) ? modification : [modification];
  const primaryMod = mods[0] || { type: 'reduced_income' as const };

  // ── Original pipeline ─────────────────────────────────────────────────
  const original = runPipeline(profile, events);

  // ── Apply modification(s) to a clone ──────────────────────────────────
  const modified = cloneProfile(profile);
  const modifiedEvents = [...events];
  const explanations: string[] = [];

  for (const mod of mods) {
    switch (mod.type) {
      case 'delayed_salary': {
        const delay = mod.salaryDelayDays ?? 0;
        modified.income.creditDay = Math.min(31, modified.income.creditDay + delay);
        // Also shift the salary event in the events array
        for (const event of modifiedEvents) {
          if (event.category === 'salary') {
            event.dayOfMonth = Math.min(31, event.dayOfMonth + delay);
          }
        }
        explanations.push(
          `Salary credit delayed by ${delay} days shifts cash-flow timing, potentially pressuring debit dates.`
        );
        break;
      }

      case 'increased_rent': {
        const increase = mod.rentIncreaseAmount ?? 0;
        modified.expenses.rent += increase;
        explanations.push(
          `Monthly rent increased by ₹${increase.toLocaleString('en-IN')}, directly reducing surplus.`
        );
        break;
      }

      case 'unexpected_medical_expense': {
        const shock = mod.medicalExpenseAmount ?? 0;
        modified.expenses.discretionary += shock;
        explanations.push(
          `One-time medical expense shock of ₹${shock.toLocaleString('en-IN')} incurred this month.`
        );
        break;
      }

      case 'reduced_income': {
        const fraction = Math.min(1, Math.max(0, mod.incomeReductionFraction ?? 0));
        modified.income.monthlyTakeHome *= (1 - fraction);
        if (modified.income.variableLowMonth !== undefined) {
          modified.income.variableLowMonth *= (1 - fraction);
        }
        if (modified.income.variableTypicalMonth !== undefined) {
          modified.income.variableTypicalMonth *= (1 - fraction);
        }
        explanations.push(
          `Monthly income reduced by ${Math.round(fraction * 100)}%, compressing available liquidity.`
        );
        break;
      }

      case 'new_emi': {
        const amount = mod.newEmiAmount ?? 0;
        modified.liabilities.activeEmisMonthly += amount;
        if (mod.newEmiDay) {
          modifiedEvents.push({
            id: `scenario-new-emi-${Math.random().toString(36).substring(2, 7)}`,
            profileId: profile.id,
            title: 'New EMI',
            category: 'emi',
            amount,
            dayOfMonth: mod.newEmiDay,
            isInflow: false,
            isRecurring: true,
            createdAt: new Date().toISOString(),
          });
        }
        explanations.push(
          `New recurring monthly EMI of ₹${amount.toLocaleString('en-IN')}${mod.newEmiDay ? ` on day ${mod.newEmiDay}` : ''} added.`
        );
        break;
      }

      case 'variable_income_month': {
        const monthType = mod.variableIncomeMonth ?? 'typical';
        let targetIncome = modified.income.monthlyTakeHome;
        if (monthType === 'low' && modified.income.variableLowMonth !== undefined) {
          targetIncome = modified.income.variableLowMonth;
        } else if (monthType === 'high' && modified.income.variableHighMonth !== undefined) {
          targetIncome = modified.income.variableHighMonth;
        } else if (modified.income.variableTypicalMonth !== undefined) {
          targetIncome = modified.income.variableTypicalMonth;
        }
        modified.income.monthlyTakeHome = targetIncome;
        // Also align variable month parameters so conservative income uses this simulated month
        modified.income.variableLowMonth = targetIncome;
        modified.income.variableTypicalMonth = targetIncome;
        modified.income.variableHighMonth = targetIncome;
        explanations.push(
          `Simulated a ${monthType}-income month (₹${Math.round(targetIncome).toLocaleString('en-IN')}) for variable income.`
        );
        break;
      }
    }
  }

  // ── Modified pipeline ─────────────────────────────────────────────────
  const result = runPipeline(modified, modifiedEvents);

  // ── Build explanation ─────────────────────────────────────────────────
  const delta = result.surplus - original.surplus;
  const direction = delta < 0 ? 'decreased' : 'increased';
  const absAmount = Math.abs(Math.round(delta)).toLocaleString('en-IN');

  const combinedExplanation =
    mods.length === 1
      ? (primaryMod.type === 'reduced_income'
          ? `Your expected monthly income has decreased by ${Math.round((primaryMod.incomeReductionFraction ?? 0) * 100)}%. After accounting for your recurring expenses, your estimated available surplus has ${direction} by ₹${absAmount}.`
          : primaryMod.type === 'delayed_salary'
          ? `Your salary credit was delayed by ${primaryMod.salaryDelayDays ?? 0} days. This shifts when funds are available, potentially creating cash-flow pressure if outflows occur before the salary lands.`
          : primaryMod.type === 'increased_rent'
          ? `Your monthly rent increased by ₹${(primaryMod.rentIncreaseAmount ?? 0).toLocaleString('en-IN')}. This directly reduces your available surplus.`
          : primaryMod.type === 'unexpected_medical_expense'
          ? `A one-time medical expense of ₹${(primaryMod.medicalExpenseAmount ?? 0).toLocaleString('en-IN')} was added this month, reducing your available surplus.`
          : primaryMod.type === 'new_emi'
          ? `A new monthly EMI of ₹${(primaryMod.newEmiAmount ?? 0).toLocaleString('en-IN')} was added. This increases your fixed obligations and reduces your available surplus.`
          : `Simulating a ${primaryMod.variableIncomeMonth ?? 'typical'}-income month shows how income variability affects your monthly surplus.`)
      : `Combined scenarios (${mods.length} stacked): ${explanations.join(' ')} Overall surplus changed by ${delta < 0 ? '-' : '+'}₹${absAmount}, shifting readiness to ${result.tier}.`;

  return {
    scenarioType: primaryMod.type,
    originalSurplus: Math.round(original.surplus),
    newSurplus: Math.round(result.surplus),
    delta: Math.round(delta),
    originalReadinessTier: original.tier,
    newReadinessTier: result.tier,
    originalReserveGap: Math.round(original.reserveGap),
    newReserveGap: Math.round(result.reserveGap),
    originalSipMin: Math.round(original.sipMin),
    originalSipMax: Math.round(original.sipMax),
    newSipMin: Math.round(result.sipMin),
    newSipMax: Math.round(result.sipMax),
    newConflicts: result.conflicts,
    originalConflictCount: original.conflicts.length,
    explanation: combinedExplanation,
    stackedModifications: mods,
    createdAt: new Date().toISOString(),
  };
}

