import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../../src/store/useUserStore';
import { useFinancialProfileStore } from '../../src/store/useFinancialProfileStore';
import { useAssessmentStore } from '../../src/store/useAssessmentStore';
import { useReportStore } from '../../src/store/useReportStore';
import { useScenarioStore } from '../../src/store/useScenarioStore';
import { demoProfileA, freshDemoUser } from '../../src/data/demoProfiles';

describe('Zustand Stores Suite', () => {

  beforeEach(() => {
    useUserStore.getState().resetUser();
    useFinancialProfileStore.getState().resetProfile();
    useAssessmentStore.getState().resetSession();
    useReportStore.getState().clearReport();
    useScenarioStore.getState().clearScenarios();
  });

  describe('useUserStore', () => {
    it('initializes with freshDemoUser', () => {
      const state = useUserStore.getState();
      expect(state.currentUser.id).toBe(freshDemoUser.user.id);
      expect(state.activePersona).toBe('custom');
    });

    it('switches personas correctly', () => {
      useUserStore.getState().switchPersona('profileA');
      const state = useUserStore.getState();
      expect(state.currentUser.name).toBe(demoProfileA.user.name);
      expect(state.activePersona).toBe('early_career');
    });

    it('resets user back to freshDemoUser', () => {
      useUserStore.getState().switchPersona('profileA');
      useUserStore.getState().resetUser();
      expect(useUserStore.getState().currentUser.id).toBe(freshDemoUser.user.id);
    });
  });

  describe('useFinancialProfileStore', () => {
    it('initializes with fresh demo profile (goal set, income 0)', () => {
      const profile = useFinancialProfileStore.getState().profile;
      expect(profile.goal.purpose).toBe('Buying a house');
      expect(profile.income.monthlyTakeHome).toBe(0);
    });

    it('updates income patch cleanly', () => {
      useFinancialProfileStore.getState().updateIncome({ monthlyTakeHome: 50000 });
      expect(useFinancialProfileStore.getState().profile.income.monthlyTakeHome).toBe(50000);
      expect(useFinancialProfileStore.getState().profile.goal.purpose).toBe('Buying a house');
    });

    it('loads a demo profile completely', () => {
      useFinancialProfileStore.getState().loadDemoProfile('profileA');
      const profile = useFinancialProfileStore.getState().profile;
      expect(profile.income.monthlyTakeHome).toBe(45000);
      expect(profile.expenses.rent).toBe(14000);
    });

    it('resets profile back to freshDemoUser', () => {
      useFinancialProfileStore.getState().loadDemoProfile('profileA');
      useFinancialProfileStore.getState().resetProfile();
      expect(useFinancialProfileStore.getState().profile.income.monthlyTakeHome).toBe(0);
    });
  });

  describe('useAssessmentStore', () => {
    it('starts a new session with in_progress status', () => {
      useAssessmentStore.getState().startSession('user-test-1');
      const state = useAssessmentStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.status).toBe('in_progress');
      expect(state.currentCategory).toBe('goals');
    });

    it('adds messages and advances stepIndex', () => {
      useAssessmentStore.getState().startSession('user-test-1');
      useAssessmentStore.getState().addMessage({
        id: 'msg-1',
        sessionId: 'sess-1',
        sender: 'assistant',
        content: 'What is your goal?',
        category: 'goals',
        stepIndex: 1,
        timestamp: new Date().toISOString(),
      });

      const state = useAssessmentStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.session?.stepIndex).toBe(1);
    });

    it('updates collected data with deep patches', () => {
      useAssessmentStore.getState().startSession();
      useAssessmentStore.getState().updateCollectedData({
        income: {
          monthlyTakeHome: 60000,
          type: 'salaried_fixed',
          creditDay: 5,
          otherReliableIncome: 0,
          isStableLast6Months: true,
        },
      });

      const collected = useAssessmentStore.getState().collectedData;
      expect(collected.income?.monthlyTakeHome).toBe(60000);
      expect(collected.goal?.purpose).toBe('Buying a house');
    });

    it('edits an answer and truncates subsequent messages', () => {
      useAssessmentStore.getState().startSession();
      const msg1 = {
        id: 'msg-1',
        sessionId: 'sess-1',
        sender: 'user' as const,
        content: 'Original Answer',
        category: 'goals' as const,
        stepIndex: 1,
        timestamp: new Date().toISOString(),
      };
      const msg2 = {
        id: 'msg-2',
        sessionId: 'sess-1',
        sender: 'assistant' as const,
        content: 'Next question',
        category: 'income' as const,
        stepIndex: 2,
        timestamp: new Date().toISOString(),
      };

      useAssessmentStore.getState().addMessage(msg1);
      useAssessmentStore.getState().addMessage(msg2);
      expect(useAssessmentStore.getState().messages).toHaveLength(2);

      // Edit msg-1
      useAssessmentStore.getState().editAnswer('msg-1', 'Updated Answer');
      const messages = useAssessmentStore.getState().messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Updated Answer');
      expect(useAssessmentStore.getState().stepIndex).toBe(1);
    });

    it('completes session cleanly', () => {
      useAssessmentStore.getState().startSession();
      useAssessmentStore.getState().completeSession();
      expect(useAssessmentStore.getState().session?.status).toBe('completed');
    });
  });

  describe('useReportStore', () => {
    it('generates a real report from profile using deterministic engine', () => {
      const report = useReportStore.getState().generateReport(demoProfileA.profile);
      expect(report).toBeDefined();
      expect(report.breakdown.conservativeMonthlyIncome).toBe(45000);
      expect(report.breakdown.essentialExpenses).toBeGreaterThan(0);
      expect(useReportStore.getState().report).toBe(report);
    });

    it('clears report on demand', () => {
      useReportStore.getState().generateReport(demoProfileA.profile);
      useReportStore.getState().clearReport();
      expect(useReportStore.getState().report).toBeNull();
    });
  });

  describe('useScenarioStore', () => {
    it('runs and records scenario result', () => {
      const result = useScenarioStore.getState().runScenario(
        { type: 'increased_rent', rentIncreaseAmount: 3000 },
        demoProfileA.profile
      );

      expect(result).toBeDefined();
      expect(result.delta).toBe(-3000);
      expect(useScenarioStore.getState().activeScenario).toBe(result);
      expect(useScenarioStore.getState().scenarios).toHaveLength(1);
    });

    it('saves scenarios for comparison up to 3 slots', () => {
      const store = useScenarioStore.getState();
      const res1 = store.runScenario({ type: 'increased_rent', rentIncreaseAmount: 1000 }, demoProfileA.profile);
      const res2 = store.runScenario({ type: 'increased_rent', rentIncreaseAmount: 2000 }, demoProfileA.profile);
      const res3 = store.runScenario({ type: 'increased_rent', rentIncreaseAmount: 3000 }, demoProfileA.profile);
      const res4 = store.runScenario({ type: 'increased_rent', rentIncreaseAmount: 4000 }, demoProfileA.profile);

      store.saveScenario('Rent +1K', res1);
      store.saveScenario('Rent +2K', res2);
      store.saveScenario('Rent +3K', res3);
      store.saveScenario('Rent +4K', res4);

      // Max 3 slots
      expect(useScenarioStore.getState().savedScenarios.length).toBeLessThanOrEqual(3);
    });
  });
});

