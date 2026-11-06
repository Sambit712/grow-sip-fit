/**
 * LandingPage.tsx
 *
 * Primary landing page:
 * - Clear hero communicating the 3-step value proposition (Assess -> Plan -> Sustain)
 * - 4 interactive Demo Profile switcher cards with "Load Demo Profile" -> /dashboard
 * - "Start Fresh Assessment" primary CTA
 * - Collapsible "What is SIP Fit?" FAQ section
 * - Quick-access links to Simulator, AI Education, and Payment Troubleshooter
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useCashflowStore } from '../store/useCashflowStore';
import { allDemoProfiles } from '../data/demoProfiles';
import { formatINR } from '../validation/currencyParser';
import { track } from '../utils/analytics';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  BookOpen,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'What is Groww SIP Fit?',
    a: 'Groww SIP Fit is an AI-powered financial readiness decision aid. Before you commit your hard-earned savings into recurring mutual fund SIPs, it analyzes your fixed obligations, rent, EMIs, and emergency cushion to ensure you never start an investment you are forced to stop prematurely.',
  },
  {
    q: 'Why should I check my SIP readiness before investing?',
    a: 'Over 30% of new retail SIPs in India are paused, stopped, or bounce within 12 months due to cash-flow strain and emergency expenses. SIP Fit ensures your investment debit dates align with your salary and verifies that you have a liquid safety buffer first.',
  },
  {
    q: 'Does Groww SIP Fit recommend specific mutual fund schemes or stocks?',
    a: 'No. Under SEBI compliance regulations, Groww SIP Fit is strictly an educational readiness guide and financial planning tool. We calculate mathematical affordability and readiness tiers—we do not recommend specific fund schemes, stocks, or promise returns.',
  },
  {
    q: 'How does the deterministic financial engine work?',
    a: 'All financial numbers (available surplus, emergency reserve targets, indicative SIP range) are computed using pure mathematical functions in TypeScript. The AI never invents numbers; it only translates verified engine calculations into plain English advice.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. All data is saved exclusively in your browser\'s local storage. We do not require, collect, or store your PAN, Aadhaar, bank credentials, or OTPs. Any accidental entry of sensitive numbers is immediately scrubbed by our built-in Layer 5 privacy redactor.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchPersona, activePersona, currentUser } = useUserStore();
  const { setProfile } = useFinancialProfileStore();
  const { startSession, session } = useAssessmentStore();
  const { seedFromProfile } = useCashflowStore();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleStartFresh = () => {
    track('Assessment_started', {
      userId: currentUser?.id || 'demo-user',
      profileType: 'fresh_user',
    });
    startSession();
    navigate('/assess');
  };

  const handleLoadPersona = (personaKey: keyof typeof allDemoProfiles) => {
    const persona = allDemoProfiles[personaKey];
    if (persona) {
      switchPersona(personaKey);
      setProfile(persona.profile);
      seedFromProfile(persona.profile);
      track('Contextual_action_clicked', {
        action: 'load_demo_profile',
        persona: personaKey,
        page: 'landing',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── HERO SECTION ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full mb-4 shadow-2xs">
          <Sparkles size={13} className="text-emerald-600" />
          AI-Powered Financial Readiness & SIP Continuity
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
          Never start an SIP you can't comfortably sustain.
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          Evaluate your recurring obligations, emergency cushion, and salary timing before committing to your first mutual fund investment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={handleStartFresh}
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{session?.status === 'in_progress' ? 'Resume Assessment' : 'Start Fresh Assessment'}</span>
            <ArrowRight size={16} />
          </button>
          <Link
            to="/simulator"
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Activity size={16} className="text-emerald-600" />
            <span>Try Scenario Simulator</span>
          </Link>
        </div>
      </section>

      {/* ── 3-STEP VALUE PROPOSITION (Assess -> Plan -> Sustain) ── */}
      <section className="bg-white border-y border-gray-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Methodology
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              A 3-Step Bridge to Long-Term Wealth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">
                1. Assess (Conversational)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Adaptive, jargon-free dialogue collects income stability, rent, active EMIs, and emergency savings one gentle question at a time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">
                2. Plan (Deterministic Math)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pure TypeScript engine deducts fixed expenses, a 10% irregular buffer, and target reserve contributions to calculate safe SIP capacity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">
                3. Sustain (Continuity Dashboard)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Simulate rent hikes, medical shocks, and salary delays. The cash-flow calendar highlights conflict days before debits bounce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 DEMO PROFILE SWITCHER CARDS ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Realistic Indian Investor Personas
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Test Pre-Seeded Financial Profiles
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
            Instant 1-Click Load
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(allDemoProfiles)
            .filter(([key]) => key !== 'demo')
            .map(([key, item]) => {
              const isActive = activePersona === item.user.persona;

              return (
                <div
                  key={key}
                  className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-base text-gray-900">{item.user.name}</span>
                      {isActive && <CheckCircle2 size={18} className="text-emerald-600" />}
                    </div>

                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md block w-fit mb-2">
                      {item.profile.income.type === 'salaried_fixed'
                        ? 'Salaried Fixed'
                        : item.profile.income.type === 'salaried_variable'
                        ? 'Variable Bonus'
                        : 'Freelancer'}
                    </span>

                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-xs font-medium space-y-1 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Take-Home:</span>
                        <span className="font-bold text-gray-900">
                          {formatINR(item.profile.income.monthlyTakeHome)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Emergency:</span>
                        <span className="font-bold text-gray-900">
                          {formatINR(item.profile.savings.accessibleEmergencyFund)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Goal:</span>
                        <span className="font-bold text-gray-900 truncate max-w-[100px]">
                          {item.profile.goal.purpose}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadPersona(key as keyof typeof allDemoProfiles)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <span>{isActive ? 'View in Dashboard →' : 'Load Demo Profile'}</span>
                  </button>
                </div>
              );
            })}
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS GRID ── */}
      <section className="bg-white border-y border-gray-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Complete Tool Suite
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Engineered for Complete Peace of Mind
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              to="/simulator"
              className="p-6 bg-slate-50/70 rounded-2xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Activity size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">Scenario Simulator</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Stack up to 6 real-world cash-flow shocks: delayed salary (+5 to +15 days), rent hikes, medical emergencies, and variable income months.
              </p>
              <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                Launch Stress-Test →
              </span>
            </Link>

            <Link
              to="/education"
              className="p-6 bg-slate-50/70 rounded-2xl border border-gray-200/80 hover:border-blue-500 hover:shadow-xs transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                <BookOpen size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">AI Education Assistant</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Understand NAV, volatility, rupee-cost averaging, and horizon-matching through personalized explanations matched to your financial goal.
              </p>
              <span className="text-xs font-bold text-blue-700 group-hover:underline flex items-center gap-1">
                Ask Questions →
              </span>
            </Link>

            <Link
              to="/payment-help"
              className="p-6 bg-slate-50/70 rounded-2xl border border-gray-200/80 hover:border-purple-500 hover:shadow-xs transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">Payment & AutoPay Help</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                5-step diagnostic troubleshooter for failed debits, pending mandates, bank account switches, and pausing vs stopping SIPs.
              </p>
              <span className="text-xs font-bold text-purple-700 group-hover:underline flex items-center gap-1">
                Troubleshoot Issues →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COLLAPSIBLE FAQ SECTION ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Common Questions
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-sm text-gray-900 hover:bg-gray-50 transition"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
