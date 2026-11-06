import React from 'react';
import type { AssessmentCategory } from '../../types/AssessmentSession';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentCategory: AssessmentCategory;
  stepIndex: number;
  totalSteps: number;
}

const CATEGORIES: Array<{ id: AssessmentCategory; label: string }> = [
  { id: 'goals', label: 'Goals' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'liabilities', label: 'Debt' },
  { id: 'savings', label: 'Savings' },
  { id: 'investments', label: 'Investments' },
  { id: 'risk', label: 'Risk' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentCategory,
  stepIndex,
  totalSteps,
}) => {
  const currentCategoryIdx = CATEGORIES.findIndex((c) => c.id === currentCategory);
  const percentage = Math.min(100, Math.round(((stepIndex + 1) / totalSteps) * 100));

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1.5 text-gray-700">
            <span className="font-semibold text-emerald-600">
              Category {Math.max(1, currentCategoryIdx + 1)} of {CATEGORIES.length}:
            </span>
            <span className="text-gray-900 font-bold">
              {CATEGORIES[currentCategoryIdx]?.label ?? 'Assessment'}
            </span>
          </div>
          <span className="text-gray-500 font-mono text-xs">{percentage}% completed</span>
        </div>

        {/* Category breadcrumb chips */}
        <div className="hidden sm:flex items-center justify-between gap-1 pt-1">
          {CATEGORIES.map((cat, idx) => {
            const isCompleted = idx < currentCategoryIdx;
            const isCurrent = idx === currentCategoryIdx;

            return (
              <div
                key={cat.id}
                className={`flex items-center gap-1 text-xs py-0.5 px-2 rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-emerald-100 text-emerald-800 font-semibold'
                    : isCompleted
                    ? 'text-gray-600 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={13} className="text-emerald-600" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
                <span>{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-0.5">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

