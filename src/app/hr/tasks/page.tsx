'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, Clock, MapPin,
  Calendar, Search, Filter, Shield, AlertTriangle
} from 'lucide-react';
import { MOCK_TASKS, MOCK_LOCATIONS, MOCK_CONTACTS, MOCK_TASK_DEPENDENCIES } from '@/lib/mock-data';
import { cn, formatDuration, getCategoryIcon } from '@/lib/utils';

export default function HRTasksPage() {
  const [selectedDay, setSelectedDay] = useState<number | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'HR', 'IT', 'Security', 'Team', 'Role'];

  const filteredTasks = MOCK_TASKS.filter(task => {
    const matchDay = selectedDay === 'All' || task.day_number === selectedDay;
    const matchCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchSearch =
      task.name.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchDay && matchCategory && matchSearch;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Onboarding Task Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">
          Standardized Day 1–5 journey templates, dependencies, and role routing
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks, guides, requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', 1, 2, 3, 4, 5] as const).map(day => (
            <button
              key={String(day)}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border',
                selectedDay === day
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              )}
            >
              {day === 'All' ? 'All Days' : `Day ${day}`}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid gap-3">
        {filteredTasks.map((task, i) => {
          const loc = MOCK_LOCATIONS.find(l => l.id === task.location_id);
          const contact = MOCK_CONTACTS.find(c => c.id === task.contact_id);
          const deps = MOCK_TASK_DEPENDENCIES.filter(d => d.task_id === task.id);

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                  {getCategoryIcon(task.category)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="badge bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                      Day {task.day_number}
                    </span>
                    <span className="badge bg-emerald-500/10 text-emerald-400 text-[11px]">
                      {task.category}
                    </span>
                    <h3 className="font-bold text-white text-base">{task.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{task.description}</p>

                  {task.why_required && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Reason: {task.why_required}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDuration(task.estimated_minutes)}
                    </span>
                    {loc && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {loc.name} ({loc.building}, {loc.floor})
                      </span>
                    )}
                    {deps.length > 0 && (
                      <span className="text-amber-400 font-medium">
                        Requires {deps.length} prerequisite task{deps.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                  Priority: {task.priority.toUpperCase()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
