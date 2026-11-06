import { describe, it, expect } from 'vitest';
import { calculateReserve } from '../../src/engine/reserveCalculator';

describe('reserveCalculator — calculateReserve', () => {

  it('computes target reserve as essentialExpenses × reserveMonths', () => {
    const result = calculateReserve(20000, 0, 3, 50000);
    expect(result.targetReserve).toBe(60000);
    expect(result.reserveMonthsUsed).toBe(3);
  });

  it('zero emergency fund → reserve gap equals target reserve', () => {
    const result = calculateReserve(20000, 0, 3, 50000);
    expect(result.reserveGap).toBe(60000);
    expect(result.existingEmergencyFund).toBe(0);
  });

  it('fully-funded reserve → gap is 0', () => {
    const result = calculateReserve(20000, 100000, 3, 50000);
    expect(result.reserveGap).toBe(0);
    expect(result.plannedMonthlyReserveContribution).toBe(0);
  });

  it('partially-funded reserve → gap = target - existing', () => {
    const result = calculateReserve(20000, 30000, 3, 50000);
    // target = 60000, existing = 30000, gap = 30000
    expect(result.reserveGap).toBe(30000);
  });

  it('planned contribution = min(surplus×0.30, gap/12)', () => {
    // surplus=50000: 30%=15000; gap/12=30000/12=2500 → min=2500
    const result = calculateReserve(20000, 30000, 3, 50000);
    expect(result.plannedMonthlyReserveContribution).toBe(2500);
  });

  it('planned contribution limited to 30% of surplus when gap/12 is large', () => {
    // essentials=50000, existing=0 → target=150000, gap=150000, gap/12=12500
    // surplus=30000 → 30%=9000; min(9000,12500)=9000
    const result = calculateReserve(50000, 0, 3, 30000);
    expect(result.plannedMonthlyReserveContribution).toBe(9000);
  });

  it('no contribution when surplus is 0 or negative', () => {
    const result = calculateReserve(20000, 0, 3, 0);
    expect(result.plannedMonthlyReserveContribution).toBe(0);
    expect(result.warnings.some(w => w.includes('No surplus'))).toBe(true);
  });

  it('reserve gap never goes negative', () => {
    // existing > target
    const result = calculateReserve(10000, 500000, 6, 50000);
    expect(result.reserveGap).toBe(0);
  });

  it('clamps reserveMonths to [1,12]', () => {
    const r1 = calculateReserve(20000, 0, 0, 50000);  // below 1 → 1
    expect(r1.reserveMonthsUsed).toBe(1);

    const r2 = calculateReserve(20000, 0, 50, 50000); // above 12 → 12
    expect(r2.reserveMonthsUsed).toBe(12);
  });

  it('warns when essential expenses are 0', () => {
    const result = calculateReserve(0, 0, 3, 50000);
    expect(result.warnings.some(w => w.includes('₹0'))).toBe(true);
  });
});

