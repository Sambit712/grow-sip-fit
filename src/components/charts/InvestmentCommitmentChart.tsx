import React from 'react';
import { formatINR } from '../../validation/currencyParser';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';

interface InvestmentCommitmentProps {
  existingSips: number;
  sipMin: number;
  sipMax: number;
}

export const InvestmentCommitmentChart: React.FC<InvestmentCommitmentProps> = ({
  existingSips,
  sipMin,
  sipMax,
}) => {
  const avgNewCapacity = Math.round((sipMin + sipMax) / 2);
  const data = [
    { name: 'Existing SIPs', value: existingSips, color: '#3B82F6' },
    { name: 'New SIP Capacity', value: avgNewCapacity, color: '#00D09C' },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900">Investment Commitment Capacity</h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Layers size={12} />
          <span>Recurring</span>
        </span>
      </div>

      <div className="flex items-center gap-4 my-2">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                dataKey="value"
                paddingAngle={4}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: unknown) => [formatINR(Number(val)), '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3 text-xs">
          <div>
            <div className="text-gray-400 font-medium">Existing SIP Commitments</div>
            <div className="text-base font-bold text-gray-800">{formatINR(existingSips)}/mo</div>
          </div>
          <div>
            <div className="text-gray-400 font-medium">Indicative New SIP Capacity</div>
            <div className="text-base font-bold text-emerald-600">
              {sipMax > 0 ? `${formatINR(sipMin)} – ${formatINR(sipMax)}/mo` : '₹0/mo'}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
        Total Potential Recurring: {formatINR(existingSips + avgNewCapacity)}/month
      </div>
    </div>
  );
};

