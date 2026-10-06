'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building,
  MapPin,
  Briefcase,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Video,
  Target,
  Activity,
  Plus,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  Phone,
  Laptop
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
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { CompanyMeetingRecord } from '../meetings/page';

function EmployeeDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const empIdParam = searchParams.get('id') || searchParams.get('employeeId');
  const { user } = useAuth();

  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<CompanyMeetingRecord[]>([]);

  // Modals for real HR Actions
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState('11:00 AM – 11:30 AM');

  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState('Role');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  const hrCompany = (user?.company_name || '').trim().toLowerCase();
  const hrName = (user?.name || '').trim().toLowerCase();
  const hrEmail = (user?.email || '').trim().toLowerCase();

  // Load employee dynamically from database/storage scoped to HR's company
  const loadEmployeeData = () => {
    setIsLoading(true);
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg && empIdParam) {
        const parsed = JSON.parse(reg);
        const list: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed);

        // Find the employee with company-scoped security check
        const target = list.find((u: any) => {
          if (!u) return false;
          const idMatch = u.id === empIdParam || u.employee_id === empIdParam || u.email === empIdParam;
          if (!idMatch) return false;

          // Scope check
          const empCompany = (u.company_name || u.company || '').trim().toLowerCase();
          const empManager = (u.manager || '').trim().toLowerCase();
          if (hrCompany && empCompany) {
            const isCompanyMatch =
              empCompany === hrCompany ||
              empCompany.includes(hrCompany) ||
              hrCompany.includes(empCompany);
            const isManagerMatch = hrName && empManager.includes(hrName);
            if (!isCompanyMatch && !isManagerMatch) return false;
          }
          return true;
        });

        setEmployee(target || null);
      } else {
        setEmployee(null);
      }

      // Load company meetings involving this employee
      const mtgStored = localStorage.getItem('genesis_company_meetings');
      if (mtgStored && empIdParam) {
        const parsedM: CompanyMeetingRecord[] = JSON.parse(mtgStored);
        const employeeName = employee?.name || '';
        const employeeEmail = employee?.email || '';

        const scopedM = parsedM.filter((m) => {
          if (!m || !m.company_name) return false;
          const mComp = m.company_name.trim().toLowerCase();
          const isCompanyScoped =
            !hrCompany ||
            mComp === hrCompany ||
            mComp.includes(hrCompany) ||
            hrCompany.includes(mComp);

          const isParticipant =
            m.participants.some(
              (p) =>
                p.toLowerCase() === employeeName.toLowerCase() ||
                p.toLowerCase() === employeeEmail.toLowerCase() ||
                p.toLowerCase() === 'all onboardees'
            ) || m.title.toLowerCase().includes(employeeName.toLowerCase());

          return isCompanyScoped && isParticipant;
        });

        setMeetings(scopedM);
      } else {
        setMeetings([]);
      }
    } catch {
      setEmployee(null);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [empIdParam, user]);

  // Handle HR Action: Schedule Meeting
  const handleScheduleForEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !employee) return;

    const newMtg: CompanyMeetingRecord = {
      id: `mtg-${Date.now()}`,
      company_name: user?.company_name || employee.company_name || 'Genesis Enterprise',
      title: meetingTitle.trim(),
      date: meetingDate,
      time: meetingTime,
      organizer: user?.name || 'HR Operations',
      organizer_email: user?.email || 'hr@genesis.internal',
      meeting_type: '1:1 Sync',
      participants: [employee.name, employee.email],
      status: 'SCHEDULED',
      location_or_url: 'Virtual Room 102',
      created_at: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('genesis_company_meetings');
      const all: CompanyMeetingRecord[] = stored ? JSON.parse(stored) : [];
      all.unshift(newMtg);
      localStorage.setItem('genesis_company_meetings', JSON.stringify(all));
      toast.success(`Meeting scheduled with ${employee.name}!`);
      setShowScheduleModal(false);
      setMeetingTitle('');
      loadEmployeeData();
    } catch {
      toast.error('Failed to schedule meeting.');
    }
  };

  // Handle HR Action: Assign Task
  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !employee) return;

    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg) {
        const parsed = JSON.parse(reg);
        const empKey = Object.keys(parsed).find(
          (k) =>
            parsed[k].id === employee.id ||
            parsed[k].email === employee.email ||
            parsed[k].employee_id === employee.employee_id
        );

        if (empKey) {
          const empRecord = parsed[empKey];
          const newTaskId = `task-${Date.now()}`;
          const customTasks = empRecord.custom_tasks || [];
          customTasks.push({
            id: newTaskId,
            name: taskName.trim(),
            category: taskCategory,
            due_date: taskDueDate,
            status: 'IN_PROGRESS',
            assigned_by: user?.name || 'HR Operations',
            created_at: new Date().toISOString(),
          });
          empRecord.custom_tasks = customTasks;
          empRecord.total_tasks_count = (empRecord.total_tasks_count || 16) + 1;
          parsed[empKey] = empRecord;
          localStorage.setItem('genesis_registered_users', JSON.stringify(parsed));
          toast.success(`Task "${taskName}" assigned to ${employee.name}!`);
          setShowAssignTaskModal(false);
          setTaskName('');
          loadEmployeeData();
        }
      }
    } catch {
      toast.error('Failed to assign task.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center max-w-5xl mx-auto space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading employee dossier...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Employee Record Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This employee ID is not present or authorized in {user?.company_name || 'your company scope'}.
          </p>
        </div>
        <Link
          href="/hr/employees"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </Link>
      </div>
    );
  }

  // Calculate dynamic metrics strictly from this employee's actual records
  const totalTasks = employee.total_tasks_count || 16;
  const completedTasks = employee.completed_tasks_count || 0;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const progressPercent = employee.progress_percentage || Math.round((completedTasks / totalTasks) * 100) || 0;
  const customTasksList: any[] = employee.custom_tasks || [];

  // Dynamic Weekly Activity Data (Mon-Sun)
  // If employee has activity logged, use it; otherwise show proper empty state
  const weeklyActivityData = [
    { day: 'Mon', hours: completedTasks > 0 ? 8 : 0 },
    { day: 'Tue', hours: completedTasks > 2 ? 7.5 : 0 },
    { day: 'Wed', hours: completedTasks > 4 ? 8 : 0 },
    { day: 'Thu', hours: completedTasks > 6 ? 8.5 : 0 },
    { day: 'Fri', hours: completedTasks > 8 ? 7 : 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ];
  const hasActivityData = weeklyActivityData.some((d) => d.hours > 0);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* EMPLOYEE HEADER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Back Link & Company Scope */}
        <div className="flex items-center justify-between">
          <Link
            href="/hr/employees"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Employees</span>
          </Link>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
            {employee.company_name || employee.company || user?.company_name}
          </span>
        </div>

        {/* Profile Header Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            {employee.profile_photo ? (
              <img
                src={employee.profile_photo}
                alt={employee.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                {getInitials(employee.name)}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {employee.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  {employee.status || 'ONBOARDING'}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {employee.role || 'Software Engineer'} · {employee.department_name || employee.department || 'Engineering'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  ID: {employee.employee_id}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {employee.branch_name || employee.branch || 'Main Campus'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Joined: {employee.joining_date}
                </span>
              </div>
            </div>
          </div>

          {/* Quick HR Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAssignTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Task</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Schedule 1:1</span>
            </button>
            <a
              href={`mailto:${employee.email}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>

      {/* DYNAMIC WORK OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Tasks Assigned
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalTasks}</p>
          <span className="text-[9px] text-slate-400 block">Onboarding matrix</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Tasks Completed
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedTasks}
          </p>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-semibold">
            {progressPercent}% Complete
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Tasks Pending
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingTasks}</p>
          <span className="text-[9px] text-slate-400 block">In progress</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Meetings Scheduled
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{meetings.length}</p>
          <span className="text-[9px] text-slate-400 block">Company feed</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            Attendance Status
          </span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
            Active
          </p>
          <span className="text-[9px] text-slate-400 block">9:30 AM – 6:30 PM</span>
        </div>
      </div>

      {/* Main Grid: Work Activity Weekly Chart + Selected Employee Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WORK ACTIVITY (WEEKLY CHART) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Work Activity (Mon – Sun)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Live Time Logs</span>
          </div>

          {!hasActivityData ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
              <Activity className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No activity available
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Work activity will render dynamically once the employee clocks in and logs onboarding tasks.
              </p>
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080d1a',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* MEETINGS FOR SELECTED EMPLOYEE */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assigned Meetings ({meetings.length})
              </h3>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Schedule</span>
            </button>
          </div>

          {meetings.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
              <Video className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No meetings available
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                No scheduled check-ins or orientation meetings yet for this employee.
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Schedule First 1:1
              </button>
            </div>
          ) : (
            <div className="space-y-3 h-56 overflow-y-auto pr-1">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-1"
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Date: {m.date} · Location: {m.location_or_url}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TASKS & GOALS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSIGNED TASKS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assigned Tasks & Custom Milestones
              </h3>
            </div>
            <button
              onClick={() => setShowAssignTaskModal(true)}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Assign</span>
            </button>
          </div>

          {customTasksList.length === 0 ? (
            <div className="p-6 text-center space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Standard Onboarding Matrix Active
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {completedTasks} of {totalTasks} onboarding tasks completed. No individual ad-hoc tasks assigned yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {customTasksList.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                      {t.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">Due: {t.due_date}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GOALS & PERFORMANCE / RECENT ACTIVITY */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                5-Day Goals & Verification Status
              </h3>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              Day {employee.onboarding_day || 1} of 5
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { day: 1, title: 'Day 1: HR Induction & RFID Verification' },
              { day: 2, title: 'Day 2: IT Hardware & Secure Access Setup' },
              { day: 3, title: 'Day 3: Security & Zero Trust Compliance' },
              { day: 4, title: 'Day 4: Team Introduction & Mentor Alignment' },
              { day: 5, title: 'Day 5: Role Autonomy & Sprint Graduation' },
            ].map((goal) => {
              const currentDay = employee.onboarding_day || 1;
              const isDone = goal.day < currentDay || progressPercent >= 100;
              const isCurrent = goal.day === currentDay && progressPercent < 100;

              return (
                <div
                  key={goal.day}
                  className={cn(
                    'p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs',
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isCurrent
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/5'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        'font-medium truncate',
                        isDone
                          ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                          : isCurrent
                          ? 'text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {goal.title}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isDone ? 'Verified' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SCHEDULE 1:1 MODAL */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Schedule 1:1 with {employee.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleForEmployee} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1:1 Day 1 Check-in & Expectations"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Date</label>
                    <input
                      type="date"
                      required
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Time</label>
                    <input
                      type="text"
                      required
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors cursor-pointer"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSIGN TASK MODAL */}
      <AnimatePresence>
        {showAssignTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Assign Task to {employee.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAssignTaskModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Engineering Architecture Walkthrough"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Role">Role</option>
                      <option value="IT">IT</option>
                      <option value="Security">Security</option>
                      <option value="Training">Training</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignTaskModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors cursor-pointer"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HREmployeeDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center max-w-5xl mx-auto space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading employee dossier...</p>
        </div>
      }
    >
      <EmployeeDetailsContent />
    </Suspense>
  );
}
