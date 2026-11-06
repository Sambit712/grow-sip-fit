import React from 'react';
import type { CashflowEvent, ConflictWarning } from '../../types/CashflowEvent';
import { formatINR } from '../../validation/currencyParser';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CashflowCalendarViewProps {
  events: CashflowEvent[];
  conflicts: ConflictWarning[];
  openingBalance: number;
  safetyBuffer?: number;
}

export const CashflowCalendarView: React.FC<CashflowCalendarViewProps> = ({
  events,
  conflicts,
  openingBalance,
  safetyBuffer = 5000,
}) => {
  // Compute day-by-day running balance for 31 days
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dayEvents = events.filter((e) => e.dayOfMonth === day);
    const dayInflows = dayEvents.filter((e) => e.isInflow).reduce((acc, e) => acc + e.amount, 0);
    const dayOutflows = dayEvents.filter((e) => !e.isInflow).reduce((acc, e) => acc + e.amount, 0);
    return {
      day,
      events: dayEvents,
      inflows: dayInflows,
      outflows: dayOutflows,
    };
  });

  // Calculate cumulative balance day-by-day
  let balance = Math.max(0, openingBalance);
  const calendarDays = dailyData.map((d) => {
    balance += d.inflows - d.outflows;
    const isBelowBuffer = balance < safetyBuffer;
    const hasSip = d.events.some((e) => e.category === 'sip');

    return {
      ...d,
      runningBalance: balance,
      isBelowBuffer,
      hasSip,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={18} className="text-emerald-600" />
            <span>Monthly Cash-Flow Calendar</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Running daily liquidity simulation across days 1–31 of the month.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Salary
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Outflows
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> SIP Debit
          </span>
        </div>
      </div>

      {/* Conflict Alert Banners */}
      {conflicts.length > 0 && (
        <div className="mb-4 space-y-2">
          {conflicts.slice(0, 2).map((c, i) => (
            <div
              key={`conflict-${i}`}
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Day {c.conflictDay} Cash-Flow Warning: </span>
                <span>{c.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 31-Day Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((d) => (
          <div
            key={d.day}
            className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
              d.isBelowBuffer
                ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400'
                : d.events.length > 0
                ? 'bg-slate-50 border-gray-200'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold ${
                  d.isBelowBuffer ? 'text-red-700 font-extrabold' : 'text-gray-700'
                }`}
              >
                {d.day}
              </span>
              {d.hasSip && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="SIP Debit Date" />
              )}
            </div>

            {/* Events indicators */}
            <div className="space-y-0.5 my-1">
              {d.inflows > 0 && (
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center leading-none">
                  <ArrowDownRight size={10} className="shrink-0" />
                  <span className="truncate">+{formatINR(d.inflows, true)}</span>
                </div>
              )}
              {d.outflows > 0 && (
                <div className="text-[10px] text-red-600 font-semibold flex items-center leading-none">
                  <ArrowUpRight size={10} className="shrink-0" />
                  <span className="truncate">-{formatINR(d.outflows, true)}</span>
                </div>
              )}
            </div>

            {/* Estimated balance on that day */}
            <div className="text-[9px] font-mono text-gray-500 text-right truncate">
              {formatINR(d.runningBalance, true)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1 text-[11px]">
          <Info size={12} className="text-gray-400" />
          <span>Safety buffer threshold: {formatINR(safetyBuffer)}</span>
        </span>
        <span className="text-[11px] text-gray-400">
          Red highlights indicate days where cash balance dips below buffer.
        </span>
      </div>
    </div>
  );
};

