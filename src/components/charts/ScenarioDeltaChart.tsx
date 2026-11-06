/**
 * ScenarioDeltaChart.tsx
 *
 * Recharts visualization comparing Before vs. After financial metrics
 * in the Financial Scenario Simulator.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatINR } from '../../validation/currencyParser';
import type { ScenarioResult } from '../../types/CashflowEvent';

interface ScenarioDeltaChartProps {
  result: ScenarioResult;
  className?: string;
}

export const ScenarioDeltaChart: React.FC<ScenarioDeltaChartProps> = ({
  result,
  className = '',
}) => {
  const data = [
    {
      metric: 'Monthly Surplus',
      Before: result.originalSurplus,
      After: result.newSurplus,
    },
    {
      metric: 'Reserve Gap',
      Before: result.originalReserveGap ?? 0,
      After: result.newReserveGap ?? 0,
    },
    {
      metric: 'Max SIP Capacity',
      Before: result.originalSipMax ?? 0,
      After: result.newSipMax ?? 0,
    },
  ];

  return (
    <div className={`w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Stress-Test Visual Comparison
          </h3>
          <span className="text-sm font-extrabold text-gray-900 block mt-0.5">
            Before vs. After Simulation Impact
          </span>
        </div>
        <span
          className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
            result.delta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {result.delta >= 0 ? '+' : ''}
          {formatINR(result.delta)} Surplus Δ
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              formatter={(value: any) => [formatINR(Number(value) || 0), '']}
              labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            <ReferenceLine y={0} stroke="#94A3B8" />
            <Bar dataKey="Before" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar
              dataKey="After"
              fill={result.delta >= 0 ? '#10B981' : '#F43F5E'}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

