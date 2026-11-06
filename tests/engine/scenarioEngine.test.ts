import { describe, it, expect } from 'vitest';
import { runScenario } from '../../src/engine/scenarioEngine';
import type { FinancialProfile } from '../../src/types/FinancialProfile';
import type { ScenarioModification } from '../../src/types/CashflowEvent';

/** Build a complete, well-funded FinancialProfile for testing */
function buildProfile(overrides: Partial<FinancialProfile> = {}): FinancialProfile {
  return {
    id: 'test-user',
    userId: 'test-user',
    income: {
      monthlyTakeHome: 80000,
      type: 'salaried_fixed',
      creditDay: 5,
      otherReliableIncome: 0,
      isStableLast6Months: true,
    },
    expenses: {
      rent: 15000,
      groceriesAndUtilities: 8000,
      transportAndHealthcare: 3000,
      insurancePremiums: 2000,
      education: 0,
      subscriptions: 500,
      familySupport: 5000,
      discretionary: 5000,
      otherRecurring: 2000,
    },
    liabilities: {
      activeEmisMonthly: 10000,
      creditCardDebt: 0,
      upcomingLargeCommitments: 0,
    },
    savings: {
      accessibleEmergencyFund: 100000,
      reserveMonthsTarget: 3,
    },
    existingInvestments: {
      activeSipTotal: 3000,
      otherRecurringInvestments: 0,
    },
    goal: {
      purpose: 'Buying a house',
      targetAmount: 2000000,
      horizonYears: 5,
      alreadySaved: 500000,
    },
    risk: {
      willingness: 'moderate',
      capacity: 'moderate',
      marketUnderstanding: 'beginner',
    },
    ...overrides,
  };
}

describe('scenarioEngine — runScenario', () => {

  it('reduced_income: 20% reduction results in lower surplus', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'reduced_income', incomeReductionFraction: 0.20 };
    const result = runScenario(profile, mod);

    expect(result.scenarioType).toBe('reduced_income');
    expect(result.newSurplus).toBeLessThan(result.originalSurplus);
    expect(result.delta).toBeLessThan(0);
    // 20% of 80000 = 16000 reduction in income → surplus should drop by ~16000
    expect(Math.abs(result.delta)).toBeGreaterThanOrEqual(10000);
  });

  it('reduced_income: 100% reduction results in deeply negative surplus', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'reduced_income', incomeReductionFraction: 1.0 };
    const result = runScenario(profile, mod);
    expect(result.newSurplus).toBeLessThanOrEqual(0);
  });

  it('increased_rent: rent increase reduces surplus by the same amount', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'increased_rent', rentIncreaseAmount: 5000 };
    const result = runScenario(profile, mod);
    expect(result.delta).toBe(-5000);
  });

  it('unexpected_medical_expense: one-time expense reduces surplus', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'unexpected_medical_expense', medicalExpenseAmount: 25000 };
    const result = runScenario(profile, mod);
    expect(result.delta).toBe(-25000);
  });

  it('new_emi: adding an EMI reduces surplus', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'new_emi', newEmiAmount: 8000, newEmiDay: 10 };
    const result = runScenario(profile, mod);
    expect(result.delta).toBe(-8000);
  });

  it('delayed_salary: does not change the surplus amount (only timing)', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'delayed_salary', salaryDelayDays: 10 };
    const result = runScenario(profile, mod);
    // Surplus amount is unchanged; only timing of cash-flow changes
    expect(result.originalSurplus).toBe(result.newSurplus);
  });

  it('variable_income_month low: reduces surplus', () => {
    const profile = buildProfile({
      income: {
        monthlyTakeHome: 80000,
        type: 'salaried_variable',
        creditDay: 5,
        variableLowMonth: 40000,
        variableTypicalMonth: 70000,
        variableHighMonth: 120000,
        otherReliableIncome: 0,
        isStableLast6Months: true,
      },
    });
    const mod: ScenarioModification = { type: 'variable_income_month', variableIncomeMonth: 'low' };
    const result = runScenario(profile, mod);
    expect(result.newSurplus).toBeLessThanOrEqual(result.originalSurplus);
  });

  it('scenario result includes an explanation string', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'reduced_income', incomeReductionFraction: 0.20 };
    const result = runScenario(profile, mod);
    expect(typeof result.explanation).toBe('string');
    expect(result.explanation.length).toBeGreaterThan(10);
  });

  it('scenario result includes a readiness tier for both original and new', () => {
    const profile = buildProfile();
    const mod: ScenarioModification = { type: 'reduced_income', incomeReductionFraction: 0.50 };
    const result = runScenario(profile, mod);
    const validTiers = ['READY', 'LIMITED_FLEXIBILITY', 'LIQUIDITY_NEEDS_ATTENTION', 'MORE_INFO_REQUIRED'];
    expect(validTiers).toContain(result.originalReadinessTier);
    expect(validTiers).toContain(result.newReadinessTier);
  });
});
