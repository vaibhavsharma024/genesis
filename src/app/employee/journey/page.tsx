'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, Play,
  ChevronRight, ArrowRight, Zap, Users, Shield,
  Laptop, Target, Star, Trash2, Compass
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types';

export default function JourneyPage() {
  const { user, employee } = useAuth();
  const {
    tasks, onboardingTasks, updateTaskStatus,
    journeyMilestones, deleteJourneyMilestone
  } = useEmployeeData();

  // Days 1 through 5 group
  const days = [1, 2, 3, 4, 5];

  const hasAnyData = tasks.length > 0 || journeyMilestones.length > 0;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Onboarding Journey
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track your onboarding milestones and phased roadmap across your onboarding cycle.
          </p>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Onboarding Journey in Progress
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
              Your onboarding progress across Day 1 to Day 5 will be displayed as your assigned tasks and verified milestones are activated.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map(dayNum => {
            const dayMilestones = journeyMilestones.filter(m => m.day === dayNum);
            const dayTasks = tasks.filter(et => {
              const t = et.task || onboardingTasks.find(ot => ot.id === et.task_id);
              return (t?.day_number || 1) === dayNum;
            });

            if (dayMilestones.length === 0 && dayTasks.length === 0) {
              return null;
            }

            return (
              <motion.div
                key={dayNum}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                      D{dayNum}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Day {dayNum} Roadmap
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dayMilestones.length} milestone{dayMilestones.length === 1 ? '' : 's'} · {dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day Milestones */}
                {dayMilestones.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestones</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayMilestones.map(m => (
                        <div
                          key={m.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                              {m.department}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.label}</h4>
                            {m.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">{m.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteJourneyMilestone(m.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day Tasks */}
                {dayTasks.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked Tasks</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayTasks.map(et => {
                        const task = et.task || onboardingTasks.find(ot => ot.id === et.task_id);
                        const isDone = et.status === 'COMPLETED';
                        return (
                          <div
                            key={et.task_id}
                            className={cn(
                              'p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3',
                              isDone
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/30'
                                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/5'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => updateTaskStatus(et.task_id, isDone ? 'READY' : 'COMPLETED')}
                                className={cn(
                                  'w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer',
                                  isDone
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-white/20'
                                )}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <div>
                                <h5 className={cn('text-xs font-bold text-slate-900 dark:text-white', isDone && 'line-through text-slate-400')}>
                                  {task?.name || 'Task'}
                                </h5>
                                <span className="text-[10px] text-slate-400">{task?.category}</span>
                              </div>
                            </div>

                            <Link
                              href={`/employee/tasks/${et.task_id}`}
                              className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <span>Open</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
