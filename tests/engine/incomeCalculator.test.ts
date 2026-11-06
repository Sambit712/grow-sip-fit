import { describe, it, expect } from 'vitest';
import { calculateConservativeIncome } from '../../src/engine/incomeCalculator';
import type { FinancialProfile } from '../../src/types/FinancialProfile';

/** Helper to build a minimal income object */
function income(overrides: Partial<FinancialProfile['income']>): FinancialProfile['income'] {
  return {
    monthlyTakeHome: 0,
    type: 'salaried_fixed',
    creditDay: 5,
    otherReliableIncome: 0,
    isStableLast6Months: true,
    ...overrides,
  };
}

describe('incomeCalculator — calculateConservativeIncome', () => {

  // ── Salaried Fixed ──────────────────────────────────────────────────
  describe('salaried_fixed', () => {
    it('returns take-home + other reliable income', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_fixed',
        monthlyTakeHome: 60000,
        otherReliableIncome: 5000,
      }));
      expect(result.conservativeMonthlyIncome).toBe(65000);
      expect(result.requiresMoreInfo).toBe(false);
    });

    it('returns 0 and flags requiresMoreInfo when income is 0', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_fixed',
        monthlyTakeHome: 0,
        otherReliableIncome: 0,
      }));
      expect(result.conservativeMonthlyIncome).toBe(0);
      expect(result.requiresMoreInfo).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('adds a warning when income has been unstable', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_fixed',
        monthlyTakeHome: 50000,
        isStableLast6Months: false,
      }));
      expect(result.warnings.some(w => w.includes('stable'))).toBe(true);
    });

    it('handles negative monthlyTakeHome gracefully (clamps to 0)', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_fixed',
        monthlyTakeHome: -10000,
      }));
      expect(result.conservativeMonthlyIncome).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Salaried Variable ───────────────────────────────────────────────
  describe('salaried_variable', () => {
    it('uses min(typical, low×1.1) — never the high month', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_variable',
        variableLowMonth: 40000,
        variableTypicalMonth: 55000,
        variableHighMonth: 90000,
        otherReliableIncome: 0,
      }));
      // min(55000, 40000*1.1=44000) = 44000
      expect(result.conservativeMonthlyIncome).toBe(44000);
      expect(result.requiresMoreInfo).toBe(false);
    });

    it('does NOT use the high-income month as the baseline', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_variable',
        variableLowMonth: 30000,
        variableTypicalMonth: 50000,
        variableHighMonth: 120000,
      }));
      // Should never return 120000
      expect(result.conservativeMonthlyIncome).toBeLessThanOrEqual(50000);
    });

    it('uses typical month when no low month is provided', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_variable',
        variableTypicalMonth: 55000,
        variableHighMonth: 90000,
      }));
      expect(result.conservativeMonthlyIncome).toBe(55000);
    });

    it('returns requiresMoreInfo when neither low nor typical provided', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_variable',
        variableLowMonth: 0,
        variableTypicalMonth: 0,
      }));
      expect(result.requiresMoreInfo).toBe(true);
      expect(result.conservativeMonthlyIncome).toBe(0);
    });

    it('includes other reliable income in the total', () => {
      const result = calculateConservativeIncome(income({
        type: 'salaried_variable',
        variableLowMonth: 40000,
        variableTypicalMonth: 55000,
        otherReliableIncome: 5000,
      }));
      // 44000 + 5000
      expect(result.conservativeMonthlyIncome).toBe(49000);
    });
  });

  // ── Freelance / Self-employed ───────────────────────────────────────
  describe('freelance_self_employed', () => {
    it('uses conservative low-month baseline', () => {
      const result = calculateConservativeIncome(income({
        type: 'freelance_self_employed',
        variableLowMonth: 25000,
        variableTypicalMonth: 60000,
        variableHighMonth: 100000,
      }));
      // min(60000, 25000*1.1=27500) = 27500
      expect(result.conservativeMonthlyIncome).toBeCloseTo(27500, 0);
    });

    it('warns that variable income is not guaranteed', () => {
      const result = calculateConservativeIncome(income({
        type: 'freelance_self_employed',
        variableLowMonth: 25000,
        variableTypicalMonth: 60000,
      }));
      expect(result.warnings.some(w => w.toLowerCase().includes('not guaranteed'))).toBe(true);
    });
  });

  // ── Unemployed ──────────────────────────────────────────────────────
  describe('unemployed', () => {
    it('returns 0 income and flags requiresMoreInfo', () => {
      const result = calculateConservativeIncome(income({ type: 'unemployed' }));
      expect(result.conservativeMonthlyIncome).toBe(0);
      expect(result.requiresMoreInfo).toBe(true);
    });
  });
});
