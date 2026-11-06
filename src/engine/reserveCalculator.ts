/**
 * reserveCalculator.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Calculates the emergency reserve target, the gap between the target and
 * the user's existing liquid savings, and the recommended monthly contribution
 * towards closing that gap.
 *
 * The reserve months target is a user-configurable planning assumption (3–6 months)
 * and is NOT presented as a universal rule.
 */

export interface ReserveResult {
  /** Essential monthly expenses × reserve months target */
  targetReserve: number;
  reserveMonthsUsed: number;
  existingEmergencyFund: number;
  /** Clamped to 0 minimum — cannot be negative */
  reserveGap: number;
  /**
   * Recommended monthly contribution to close the gap.
   * = min(availableSurplus × 0.30, reserveGap / 12)
   * = 0 if gap is already closed
   */
  plannedMonthlyReserveContribution: number;
  /** Number of months to close the gap at the planned contribution rate */
  monthsToCloseGap: number | null;
  warnings: string[];
}

/**
 * Calculate the emergency reserve position.
 *
 * @param essentialExpenses         - Monthly essential expenses (from obligationsCalculator)
 * @param accessibleEmergencyFund   - Liquid savings accessible within ~7 days
 * @param reserveMonthsTarget       - Planning assumption: 3–6 months (default 3)
 * @param availableSurplus          - From surplusCalculator (used to cap the contribution)
 * @returns ReserveResult
 */
export function calculateReserve(
  essentialExpenses: number,
  accessibleEmergencyFund: number,
  reserveMonthsTarget: number,
  availableSurplus: number
): ReserveResult {
  const warnings: string[] = [];

  // Clamp reserveMonths to [1, 12]
  const reserveMonths = Math.min(12, Math.max(1, reserveMonthsTarget));

  const targetReserve = essentialExpenses * reserveMonths;
  const existingFund = Math.max(0, accessibleEmergencyFund);
  const rawGap = targetReserve - existingFund;
  const reserveGap = Math.max(0, rawGap);

  let plannedMonthlyReserveContribution = 0;
  let monthsToCloseGap: number | null = null;

  if (reserveGap > 0) {
    if (availableSurplus <= 0) {
      warnings.push(
        'No surplus available to build an emergency reserve. Prioritise reducing obligations before committing to new investments.'
      );
      plannedMonthlyReserveContribution = 0;
    } else {
      // Contribution = min(30% of surplus, 1/12 of the gap)
      const thirtyPctSurplus = availableSurplus * 0.30;
      const twelfthOfGap = reserveGap / 12;
      plannedMonthlyReserveContribution = Math.min(thirtyPctSurplus, twelfthOfGap);
      plannedMonthlyReserveContribution = Math.round(plannedMonthlyReserveContribution);

      if (plannedMonthlyReserveContribution > 0) {
        monthsToCloseGap = Math.ceil(reserveGap / plannedMonthlyReserveContribution);
      }

      warnings.push(
        `Emergency reserve gap of ₹${reserveGap.toLocaleString('en-IN')} detected. A monthly contribution of ₹${plannedMonthlyReserveContribution.toLocaleString('en-IN')} has been set aside before calculating SIP capacity.`
      );
    }
  } else {
    warnings.push(
      `Emergency reserve appears funded (₹${existingFund.toLocaleString('en-IN')} ≥ target ₹${targetReserve.toLocaleString('en-IN')} for ${reserveMonths} months).`
    );
  }

  if (essentialExpenses === 0) {
    warnings.push(
      'Essential expenses are ₹0 — the emergency reserve target cannot be computed accurately without expense data.'
    );
  }

  return {
    targetReserve,
    reserveMonthsUsed: reserveMonths,
    existingEmergencyFund: existingFund,
    reserveGap,
    plannedMonthlyReserveContribution,
    monthsToCloseGap,
    warnings,
  };
}

