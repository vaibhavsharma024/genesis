'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, HelpCircle, Clock, CheckCircle2,
  AlertTriangle, Sparkles, User, Laptop,
  Building, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { useEmployeeData } from '@/lib/context';
import { DEMO_EMPLOYEE } from '@/lib/mock-data';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { SupportType } from '@/types';
import toast from 'react-hot-toast';

const SUPPORT_TYPES: { value: SupportType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'HR', label: 'HR Question', icon: User, color: 'text-violet-400' },
  { value: 'IT', label: 'IT Issue', icon: Laptop, color: 'text-blue-400' },
  { value: 'Facilities', label: 'Facilities', icon: Building, color: 'text-emerald-400' },
  { value: 'General', label: 'General', icon: HelpCircle, color: 'text-slate-400' },
];

const STATUS_CONFIG = {
  REQUESTED: { label: 'Submitted', color: 'text-blue-400 bg-blue-500/20', icon: Clock },
  AI_REVIEWING: { label: 'AI Reviewing', color: 'text-violet-400 bg-violet-500/20', icon: Sparkles },
  HUMAN_REQUIRED: { label: 'Human Required', color: 'text-amber-400 bg-amber-500/20', icon: AlertTriangle },
  ASSIGNED: { label: 'Assigned', color: 'text-cyan-400 bg-cyan-500/20', icon: User },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400 bg-amber-500/20', icon: Clock },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', color: 'text-slate-400 bg-slate-700', icon: CheckCircle2 },
};

function NewTicketModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [type, setType] = useState<SupportType>('General');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit({ type, subject, description });
    setIsSubmitting(false);
    onClose();
    toast.success('Support request submitted! Genesis AI is reviewing your request.');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">New Support Request</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-sm transition-all text-left',
                      type === t.value
                        ? 'border-violet-500/50 bg-violet-500/10 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0', type === t.value ? t.color : 'text-slate-500')} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
            />
          </div>

          {/* AI note */}
          <div className="flex items-center gap-2 p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <p className="text-xs text-violet-300">Genesis AI will review your request and provide an initial response instantly.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !description.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function HelpPage() {
  const { supportRequests, addSupportRequest } = useEmployeeData();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = (data: any) => {
    addSupportRequest({
      employee_id: 'emp-vaibhav',
      task_id: undefined,
      type: data.type,
      subject: data.subject,
      description: data.description,
      status: 'AI_REVIEWING',
      ai_response: `Thank you for your request! I'm Genesis AI and I'm reviewing your "${data.subject}" request. Based on your profile and onboarding day, here's what I can help with immediately. An HR representative will follow up within 4 hours if this needs human assistance.`,
      assigned_to: undefined,
      resolution_notes: undefined,
    });
  };

  const active = supportRequests.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED');
  const resolved = supportRequests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED');

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-400 text-sm mt-1">Get help from Genesis AI or your HR team</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* AI assistant hint */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-violet-300 text-sm font-medium">Genesis AI is available 24/7</p>
          <p className="text-violet-400/70 text-xs mt-0.5">
            Use the <strong>Ask Genesis</strong> bar below for instant answers about locations, tasks, contacts, and more.
            For complex issues, submit a support request and our team will assist within 4 hours.
          </p>
        </div>
      </div>

      {/* Active requests */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-300">Active Requests ({active.length})</h3>
          {active.map((req, i) => {
            const statusConf = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.REQUESTED;
            const StatusIcon = statusConf.icon;
            const expanded = expandedId === req.id;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : req.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className={cn('badge flex-shrink-0', statusConf.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConf.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{req.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{req.type} · {formatRelativeTime(req.created_at)}</p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800 overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Your Request:</p>
                          <p className="text-sm text-slate-300">{req.description}</p>
                        </div>

                        {req.ai_response && (
                          <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-violet-400" />
                              <p className="text-xs font-semibold text-violet-400">Genesis AI Response</p>
                            </div>
                            <p className="text-sm text-slate-300">{req.ai_response}</p>
                          </div>
                        )}

                        {req.assigned_to && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <User className="w-4 h-4" />
                            Assigned to: <span className="text-white font-medium">{req.assigned_to}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-500 text-sm">Resolved ({resolved.length})</h3>
          {resolved.map((req, i) => {
            const statusConf = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.RESOLVED;
            return (
              <div
                key={req.id}
                className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl opacity-70"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-400 truncate">{req.subject}</p>
                  <p className="text-xs text-slate-600">{req.type} · {formatRelativeTime(req.updated_at)}</p>
                </div>
                <span className="text-xs text-emerald-500">Resolved</span>
              </div>
            );
          })}
        </div>
      )}

      {supportRequests.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No support requests yet</p>
          <p className="text-xs mt-1">Click "New Request" if you need help</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NewTicketModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />
        )}
      </AnimatePresence>
    </div>
  );
}
