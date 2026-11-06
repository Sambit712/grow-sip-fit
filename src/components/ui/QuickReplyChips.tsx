import React from 'react';

interface QuickReplyChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const QuickReplyChips: React.FC<QuickReplyChipsProps> = ({
  options,
  onSelect,
  disabled = false,
}) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 animate-fadeIn">
      {options.map((option, idx) => (
        <button
          key={`${option}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all duration-150 text-left
            ${
              disabled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white hover:bg-emerald-50 text-gray-800 border-gray-300 hover:border-emerald-500 hover:text-emerald-700 active:scale-95 shadow-sm'
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

