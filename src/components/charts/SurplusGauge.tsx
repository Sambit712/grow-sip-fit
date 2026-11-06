import React from 'react';
import { formatINR } from '../../validation/currencyParser';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface SurplusGaugeProps {
  surplus: number;
  income: number;
}

export const SurplusGauge: React.FC<SurplusGaugeProps> = ({ surplus, income }) => {
  const isPositive = surplus > 0;
  const ratio = income > 0 ? Math.min(100, Math.max(0, Math.round((surplus / income) * 100))) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Available Monthly Surplus
        </span>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {isPositive ? <TrendingUp size={13} /> : <AlertTriangle size={13} />}
          <span>{isPositive ? `${ratio}% of Income` : 'Deficit'}</span>
        </div>
      </div>

      <div className="my-2">
        <div
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {formatINR(surplus)}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isPositive
            ? 'Estimated surplus remaining after essential obligations and debts.'
            : 'Recurring obligations currently exceed your conservative monthly income.'}
        </p>
      </div>

      {/* Visual meter bar */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
          <span>0%</span>
          <span>Commitment Buffer: {ratio}%</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPositive ? (ratio >= 20 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(5, ratio)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

