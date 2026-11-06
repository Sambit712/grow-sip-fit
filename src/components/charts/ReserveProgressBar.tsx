import React from 'react';
import { formatINR } from '../../validation/currencyParser';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ReserveProgressBarProps {
  currentSavings: number;
  targetReserve: number;
  reserveMonths: number;
  gap: number;
}

export const ReserveProgressBar: React.FC<ReserveProgressBarProps> = ({
  currentSavings,
  targetReserve,
  reserveMonths,
  gap,
}) => {
  const percentage =
    targetReserve > 0 ? Math.min(100, Math.round((currentSavings / targetReserve) * 100)) : 100;

  const isFunded = gap === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Emergency Reserve Cushion</h3>
        <div
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
            isFunded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {isFunded ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
          <span>{isFunded ? 'Fully Funded' : `${percentage}% Covered`}</span>
        </div>
      </div>

      <div className="space-y-3 my-2">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold text-gray-900">{formatINR(currentSavings)}</div>
            <span className="text-xs text-gray-500">Accessible liquid savings</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{formatINR(targetReserve)}</div>
            <span className="text-xs text-gray-400">{reserveMonths}-month target</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFunded ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(4, percentage)}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
        <span>Emergency Reserve Gap:</span>
        <span className={`font-mono font-bold ${gap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          {gap > 0 ? formatINR(gap) : '₹0 (Target Met)'}
        </span>
      </div>
    </div>
  );
};

