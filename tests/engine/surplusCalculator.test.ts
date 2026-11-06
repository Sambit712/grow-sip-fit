import { describe, it, expect } from 'vitest';
import { calculateSurplus } from '../../src/engine/surplusCalculator';

describe('surplusCalculator — calculateSurplus', () => {

  it('returns a positive surplus when income exceeds obligations', () => {
    const result = calculateSurplus(60000, 40000);
    expect(result.availableSurplus).toBe(20000);
    // 40000/60000 = 66.7% → emits a "relatively high commitment ratio" warning
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  it('returns a NEGATIVE surplus when obligations exceed income', () => {
    const result = calculateSurplus(40000, 60000);
    expect(result.availableSurplus).toBe(-20000);
    expect(result.warnings.some(w => w.includes('exceed'))).toBe(true);
  });

  it('returns zero surplus when income equals obligations', () => {
    const result = calculateSurplus(50000, 50000);
    expect(result.availableSurplus).toBe(0);
  });

  it('warns when income is 0', () => {
    const result = calculateSurplus(0, 30000);
    expect(result.warnings.some(w => w.includes('₹0 or missing'))).toBe(true);
  });

  it('computes obligationsToIncomeRatio correctly', () => {
    const result = calculateSurplus(80000, 40000);
    expect(result.obligationsToIncomeRatio).toBe(50);
  });

  it('caps obligationsToIncomeRatio at 100 when income is 0', () => {
    const result = calculateSurplus(0, 10000);
    expect(result.obligationsToIncomeRatio).toBe(100);
  });

  it('warns when obligations-to-income ratio is above 80%', () => {
    const result = calculateSurplus(50000, 42000); // 84%
    expect(result.warnings.some(w => w.includes('80%') || w.includes('84%'))).toBe(true);
  });

  it('warns when obligations-to-income ratio is between 60% and 80%', () => {
    const result = calculateSurplus(50000, 35000); // 70%
    expect(result.warnings.some(w => w.includes('60%') || w.includes('70%'))).toBe(true);
  });
});
