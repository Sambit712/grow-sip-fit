import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialReport } from '../types/FinancialReport';
import type { FinancialProfile } from '../types/FinancialProfile';
import type { CashflowEvent } from '../types/CashflowEvent';
import { runFullEngine } from '../engine';

interface ReportState {
  report: FinancialReport | null;
  setReport: (r: FinancialReport) => void;
  generateReport: (profile: FinancialProfile, events?: CashflowEvent[], sessionId?: string) => FinancialReport;
  clearReport: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      report: null,

      setReport: (r) => set({ report: r }),

      generateReport: (profile, events = [], sessionId = '') => {
        const generated = runFullEngine(profile, events, undefined, sessionId);
        set({ report: generated });
        return generated;
      },

      clearReport: () => set({ report: null }),
    }),
    {
      name: 'groww_sip_fit_report_store',
    }
  )
);

