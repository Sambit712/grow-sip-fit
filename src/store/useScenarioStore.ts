import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScenarioResult, ScenarioModification, CashflowEvent } from '../types/CashflowEvent';
import type { FinancialProfile } from '../types/FinancialProfile';
import { runScenario as executeScenario } from '../engine/scenarioEngine';

interface ScenarioState {
  scenarios: ScenarioResult[];
  activeScenario: ScenarioResult | null;
  savedScenarios: Array<{ id: string; name: string; result: ScenarioResult }>;
  activeModification: ScenarioModification | null;
  activeModifications: ScenarioModification[];

  runScenario: (
    mod: ScenarioModification | ScenarioModification[],
    profile: FinancialProfile,
    events?: CashflowEvent[]
  ) => ScenarioResult;
  setActiveScenario: (res: ScenarioResult | null) => void;
  saveScenario: (name: string, result: ScenarioResult) => void;
  removeSavedScenario: (id: string) => void;
  clearScenarios: () => void;
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set) => ({
      scenarios: [],
      activeScenario: null,
      savedScenarios: [],
      activeModification: null,
      activeModifications: [],

      runScenario: (mod, profile, events = []) => {
        const result = executeScenario(profile, mod, events);
        const modsArray = Array.isArray(mod) ? mod : [mod];
        set((state) => ({
          activeScenario: result,
          activeModification: modsArray[0] || null,
          activeModifications: modsArray,
          scenarios: [result, ...state.scenarios.slice(0, 9)], // keep last 10
        }));
        return result;
      },

      setActiveScenario: (res) => set({ activeScenario: res }),

      saveScenario: (name, result) =>
        set((state) => {
          // Limit to 3 saved scenarios for side-by-side comparison, newest first
          const next = [
            { id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, name, result },
            ...state.savedScenarios.slice(0, 2),
          ];
          return { savedScenarios: next };
        }),

      removeSavedScenario: (id) =>
        set((state) => ({
          savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
        })),

      clearScenarios: () =>
        set({
          scenarios: [],
          activeScenario: null,
          savedScenarios: [],
          activeModification: null,
        }),
    }),
    {
      name: 'groww_sip_fit_scenario_store',
    }
  )
);

