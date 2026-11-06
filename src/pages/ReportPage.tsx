import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReportStore } from '../store/useReportStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { validateProfile } from '../validation/validateProfile';
import { getReportExplanation } from '../ai/explanationService';
import { formatINR } from '../validation/currencyParser';
import { track } from '../utils/analytics';
import type { FinancialReport, ReadinessTier } from '../types/FinancialReport';
import type { ReportExplanation } from '../ai/IConversationEngine';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Target,
  Sparkles,
  Info,
} from 'lucide-react';

const TIER_CONFIG: Record<
  ReadinessTier,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  READY: {
    label: 'Ready for further SIP consideration',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: <CheckCircle2 size={20} className="text-emerald-600" />,
  },
  LIMITED_FLEXIBILITY: {
    label: 'Limited flexibility',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: <AlertTriangle size={20} className="text-amber-600" />,
  },
  LIQUIDITY_NEEDS_ATTENTION: {
    label: 'Liquidity needs attention',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: <AlertCircle size={20} className="text-red-600" />,
  },
  MORE_INFO_REQUIRED: {
    label: 'More information required',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: <HelpCircle size={20} className="text-slate-600" />,
  },
};

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { report, generateReport } = useReportStore();
  const { profile } = useFinancialProfileStore();

  const [activeReport, setActiveReport] = useState<FinancialReport | null>(report);
  const [explanation, setExplanation] = useState<ReportExplanation | null>(null);
  const [showFormulaAudit, setShowFormulaAudit] = useState(false);

  useEffect(() => {
    // Generate fresh report if none exists or profile has changed
    const r = report || generateReport(profile);
    setActiveReport(r);

    track('Readiness_report_generated', {
      readinessTier: r.readinessTier,
      userId: r.userId,
      indicativeSipMin: r.breakdown.indicativeSipMin,
      indicativeSipMax: r.breakdown.indicativeSipMax,
    });

    getReportExplanation(r)
      .then((exp) => setExplanation(exp));
  }, [report, profile, generateReport]);

  if (!activeReport) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No assessment report found.</p>
          <button
            onClick={() => navigate('/assess')}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const b = activeReport.breakdown;
  const g = activeReport.goalCompatibility;
  const tierConfig = TIER_CONFIG[activeReport.readinessTier];
  const validation = validateProfile(profile);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold tracking-tight">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                SIP
              </span>
              <span>Groww SIP Fit</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-500 uppercase">Readiness Report</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard size={14} />
              <span>Cash-Flow Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* Title & Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2">
              <Sparkles size={12} />
              <span>Deterministic Financial Evaluation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Personal Financial Readiness Report
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Engine Version {activeReport.engineVersion} • Generated on{' '}
              {new Date(activeReport.generatedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <Link
            to="/assess"
            className="self-start sm:self-auto px-3 py-1.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw size={13} />
            <span>Retake Assessment</span>
          </Link>
        </div>

        {/* Missing Fields Banner (if any) */}
        {!validation.isComplete && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Assessment Incomplete ({validation.completenessPercentage}% completed): </span>
              <span>
                Missing critical fields: {validation.missingFields.join(', ')}. Calculations are operating on conservative estimates.
              </span>
            </div>
          </div>
        )}

        {/* SECTION 2: FINANCIAL READINESS STATUS (PROMINENT BADGE) */}
        <div className={`p-6 rounded-2xl border ${tierConfig.border} ${tierConfig.bg} shadow-xs`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs shrink-0">
                {tierConfig.icon}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-0.5">
                  Readiness Classification
                </span>
                <h2 className={`text-xl font-extrabold tracking-tight ${tierConfig.text}`}>
                  {tierConfig.label}
                </h2>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-gray-500 block font-medium">Estimated Surplus</span>
              <span
                className={`text-2xl font-black font-mono ${
                  b.availableSurplus > 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatINR(b.availableSurplus)}/mo
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-gray-700 leading-relaxed pt-3 border-t border-gray-200/60">
            {explanation ? explanation.readinessExplanation : 'Analyzing readiness narrative...'}
          </p>
        </div>

        {/* SECTION 1: FINANCIAL OVERVIEW GRID */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">Section 1: Financial Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Monthly Income</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 block mt-1 font-mono">
                {formatINR(b.conservativeMonthlyIncome)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">Conservative Baseline</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Essential Expenses</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 block mt-1 font-mono">
                {formatINR(b.essentialExpenses)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">Rent, Food & Bills</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Total Obligations</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 block mt-1 font-mono">
                {formatINR(b.totalObligations)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">Incl. EMIs & Remittances</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Existing SIPs</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 block mt-1 font-mono">
                {formatINR(b.existingSipTotal)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">Active Debits</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Emergency Savings</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 block mt-1 font-mono">
                {formatINR(b.existingEmergencyFund)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">Liquid & Accessible</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Emergency Reserve Gap</span>
              <span
                className={`text-base sm:text-lg font-bold block mt-1 font-mono ${
                  b.emergencyReserveGap > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {b.emergencyReserveGap > 0 ? formatINR(b.emergencyReserveGap) : '₹0 (Funded)'}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block truncate">
                Target: {b.reserveMonthsUsed} Months
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs col-span-2">
              <span className="text-xs text-gray-400 font-medium block">Available Monthly Surplus</span>
              <span
                className={`text-xl sm:text-2xl font-extrabold block mt-1 font-mono ${
                  b.availableSurplus > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatINR(b.availableSurplus)}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">
                Conservative Income minus Total Recurring Obligations
              </span>
            </div>
          </div>

          {/* Collapsible Formula Audit */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4 text-xs shadow-xs">
            <button
              onClick={() => setShowFormulaAudit(!showFormulaAudit)}
              className="w-full flex items-center justify-between text-left font-bold text-gray-800"
            >
              <div className="flex items-center gap-2">
                <Info size={15} className="text-emerald-600" />
                <span>How were these numbers calculated? (Audit Trail & Formulas)</span>
              </div>
              {showFormulaAudit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showFormulaAudit && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 font-mono text-gray-600">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-gray-800">1. Available Surplus Formula:</div>
                  <div>Surplus = Conservative Income - Total Obligations</div>
                  <div className="text-emerald-700 mt-1">
                    = ₹{b.conservativeMonthlyIncome.toLocaleString('en-IN')} - ₹
                    {b.totalObligations.toLocaleString('en-IN')} = ₹
                    {b.availableSurplus.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-gray-800">2. Emergency Reserve Target & Gap:</div>
                  <div>Target = Essential Expenses × {b.reserveMonthsUsed} months</div>
                  <div>
                    = ₹{b.essentialExpenses.toLocaleString('en-IN')} × {b.reserveMonthsUsed} = ₹
                    {b.targetEmergencyReserve.toLocaleString('en-IN')}
                  </div>
                  <div className="text-emerald-700 mt-1">
                    Gap = Target - Liquid Savings = ₹{b.emergencyReserveGap.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-gray-800">3. SIP Capacity Derivation:</div>
                  <div>
                    Uncommitted = Surplus - Reserve Contribution ({formatINR(b.plannedMonthlyReserveContribution)}) - 10% Buffer ({formatINR(b.irregularExpenseBuffer)})
                  </div>
                  <div className="text-emerald-700 mt-1">
                    Uncommitted Surplus = {formatINR(b.uncommittedSurplus)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: INDICATIVE SIP CAPACITY */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Section 3: Indicative SIP Contribution Capacity
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Safe recurring contribution range computed after deducting debt, emergency building, and irregular buffers.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl mb-4 gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                Indicative Monthly Range
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                {b.indicativeSipMax > 0
                  ? `${formatINR(b.indicativeSipMin)} – ${formatINR(b.indicativeSipMax)}`
                  : '₹0 (No surplus available)'}
              </div>
              <span className="text-xs text-emerald-900 mt-1 block">
                Recommended monthly contribution (rounded to nearest ₹500)
              </span>
            </div>

            <Link
              to="/dashboard"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
            >
              <span>Explore Continuity Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-gray-500 space-y-1">
            <span className="font-semibold text-gray-700 block mb-1">Key Assumptions Applied:</span>
            {b.assumptions.map((a, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{a}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-gray-400 italic">
            * This is an indicative range based on the information provided. It is not a guaranteed safe investment amount or a SEBI-registered portfolio recommendation.
          </div>
        </div>

        {/* SECTION 4: GOAL COMPATIBILITY */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">Section 4: Goal Compatibility</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Evaluation of your timeline and target corpus against investment capacity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block">Financial Goal</span>
              <span className="text-sm font-bold text-gray-900 block mt-0.5">{g.goalPurpose}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block">Target Corpus</span>
              <span className="text-sm font-bold text-gray-900 block mt-0.5 font-mono">
                {formatINR(g.targetAmount)}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block">Horizon & Savings Gap</span>
              <span className="text-sm font-bold text-gray-900 block mt-0.5 font-mono">
                {g.horizonYears} Years (Gap: {formatINR(g.savingsGap)})
              </span>
            </div>
          </div>

          {g.isHorizonShort && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 mb-4">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Short Investment Horizon Warning: </span>
                <span>
                  Your investment horizon is under 3 years. Short horizons carry higher market uncertainty for equity SIPs. Consider liquidity and whether debt instruments better protect your timeline.
                </span>
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-700 bg-slate-50 p-4 rounded-xl leading-relaxed">
            {g.compatibilityNote}
          </p>
        </div>

        {/* SECTION 5: NEXT STEPS */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Section 5: Recommended Next Steps</h3>
          <p className="text-xs text-gray-500 mb-4">
            Actionable planning steps tailored to your readiness tier.
          </p>

          <div className="space-y-2.5">
            {activeReport.nextSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Link
              to="/dashboard"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <LayoutDashboard size={15} />
              <span>Continue to Financial Dashboard</span>
            </Link>
            <Link
              to="/simulator"
              className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Explore Scenario Simulator</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
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
