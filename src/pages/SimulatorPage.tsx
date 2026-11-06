/**
 * SimulatorPage.tsx
 *
 * Financial Scenario Simulator (Phase 5).
 * Allows users to test real-world financial stressors:
 * - Scenario A: Delayed Salary
 * - Scenario B: Increased Rent
 * - Scenario C: Unexpected Medical Expense
 * - Scenario D: Reduced Income
 * - Scenario E: New EMI
 * - Scenario F: Variable Income Month
 *
 * Features:
 * - Instant synchronous recalculation (<16ms) via scenarioEngine.ts
 * - Multi-scenario stacking
 * - Side-by-side Before vs. After comparison with Delta badges
 * - Save Scenario functionality with up to 3 comparison tabs
 * - Conflict alerts and natural language explanation
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { useCashflowStore } from '../store/useCashflowStore';
import { useScenarioStore } from '../store/useScenarioStore';
import { runScenario } from '../engine/scenarioEngine';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { formatINR } from '../validation/currencyParser';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { ScenarioDeltaChart } from '../components/charts/ScenarioDeltaChart';
import { track } from '../utils/analytics';
import type { ScenarioModification, ScenarioResult } from '../types/CashflowEvent';
import type { FinancialProfile } from '../types/FinancialProfile';
import type { ReadinessTier } from '../types/FinancialReport';

export const SimulatorPage: React.FC = () => {
  const { profile, setProfile } = useFinancialProfileStore();
  const { events } = useCashflowStore();
  const { savedScenarios, saveScenario, removeSavedScenario } = useScenarioStore();

  // Ensure a valid profile exists for simulation
  const activeProfile = useMemo(() => {
    return profile || DEMO_PROFILES[0];
  }, [profile]);

  // If store was empty, seed with Profile A for convenience
  useEffect(() => {
    if (!profile) {
      setProfile(DEMO_PROFILES[0]);
    }
  }, [profile, setProfile]);

  // ── Scenario Control States ───────────────────────────────────────────
  // A: Delayed Salary
  const [delayedSalaryEnabled, setDelayedSalaryEnabled] = useState(false);
  const [delayedDays, setDelayedDays] = useState<number>(7);

  // B: Increased Rent
  const [increasedRentEnabled, setIncreasedRentEnabled] = useState(false);
  const [rentIncrease, setRentIncrease] = useState<number>(3000);

  // C: Unexpected Medical Expense
  const [medicalShockEnabled, setMedicalShockEnabled] = useState(false);
  const [medicalShockAmount, setMedicalShockAmount] = useState<number>(15000);

  // D: Reduced Income
  const [reducedIncomeEnabled, setReducedIncomeEnabled] = useState(false);
  const [reducedIncomePercent, setReducedIncomePercent] = useState<number>(20);

  // E: New EMI
  const [newEmiEnabled, setNewEmiEnabled] = useState(false);
  const [newEmiAmount, setNewEmiAmount] = useState<number>(8000);
  const [newEmiDay, setNewEmiDay] = useState<number>(10);

  // F: Variable Income Month
  const [variableMonthEnabled, setVariableMonthEnabled] = useState(false);
  const [variableMonthType, setVariableMonthType] = useState<'low' | 'typical' | 'high'>('low');

  // Compare Tab view state: 'active' or saved scenario id
  const [activeTab, setActiveTab] = useState<'active' | string>('active');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scenarioSaveName, setScenarioSaveName] = useState('');

  // ── Compose stacked modifications ─────────────────────────────────────
  const currentModifications = useMemo<ScenarioModification[]>(() => {
    const list: ScenarioModification[] = [];

    if (delayedSalaryEnabled) {
      list.push({
        type: 'delayed_salary',
        salaryDelayDays: delayedDays,
      });
    }

    if (increasedRentEnabled) {
      list.push({
        type: 'increased_rent',
        rentIncreaseAmount: rentIncrease,
      });
    }

    if (medicalShockEnabled) {
      list.push({
        type: 'unexpected_medical_expense',
        medicalExpenseAmount: medicalShockAmount,
      });
    }

    if (reducedIncomeEnabled) {
      list.push({
        type: 'reduced_income',
        incomeReductionFraction: reducedIncomePercent / 100,
      });
    }

    if (newEmiEnabled) {
      list.push({
        type: 'new_emi',
        newEmiAmount: newEmiAmount,
        newEmiDay: newEmiDay,
      });
    }

    if (variableMonthEnabled) {
      list.push({
        type: 'variable_income_month',
        variableIncomeMonth: variableMonthType,
      });
    }

    return list;
  }, [
    delayedSalaryEnabled,
    delayedDays,
    increasedRentEnabled,
    rentIncrease,
    medicalShockEnabled,
    medicalShockAmount,
    reducedIncomeEnabled,
    reducedIncomePercent,
    newEmiEnabled,
    newEmiAmount,
    newEmiDay,
    variableMonthEnabled,
    variableMonthType,
  ]);

  // ── Execute engine synchronously (<16ms) ──────────────────────────────
  const activeResult: ScenarioResult = useMemo(() => {
    if (currentModifications.length === 0) {
      // Default to baseline identity scenario
      return runScenario(
        activeProfile,
        { type: 'delayed_salary', salaryDelayDays: 0 },
        events
      );
    }

    return runScenario(activeProfile, currentModifications, events);
  }, [activeProfile, currentModifications, events]);

  // Fire analytics when scenarios are toggled
  useEffect(() => {
    if (currentModifications.length > 0) {
      track('Scenario_created', {
        userId: activeProfile.userId,
        scenarioTypes: currentModifications.map((m) => m.type),
      });
      track('Scenario_completed', {
        userId: activeProfile.userId,
        resultTier: activeResult.newReadinessTier,
      });
    }
  }, [currentModifications.length, activeResult.newReadinessTier, activeProfile.userId]);

  // Reset all controls to baseline
  const handleResetAll = () => {
    setDelayedSalaryEnabled(false);
    setIncreasedRentEnabled(false);
    setMedicalShockEnabled(false);
    setReducedIncomeEnabled(false);
    setNewEmiEnabled(false);
    setVariableMonthEnabled(false);
    setActiveTab('active');
  };

  // Save current scenario handler
  const handleSaveCurrentScenario = () => {
    const name =
      scenarioSaveName.trim() ||
      `Stress Test (${currentModifications.length || 0} factors)`;
    saveScenario(name, activeResult);
    setScenarioSaveName('');
    setSaveModalOpen(false);
  };

  // Helper for tier badges
  const getTierBadge = (tier: ReadinessTier) => {
    switch (tier) {
      case 'READY':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            READY
          </span>
        );
      case 'LIMITED_FLEXIBILITY':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            LIMITED FLEXIBILITY
          </span>
        );
      case 'LIQUIDITY_NEEDS_ATTENTION':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            LIQUIDITY UNDER ATTENTION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            MORE INFO NEEDED
          </span>
        );
    }
  };

  // Helper for delta formatting
  const renderDelta = (deltaValue: number, isCurrency = true, reverseGood = false) => {
    if (deltaValue === 0) {
      return <span className="text-xs font-bold text-gray-400">No change</span>;
    }
    const isNegative = deltaValue < 0;
    // For expenses/gaps, negative change is good; for surplus, positive change is good
    const isGood = reverseGood ? isNegative : !isNegative;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
          isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {isNegative ? '▼ ' : '▲ +'}
        {isCurrency ? formatINR(Math.abs(deltaValue)) : Math.abs(deltaValue)}
      </span>
    );
  };

  // Active displayed scenario (either active calculation or a saved one)
  const displayedResult: ScenarioResult = useMemo(() => {
    if (activeTab === 'active') {
      return activeResult;
    }
    const found = savedScenarios.find((s) => s.id === activeTab);
    return found ? found.result : activeResult;
  }, [activeTab, activeResult, savedScenarios]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Strip */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                G
              </div>
              <span className="hidden sm:inline">Groww SIP Fit</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">Scenario Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden md:inline">Profile:</span>
            <select
              value={activeProfile.id}
              onChange={(e) => {
                const found = DEMO_PROFILES.find((p: FinancialProfile) => p.id === e.target.value);
                if (found) setProfile(found);
              }}
              className="text-xs font-semibold bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {DEMO_PROFILES.map((p: FinancialProfile) => (
                <option key={p.id} value={p.id}>
                  {p.goal.purpose} ({p.income.type.replace('_', ' ')})
                </option>
              ))}
            </select>

            <Link
              to="/dashboard"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition"
            >
              Cashflow Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Intro Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Financial Stress-Test Simulator
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Simulate cash-flow shocks, salary delays, and rent hikes in real-time to assess your SIP continuity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentModifications.length > 0 && (
              <button
                onClick={handleResetAll}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Reset Scenarios ({currentModifications.length})
              </button>
            )}
            <button
              onClick={() => setSaveModalOpen(true)}
              disabled={savedScenarios.length >= 3}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50"
              title={savedScenarios.length >= 3 ? 'Maximum 3 scenarios saved' : 'Save current scenario'}
            >
              + Save This Scenario ({savedScenarios.length}/3)
            </button>
          </div>
        </div>

        {/* Comparison Tabs */}
        {savedScenarios.length > 0 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                activeTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⚡ Live Active Simulator
            </button>

            {savedScenarios.map((saved) => (
              <div
                key={saved.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                  activeTab === saved.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <button onClick={() => setActiveTab(saved.id)}>{saved.name}</button>
                <button
                  onClick={() => {
                    removeSavedScenario(saved.id);
                    if (activeTab === saved.id) setActiveTab('active');
                  }}
                  className="hover:text-red-300 ml-1 text-xs"
                  title="Remove scenario"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT PANEL: Scenario Controls (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Stress-Test Controls
              </h2>
              <span className="text-xs text-gray-400">Stack multiple factors</span>
            </div>

            {/* Scenario A: Delayed Salary */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                delayedSalaryEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={delayedSalaryEnabled}
                    onChange={(e) => setDelayedSalaryEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  A — Delayed Salary
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {delayedSalaryEnabled ? `+${delayedDays} days` : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Simulate your salary crediting late, testing if early-month SIP debits or EMIs bounce.
              </p>
              {delayedSalaryEnabled && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Delay duration:</span>
                    <span className="font-extrabold text-emerald-700">{delayedDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={delayedDays}
                    onChange={(e) => setDelayedDays(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between gap-2 pt-1">
                    {[5, 10, 15].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDelayedDays(d)}
                        className={`flex-1 py-1 text-xs font-bold rounded ${
                          delayedDays === d
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        +{d} days
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scenario B: Increased Rent */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                increasedRentEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={increasedRentEnabled}
                    onChange={(e) => setIncreasedRentEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  B — Increased Rent
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {increasedRentEnabled ? `+${formatINR(rentIncrease)}` : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Simulate annual rent hikes or lease escalation on your monthly surplus.
              </p>
              {increasedRentEnabled && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Rent increment:</span>
                    <span className="font-extrabold text-emerald-700">+{formatINR(rentIncrease)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={rentIncrease}
                    onChange={(e) => setRentIncrease(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between gap-2 pt-1">
                    {[1000, 3000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRentIncrease(amt)}
                        className={`flex-1 py-1 text-xs font-bold rounded ${
                          rentIncrease === amt
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scenario C: Unexpected Medical Expense */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                medicalShockEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={medicalShockEnabled}
                    onChange={(e) => setMedicalShockEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  C — Unexpected Medical Expense
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {medicalShockEnabled ? formatINR(medicalShockAmount) : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                One-time healthcare or home emergency shock tested against your liquidity buffer.
              </p>
              {medicalShockEnabled && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between gap-2">
                    {[5000, 10000, 25000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMedicalShockAmount(amt)}
                        className={`flex-1 py-1 text-xs font-bold rounded ${
                          medicalShockAmount === amt
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {formatINR(amt)}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <CurrencyInput
                      id="medical-custom"
                      label="Or custom shock amount"
                      placeholder="e.g. 20000"
                      onChange={(val: number | null) => {
                        if (val !== null) setMedicalShockAmount(val);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scenario D: Reduced Income */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                reducedIncomeEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={reducedIncomeEnabled}
                    onChange={(e) => setReducedIncomeEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  D — Reduced Income
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {reducedIncomeEnabled ? `-${reducedIncomePercent}%` : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Simulate pay cuts, loss of overtime, or reduced freelance retainer fees.
              </p>
              {reducedIncomeEnabled && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Income reduction:</span>
                    <span className="font-extrabold text-red-600">-{reducedIncomePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={reducedIncomePercent}
                    onChange={(e) => setReducedIncomePercent(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between gap-2 pt-1">
                    {[10, 20, 30].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setReducedIncomePercent(p)}
                        className={`flex-1 py-1 text-xs font-bold rounded ${
                          reducedIncomePercent === p
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        -{p}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scenario E: New EMI */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                newEmiEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={newEmiEnabled}
                    onChange={(e) => setNewEmiEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  E — New EMI Commitment
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {newEmiEnabled ? `${formatINR(newEmiAmount)}/mo` : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Test the affordability of taking on a new personal, gadget, or car loan EMI.
              </p>
              {newEmiEnabled && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Monthly EMI Amount
                    </label>
                    <CurrencyInput
                      id="new-emi-amount"
                      initialValue={newEmiAmount}
                      onChange={(val: number | null) => {
                        if (val !== null) setNewEmiAmount(val);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Debit Day of Month (1–31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newEmiDay}
                      onChange={(e) => setNewEmiDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                      className="w-full text-sm font-semibold border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scenario F: Variable Income Month */}
            <div
              className={`bg-white rounded-xl border p-4 transition ${
                variableMonthEnabled
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'border-gray-200 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={variableMonthEnabled}
                    onChange={(e) => setVariableMonthEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  F — Variable Income Month
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {variableMonthEnabled ? `${variableMonthType.toUpperCase()} month` : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Simulate low vs typical vs high earning months for freelancers and incentive-earners.
              </p>
              {variableMonthEnabled && (
                <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
                  {(['low', 'typical', 'high'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVariableMonthType(m)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded capitalize transition ${
                        variableMonthType === m
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m} Month
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL: Scenario Results & Impact (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Impact Analysis ({activeTab === 'active' ? 'Live Calculation' : 'Saved Scenario'})
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Deterministic Engine (&lt;16ms)
              </span>
            </div>

            {/* Before vs After Metric Grid */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Metric</div>
                <div className="col-span-3 text-right">Before</div>
                <div className="col-span-3 text-right">After</div>
                <div className="col-span-2 text-right">Δ Delta</div>
              </div>

              <div className="divide-y divide-gray-100 text-sm">
                {/* Available Monthly Surplus */}
                <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-gray-900 block">Available Surplus</span>
                    <span className="text-xs text-gray-400">Monthly free cash</span>
                  </div>
                  <div className="col-span-3 text-right font-semibold text-gray-700">
                    {formatINR(displayedResult.originalSurplus)}
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-gray-900">
                    {formatINR(displayedResult.newSurplus)}
                  </div>
                  <div className="col-span-2 text-right">
                    {renderDelta(displayedResult.delta, true, false)}
                  </div>
                </div>

                {/* Emergency Reserve Gap */}
                <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-gray-900 block">Reserve Gap</span>
                    <span className="text-xs text-gray-400">Needed for safety</span>
                  </div>
                  <div className="col-span-3 text-right font-semibold text-gray-700">
                    {formatINR(displayedResult.originalReserveGap ?? 0)}
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-gray-900">
                    {formatINR(displayedResult.newReserveGap ?? 0)}
                  </div>
                  <div className="col-span-2 text-right">
                    {renderDelta(
                      (displayedResult.newReserveGap ?? 0) - (displayedResult.originalReserveGap ?? 0),
                      true,
                      true
                    )}
                  </div>
                </div>

                {/* Financial Readiness Tier */}
                <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-gray-900 block">Readiness Tier</span>
                    <span className="text-xs text-gray-400">Overall risk status</span>
                  </div>
                  <div className="col-span-3 text-right">
                    {getTierBadge(displayedResult.originalReadinessTier)}
                  </div>
                  <div className="col-span-3 text-right">
                    {getTierBadge(displayedResult.newReadinessTier)}
                  </div>
                  <div className="col-span-2 text-right text-xs font-bold text-gray-500">
                    {displayedResult.originalReadinessTier === displayedResult.newReadinessTier
                      ? 'Unchanged'
                      : 'Tier Shift'}
                  </div>
                </div>

                {/* Indicative SIP Capacity Range */}
                <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-gray-900 block">SIP Capacity</span>
                    <span className="text-xs text-gray-400">Indicative range</span>
                  </div>
                  <div className="col-span-3 text-right font-semibold text-gray-700 text-xs">
                    {displayedResult.originalSipMax && displayedResult.originalSipMax > 0
                      ? `${formatINR(displayedResult.originalSipMin ?? 0)}–${formatINR(displayedResult.originalSipMax ?? 0)}`
                      : '₹0'}
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-gray-900 text-xs">
                    {displayedResult.newSipMax && displayedResult.newSipMax > 0
                      ? `${formatINR(displayedResult.newSipMin ?? 0)}–${formatINR(displayedResult.newSipMax ?? 0)}`
                      : '₹0'}
                  </div>
                  <div className="col-span-2 text-right">
                    {renderDelta(
                      (displayedResult.newSipMax ?? 0) - (displayedResult.originalSipMax ?? 0),
                      true,
                      false
                    )}
                  </div>
                </div>

                {/* Cashflow Pressure Conflicts */}
                <div className="grid grid-cols-12 px-4 py-3.5 items-center">
                  <div className="col-span-4">
                    <span className="font-bold text-gray-900 block">Pressure Points</span>
                    <span className="text-xs text-gray-400">Debit date conflicts</span>
                  </div>
                  <div className="col-span-3 text-right font-semibold text-gray-700">
                    {displayedResult.originalConflictCount} detected
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-gray-900">
                    {displayedResult.newConflicts.length} detected
                  </div>
                  <div className="col-span-2 text-right">
                    {renderDelta(
                      displayedResult.newConflicts.length - displayedResult.originalConflictCount,
                      false,
                      true
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Comparison Chart */}
            <ScenarioDeltaChart result={displayedResult} />

            {/* Explanation Synthesis Card */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 mb-1">
                    Simulation Insights & Recommendation
                  </h3>
                  <p className="text-sm text-emerald-900/90 leading-relaxed">
                    {displayedResult.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Cashflow Conflict Warnings */}
            {displayedResult.newConflicts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-black">⚠️</span>
                  <h3 className="text-sm font-bold text-amber-900">
                    {displayedResult.newConflicts.length} Cash-Flow Timing Warning(s)
                  </h3>
                </div>
                {displayedResult.newConflicts.map((c, i) => (
                  <div
                    key={i}
                    className="bg-white/80 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-900"
                  >
                    <div className="font-bold mb-1">
                      Pressure Point on Day {c.conflictDay} of the month
                    </div>
                    <div>{c.suggestion}</div>
                    <div className="text-[11px] text-amber-700/80 mt-1">
                      Estimated Balance: {formatINR(c.estimatedBalance)} vs Safety Buffer {formatINR(c.safetyBuffer)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contextual Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-black transition shadow-xs"
              >
                View in Monthly Calendar →
              </Link>
              <Link
                to="/education"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Ask AI Assistant About Volatility
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Save Scenario Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Save Scenario for Comparison</h3>
            <p className="text-xs text-gray-500 mb-4">
              Save up to 3 scenarios to compare side-by-side or revisit later.
            </p>
            <input
              type="text"
              placeholder="e.g. Rent +3k & 10-day salary delay"
              value={scenarioSaveName}
              onChange={(e) => setScenarioSaveName(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentScenario}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
              >
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
