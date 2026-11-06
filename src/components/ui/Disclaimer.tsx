/**
 * Disclaimer.tsx
 *
 * Mandatory regulatory and prototype disclaimer footer component.
 * Rendered across all application views and in the persistent AppShell.
 */

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface DisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <footer className={`py-3 px-4 text-center text-[11px] text-gray-500 bg-white/80 border-t border-gray-200 ${className}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
          <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
          <span>
            Groww SIP Fit is a financial readiness decision aid and educational simulator. It does not provide SEBI-registered investment advice or guarantee returns. Prototype demonstration only.
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-white border-t border-gray-200/90 py-5 px-6 text-gray-500 text-xs ${className}`}>
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-gray-700">
              Regulatory & Prototype Notice
            </p>
            <p className="leading-relaxed text-gray-500">
              Groww SIP Fit is a financial readiness decision aid and educational simulator. It does not provide SEBI-registered investment advice, stock recommendations, or guarantee future returns. All calculations are mathematical derivations based on self-reported inputs.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Info size={12} />
            Mutual fund investments are subject to market risks. Read all scheme related documents carefully.
          </span>
          <span>Groww SIP Fit MVP Prototype</span>
        </div>
      </div>
    </footer>
  );
};

