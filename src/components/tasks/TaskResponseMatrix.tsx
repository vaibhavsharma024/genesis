'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, Play,
  Send, Edit3, X, Sparkles, Shield, ArrowRight,
  Flame, Target, MessageSquare
} from 'lucide-react';
import { cn, formatDuration, getPriorityColor, getCategoryIcon } from '@/lib/utils';
import type { TaskStatus } from '@/types';
import toast from 'react-hot-toast';

interface TaskResponseMatrixProps {
  task: {
    id: string;
    name: string;
    description: string;
    why_required?: string;
    day_number: number;
    priority?: string;
    category?: string;
    estimated_minutes?: number;
  };
  currentStatus: TaskStatus;
  onSelectResponse: (newStatus: TaskStatus, customNote?: string) => void;
  isReadOnly?: boolean;
}

export default function TaskResponseMatrix({
  task,
  currentStatus,
  onSelectResponse,
  isReadOnly = false,
}: TaskResponseMatrixProps) {
  // Option 4 custom input mode toggle
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleSelectPredefined = (cardIndex: number, status: TaskStatus, label: string) => {
    if (isReadOnly) {
      toast.error('Directory inspection is strictly view-only.');
      return;
    }
    setSelectedCard(cardIndex);
    onSelectResponse(status, label);
    toast.success(`Response recorded: "${label}"`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      toast.error('Directory inspection is strictly view-only.');
      return;
    }
    if (!customText.trim()) {
      toast.error('Please enter your response before submitting.');
      return;
    }
    onSelectResponse('IN_PROGRESS', customText.trim());
    toast.success('Custom response & update submitted!');
    setIsCustomMode(false);
    setSelectedCard(4);
  };

  return (
    <div className="w-full grid lg:grid-cols-12 gap-6 items-stretch">
      {/* ======================================================== */}
      {/* LEFT SIDE: LARGE FOCUS CARD                              */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-5 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-violet-950/20 p-6 md:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Day Milestone & Category Capsule */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Day {task.day_number} Milestone
            </span>
            {task.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <span>{getCategoryIcon(task.category)}</span>
                <span>{task.category}</span>
              </span>
            )}
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
              currentStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
              currentStatus === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
              currentStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              'bg-blue-500/20 text-blue-300 border-blue-500/30'
            )}>
              {currentStatus.replace('_', ' ')}
            </span>
          </div>

          {/* Large Task Title */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {task.name}
          </h2>

          {/* Objective & Description */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
              Objective & Key Deliverable
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {task.description}
            </p>

            {task.why_required && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Why is this required?</strong>
                {task.why_required}
              </div>
            )}
          </div>
        </div>

        {/* Task Footer Meta */}
        <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
          {task.estimated_minutes && (
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>Est: {formatDuration(task.estimated_minutes)}</span>
            </div>
          )}
          {task.priority && (
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="text-slate-500">Priority:</span>
              <span className={cn('capitalize', getPriorityColor(task.priority as any))}>
                {task.priority}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* RIGHT SIDE: 4-CARD RESPONSE MATRIX                       */}
      {/* ======================================================== */}
      <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
        {/* OPTION 1: COMPLETE & VERIFIED */}
        <motion.div
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => handleSelectPredefined(1, 'COMPLETED', 'Milestone Verified & Successfully Completed')}
          className={cn(
            'group rounded-3xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg select-none',
            selectedCard === 1 || currentStatus === 'COMPLETED'
              ? 'border-emerald-500 bg-emerald-500/15 shadow-emerald-500/20'
              : 'border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:shadow-2xl'
          )}
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Option 1 · Single Click</span>
            <h4 className="text-base font-bold text-white mt-1 mb-1.5">Mark Completed</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All objectives, security checks, and deliverables are fully accomplished.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Submit Status</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* OPTION 2: IN PROGRESS / ACTIVE MILESTONE */}
        <motion.div
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => handleSelectPredefined(2, 'IN_PROGRESS', 'Active Work Underway')}
          className={cn(
            'group rounded-3xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg select-none',
            selectedCard === 2 || currentStatus === 'IN_PROGRESS'
              ? 'border-blue-500 bg-blue-500/15 shadow-blue-500/20'
              : 'border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-2xl'
          )}
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Option 2 · Single Click</span>
            <h4 className="text-base font-bold text-white mt-1 mb-1.5">Active / In Progress</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Currently executing instructions, attending sessions, or setting up environment.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-blue-400">
            <span>Submit Status</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* OPTION 3: PREREQUISITES VERIFIED / READY */}
        <motion.div
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => handleSelectPredefined(3, 'READY', 'Prerequisites Verified')}
          className={cn(
            'group rounded-3xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg select-none',
            selectedCard === 3 || currentStatus === 'READY'
              ? 'border-violet-500 bg-violet-500/15 shadow-violet-500/20'
              : 'border-white/10 bg-white/5 hover:border-violet-500/40 hover:bg-violet-500/5 hover:shadow-2xl'
          )}
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mb-3 text-violet-400 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Option 3 · Single Click</span>
            <h4 className="text-base font-bold text-white mt-1 mb-1.5">Prerequisites Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dependencies and access permissions verified; primed to execute task immediately.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-violet-400">
            <span>Submit Status</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* OPTION 4: CUSTOM INPUT CARD (TRANSFORMS INTO LIVE TEXTAREA) */}
        <motion.div
          whileHover={!isCustomMode ? { scale: 1.03, y: -6 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={cn(
            'rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-lg',
            isCustomMode
              ? 'border-indigo-500/60 bg-slate-900/95 ring-2 ring-indigo-500/30 shadow-2xl'
              : 'border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer'
          )}
          onClick={() => {
            if (!isCustomMode) setIsCustomMode(true);
          }}
        >
          <AnimatePresence mode="wait">
            {!isCustomMode ? (
              <motion.div
                key="card-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-3 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Option 4 · Custom Input</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-1.5">Type Manual Response</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click to transform into a live input to document blockers, notes, or special updates.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>Open Custom Input</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="input-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleCustomSubmit}
                onClick={(e) => e.stopPropagation()}
                className="h-full flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Live Custom Response
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Describe your progress, blocker reason, or specific milestone update..."
                    rows={3}
                    className="w-full p-2.5 bg-black/50 border border-indigo-500/30 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Submit Update
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
