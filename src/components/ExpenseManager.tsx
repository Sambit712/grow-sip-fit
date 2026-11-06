import React, { useState } from 'react';
import type { CashflowEvent, EventCategory } from '../types/CashflowEvent';
import { useCashflowStore } from '../store/useCashflowStore';
import { useFinancialProfileStore } from '../store/useFinancialProfileStore';
import { parseCurrencyInput, formatINR } from '../validation/currencyParser';
import { Plus, Edit2, Trash2, X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  salary: 'Salary Inflow',
  other_income: 'Other Income',
  rent: 'Rent / Housing',
  emi: 'Loan EMI',
  grocery: 'Groceries',
  utility: 'Utility Bills',
  insurance: 'Insurance',
  transport: 'Transport',
  healthcare: 'Healthcare',
  family_support: 'Family Support',
  subscription: 'Subscriptions',
  education: 'Education',
  sip: 'Mutual Fund SIP',
  discretionary: 'Entertainment',
  other_expense: 'Other Recurring',
};

export const ExpenseManager: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, recomputeConflicts } = useCashflowStore();
  const { profile } = useFinancialProfileStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('other_expense');
  const [amountStr, setAmountStr] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('5');
  const [isInflow, setIsInflow] = useState(false);
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('other_expense');
    setAmountStr('');
    setDayOfMonth('5');
    setIsInflow(false);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (event: CashflowEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setCategory(event.category);
    setAmountStr(event.amount.toString());
    setDayOfMonth(event.dayOfMonth.toString());
    setIsInflow(event.isInflow);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const parsedAmount = parseCurrencyInput(amountStr);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const day = parseInt(dayOfMonth, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('Day must be between 1 and 31');
      return;
    }

    if (editingId) {
      updateEvent(editingId, {
        title: title.trim(),
        category,
        amount: parsedAmount,
        dayOfMonth: day,
        isInflow,
      });
    } else {
      addEvent({
        profileId: profile.id,
        title: title.trim(),
        category,
        amount: parsedAmount,
        dayOfMonth: day,
        isInflow,
        isRecurring: true,
      });
    }

    recomputeConflicts(profile.income.creditDay || 5, profile.savings.accessibleEmergencyFund || 0);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    recomputeConflicts(profile.income.creditDay || 5, profile.savings.accessibleEmergencyFund || 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Recurring Commitments & Expenses</h3>
          <p className="text-xs text-gray-500">
            Add or adjust recurring payments to recalculate cash-flow conflict forecasts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Plus size={15} />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Title & Category</th>
              <th className="py-2.5 px-3">Scheduled Day</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No recurring events configured. Click "Add Commitment" above.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-900">{evt.title}</div>
                    <div className="text-[11px] text-gray-400">{CATEGORY_LABELS[evt.category]}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">
                    Day {evt.dayOfMonth} of month
                  </td>
                  <td className="py-3 px-3 font-bold font-mono">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        evt.isInflow ? 'text-emerald-600' : 'text-gray-900'
                      }`}
                    >
                      {evt.isInflow ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {formatINR(evt.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Edit Commitment"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Commitment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Commitment' : 'Add Recurring Commitment'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Commitment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Home Rent, Car Loan, Netflix"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Flow Type</label>
                  <select
                    value={isInflow ? 'inflow' : 'outflow'}
                    onChange={(e) => setIsInflow(e.target.value === 'inflow')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="outflow">Expense / Outflow (-)</option>
                    <option value="inflow">Income / Inflow (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="e.g. 15000 or 15k"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Day of Month (1–31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check size={14} />
                  <span>{editingId ? 'Save Changes' : 'Add Commitment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

