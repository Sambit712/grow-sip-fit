import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialProfile } from '../types/FinancialProfile';
import { freshDemoUser, allDemoProfiles } from '../data/demoProfiles';

interface FinancialProfileState {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
  updateProfile: (patch: Partial<FinancialProfile>) => void;
  updateIncome: (patch: Partial<FinancialProfile['income']>) => void;
  updateExpenses: (patch: Partial<FinancialProfile['expenses']>) => void;
  updateLiabilities: (patch: Partial<FinancialProfile['liabilities']>) => void;
  updateSavings: (patch: Partial<FinancialProfile['savings']>) => void;
  updateGoal: (patch: Partial<FinancialProfile['goal']>) => void;
  updateRisk: (patch: Partial<FinancialProfile['risk']>) => void;
  loadDemoProfile: (key: keyof typeof allDemoProfiles) => void;
  resetProfile: () => void;
  deleteProfile: () => void;
}

export const useFinancialProfileStore = create<FinancialProfileState>()(
  persist(
    (set) => ({
      profile: freshDemoUser.profile,

      setProfile: (p) => set({ profile: p }),

      updateProfile: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...patch,
          },
        })),

      updateIncome: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            income: { ...state.profile.income, ...patch },
          },
        })),

      updateExpenses: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            expenses: { ...state.profile.expenses, ...patch },
          },
        })),

      updateLiabilities: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            liabilities: { ...state.profile.liabilities, ...patch },
          },
        })),

      updateSavings: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            savings: { ...state.profile.savings, ...patch },
          },
        })),

      updateGoal: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            goal: { ...state.profile.goal, ...patch },
          },
        })),

      updateRisk: (patch) =>
        set((state) => ({
          profile: {
            ...state.profile,
            risk: { ...state.profile.risk, ...patch },
          },
        })),

      loadDemoProfile: (key) => {
        const found = allDemoProfiles[key];
        if (found) {
          set({ profile: JSON.parse(JSON.stringify(found.profile)) });
        }
      },

      resetProfile: () =>
        set({
          profile: JSON.parse(JSON.stringify(freshDemoUser.profile)),
        }),

      deleteProfile: () =>
        set({
          profile: JSON.parse(JSON.stringify(freshDemoUser.profile)),
        }),
    }),
    {
      name: 'groww_sip_fit_profile_store',
    }
  )
);

