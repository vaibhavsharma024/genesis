'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Lock, TrendingUp, Star, Zap, MapPin, Phone,
  Calendar, Users, Target, Activity, Plus, Compass
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn, formatDate } from '@/lib/utils';
import type { EmployeeTask } from '@/types';
import Dynamic3DLeftSidebar from '@/components/dashboard/Dynamic3DLeftSidebar';

function ProgressRing({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth={8} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#pg)" strokeWidth={8}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function EmployeeDashboard() {
  const { user, employee: authEmp } = useAuth();
  const { tasks, onboardingTasks, updateTaskStatus } = useEmployeeData();

  const displayName = authEmp?.name || user?.name || 'Genesis Member';
  const firstName = displayName.split(' ')[0];
  const companyName = authEmp?.company_name || user?.company_name || 'Genesis Enterprise';
  const roleName = authEmp?.role || 'Active Member';
  const deptName = authEmp?.department_name || user?.department_name || 'Operations';

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, blocked, progress };
  }, [tasks]);

  const activeTask = tasks.find(t => t.status === 'IN_PROGRESS') || tasks.find(t => t.status === 'READY');

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">
      {/* 3D Dynamic Left Sidebar (Docked) */}
      <Dynamic3DLeftSidebar />

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Good day, {firstName}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {roleName} · {companyName} · {deptName}
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="relative flex items-center justify-center">
              <ProgressRing value={stats.progress} size={70} />
              <span className="absolute text-sm font-black text-slate-900 dark:text-white">
                {stats.progress}%
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Overall Onboarding</span>
              <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                {stats.completed} of {stats.total} completed
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'text-violet-600 dark:text-violet-400' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Blocked', value: stats.blocked, color: 'text-red-600 dark:text-red-400' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs"
            >
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
              <p className={cn('text-2xl font-black mt-1', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Focus Item: Next Step / Action */}
        {stats.total === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Zero Demo Data — Create Your First Task
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your onboarding experience is completely customized. Create tasks from the top ribbon or link below.
              </p>
            </div>
            <Link
              href="/employee/tasks"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Go to Tasks Hub</span>
            </Link>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recommended Next Milestone
                </h3>
              </div>
              <Link
                href="/employee/tasks"
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {activeTask ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                    {activeTask.task?.category || 'Task'}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeTask.task?.name || 'Active Task'}
                  </h4>
                  {activeTask.task?.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeTask.task.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/employee/tasks/${activeTask.task_id}`}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Task Matrix</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>All currently assigned tasks are completed! Awesome job!</span>
              </div>
            )}
          </div>
        )}

        {/* First-Week Journey Roadmap Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                5-Day Onboarding Roadmap
              </h3>
            </div>
            <Link
              href="/employee/journey"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Journey</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center pt-2">
            {[1, 2, 3, 4, 5].map(d => {
              const dayTasks = tasks.filter(t => (t.task?.day_number || 1) === d);
              const done = dayTasks.filter(t => t.status === 'COMPLETED').length;
              const allDone = dayTasks.length > 0 && done === dayTasks.length;

              return (
                <div
                  key={d}
                  className={cn(
                    'p-3 rounded-2xl border transition-all flex flex-col items-center space-y-1',
                    allDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/5'
                  )}
                >
                  <span className={cn('w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold', allDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300')}>
                    D{d}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Day {d}</span>
                  <span className="text-[9px] font-semibold text-violet-600 dark:text-violet-400">
                    {dayTasks.length === 0 ? 'Empty' : `${done}/${dayTasks.length}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
