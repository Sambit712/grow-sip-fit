/**
 * BottomNav.tsx
 *
 * Dedicated mobile bottom navigation bar with quick tap targets.
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CheckCircle2, LayoutDashboard, Activity, BookOpen, User } from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Assess', path: '/assess', icon: CheckCircle2 },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Simulator', path: '/simulator', icon: Activity },
  { name: 'Education', path: '/education', icon: BookOpen },
  { name: 'Profile', path: '/profile', icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const location = useLocation();

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around py-1.5 px-2 shadow-lg ${className}`}>
      {NAV_LINKS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[50px] rounded-lg transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon size={19} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

