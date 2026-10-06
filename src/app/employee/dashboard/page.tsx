'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  TrendingUp,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Target,
  Activity,
  Plus,
  Compass,
  Building,
  Briefcase,
  Mail,
  User as UserIcon,
  CheckSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn, formatDate, getInitials } from '@/lib/utils';
import GenesisAssistant from '@/components/ai/GenesisAssistant';

function ProgressRing({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-slate-200 dark:text-slate-800"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#pg)"
        strokeWidth={8}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function EmployeeDashboard() {
  const { user, employee: authEmp } = useAuth();
  const { tasks, journeyMilestones } = useEmployeeData();

  // Dynamic user data from authentication & context
  const displayName = authEmp?.name || user?.name || 'Genesis Member';
  const firstName = displayName.split(' ')[0];
  const employeeId = authEmp?.employee_id || (user?.id ? `GEN-${user.id.slice(0, 6).toUpperCase()}` : 'GEN-001');
  const companyName = authEmp?.company_name || user?.company_name || 'Genesis Workspace';
  const roleName = authEmp?.role || 'Team Member';
  const deptName = authEmp?.department_name || user?.department_name || 'Operations';
  const branchName = authEmp?.branch_name || user?.branch_name || 'Main Campus';
  const workMode = authEmp?.work_type || 'Hybrid';
  const displayPhoto = authEmp?.profile_photo || user?.profile_photo;
  const userEmail = authEmp?.email || user?.email || 'member@genesis.internal';
  const joiningDateRaw = authEmp?.joining_date || new Date().toISOString().split('T')[0];

  // Dynamic task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const blocked = tasks.filter((t) => t.status === 'BLOCKED').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, blocked, progress };
  }, [tasks]);

  const activeTask =
    tasks.find((t) => t.status === 'IN_PROGRESS') || tasks.find((t) => t.status === 'READY');

  // Next upcoming calendar event from joining date
  const upcomingMilestone = useMemo(() => {
    const joinD = new Date(joiningDateRaw);
    const dayNum = authEmp?.onboarding_day || 1;
    const targetDate = new Date(joinD);
    targetDate.setDate(joinD.getDate() + (dayNum - 1));

    const title =
      dayNum === 1
        ? 'Day 1: HR Induction & Verification'
        : dayNum === 2
        ? 'Day 2: IT Provisioning & Hardware Setup'
        : dayNum === 3
        ? 'Day 3: Security & Compliance Checklist'
        : dayNum === 4
        ? 'Day 4: Team Introduction & Mentor Alignment'
        : 'Day 5: Sprint Alignment & Autonomy';

    return {
      title,
      dayNum,
      dateFormatted: targetDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: '10:00 AM – 11:30 AM',
    };
  }, [joiningDateRaw, authEmp]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to {companyName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {firstName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {roleName} · {deptName} · {branchName}
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="relative flex items-center justify-center">
            <ProgressRing value={stats.progress} size={70} />
            <span className="absolute text-sm font-black text-slate-900 dark:text-amber-400">
              {stats.progress}%
            </span>
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              Onboarding Progress
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              {stats.completed} of {stats.total} tasks completed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Two Key Primary Cards: Dynamic Employee Profile & Dynamic Calendar Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Employee Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Employee Profile Dossier
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Active Member
              </span>
            </div>

            {/* Profile Content */}
            <div className="flex items-start gap-4">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="flex flex-col min-w-0 space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {displayName}
                </h2>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                  {roleName}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    ID: {employeeId}
                  </span>
                  <span>•</span>
                  <span>{workMode}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Metadata Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" /> Organization
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {companyName}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" /> Department
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {deptName}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Location / Campus
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {branchName}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-slate-400" /> Joining Date
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {new Date(joiningDateRaw + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{userEmail}</span>
            </span>
            <Link
              href="/employee/experience"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>View Full Experience</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dynamic Calendar & Important Dates Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Calendar & Key Dates
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                Shift: 9:30 AM – 6:30 PM
              </span>
            </div>

            {/* Next Recommended Milestone */}
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  Next Key Milestone
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {upcomingMilestone.dateFormatted}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {upcomingMilestone.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Core sync: {upcomingMilestone.time}</span>
              </p>
            </div>

            {/* Key Schedule Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Weekly Operating Schedule
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Monday – Friday
                </span>
                <span className="text-[10px] text-slate-500">Sat & Sun (Weekly Off)</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Active Onboarding Day
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  Day {authEmp?.onboarding_day || 1} of 5
                </span>
                <span className="text-[10px] text-slate-500">
                  {stats.completed}/{stats.total} Tasks Completed
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live schedule sync active
            </span>
            <Link
              href="/employee/calendar"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Open Calendar Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Blocked', value: stats.blocked, color: 'text-red-600 dark:text-red-400' },
        ].map((s, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
            <p className={cn('text-2xl font-black mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recommended Task Milestone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recommended Next Milestone
            </h3>
          </div>
          <Link
            href="/employee/tasks"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {activeTask ? (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <span>Open Task Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>All currently assigned onboarding tasks are completed! Awesome job!</span>
          </div>
        )}
      </div>

      {/* 5-Day Onboarding Roadmap Preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
          {[1, 2, 3, 4, 5].map((d) => {
            const dayTasks = tasks.filter((t) => (t.task?.day_number || 1) === d);
            const done = dayTasks.filter((t) => t.status === 'COMPLETED').length;
            const allDone = dayTasks.length > 0 && done === dayTasks.length;

            return (
              <div
                key={d}
                className={cn(
                  'p-3 rounded-2xl border transition-all flex flex-col items-center space-y-1',
                  allDone
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold',
                    allDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  )}
                >
                  D{d}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Day {d}</span>
                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                  {dayTasks.length === 0 ? 'Empty' : `${done}/${dayTasks.length}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genesis Assistant Floating Copilot */}
      <GenesisAssistant />
    </div>
  );
}
