/**
 * PaymentHelpPage.tsx
 *
 * Payment & AutoPay Troubleshooter (Phase 5).
 * Guides users through 6 critical payment and mandate failure scenarios:
 * 1. Insufficient balance for SIP debit
 * 2. AutoPay mandate pending / not registered
 * 3. Bank account changed
 * 4. SIP shown as failed but bank debited
 * 5. Payment processing delay
 * 6. Stopping SIP vs. disabling AutoPay
 *
 * Features:
 * - 3–5 step diagnostic flow with interactive clarifying questions
 * - Realistic mock transaction details (amounts, UMRN, UTR, failure codes)
 * - Concrete Groww UI navigation steps
 * - Explicit simulation disclaimers (never claims real bank access)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PAYMENT_SCENARIOS, type MockPaymentScenario } from '../data/paymentScenarios';
import { formatINR } from '../validation/currencyParser';
import { track } from '../utils/analytics';
import { useUserStore } from '../store/useUserStore';

export const PaymentHelpPage: React.FC = () => {
  const { currentUser } = useUserStore();
  const scenarioKeys = Object.keys(PAYMENT_SCENARIOS);
  const [selectedKey, setSelectedKey] = useState<string>('insufficient_balance');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const scenario: MockPaymentScenario = PAYMENT_SCENARIOS[selectedKey] || PAYMENT_SCENARIOS.insufficient_balance;

  const handleSelectScenario = (key: string) => {
    setSelectedKey(key);
    setSelectedOption(null);
    track('AI_question_asked', {
      topic: `payment_${key}`,
      userId: currentUser?.id || 'demo-user',
    });
  };

  const getStatusBadge = (status: MockPaymentScenario['simulatedDetails']['status']) => {
    switch (status) {
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            DEBIT FAILED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            MANDATE PENDING
          </span>
        );
      case 'SUCCESS_UNCONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            CONFIRMATION AWAITED
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            ACTION REQUIRED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                G
              </div>
              <span className="hidden sm:inline">Groww SIP Fit</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">Payment & AutoPay Help</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 bg-white transition"
            >
              Cashflow Dashboard
            </Link>
            <Link
              to="/education"
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
            >
              Education Assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Intro Banner */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Payment & AutoPay Troubleshooter
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Diagnose mandate issues, failed debits, and processing delays with interactive step-by-step guidance.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <span>ℹ️</span> Simulated Diagnostic Engine
            </span>
          </div>
        </div>

        {/* Issue Selector Chips */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Select Your Payment or Mandate Scenario:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {scenarioKeys.map((key) => {
              const item = PAYMENT_SCENARIOS[key];
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900 mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{item.shortDescription}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Simulated Order Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Simulated Order
              </span>
              {getStatusBadge(scenario.simulatedDetails.status)}
            </div>

            <div>
              <div className="text-base font-extrabold text-gray-900">
                {scenario.simulatedDetails.fundName}
              </div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {formatINR(scenario.simulatedDetails.amount)}
              </div>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Bank Account</span>
                <span className="font-bold text-gray-800">
                  {scenario.simulatedDetails.bankName} (••{scenario.simulatedDetails.accountLast4})
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Debit Schedule</span>
                <span className="font-semibold text-gray-800">
                  {scenario.simulatedDetails.scheduledDebitDate}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Mandate Reference</span>
                <span className="font-mono text-gray-700">
                  {scenario.simulatedDetails.mandateId}
                </span>
              </div>
              {scenario.simulatedDetails.utrNumber && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Bank UTR</span>
                  <span className="font-mono text-gray-700">
                    {scenario.simulatedDetails.utrNumber}
                  </span>
                </div>
              )}
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">NPCI / Error Code</span>
                <span className="font-mono text-red-600 font-bold">
                  {scenario.simulatedDetails.failureReasonCode}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Simulated Data Notice:</strong> This simulates a typical bank transaction error in the Indian mutual fund ecosystem. No real bank connection is made.
            </div>
          </div>

          {/* Right Column: 5-Step Diagnostic Tree (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            {/* Step 1: Specific Situation */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Step 1: What Happened
                </h3>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                  {scenario.diagnosticTree.step1_situation}
                </p>
              </div>
            </div>

            {/* Step 2: Probable Root Cause */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Step 2: Probable Root Cause
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {scenario.diagnosticTree.step2_probableReason}
                </p>
              </div>
            </div>

            {/* Step 3: Interactive Clarifying Question */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Step 3: Clarifying Assessment
                </h3>
                <p className="text-sm font-semibold text-gray-900 mb-2.5">
                  {scenario.diagnosticTree.step3_clarifyingQuestions.question}
                </p>
                <div className="flex flex-wrap gap-2">
                  {scenario.diagnosticTree.step3_clarifyingQuestions.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition ${
                        selectedOption === opt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {selectedOption && (
                  <div className="text-xs text-blue-800 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 mt-2.5">
                    ✓ Selected: <em>{selectedOption}</em>. Follow the Groww UI steps below to resolve this.
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Step-by-Step Groww UI Actions */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  Step 4: Groww App Resolution Steps
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 space-y-2.5">
                  {scenario.diagnosticTree.step4_growwUiSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-800 leading-relaxed">
                      <span className="font-extrabold text-emerald-600 mt-0.5">▶</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5: Escalation & Checklist */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                  Step 5: Support Escalation Guidance
                </h3>
                <p className="text-xs text-gray-700 mb-2">
                  {scenario.diagnosticTree.step5_escalation.contactGrowwWhen}
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {scenario.diagnosticTree.step5_escalation.checklist.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Groww SIP Fit Diagnostic Flow</span>
              <Link to="/simulator" className="text-emerald-600 font-bold hover:underline">
                Test Cashflow Shocks in Simulator →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
