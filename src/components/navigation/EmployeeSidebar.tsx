'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Calendar,
  MapPin,
  BookOpen,
  Route,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import { cn, getInitials } from '@/lib/utils';

interface EmployeeSidebarProps {
  onOpenAi?: () => void;
}

export default function EmployeeSidebar({ onOpenAi }: EmployeeSidebarProps) {
  const pathname = usePathname();
  const { user, employee, theme, toggleTheme, logout } = useAuth();

  const displayName = employee?.name || user?.name || 'Genesis Member';
  const displayRole = employee?.role || 'Team Member';
  const displayPhoto = employee?.profile_photo || user?.profile_photo;

  const navItems = [
    {
      label: 'Home / Dashboard',
      shortLabel: 'Home',
      href: '/employee/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Profile',
      shortLabel: 'Profile',
      href: '/employee/experience',
      icon: User,
    },
    {
      label: 'Calendar',
      shortLabel: 'Calendar',
      href: '/employee/calendar',
      icon: Calendar,
    },
    {
      label: 'Map',
      shortLabel: 'Map',
      href: '/employee/company-map',
      icon: MapPin,
    },
    {
      label: 'Resources',
      shortLabel: 'Resources',
      href: '/employee/resources',
      icon: BookOpen,
    },
    {
      label: 'Journey',
      shortLabel: 'Journey',
      href: '/employee/journey',
      icon: Route,
    },
    {
      label: 'About',
      shortLabel: 'About',
      href: '/employee/support-about',
      icon: HelpCircle,
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
            const isActive = pathname === item.href || (item.href !== '/employee/dashboard' && pathname.startsWith(item.href));

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
                    layoutId="employeeSidebarActiveBar"
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

          {/* Ask Genesis AI Copilot Button */}
          {onOpenAi && (
            <button
              onClick={onOpenAi}
              title="Ask Genesis AI Copilot"
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 mt-1"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-violet-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <span className="truncate font-bold text-violet-700 dark:text-violet-300">Genesis AI</span>
                <span className="text-[10px] text-slate-400">Ask assistant</span>
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Section: Profile + Mode Change */}
      <div className="p-3 lg:p-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2.5">
        {/* Profile Card in Sidebar */}
        <Link
          href="/employee/experience"
          title="View My Profile"
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group cursor-pointer"
        >
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={displayName}
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
              {getInitials(displayName)}
            </div>
          )}
          <div className="hidden lg:flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {displayRole}
            </span>
          </div>
          <ChevronRight className="hidden lg:block ml-auto w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

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
