import { describe, it, expect } from 'vitest';
import { runScenario } from '../../src/engine/scenarioEngine';
import { useScenarioStore } from '../../src/store/useScenarioStore';
import { EDUCATIONAL_TOPICS, askEducationalQuestion } from '../../src/ai/educationService';
import { PAYMENT_SCENARIOS } from '../../src/data/paymentScenarios';
import { demoProfileA, demoProfileB } from '../../src/data/demoProfiles';
import type { FinancialProfile } from '../../src/types/FinancialProfile';
import type { ScenarioModification } from '../../src/types/CashflowEvent';

describe('Phase 5: Financial Scenario Simulator', () => {
  const profile: FinancialProfile = JSON.parse(JSON.stringify(demoProfileA.profile));

  it('calculates single scenario: increased rent reduces surplus directly', () => {
    const mod: ScenarioModification = {
      type: 'increased_rent',
      rentIncreaseAmount: 4000,
    };
    const result = runScenario(profile, mod);

    expect(result.originalSurplus).toBeGreaterThan(0);
    expect(result.newSurplus).toBe(result.originalSurplus - 4000);
    expect(result.delta).toBe(-4000);
    expect(result.explanation).toContain('4,000');
  });

  it('calculates single scenario: delayed salary retains surplus but changes timing', () => {
    const mod: ScenarioModification = {
      type: 'delayed_salary',
      salaryDelayDays: 10,
    };
    const result = runScenario(profile, mod);

    expect(result.newSurplus).toBe(result.originalSurplus);
    expect(result.delta).toBe(0);
    expect(result.explanation).toContain('delayed by 10 days');
  });

  it('calculates single scenario: unexpected medical expense shocks surplus', () => {
    const mod: ScenarioModification = {
      type: 'unexpected_medical_expense',
      medicalExpenseAmount: 15000,
    };
    const result = runScenario(profile, mod);

    expect(result.delta).toBe(-15000);
    expect(result.newSurplus).toBe(result.originalSurplus - 15000);
  });

  it('calculates single scenario: reduced income drops surplus proportionally', () => {
    const mod: ScenarioModification = {
      type: 'reduced_income',
      incomeReductionFraction: 0.25, // 25% reduction
    };
    const result = runScenario(profile, mod);

    expect(result.newSurplus).toBeLessThan(result.originalSurplus);
    expect(result.delta).toBeLessThan(0);
    expect(result.explanation).toContain('25%');
  });

  it('calculates single scenario: new EMI increases debt obligations', () => {
    const mod: ScenarioModification = {
      type: 'new_emi',
      newEmiAmount: 6000,
      newEmiDay: 8,
    };
    const result = runScenario(profile, mod);

    expect(result.delta).toBe(-6000);
    expect(result.newSurplus).toBe(result.originalSurplus - 6000);
    expect(result.explanation).toContain('6,000');
  });

  it('calculates single scenario: variable income month toggles between low and typical', () => {
    const varProfile: FinancialProfile = JSON.parse(JSON.stringify(demoProfileB.profile));
    const modLow: ScenarioModification = {
      type: 'variable_income_month',
      variableIncomeMonth: 'low',
    };
    const resultLow = runScenario(varProfile, modLow);

    const modHigh: ScenarioModification = {
      type: 'variable_income_month',
      variableIncomeMonth: 'high',
    };
    const resultHigh = runScenario(varProfile, modHigh);

    expect(resultHigh.newSurplus).toBeGreaterThan(resultLow.newSurplus);
  });

  it('supports multi-scenario stacking: combining rent increase + new EMI + medical shock', () => {
    const stackedMods: ScenarioModification[] = [
      { type: 'increased_rent', rentIncreaseAmount: 3000 },
      { type: 'new_emi', newEmiAmount: 5000, newEmiDay: 12 },
      { type: 'unexpected_medical_expense', medicalExpenseAmount: 10000 },
    ];

    const result = runScenario(profile, stackedMods);

    // Total expected reduction: 3000 + 5000 + 10000 = 18000
    expect(result.delta).toBe(-18000);
    expect(result.newSurplus).toBe(result.originalSurplus - 18000);
    expect(result.explanation).toContain('Combined scenarios');
    expect(result.stackedModifications).toHaveLength(3);
  });

  it('scenario store: saves, persists, and caps at 3 scenarios', () => {
    const store = useScenarioStore.getState();
    store.clearScenarios();

    const res1 = runScenario(profile, { type: 'increased_rent', rentIncreaseAmount: 2000 });
    const res2 = runScenario(profile, { type: 'new_emi', newEmiAmount: 4000 });
    const res3 = runScenario(profile, { type: 'delayed_salary', salaryDelayDays: 5 });
    const res4 = runScenario(profile, { type: 'unexpected_medical_expense', medicalExpenseAmount: 5000 });

    store.saveScenario('Test 1', res1);
    store.saveScenario('Test 2', res2);
    store.saveScenario('Test 3', res3);
    store.saveScenario('Test 4', res4);

    const saved = useScenarioStore.getState().savedScenarios;
    expect(saved.length).toBeLessThanOrEqual(3);
    expect(saved[0].name).toBe('Test 4');

    // Remove one scenario
    store.removeSavedScenario(saved[0].id);
    expect(useScenarioStore.getState().savedScenarios.length).toBe(saved.length - 1);
  });
});

