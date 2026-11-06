import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR } from '../../validation/currencyParser';

interface ExpenseItem {
  name: string;
  value: number;
  color: string;
}

interface ExpenseBreakdownPieProps {
  expenses: {
    rent: number;
    groceriesAndUtilities: number;
    transportAndHealthcare: number;
    familySupport: number;
    discretionary: number;
    emis: number;
  };
}

const COLORS = ['#00D09C', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

export const ExpenseBreakdownPie: React.FC<ExpenseBreakdownPieProps> = ({ expenses }) => {
  const data: ExpenseItem[] = [
    { name: 'Rent / Housing', value: expenses.rent, color: COLORS[0] },
    { name: 'Groceries & Bills', value: expenses.groceriesAndUtilities, color: COLORS[1] },
    { name: 'Transport & Health', value: expenses.transportAndHealthcare, color: COLORS[2] },
    { name: 'Family Support', value: expenses.familySupport, color: COLORS[3] },
    { name: 'Discretionary', value: expenses.discretionary, color: COLORS[4] },
    { name: 'Active EMIs', value: expenses.emis, color: COLORS[5] },
  ].filter((item) => item.value > 0);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900">Monthly Expense Breakdown</h3>
        <span className="text-xs font-semibold text-gray-500 font-mono">
          Total: {formatINR(total)}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-gray-400">
          No expenses recorded
        </div>
      ) : (
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: unknown) => [formatINR(Number(val)), 'Amount']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600 truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

