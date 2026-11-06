/**
 * TopBar.tsx
 *
 * Sticky responsive top navigation header for mobile and desktop contexts.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface TopBarProps {
  title?: string;
  showProfileSelector?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'Groww SIP Fit',
}) => {
  const { currentUser } = useUserStore();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-20 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-gray-900 font-extrabold tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
          SIP
        </div>
        <span className="text-base sm:text-lg">{title}</span>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
          FIT
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-800 transition"
        >
          <User size={14} className="text-gray-500" />
          <span className="truncate max-w-[120px]">{currentUser?.name || 'My Profile'}</span>
        </Link>
      </div>
    </header>
  );
};
