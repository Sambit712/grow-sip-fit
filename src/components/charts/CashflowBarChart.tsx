import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { formatINR } from '../../validation/currencyParser';

interface CashflowBarChartProps {
  income: number;
  essentialExpenses: number;
  emis: number;
  surplus: number;
}

export const CashflowBarChart: React.FC<CashflowBarChartProps> = ({
  income,
  essentialExpenses,
  emis,
  surplus,
}) => {
  const chartData = [
    {
      name: 'Cash Flow',
      Income: income,
      Essentials: essentialExpenses,
      EMIs: emis,
      Surplus: Math.max(0, surplus),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900">Income vs. Obligations</h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          Monthly Flow
        </span>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(val) => formatINR(val, true)} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(val: unknown) => [formatINR(Number(val)), '']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="Income" fill="#00D09C" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Essentials" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="EMIs" fill="#EF4444" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Surplus" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-around text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D09C]" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>Essentials</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>EMIs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Surplus</span>
        </div>
      </div>
    </div>
  );
};

