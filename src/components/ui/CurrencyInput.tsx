import React, { useState } from 'react';
import { parseCurrencyInput, formatINR } from '../../validation/currencyParser';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface CurrencyInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  sensitivityNote?: string;
  initialValue?: number | string;
  onSubmit?: (val: string) => void;
  onChange?: (val: number | null) => void;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  placeholder = 'e.g. 50,000 or 50k',
  sensitivityNote,
  initialValue,
  onSubmit,
  onChange,
  disabled = false,
}) => {
  const [value, setValue] = useState(
    initialValue !== undefined ? String(initialValue) : ''
  );
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [hasError, setHasError] = useState(false);

  const parsedValue = parseCurrencyInput(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    if (hasError) setHasError(false);
    if (onChange) {
      onChange(parseCurrencyInput(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !value.trim()) return;

    if (parsedValue === null && value.trim() !== '0') {
      setHasError(true);
      return;
    }

    setHasError(false);
    if (onSubmit) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <div className="w-full pt-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1">
          {label}
        </label>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
              ₹
            </span>
            <input
              id={id}
              type="text"
              disabled={disabled}
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`w-full pl-7 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
                hasError
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
          </div>
          {onSubmit && (
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
            >
              <span>Confirm</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>

        {/* Live parsed feedback or error */}
        <div className="flex items-center justify-between text-xs px-1">
          {hasError ? (
            <span className="text-red-500 font-medium">
              Please enter a valid amount (e.g. 25,000, 25k, or 2.5L)
            </span>
          ) : parsedValue !== null && value.trim() !== '' ? (
            <span className="text-emerald-700 font-medium">
              Interpreted as: {formatINR(parsedValue)}
            </span>
          ) : (
            <span className="text-gray-400">Accepts 25k, 2.5L, 25,000, etc.</span>
          )}

          {sensitivityNote && (
            <button
              type="button"
              onClick={() => setShowSensitivity(!showSensitivity)}
              className="text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <HelpCircle size={13} />
              <span>Why do we ask this?</span>
            </button>
          )}
        </div>

        {/* Sensitivity note tooltip box */}
        {showSensitivity && sensitivityNote && (
          <div className="p-2.5 mt-1 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs text-emerald-800 animate-fadeIn">
            <span className="font-semibold">Privacy & Purpose: </span>
            {sensitivityNote}
          </div>
        )}
      </form>
    </div>
  );
};