describe('Phase 5: Contextual AI Education Assistant & Guardrails', () => {
  const profile = demoProfileA.profile;

  it('covers all 10 standard educational topics with informative responses', async () => {
    expect(EDUCATIONAL_TOPICS).toHaveLength(10);

    for (const topic of EDUCATIONAL_TOPICS) {
      const response = await askEducationalQuestion(topic.fullQuestion, profile, { forceDeterministic: true });
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(40);
    }
  });

  it('personalizes educational responses with the user profile goal', async () => {
    const response = await askEducationalQuestion('What is an SIP?', profile, { forceDeterministic: true });
    // Profile A's goal is 'Wealth creation'
    expect(response).toContain(profile.goal.purpose);
  });

  it('strictly enforces guardrails against fund and stock recommendations', async () => {
    const badQueries = [
      'Can you recommend the best mutual fund for 2026?',
      'Which fund should I buy on Groww?',
      'What are the top 5 stocks to invest in right now?',
    ];

    for (const query of badQueries) {
      const response = await askEducationalQuestion(query, profile, { forceDeterministic: true });
      expect(response.toLowerCase()).toContain('not a sebi-registered');
      expect(response).not.toContain('HDFC');
      expect(response).not.toContain('ICICI');
    }
  });

  it('strictly enforces guardrails against return guarantees', async () => {
    const badQueries = [
      'Will this give me a guaranteed return of 15%?',
      'Can you promise double my money in 3 years?',
      'How much fixed return can I get from equity mutual funds?',
    ];

    for (const query of badQueries) {
      const response = await askEducationalQuestion(query, profile, { forceDeterministic: true });
      expect(response.toLowerCase()).toContain('market risks');
      expect(response.toLowerCase()).toContain('prohibit');
    }
  });
});

describe('Phase 5: Payment & AutoPay Troubleshooter', () => {
  it('defines all 6 simulated payment scenarios', () => {
    const keys = Object.keys(PAYMENT_SCENARIOS);
    expect(keys).toEqual([
      'insufficient_balance',
      'mandate_pending',
      'bank_changed',
      'failed_but_debited',
      'processing_delay',
      'pause_vs_cancel',
    ]);
  });

  it('each scenario contains complete 5-step diagnostic tree and simulated details', () => {
    for (const [key, scenario] of Object.entries(PAYMENT_SCENARIOS)) {
      expect(scenario.issueKey).toBe(key);
      expect(scenario.simulatedDetails.amount).toBeGreaterThan(0);
      expect(scenario.simulatedDetails.bankName.length).toBeGreaterThan(0);
      expect(scenario.simulatedDetails.failureReasonCode.length).toBeGreaterThan(0);

      // Check all 5 steps
      const tree = scenario.diagnosticTree;
      expect(tree.step1_situation.length).toBeGreaterThan(10);
      expect(tree.step2_probableReason.length).toBeGreaterThan(10);
      expect(tree.step3_clarifyingQuestions.options.length).toBeGreaterThanOrEqual(2);
      expect(tree.step4_growwUiSteps.length).toBeGreaterThanOrEqual(3);
      expect(tree.step5_escalation.checklist.length).toBeGreaterThanOrEqual(1);
    }
  });
});
