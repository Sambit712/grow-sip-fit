/**
 * ProfilePage.tsx
 *
 * User Profile & Financial Settings Page:
 * - Read-only cards across all 6 financial domains
 * - "Edit Financial Details" modal with Zod schema validation
 * - "Re-take Assessment" button (clears assessment session, navigates to /assess)
 * - "Reset Demo Profile" confirmation dialog
 * - "Delete All My Data" confirmation dialog (clears all stores and localStorage)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { useReportStore } from '../store/useReportStore';
import { useScenarioStore } from '../store/useScenarioStore';
import { useCashflowStore } from '../store/useCashflowStore';
import { allDemoProfiles } from '../data/demoProfiles';
import { formatINR } from '../validation/currencyParser';
import { profileSchema } from '../validation/profileSchema';
import { track } from '../utils/analytics';
import type { FinancialProfile } from '../types/FinancialProfile';
import {
  RotateCcw,
  Trash2,
  Edit3,
  AlertTriangle,
  Briefcase,
  Home,
  Shield,
  CreditCard,
  Target,
  Compass,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const { currentUser, activePersona, resetUser } = useUserStore();
  const { profile, setProfile, deleteProfile } = useFinancialProfileStore();
  const { resetSession } = useAssessmentStore();
  const { clearReport } = useReportStore();
  const { clearScenarios } = useScenarioStore();
  const { seedFromProfile } = useCashflowStore();

  const activeProfile: FinancialProfile = profile || allDemoProfiles[activePersona]?.profile || allDemoProfiles.profileA.profile;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);

  // Local form state for editing
  const [formData, setFormData] = useState<FinancialProfile>(JSON.parse(JSON.stringify(activeProfile)));

  const handleOpenEdit = () => {
    setFormData(JSON.parse(JSON.stringify(activeProfile)));
    setEditErrors([]);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrors([]);

    const validation = profileSchema.safeParse(formData);

    if (!validation.success) {
      const messages = validation.error.issues.map((i) => `${String(i.path.join('.'))}: ${i.message}`);
      setEditErrors(messages);
      return;
    }

    // Save validated profile
    setProfile(validation.data as FinancialProfile);
    seedFromProfile(validation.data as FinancialProfile);

    track('Profile_updated', {
      userId: currentUser?.id || 'demo-user',
      updatedFields: Object.keys(formData),
    });

    setIsEditModalOpen(false);
  };

  const handleRetakeAssessment = () => {
    resetSession();
    track('Contextual_action_clicked', {
      action: 'retake_assessment',
      page: 'profile',
    });
    navigate('/assess');
  };

  const handleResetDemoProfile = () => {
    const original = allDemoProfiles[activePersona];
    if (original) {
      setProfile(JSON.parse(JSON.stringify(original.profile)));
      seedFromProfile(original.profile);
    }
    setIsResetConfirmOpen(false);
  };

  const handleDeleteAllData = () => {
    deleteProfile();
    resetSession();
    clearReport();
    clearScenarios();
    resetUser();
    localStorage.clear();
    setIsDeleteConfirmOpen(false);
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900">{currentUser?.name || 'My Profile'}</h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">
                {activePersona.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target Goal: <strong>{activeProfile.goal.purpose}</strong> (Horizon: {activeProfile.goal.horizonYears} yrs)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenEdit}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 size={14} />
            <span>Edit Financial Details</span>
          </button>
          <button
            onClick={handleRetakeAssessment}
            className="px-3.5 py-2 text-xs font-bold bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Re-take Assessment</span>
          </button>
        </div>
      </div>

      {/* 6 Category Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Income */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-emerald-600" />
              Monthly Income
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Day {activeProfile.income.creditDay}
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Take-Home:</span>
              <span className="font-bold text-gray-900 font-mono">
                {formatINR(activeProfile.income.monthlyTakeHome)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span>Income Type:</span>
              <span className="capitalize font-semibold text-gray-800">
                {activeProfile.income.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Other Income:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.income.otherReliableIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Essential Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Home size={14} className="text-emerald-600" />
              Living Expenses
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
              Monthly
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Rent:</span>
              <span className="font-bold text-gray-900 font-mono">
                {formatINR(activeProfile.expenses.rent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Groceries & Bills:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.expenses.groceriesAndUtilities)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discretionary:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.expenses.discretionary)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Liabilities & EMIs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-600" />
              Liabilities
            </span>
            <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
              Fixed Debt
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Active EMIs:</span>
              <span className="font-bold text-gray-900 font-mono">
                {formatINR(activeProfile.liabilities.activeEmisMonthly)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span>Credit Card Debt:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.liabilities.creditCardDebt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Large Commitments:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.liabilities.upcomingLargeCommitments)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Savings & Emergency Fund */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-600" />
              Emergency Reserve
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {activeProfile.savings.reserveMonthsTarget} Months
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Accessible Savings:</span>
              <span className="font-bold text-gray-900 font-mono">
                {formatINR(activeProfile.savings.accessibleEmergencyFund)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Target Reserve:</span>
              <span className="font-semibold text-gray-800">
                {activeProfile.savings.reserveMonthsTarget}x essential expenses
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Financial Goal */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-emerald-600" />
              Target Goal
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              {activeProfile.goal.horizonYears} Years
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Purpose:</span>
              <span className="font-bold text-gray-900 truncate max-w-[130px]">
                {activeProfile.goal.purpose}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Target Corpus:</span>
              <span className="font-bold text-gray-900 font-mono">
                {formatINR(activeProfile.goal.targetAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Already Saved:</span>
              <span className="font-mono text-gray-800">
                {formatINR(activeProfile.goal.alreadySaved)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Risk & Experience */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-emerald-600" />
              Risk Profile
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded capitalize">
              {activeProfile.risk.willingness}
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Willingness:</span>
              <span className="capitalize font-semibold text-gray-800">
                {activeProfile.risk.willingness}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className="capitalize font-semibold text-gray-800">
                {activeProfile.risk.capacity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Market Knowledge:</span>
              <span className="capitalize font-semibold text-gray-800">
                {activeProfile.risk.marketUnderstanding}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset Area */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            Data Management & Reset
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Reset this persona back to default parameters or wipe all data stored in this browser session.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Profile</span>
          </button>

          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Delete All My Data</span>
          </button>
        </div>
      </div>

      {/* ── EDIT FINANCIAL DETAILS MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-lg font-black text-gray-900">Edit Financial Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {editErrors.length > 0 && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs mb-4 space-y-1">
                <div className="font-bold">Validation Errors:</div>
                <ul className="list-disc list-inside">
                  {editErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Income */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase">Income</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Monthly Take-Home (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.income.monthlyTakeHome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          income: { ...formData.income, monthlyTakeHome: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Credit Day of Month (1–31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.income.creditDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          income: { ...formData.income, creditDay: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase">Monthly Expenses</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.expenses.rent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expenses: { ...formData.expenses, rent: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Groceries & Bills (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.expenses.groceriesAndUtilities}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expenses: {
                            ...formData.expenses,
                            groceriesAndUtilities: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Liabilities & Savings */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase">Debt & Emergency Savings</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Active Monthly EMIs (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.liabilities.activeEmisMonthly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          liabilities: {
                            ...formData.liabilities,
                            activeEmisMonthly: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Accessible Emergency Fund (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.savings.accessibleEmergencyFund}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          savings: {
                            ...formData.savings,
                            accessibleEmergencyFund: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase">Target Goal</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Goal Purpose
                    </label>
                    <input
                      type="text"
                      value={formData.goal.purpose}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goal: { ...formData.goal, purpose: e.target.value },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Horizon (Years)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="30"
                      value={formData.goal.horizonYears}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goal: { ...formData.goal, horizonYears: Number(e.target.value) },
                        })
                      }
                      className="w-full text-xs border rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  Save & Re-calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET DEMO PROFILE CONFIRM MODAL ── */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 space-y-4">
            <h3 className="text-base font-black text-gray-900">Reset Demo Persona?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This will restore the original seeded values for <strong>{allDemoProfiles[activePersona]?.user.name}</strong>. Any custom modifications will be replaced.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDemoProfile}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ALL DATA CONFIRM MODAL ── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-red-100 space-y-4">
            <h3 className="text-base font-black text-red-900">Delete All My Data?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This will permanently wipe all local storage data, including your financial profile, assessment progress, cash-flow events, and saved scenarios. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
