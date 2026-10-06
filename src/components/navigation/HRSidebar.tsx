'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Video,
  BarChart3,
  Activity,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import { cn, getInitials } from '@/lib/utils';

export default function HRSidebar() {
  const pathname = usePathname();
  const { user, theme, toggleTheme, logout } = useAuth();

  const displayName = user?.name || 'HR Administrator';
  const displayRole = 'People Operations';
  const companyName = user?.company_name || 'Genesis Workspace';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/hr/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Employees',
      href: '/hr/employees',
      icon: Users,
    },
    {
      label: 'Meeting Feed',
      href: '/hr/meetings',
      icon: Video,
    },
    {
      label: 'Analytics',
      href: '/hr/analytics',
      icon: BarChart3,
    },
    {
      label: 'Pulse',
      href: '/hr/pulse',
      icon: Activity,
    },
  ];

  return (
    <aside
      className="hidden md:flex flex-col justify-between w-20 lg:w-64 flex-shrink-0 bg-white/95 dark:bg-[#080d1a]/95 backdrop-blur-xl border-r border-slate-200/90 dark:border-white/10 transition-all duration-300 z-30 select-none shadow-lg"
      style={{
        boxShadow: '4px 0 24px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col p-3 lg:p-4 gap-4">
        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/hr/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="hrSidebarActiveBar"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-amber-500 to-amber-600 shadow-sm shadow-amber-500/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0',
                    isActive
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="hidden lg:flex flex-col min-w-0">
                  <span className="truncate">{item.label}</span>
                </div>

                {isActive && (
                  <span className="hidden lg:inline-block ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile + Mode Change + Sign out */}
      <div className="p-3 lg:p-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5">
        {/* HR Profile Capsule in Sidebar */}
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="hidden lg:flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Theme Mode Switch Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </div>
          <span className="hidden lg:inline-block">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </span>
        </button>

        {/* Sign out */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span className="hidden lg:inline-block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
