'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Flag,
  Coffee,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn, formatDate } from '@/lib/utils';

export default function EmployeeCalendarPage() {
  const { user, employee } = useAuth();
  const { tasks, journeyMilestones } = useEmployeeData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const companyName = employee?.company_name || user?.company_name || 'Genesis Workspace';
  const joiningDateRaw = employee?.joining_date || new Date().toISOString().split('T')[0];
  const joiningDate = new Date(joiningDateRaw);

  // Compute dynamic important events connected to the employee's onboarding & schedule
  const calendarEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      date: string; // YYYY-MM-DD
      time: string;
      category: 'onboarding' | 'shift' | 'deadline' | 'holiday' | 'meeting';
      description: string;
      status: 'COMPLETED' | 'UPCOMING' | 'TODAY';
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Day 1 - Day 5 Onboarding Milestones
    for (let day = 1; day <= 5; day++) {
      const milestoneDate = new Date(joiningDate);
      milestoneDate.setDate(joiningDate.getDate() + (day - 1));
      const dateStr = milestoneDate.toISOString().split('T')[0];

      const milestoneTitle =
        day === 1 ? 'Day 1: HR Welcome & Induction' :
        day === 2 ? 'Day 2: IT Hardware & Workspace Provisioning' :
        day === 3 ? 'Day 3: Security & Compliance Verification' :
        day === 4 ? 'Day 4: Team Integration & Buddy Sync' :
        'Day 5: Role Autonomy & Sprint Alignment';

      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      events.push({
        id: `milestone-${day}`,
        title: milestoneTitle,
        date: dateStr,
        time: '10:00 AM – 11:30 AM',
        category: 'onboarding',
        description: `Official Onboarding Milestone ${day} for ${employee?.name || user?.name || 'Employee'}.`,
        status: isPast ? 'COMPLETED' : isToday ? 'TODAY' : 'UPCOMING',
      });
    }

    // 2. Daily Core Working Hours & Standups
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth();
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const iterDate = new Date(curYear, curMonth, d);
      const dayOfWeek = iterDate.getDay();
      const dStr = iterDate.toISOString().split('T')[0];

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Daily Sync
        const isPast = dStr < todayStr;
        const isToday = dStr === todayStr;

        events.push({
          id: `standup-${dStr}`,
          title: 'Daily Team Sync & Check-in',
          date: dStr,
          time: '10:00 AM – 10:30 AM',
          category: 'meeting',
          description: `Daily standup with ${employee?.department_name || 'Engineering'} team.`,
          status: isPast ? 'COMPLETED' : isToday ? 'TODAY' : 'UPCOMING',
        });
      }
    }

    // 3. Task deadlines from actual task records
    if (tasks && tasks.length > 0) {
      tasks.forEach((t) => {
        if (t.task?.day_number) {
          const tDate = new Date(joiningDate);
          tDate.setDate(joiningDate.getDate() + (t.task.day_number - 1));
          const dStr = tDate.toISOString().split('T')[0];
          events.push({
            id: `task-deadline-${t.id}`,
            title: `Deadline: ${t.task.name}`,
            date: dStr,
            time: '05:00 PM',
            category: 'deadline',
            description: t.task.description || 'Assigned task milestone',
            status: t.status === 'COMPLETED' ? 'COMPLETED' : dStr === todayStr ? 'TODAY' : 'UPCOMING',
          });
        }
      });
    }

    return events;
  }, [joiningDate, currentDate, tasks, employee, user]);

  // Selected date events
  const selectedEvents = useMemo(() => {
    return calendarEvents.filter((ev) => ev.date === selectedDateStr);
  }, [calendarEvents, selectedDateStr]);

  // Calendar month days builder
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Employee Schedule & Critical Milestones</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Schedule & Important Dates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1">
            Connected to {companyName} Onboarding Program · Core Hours: 9:30 AM – 6:30 PM (Mon–Fri)
          </p>
        </div>

        {/* Quick Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Onboarding Milestone</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Daily Team Sync</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Task Deadline</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar View + Selected Date Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {monthName}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for start offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 lg:h-20 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = dateObj.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const dayEvents = calendarEvents.filter((ev) => ev.date === dateStr);
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={cn(
                    'h-16 lg:h-20 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group',
                    isSelected
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/10 shadow-sm'
                      : isToday
                      ? 'border-violet-500/40 bg-violet-500/5'
                      : isWeekend
                      ? 'border-slate-100 dark:border-white/[0.03] bg-slate-50 dark:bg-slate-950/40 text-slate-400'
                      : 'border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg',
                        isToday
                          ? 'bg-violet-600 text-white'
                          : isSelected
                          ? 'bg-amber-500 text-white font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {dayNum}
                    </span>
                    {isWeekend && (
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                        Off
                      </span>
                    )}
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1 flex-wrap overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          ev.category === 'onboarding'
                            ? 'bg-amber-500'
                            : ev.category === 'deadline'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        )}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-400">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda / Detail Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agenda For
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                {selectedEvents.length} {selectedEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {/* List of Events for Selected Date */}
            {selectedEvents.length === 0 ? (
              <div className="p-6 text-center space-y-2 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                <Coffee className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No scheduled milestones on this date
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Standard shift hours (9:30 AM – 6:30 PM) apply unless it is a weekend off.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-[10px] uppercase font-bold px-2 py-0.5 rounded-md',
                          ev.category === 'onboarding'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : ev.category === 'deadline'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        )}
                      >
                        {ev.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ev.time}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {ev.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-semibold">
                      {ev.status === 'COMPLETED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Milestone Verified
                        </span>
                      ) : ev.status === 'TODAY' ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Active Today
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Link to Tasks & Onboarding Journey */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
            <Link
              href="/employee/journey"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Onboarding Map</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/employee/tasks"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Open Tasks Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
