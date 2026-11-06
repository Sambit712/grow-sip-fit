import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReportStore } from '../store/useReportStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { useCashflowStore } from '../store/useCashflowStore';
import { formatINR } from '../validation/currencyParser';
import { SurplusGauge } from '../components/charts/SurplusGauge';
import { ExpenseBreakdownPie } from '../components/charts/ExpenseBreakdownPie';
import { CashflowBarChart } from '../components/charts/CashflowBarChart';
import { ReserveProgressBar } from '../components/charts/ReserveProgressBar';
import { InvestmentCommitmentChart } from '../components/charts/InvestmentCommitmentChart';
import { CashflowCalendarView } from '../components/charts/CashflowCalendarView';
import { ExpenseManager } from '../components/ExpenseManager';
import {
  ShieldCheck,
  FileText,
  Sliders,
  Sparkles,
  TrendingUp,
  Wallet,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { report, generateReport } = useReportStore();
  const { profile } = useFinancialProfileStore();
  const { events, conflicts, seedFromProfile, safetyBuffer } = useCashflowStore();

  useEffect(() => {
    // Ensure report is generated from current profile
    if (!report) {
      generateReport(profile);
    }
    // Seed cashflow events from current profile if empty
    if (events.length === 0) {
      seedFromProfile(profile);
    }
  }, [report, profile, generateReport, events.length, seedFromProfile]);

  const activeReport = report || generateReport(profile);
  const b = activeReport.breakdown;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold tracking-tight">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                SIP
              </span>
              <span>Groww SIP Fit</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-500 uppercase">Cash-Flow Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="px-3.5 py-1.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <FileText size={14} />
              <span>Readiness Report</span>
            </Link>
            <Link
              to="/simulator"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sliders size={14} />
              <span>Scenario Simulator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* STICKY TOP SUMMARY METRICS STRIP */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-6 shadow-xs sticky top-[65px] z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-medium block">Monthly Income</span>
              <span className="text-sm sm:text-base font-bold text-gray-900 font-mono">
                {formatINR(b.conservativeMonthlyIncome)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-medium block">Total Obligations</span>
              <span className="text-sm sm:text-base font-bold text-gray-900 font-mono">
                {formatINR(b.totalObligations)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-medium block">Existing SIPs</span>
              <span className="text-sm sm:text-base font-bold text-gray-900 font-mono">
                {formatINR(b.existingSipTotal)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                b.availableSurplus > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-medium block">Available Surplus</span>
              <span
                className={`text-sm sm:text-base font-black font-mono ${
                  b.availableSurplus > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatINR(b.availableSurplus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* Welcome & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Continuous Financial Readiness & Cash Flow
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Keep your recurring SIP aligned with salary credits and buffer against AutoPay bounces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/report"
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View Readiness Scorecard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 6 VISUALISATIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chart 1: Available Monthly Surplus Gauge */}
          <SurplusGauge surplus={b.availableSurplus} income={b.conservativeMonthlyIncome} />

          {/* Chart 2: Income vs Obligations Bar Chart */}
          <CashflowBarChart
            income={b.conservativeMonthlyIncome}
            essentialExpenses={b.essentialExpenses}
            emis={b.emiObligations}
            surplus={b.availableSurplus}
          />

          {/* Chart 3: Expense Breakdown Pie */}
          <ExpenseBreakdownPie
            expenses={{
              rent: profile.expenses.rent,
              groceriesAndUtilities: profile.expenses.groceriesAndUtilities,
              transportAndHealthcare: profile.expenses.transportAndHealthcare,
              familySupport: profile.expenses.familySupport,
              discretionary: profile.expenses.discretionary,
              emis: profile.liabilities.activeEmisMonthly,
            }}
          />

          {/* Chart 4: Emergency Reserve Cushion Progress */}
          <ReserveProgressBar
            currentSavings={profile.savings.accessibleEmergencyFund}
            targetReserve={b.targetEmergencyReserve}
            reserveMonths={b.reserveMonthsUsed}
            gap={b.emergencyReserveGap}
          />

          {/* Chart 5: Existing SIPs vs New Capacity */}
          <InvestmentCommitmentChart
            existingSips={b.existingSipTotal}
            sipMin={b.indicativeSipMin}
            sipMax={b.indicativeSipMax}
          />

          {/* Mini Action Card linking to Simulator */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200 block mb-1">
                Scenario Testing
              </span>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">
                Simulate Financial Shocks
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Test delayed salary credits, 20% income drops, or unexpected medical expenses before scheduling your SIP debit.
              </p>
            </div>
            <Link
              to="/simulator"
              className="mt-4 py-2.5 px-4 bg-white text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors shadow-xs"
            >
              <Sliders size={14} />
              <span>Launch Simulator</span>
            </Link>
          </div>
        </div>

        {/* Chart 6: 31-Day Cash-Flow Calendar */}
        <CashflowCalendarView
          events={events}
          conflicts={conflicts}
          openingBalance={profile.savings.accessibleEmergencyFund}
          safetyBuffer={safetyBuffer}
        />

        {/* EXPENSE & COMMITMENT CRUD MANAGER */}
        <ExpenseManager />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>
            Groww SIP Fit is a financial readiness decision aid and educational simulator. It does not provide SEBI-registered investment advice or guarantee future returns.
          </span>
        </div>
      </footer>
    </div>
  );
};
