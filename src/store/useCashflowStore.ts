import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CashflowEvent, ConflictWarning } from '../types/CashflowEvent';
import type { FinancialProfile } from '../types/FinancialProfile';
import { detectCashflowConflicts } from '../engine/cashflowConflictDetector';

interface CashflowState {
  events: CashflowEvent[];
  conflicts: ConflictWarning[];
  safetyBuffer: number;

  seedFromProfile: (profile: FinancialProfile) => void;
  addEvent: (event: Omit<CashflowEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, patch: Partial<CashflowEvent>) => void;
  deleteEvent: (id: string) => void;
  setSafetyBuffer: (buffer: number) => void;
  recomputeConflicts: (salaryCreditDay: number, emergencyFund: number) => void;
}

export const useCashflowStore = create<CashflowState>()(
  persist(
    (set, get) => ({
      events: [],
      conflicts: [],
      safetyBuffer: 5000,

      seedFromProfile: (profile) => {
        const generated: CashflowEvent[] = [];
        const profileId = profile.id;
        const now = new Date().toISOString();

        // 1. Income
        if (profile.income.monthlyTakeHome > 0) {
          generated.push({
            id: `evt-salary-${profileId}`,
            profileId,
            title: 'Monthly Salary Credit',
            category: 'salary',
            amount: profile.income.monthlyTakeHome,
            dayOfMonth: profile.income.creditDay || 5,
            isInflow: true,
            isRecurring: true,
            createdAt: now,
          });
        }

        if (profile.income.otherReliableIncome > 0) {
          generated.push({
            id: `evt-other-income-${profileId}`,
            profileId,
            title: 'Other Recurring Income',
            category: 'other_income',
            amount: profile.income.otherReliableIncome,
            dayOfMonth: 10,
            isInflow: true,
            isRecurring: true,
            createdAt: now,
          });
        }

        // 2. Outflows
        if (profile.expenses.rent > 0) {
          generated.push({
            id: `evt-rent-${profileId}`,
            profileId,
            title: 'Rent / Housing',
            category: 'rent',
            amount: profile.expenses.rent,
            dayOfMonth: Math.min(31, (profile.income.creditDay || 5) + 2),
            isInflow: false,
            isRecurring: true,
            createdAt: now,
          });
        }

        if (profile.liabilities.activeEmisMonthly > 0) {
          generated.push({
            id: `evt-emi-${profileId}`,
            profileId,
            title: 'Active EMIs',
            category: 'emi',
            amount: profile.liabilities.activeEmisMonthly,
            dayOfMonth: 10,
            isInflow: false,
            isRecurring: true,
            createdAt: now,
          });
        }

        if (profile.expenses.groceriesAndUtilities > 0) {
          generated.push({
            id: `evt-groceries-${profileId}`,
            profileId,
            title: 'Groceries & Bills',
            category: 'grocery',
            amount: profile.expenses.groceriesAndUtilities,
            dayOfMonth: 3,
            isInflow: false,
            isRecurring: true,
            createdAt: now,
          });
        }

        if (profile.expenses.familySupport > 0) {
          generated.push({
            id: `evt-family-${profileId}`,
            profileId,
            title: 'Family Remittance',
            category: 'family_support',
            amount: profile.expenses.familySupport,
            dayOfMonth: 7,
            isInflow: false,
            isRecurring: true,
            createdAt: now,
          });
        }

        if (profile.existingInvestments.activeSipTotal > 0) {
          generated.push({
            id: `evt-sip-${profileId}`,
            profileId,
            title: 'Mutual Fund SIP Debit',
            category: 'sip',
            amount: profile.existingInvestments.activeSipTotal,
            dayOfMonth: 8,
            isInflow: false,
            isRecurring: true,
            createdAt: now,
          });
        }

        const conflicts = detectCashflowConflicts(
          profile.income.creditDay || 5,
          generated,
          profile.savings.accessibleEmergencyFund || 0,
          get().safetyBuffer
        );

        set({ events: generated, conflicts });
      },

      addEvent: (eventData) => {
        const newEvent: CashflowEvent = {
          ...eventData,
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const next = [...state.events, newEvent];
          return { events: next };
        });
      },

      updateEvent: (id, patch) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      setSafetyBuffer: (buffer) => set({ safetyBuffer: buffer }),

      recomputeConflicts: (salaryCreditDay, emergencyFund) => {
        const { events, safetyBuffer } = get();
        const conflicts = detectCashflowConflicts(
          salaryCreditDay,
          events,
          emergencyFund,
          safetyBuffer
        );
        set({ conflicts });
      },
    }),
    {
      name: 'groww_sip_fit_cashflow_store',
    }
  )
);
