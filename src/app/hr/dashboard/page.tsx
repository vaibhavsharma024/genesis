'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Video,
  BarChart3,
  Activity,
  Plus,
  ArrowRight,
  Building,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useAuth } from '@/lib/context';
import { cn } from '@/lib/utils';
import type { CompanyMeetingRecord } from '../meetings/page';

export default function HRDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<CompanyMeetingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hrCompany = (user?.company_name || '').trim().toLowerCase();
  const hrName = (user?.name || '').trim().toLowerCase();
  const hrEmail = (user?.email || '').trim().toLowerCase();

  // Load real registered employees scoped to HR's company
  useEffect(() => {
    setIsLoading(true);
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg) {
        const parsed = JSON.parse(reg);
        const rawList = Array.isArray(parsed) ? parsed : Object.values(parsed);

        const scoped = rawList.filter((u: any) => {
          if (!u || !u.email) return false;

          // Exclude HR itself
          const roleUpper = String(u.role || '').toUpperCase();
          if (
            u.role === 'hr_manager' ||
            u.role === 'HR' ||
            roleUpper.includes('HR') ||
            roleUpper.includes('HUMAN RESOURCES')
          ) {
            return false;
          }

          if (hrEmail && u.email.toLowerCase() === hrEmail) return false;

          // Scope check
          const empCompany = (u.company_name || u.company || '').trim().toLowerCase();
          const empManager = (u.manager || '').trim().toLowerCase();
          if (hrCompany && empCompany) {
            const isCompanyMatch =
              empCompany === hrCompany || empCompany.includes(hrCompany) || hrCompany.includes(empCompany);
            const isManagerMatch = hrName && empManager.includes(hrName);
            if (!isCompanyMatch && !isManagerMatch) return false;
          }

          return true;
        });

        setEmployees(scoped);
      } else {
        setEmployees([]);
      }

      // Load meetings
      const mtgStored = localStorage.getItem('genesis_company_meetings');
      if (mtgStored) {
        const parsedM = JSON.parse(mtgStored);
        const scopedM = parsedM.filter((m: any) => {
          if (!m || !m.company_name) return false;
          const mComp = m.company_name.trim().toLowerCase();
          return !hrCompany || mComp === hrCompany || mComp.includes(hrCompany) || hrCompany.includes(mComp);
        });
        setMeetings(scopedM);
      } else {
        setMeetings([]);
      }
    } catch {
      setEmployees([]);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Compute dynamic stats
  const totalEmployees = employees.length;
  const activeOnboarding = employees.filter((e) => (e.progress_percentage || 0) < 100).length;
  const completedOnboarding = employees.filter((e) => (e.progress_percentage || 0) >= 100).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeetingsCount = meetings.filter((m) => m.date === todayStr).length;

  // Compute dynamic department distribution
  const departmentChartData = useMemo(() => {
    if (employees.length === 0) return [];
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      const dept = emp.department_name || emp.department || 'Operations';
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [employees]);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Executive Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Company Scope: {user?.company_name || 'Genesis Enterprise'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            People Operations Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1">
            Logged in as {user?.name || 'HR Administrator'} · Real-time workforce management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Employees</span>
          </Link>
          <Link
            href="/hr/meetings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Meeting Feed</span>
          </Link>
        </div>
      </motion.div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Employees
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalEmployees}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
            Across {departmentChartData.length || 0} Departments
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Active Onboarding
          </span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {activeOnboarding}
          </p>
          <span className="text-[10px] text-slate-500 block">In 5-Day Journey</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fully Graduated
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {completedOnboarding}
          </p>
          <span className="text-[10px] text-slate-500 block">100% Onboarded</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Company Meetings
          </span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {meetings.length}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {todayMeetingsCount} Scheduled Today
          </span>
        </div>
      </div>

      {/* Main Grid: Department Chart + Meeting Feed Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Department Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Distribution
              </h3>
            </div>
            <Link
              href="/hr/employees"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {departmentChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
              <Users className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No department records available
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Onboard employees into {user?.company_name || 'your company'} to populate the distribution chart.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#888' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080d1a',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {departmentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Meeting Feed Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Meetings
              </h3>
            </div>
            <Link
              href="/hr/meetings"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All Meetings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {meetings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
              <Video className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No meetings available
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Schedule your first onboarding or check-in session from the Meeting Feed.
              </p>
              <Link
                href="/hr/meetings"
                className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
              >
                Schedule Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3 h-64 overflow-y-auto pr-1">
              {meetings.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      {m.meeting_type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {m.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {m.date}
                    </span>
                    <span>•</span>
                    <span>Host: {m.organizer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
