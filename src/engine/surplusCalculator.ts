/**
 * surplusCalculator.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Derives the available monthly surplus as the difference between conservative
 * income and total obligations. The result CAN be negative — negative surplus
 * is surfaced as-is to the report layer, never clamped to 0.
 */

export interface SurplusResult {
  conservativeMonthlyIncome: number;
  totalObligations: number;
  /** Net available surplus — may be negative */
  availableSurplus: number;
  /** Obligations as a percentage of income (0–100+) */
  obligationsToIncomeRatio: number;
  warnings: string[];
}

/**
 * Calculate the available monthly surplus.
 *
 * @param conservativeMonthlyIncome - Output from incomeCalculator
 * @param totalObligations          - Output from obligationsCalculator
 * @returns SurplusResult
 */
export function calculateSurplus(
  conservativeMonthlyIncome: number,
  totalObligations: number
): SurplusResult {
  const warnings: string[] = [];

  const availableSurplus = conservativeMonthlyIncome - totalObligations;

  const obligationsToIncomeRatio =
    conservativeMonthlyIncome > 0
      ? Math.round((totalObligations / conservativeMonthlyIncome) * 100)
      : 100;

  if (conservativeMonthlyIncome <= 0) {
    warnings.push(
      'Income is ₹0 or missing. Surplus cannot be calculated without an income entry.'
    );
  }

  if (availableSurplus < 0) {
    warnings.push(
      `Monthly obligations (₹${totalObligations.toLocaleString('en-IN')}) exceed conservative income (₹${conservativeMonthlyIncome.toLocaleString('en-IN')}). There is currently no estimated surplus for a new SIP.`
    );
  } else if (obligationsToIncomeRatio >= 80) {
    warnings.push(
      `Obligations consume ${obligationsToIncomeRatio}% of income, leaving very little financial flexibility.`
    );
  } else if (obligationsToIncomeRatio >= 60) {
    warnings.push(
      `Obligations consume ${obligationsToIncomeRatio}% of income. This is a relatively high commitment ratio.`
    );
  }

  return {
    conservativeMonthlyIncome,
    totalObligations,
    availableSurplus,
    obligationsToIncomeRatio,
    warnings,
  };
}

