'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Filter, CheckCircle2, Clock, AlertTriangle,
  Lock, Play, ChevronRight, Target, Trash2, Sparkles, CheckSquare
} from 'lucide-react';
import { useEmployeeData } from '@/lib/context';
import { cn, formatDuration, getStatusColor, getPriorityColor, getCategoryIcon } from '@/lib/utils';
import type { TaskStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Ready', value: 'READY' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Blocked', value: 'BLOCKED' },
];

export default function TasksPage() {
  const { tasks, onboardingTasks, deleteTask, updateTaskStatus } = useEmployeeData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [dayFilter, setDayFilter] = useState<number | 'ALL'>('ALL');

  // Filter tasks based on user inputs
  const filteredTasks = useMemo(() => {
    return tasks.filter(et => {
      const task = et.task || onboardingTasks.find(t => t.id === et.task_id);
      const taskName = task?.name || 'Untitled Task';
      const taskDay = task?.day_number || 1;

      if (statusFilter !== 'ALL' && et.status !== statusFilter) return false;
      if (dayFilter !== 'ALL' && taskDay !== dayFilter) return false;
      if (search && !taskName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, onboardingTasks, statusFilter, dayFilter, search]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  }), [tasks]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Onboarding Tasks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {stats.total === 0
              ? 'Zero tasks currently assigned. Complete assigned deliverables when available.'
              : `${stats.total} onboarding task${stats.total === 1 ? '' : 's'} · ${stats.completed} completed`}
          </p>
        </div>
      </div>

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

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your created tasks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                statusFilter === f.value
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                  : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List or Zero-Prefill Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {tasks.length === 0 ? 'No Onboarding Tasks Created Yet' : 'No Tasks Match Your Filters'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
              {tasks.length === 0
                ? 'You currently have no tasks in your queue. Assigned deliverables will automatically appear here as your onboarding milestones progress.'
                : 'Try clearing your search keyword or switching your status filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(et => {
            const task = et.task || onboardingTasks.find(t => t.id === et.task_id);
            const taskName = task?.name || 'Untitled Task';
            const taskCategory = task?.category || 'HR';
            const taskPriority = task?.priority || 'medium';
            const taskDuration = task?.estimated_minutes || 30;
            const taskDay = task?.day_number || 1;
            const isCompleted = et.status === 'COMPLETED';

            return (
              <motion.div
                key={et.task_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md',
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-white/10 hover:border-violet-500/30'
                )}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => updateTaskStatus(et.task_id, isCompleted ? 'READY' : 'COMPLETED')}
                    title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    className={cn(
                      'mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer flex-shrink-0',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-white/20 hover:border-violet-500'
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40">
                        Day {taskDay}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {taskCategory}
                      </span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-md font-semibold capitalize', {
                        'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30': taskPriority === 'low',
                        'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30': taskPriority === 'medium',
                        'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30': taskPriority === 'high',
                        'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30': taskPriority === 'critical',
                      })}>
                        {taskPriority} priority
                      </span>
                    </div>

                    <h4 className={cn(
                      'text-base font-bold text-slate-900 dark:text-white',
                      isCompleted && 'line-through text-slate-400 dark:text-slate-500'
                    )}>
                      {taskName}
                    </h4>

                    {task?.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{taskDuration}m</span>
                  </div>

                  <Link
                    href={`/employee/tasks/${et.task_id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-500/20 text-xs font-bold transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => deleteTask(et.task_id)}
                    title="Delete task"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
