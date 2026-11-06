/**
 * Badge.tsx
 *
 * Reusable badge component supporting readiness tiers and status variants.
 */

import React from 'react';

export type BadgeVariant =
  | 'emerald'
  | 'amber'
  | 'red'
  | 'blue'
  | 'purple'
  | 'gray'
  | 'ready'
  | 'limited'
  | 'attention'
  | 'unknown';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  limited: 'bg-amber-100 text-amber-800 border-amber-200',
  attention: 'bg-red-100 text-red-800 border-red-200',
  unknown: 'bg-slate-100 text-slate-800 border-slate-200',
};

const SIZE_STYLES = {
  sm: 'text-[10px] px-2 py-0.5 rounded-sm font-semibold',
  md: 'text-xs px-2.5 py-1 rounded-full font-bold',
  lg: 'text-sm px-3.5 py-1.5 rounded-full font-extrabold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center border tracking-tight ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
    >
      {children}
    </span>
  );
};

