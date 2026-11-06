import { describe, it, expect, beforeEach } from 'vitest';
import { useCashflowStore } from '../../src/store/useCashflowStore';
import { useReportStore } from '../../src/store/useReportStore';
import { demoProfileA, demoProfileB } from '../../src/data/demoProfiles';
import { getReportExplanation } from '../../src/ai/explanationService';
import { runFullEngine } from '../../src/engine';

describe('Phase 4: Readiness Report & Cash-Flow Dashboard Suite', () => {

  beforeEach(() => {
    useCashflowStore.setState({ events: [], conflicts: [], safetyBuffer: 5000 });
    useReportStore.getState().clearReport();
  });

  describe('useCashflowStore functionality & CRUD', () => {
    it('seeds recurring events and conflicts from financial profile', () => {
      useCashflowStore.getState().seedFromProfile(demoProfileA.profile);

      const events = useCashflowStore.getState().events;
      expect(events.length).toBeGreaterThan(0);

      const salaryEvent = events.find((e) => e.category === 'salary');
      expect(salaryEvent).toBeDefined();
      expect(salaryEvent?.amount).toBe(45000);
      expect(salaryEvent?.isInflow).toBe(true);

      const rentEvent = events.find((e) => e.category === 'rent');
      expect(rentEvent).toBeDefined();
      expect(rentEvent?.amount).toBe(14000);
      expect(rentEvent?.isInflow).toBe(false);
    });

    it('adds a new recurring event and updates store state', () => {
      useCashflowStore.getState().addEvent({
        profileId: 'test-p',
        title: 'Gym Membership',
        category: 'other_expense',
        amount: 2500,
        dayOfMonth: 12,
        isInflow: false,
        isRecurring: true,
      });

      const events = useCashflowStore.getState().events;
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Gym Membership');
      expect(events[0].amount).toBe(2500);
    });

    it('updates an existing event cleanly', () => {
      useCashflowStore.getState().addEvent({
        profileId: 'test-p',
        title: 'Electricity Bill',
        category: 'utility',
        amount: 1500,
        dayOfMonth: 4,
        isInflow: false,
        isRecurring: true,
      });

      const eventId = useCashflowStore.getState().events[0].id;
      useCashflowStore.getState().updateEvent(eventId, { amount: 2200, dayOfMonth: 5 });

      const updated = useCashflowStore.getState().events[0];
      expect(updated.amount).toBe(2200);
      expect(updated.dayOfMonth).toBe(5);
    });

    it('deletes an event cleanly', () => {
      useCashflowStore.getState().addEvent({
        profileId: 'test-p',
        title: 'Streaming Subscriptions',
        category: 'subscription',
        amount: 999,
        dayOfMonth: 15,
        isInflow: false,
        isRecurring: true,
      });

      const eventId = useCashflowStore.getState().events[0].id;
      useCashflowStore.getState().deleteEvent(eventId);
      expect(useCashflowStore.getState().events).toHaveLength(0);
    });
  });

  describe('Report Explanation Service', () => {
    it('generates structured report explanation matching calculation engine output', async () => {
      const report = runFullEngine(demoProfileB.profile);
      const explanation = await getReportExplanation(report);

      expect(explanation.overviewSummary).toContain(
        report.breakdown.conservativeMonthlyIncome.toLocaleString('en-IN')
      );
      expect(explanation.readinessExplanation).toBeDefined();
      expect(explanation.readinessExplanation.length).toBeGreaterThan(20);
      expect(explanation.sipAffordabilityNote).toBeDefined();
      expect(explanation.goalAnalysis).toBeDefined();
      expect(explanation.actionableNextSteps.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Financial Readiness Report invariants', () => {
    it('guarantees indicative SIP range is ₹0 when surplus is negative', () => {
      const deficitProfile = JSON.parse(JSON.stringify(demoProfileA.profile));
      deficitProfile.expenses.rent = 60000; // pushes surplus negative

      const report = runFullEngine(deficitProfile);
      expect(report.breakdown.availableSurplus).toBeLessThan(0);
      expect(report.breakdown.indicativeSipMin).toBe(0);
      expect(report.breakdown.indicativeSipMax).toBe(0);
      expect(report.readinessTier).toBe('LIQUIDITY_NEEDS_ATTENTION');
    });

    it('recommends conservative lower bound when readiness is limited flexibility', () => {
      // Create limited flexibility profile (funded emergency fund but thin surplus < 15%)
      const limitedProfile = JSON.parse(JSON.stringify(demoProfileA.profile));
      limitedProfile.income.monthlyTakeHome = 50000;
      limitedProfile.savings.accessibleEmergencyFund = 150000; // funded reserve, no gap
      limitedProfile.expenses.rent = 25000;
      limitedProfile.expenses.groceriesAndUtilities = 10000;
      limitedProfile.expenses.transportAndHealthcare = 5000;
      limitedProfile.expenses.discretionary = 4000;
      limitedProfile.expenses.insurancePremiums = 0;
      limitedProfile.expenses.subscriptions = 0;
      limitedProfile.expenses.otherRecurring = 0;
      // Total obligations = 44,000 -> Surplus = 6,000 (12% of income: > 0 and < 15%)

      const report = runFullEngine(limitedProfile);
      expect(report.breakdown.availableSurplus).toBe(6000);
      expect(report.readinessTier).toBe('LIMITED_FLEXIBILITY');
    });
  });
});
