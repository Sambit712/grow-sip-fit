/**
 * AppShell.tsx
 *
 * Core responsive application layout shell:
 * - Desktop: fixed left sidebar with active link border, profile badge, and clean branding
 * - Mobile: sticky top header + bottom navigation bar for one-thumb access
 * - Houses child pages and the persistent Disclaimer footer
 */

import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  CheckCircle2,
  LayoutDashboard,
  Activity,
  BookOpen,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Disclaimer } from '../ui/Disclaimer';
import { useUserStore } from '../../store/useUserStore';
import { allDemoProfiles } from '../../data/demoProfiles';

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  shortName: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', shortName: 'Home', path: '/', icon: Home },
  { name: 'SIP Assessment', shortName: 'Assess', path: '/assess', icon: CheckCircle2 },
  { name: 'Dashboard', shortName: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Scenario Simulator', shortName: 'Simulator', path: '/simulator', icon: Activity },
  { name: 'AI Education', shortName: 'Education', path: '/education', icon: BookOpen },
  { name: 'My Profile', shortName: 'Profile', path: '/profile', icon: UserIcon },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser, switchPersona, activePersona } = useUserStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── DESKTOP SIDEBAR (visible md and up) ── */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 sticky top-0 h-screen z-30 shrink-0 select-none">
        {/* Brand header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              SIP
            </div>
            <div>
              <span className="font-extrabold text-gray-900 tracking-tight text-lg">Groww</span>
              <span className="ml-1 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 bg-emerald-50 rounded">
                FIT
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border-l-4 border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-emerald-700' : 'text-gray-400'}
                />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 pb-1 px-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Assistance
            </div>
          </div>

          <NavLink
            to="/payment-help"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              location.pathname.startsWith('/payment-help')
                ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border-l-4 border-transparent'
            }`}
          >
            <HelpCircle
              size={18}
              className={location.pathname.startsWith('/payment-help') ? 'text-emerald-700' : 'text-gray-400'}
            />
            <span>Payment & AutoPay</span>
          </NavLink>
        </nav>

        {/* Profile Switcher Card in Desktop Sidebar */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 m-3 rounded-2xl border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-600" />
              Active Persona
            </span>
            <Link
              to="/profile"
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              Edit
            </Link>
          </div>

          <select
            value={activePersona}
            onChange={(e) => switchPersona(e.target.value as keyof typeof allDemoProfiles)}
            className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="early_career">Profile A: Arjun (Salaried)</option>
            <option value="variable_incentive">Profile B: Bhavna (Incentives)</option>
            <option value="freelancer">Profile C: Chetan (Freelancer)</option>
            <option value="family_dependent">Profile D: Deepika (Family)</option>
            <option value="custom">Custom / Fresh User</option>
          </select>
          <div className="mt-1.5 text-[11px] text-gray-500 truncate">
            {currentUser?.name || 'Active User'}
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP NAVBAR (visible below md) ── */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            SIP
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">Groww SIP Fit</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="p-1.5 text-gray-600 hover:text-emerald-700 bg-gray-100 rounded-lg text-xs flex items-center gap-1"
          >
            <UserIcon size={14} />
            <span className="font-semibold text-xs truncate max-w-[80px]">
              {currentUser?.name?.split(' ')[0] || 'Profile'}
            </span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT OUTLET ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <div className="flex-1">{children}</div>
        <Disclaimer compact className="hidden md:block" />
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (sticky bottom on small screens) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around py-1.5 px-2 shadow-lg">
        {NAV_ITEMS.map((item) => {
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
              <span className="text-[10px] mt-0.5 tracking-tight">{item.shortName}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

