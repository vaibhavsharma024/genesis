'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun, Moon, Clock, Building, MapPin, Briefcase,
  AlertCircle, LogOut, Activity
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { getInitials } from '@/lib/utils';

export default function PersistentTopRibbons() {
  const pathname = usePathname();
  const { user, employee, theme, toggleTheme, logout } = useAuth();
  const { tasks } = useEmployeeData();

  // Real-time ticking date & clock (updates every 1000ms for live dynamic ticking seconds)
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live overtime
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentTimeDec = currentHour + currentMinutes / 60 + currentSeconds / 3600;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isPastClosing = currentTimeDec > 18.5; // Past 6:30 PM

  let overtimeText = '';
  const isOvertime = isWeekend || isPastClosing;

  if (isWeekend) {
    const hrs = Math.max(1, Math.round((currentHour >= 9 ? currentHour - 9.5 : 2) * 10) / 10);
    overtimeText = `+${hrs}h Overtime (Weekend Off)`;
  } else if (isPastClosing) {
    const hrs = Math.round((currentTimeDec - 18.5) * 10) / 10;
    overtimeText = `+${hrs}h Live Overtime`;
  }

  // Live formatted clock with seconds
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Calculate live progress (starts at 0% when tasks are unfilled!)
  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    const total = tasks?.length || 0;
    const completed = tasks?.filter(t => t.status === 'COMPLETED').length || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completedCount: completed, totalCount: total, progressPercent: percent };
  }, [tasks]);

  // Display user attributes
  const displayName = employee?.name || user?.name || 'Genesis Member';
  const displayPhoto = employee?.profile_photo || user?.profile_photo;
  const companyName = employee?.company_name || user?.company_name || 'Genesis Enterprise';
  const branchName = employee?.branch_name || user?.branch_name || 'Main Campus';
  const departmentName = employee?.department_name || user?.department_name || 'Operations';

  const isHR = pathname.startsWith('/hr') || user?.role === 'hr_manager';

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full flex flex-col transition-all duration-300 relative"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Dynamic 3D Specular Top Ray */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-violet-500/80 to-transparent animate-pulse z-50 pointer-events-none" />

        {/* ======================================================== */}
        {/* RIBBON LEVEL 1: 3D DYNAMIC COMMAND & BRAND BAR           */}
        {/* ======================================================== */}
        <div
          className="w-full bg-white/95 dark:bg-[#070812]/95 backdrop-blur-2xl border-b border-slate-200/90 dark:border-white/10 px-4 md:px-8 py-2.5 flex items-center justify-between transition-colors relative z-30 shadow-md"
          style={{
            transform: 'perspective(1200px) translateZ(0)',
          }}
        >
          {/* Left: Genesis Logo + Brand + Live Clock */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <img
                  src="/branding/genesis-logo-transparent.png"
                  alt="Genesis Logo"
                  className="h-9 w-auto max-w-[140px] object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>

            {/* Live Real-time Clock Pill with ticking seconds */}
            <div
              className="hidden md:flex items-center gap-2 ml-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-300/80 dark:border-white/15 text-xs"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{formattedDate}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="font-mono font-bold text-slate-900 dark:text-emerald-400 tracking-wider text-xs">
                {formattedTime}
              </span>
            </div>

            {/* Live Progress Pill (0% when tasks are unfilled) */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold"
              style={{
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
              }}
            >
              <Activity className="w-3.5 h-3.5 text-violet-500 animate-spin-slow" />
              <span>{completedCount}/{totalCount} Completed ({progressPercent}%)</span>
              {progressPercent === 0 && (
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Unfilled
                </span>
              )}
            </div>
          </div>

          {/* Right Section: Tactile Dark/Light Mode + 3D User Capsule + Logout */}
          <div className="flex items-center gap-3">
            {/* 3D Tactile Global Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-amber-300 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              style={{
                boxShadow: theme === 'dark'
                  ? '0 4px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-violet-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* 3D User Profile Capsule */}
            <div
              className="flex items-center gap-2.5 pl-2 pr-3.5 py-1 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-300/80 dark:border-white/15 shadow-sm backdrop-blur-md"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              }}
            >
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="w-7 h-7 rounded-xl object-cover border border-violet-500/50 shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {getInitials(displayName)}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate max-w-[130px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                  {isHR ? 'HR Operations' : 'Active Onboardee'}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIBBON LEVEL 2: 3D DYNAMIC COMPANY & OVERTIME STATUS BAR */}
        {/* ======================================================== */}
        <div
          className="w-full bg-slate-100/90 dark:bg-[#0a0c1a]/95 border-b border-slate-200/80 dark:border-white/10 px-4 md:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors relative z-20"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* User Company, Campus Branch & Department Pills */}
          <div className="flex items-center gap-2 md:gap-3 text-slate-600 dark:text-slate-300">
            <div
              className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white px-2.5 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-xs"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <Building className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{companyName}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>{branchName}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <div className="items-center gap-1.5 text-slate-700 dark:text-slate-300 hidden sm:flex px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{departmentName}</span>
            </div>
          </div>

          {/* Operating Hours & Dynamic Overtime Widget */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Shift: <strong className="text-slate-700 dark:text-slate-200">9:30 AM – 6:30 PM</strong></span>
            </div>

            <div className="hidden xl:inline text-[11px] text-slate-500 dark:text-slate-400">
              Weekly Off: <strong className="text-slate-700 dark:text-slate-200">Sat & Sun (Closed)</strong>
            </div>

            {/* Live Dynamic Overtime Tracker */}
            {isOvertime ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse shadow-md"
                style={{
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                {overtimeText}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Within Standard Hours
              </span>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
