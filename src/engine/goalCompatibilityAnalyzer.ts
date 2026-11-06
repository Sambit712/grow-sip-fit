/**
 * goalCompatibilityAnalyzer.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Evaluates whether the user's financial goal is compatible with their
 * indicative SIP capacity. Uses 0% real return assumption intentionally —
 * this makes the required saving transparent and conservative without
 * promising any market returns.
 */

import type { FinancialProfile } from '../types/FinancialProfile';

export interface GoalCompatibilityResult {
  goalPurpose: string;
  targetAmount: number;
  horizonYears: number;
  alreadySaved: number;
  savingsGap: number;
  /**
   * Monthly saving required to close the gap at 0% real return.
   * This is intentionally conservative — no market return projection.
   */
  requiredMonthlySaving: number;
  /** true if horizon < 3 years — triggers a liquidity risk warning */
  isHorizonShort: boolean;
  compatibilityNote: string;
  warnings: string[];
}

/**
 * Analyze the compatibility between the user's goal and their SIP capacity.
 *
 * @param goal            - Goal section of FinancialProfile
 * @param indicativeSipMin - Minimum indicative SIP (from sipCapacityCalculator)
 * @param indicativeSipMax - Maximum indicative SIP (from sipCapacityCalculator)
 * @returns GoalCompatibilityResult
 */
export function analyzeGoalCompatibility(
  goal: FinancialProfile['goal'],
  indicativeSipMin: number,
  indicativeSipMax: number
): GoalCompatibilityResult {
  const warnings: string[] = [];

  const { purpose, targetAmount, horizonYears, alreadySaved } = goal;

  const savingsGap = Math.max(0, targetAmount - Math.max(0, alreadySaved));
  const totalMonths = horizonYears * 12;

  // Required monthly saving at 0% real return (conservative transparency)
  const requiredMonthlySaving =
    totalMonths > 0 ? Math.ceil(savingsGap / totalMonths) : savingsGap;

  const isHorizonShort = horizonYears < 3;

  // Build compatibility note
  let compatibilityNote: string;

  if (targetAmount <= 0) {
    compatibilityNote = 'No specific financial target has been set. The SIP range shown is based on your monthly surplus alone.';
    warnings.push('No goal target amount entered. Goal compatibility cannot be evaluated.');
  } else if (savingsGap <= 0) {
    compatibilityNote = `You have already saved enough (₹${alreadySaved.toLocaleString('en-IN')}) to meet your goal of ₹${targetAmount.toLocaleString('en-IN')} for ${purpose}.`;
  } else if (indicativeSipMax <= 0) {
    compatibilityNote = `Your goal of accumulating ₹${targetAmount.toLocaleString('en-IN')} for ${purpose} requires ₹${requiredMonthlySaving.toLocaleString('en-IN')}/month (at 0% return), but your current surplus does not support any new SIP.`;
    warnings.push('No SIP capacity available. Building a surplus is the priority before investing towards this goal.');
  } else if (requiredMonthlySaving > indicativeSipMax) {
    const shortfall = requiredMonthlySaving - indicativeSipMax;
    compatibilityNote = `To reach ₹${targetAmount.toLocaleString('en-IN')} for ${purpose} in ${horizonYears} years requires ₹${requiredMonthlySaving.toLocaleString('en-IN')}/month (0% return assumption). Your current capacity (₹${indicativeSipMax.toLocaleString('en-IN')}/month) is ₹${shortfall.toLocaleString('en-IN')} short. Consider extending the horizon, reducing the target, or increasing income.`;
    warnings.push(`Savings gap of ₹${shortfall.toLocaleString('en-IN')}/month between required saving and indicative SIP capacity.`);
  } else {
    compatibilityNote = `Your indicative SIP capacity (₹${indicativeSipMin.toLocaleString('en-IN')}–₹${indicativeSipMax.toLocaleString('en-IN')}/month) appears sufficient to work towards ₹${targetAmount.toLocaleString('en-IN')} for ${purpose} over ${horizonYears} years, assuming consistent contributions and 0% real return as a baseline.`;
  }

  if (isHorizonShort) {
    warnings.push(
      `Your investment horizon of ${horizonYears} year${horizonYears !== 1 ? 's' : ''} is relatively short. Short investment horizons carry higher market uncertainty for equity SIPs. Consider liquidity risk and whether a debt or liquid fund is more appropriate for this goal.`
    );
  }

  return {
    goalPurpose: purpose,
    targetAmount,
    horizonYears,
    alreadySaved: Math.max(0, alreadySaved),
    savingsGap,
    requiredMonthlySaving,
    isHorizonShort,
    compatibilityNote,
    warnings,
  };
}

