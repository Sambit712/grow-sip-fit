/**
 * Card.tsx
 *
 * Clean elevated container primitive for dashboards, reports, and controls.
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div>
            {title && <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

