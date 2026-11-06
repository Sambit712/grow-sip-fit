/**
 * sipCapacityCalculator.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Derives the indicative SIP contribution capacity range from the uncommitted
 * surplus after deducting the reserve-building contribution and an irregular
 * expense buffer (10%).
 *
 * Both returned values are rounded to the nearest ₹500 for practical utility.
 * If the uncommitted surplus is 0 or negative, both are 0 — no positive
 * SIP recommendation is forced.
 */

/** Round to the nearest multiple of `step` */
function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export interface SipCapacityResult {
  uncommittedSurplus: number;
  /** Conservative lower bound (60% of uncommitted, rounded to ₹500) */
  indicativeSipMin: number;
  /** Upper bound (100% of uncommitted, rounded to ₹500) */
  indicativeSipMax: number;
  /** 10% buffer deducted for irregular/unexpected expenses */
  irregularExpenseBuffer: number;
  warnings: string[];
}

/**
 * Calculate the indicative SIP affordability range.
 *
 * @param availableSurplus                 - From surplusCalculator (may be negative)
 * @param plannedMonthlyReserveContribution - From reserveCalculator
 * @returns SipCapacityResult
 */
export function calculateSipCapacity(
  availableSurplus: number,
  plannedMonthlyReserveContribution: number
): SipCapacityResult {
  const warnings: string[] = [];

  if (availableSurplus <= 0) {
    warnings.push(
      'No monthly surplus is available after accounting for obligations. There is no estimated capacity for an additional recurring investment at this time.'
    );
    return {
      uncommittedSurplus: 0,
      indicativeSipMin: 0,
      indicativeSipMax: 0,
      irregularExpenseBuffer: 0,
      warnings,
    };
  }

  // Deduct reserve contribution
  const afterReserve = availableSurplus - plannedMonthlyReserveContribution;

  if (afterReserve <= 0) {
    warnings.push(
      'After setting aside the emergency reserve contribution, no surplus remains for a new SIP. Focus on building your emergency fund first.'
    );
    return {
      uncommittedSurplus: 0,
      indicativeSipMin: 0,
      indicativeSipMax: 0,
      irregularExpenseBuffer: 0,
      warnings,
    };
  }

  // Deduct 10% buffer for irregular expenses (medical, travel, maintenance, etc.)
  const irregularExpenseBuffer = Math.round(afterReserve * 0.10);
  const uncommittedSurplus = afterReserve - irregularExpenseBuffer;

  if (uncommittedSurplus <= 0) {
    warnings.push(
      'After deducting the 10% irregular expense buffer, no surplus remains for a new SIP.'
    );
    return {
      uncommittedSurplus: 0,
      indicativeSipMin: 0,
      indicativeSipMax: 0,
      irregularExpenseBuffer,
      warnings,
    };
  }

  // Range: 60%–100% of uncommitted surplus, rounded to nearest ₹500
  const rawMin = uncommittedSurplus * 0.6;
  const rawMax = uncommittedSurplus;

  const indicativeSipMin = Math.max(500, roundToNearest(rawMin, 500));
  const indicativeSipMax = Math.max(500, roundToNearest(rawMax, 500));

  warnings.push(
    `Indicative SIP range: ₹${indicativeSipMin.toLocaleString('en-IN')}–₹${indicativeSipMax.toLocaleString('en-IN')} / month. This is an estimate based on the information provided, not a guaranteed safe investment amount.`
  );

  return {
    uncommittedSurplus,
    indicativeSipMin,
    indicativeSipMax,
    irregularExpenseBuffer,
    warnings,
  };
}

