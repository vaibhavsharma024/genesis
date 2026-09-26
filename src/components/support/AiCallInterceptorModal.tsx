'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Bot, PhoneCall, CheckCircle2, AlertTriangle,
  Clock, X, Send, Sparkles, PhoneForwarded, Lock, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactInfo {
  name: string;
  role: string;
  department: string;
  phone: string;
  availability: string;
}

interface AiCallInterceptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactInfo | null;
}

export default function AiCallInterceptorModal({
  isOpen,
  onClose,
  contact,
}: AiCallInterceptorModalProps) {
  const [issueText, setIssueText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    status: 'RESOLVED_BY_AI' | 'CALL_AUTHORIZED';
    title: string;
    description: string;
    ticketId?: string;
    solutionSteps?: string[];
  } | null>(null);

  // Check if current time is within operational hours (Mon-Fri, 9:30 AM - 6:30 PM)
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const isWithinOperationalHours = day >= 1 && day <= 5 && hour >= 9.5 && hour <= 18.5;

  const handleInterceptAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) {
      toast.error('Please describe your issue or blocker.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const query = issueText.toLowerCase();

      // Check if self-resolvable via documented policy/handbook
      const isDocumentedPolicy =
        query.includes('wifi') ||
        query.includes('password') ||
        query.includes('internet') ||
        query.includes('vpn') ||
        query.includes('leave') ||
        query.includes('holiday') ||
        query.includes('lunch') ||
        query.includes('hours') ||
        query.includes('benefits') ||
        query.includes('buddy') ||
        query.includes('github') ||
        query.includes('slack');

      if (isDocumentedPolicy) {
        setResult({
          status: 'RESOLVED_BY_AI',
          title: 'Direct Call Intercepted & Resolved by Genesis AI',
          description: 'This issue is fully documented in company policy. Genesis AI has resolved your inquiry immediately without placing an unnecessary human phone call.',
          solutionSteps: [
            'Policy Match: Company Knowledge Base Article #4092',
            'Resolution: Follow the standard self-service portal protocol or enter your SSO credentials.',
            'Status: Closed as Self-Service. No human call needed.',
          ],
        });
        toast.success('Issue solved by AI Call Guard! No human phone call needed.');
      } else {
        // Complex / physical intervention needed (e.g. damaged laptop, spilled water, badge lost)
        const tkt = `TKT-${Date.now().toString().slice(-5)}`;
        setResult({
          status: 'CALL_AUTHORIZED',
          title: 'Direct Call Authorized & Ticket Logged',
          ticketId: tkt,
          description: isWithinOperationalHours
            ? `Your blocker involves physical or administrative escalation. Genesis AI has validated the request, logged Priority Ticket #${tkt}, and authorized a direct line to ${contact?.name || 'Support Desk'}.`
            : `Physical/administrative intervention required (Logged #${tkt}), but corporate phone lines are active Mon-Fri, 9:30 AM – 6:30 PM. Your ticket has been prioritized for the next operational window.`,
        });
        toast('Human call authorized by Genesis AI Guard.', { icon: '🛡️' });
      }
    }, 900);
  };

  const handleReset = () => {
    setIssueText('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl border border-blue-500/30 bg-slate-900/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow pill */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Genesis AI Call Guard
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Direct Call Interceptor
            </h2>
          </div>
        </div>

        {/* Target contact summary */}
        {contact && (
          <div className="mb-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">{contact.name}</p>
              <p className="text-slate-400">{contact.role} · {contact.department}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {contact.availability}
              </span>
            </div>
          </div>
        )}

        {/* PHASE 1: ISSUE EXPLANATION */}
        {!result && (
          <form onSubmit={handleInterceptAnalysis} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed">
              Direct human phone calls are guarded by Genesis AI. Explain your exact issue or blocker below. If documented in policies or FAQs, AI resolves it immediately. If physical assistance is needed, a direct call is authorized.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Explain your exact blocker or request *
              </label>
              <textarea
                autoFocus
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder="e.g. Spilled liquid on laptop keyboard, cannot boot / Need WiFi password / Lost security RFID badge..."
                rows={4}
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI Guard Evaluating...
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    Verify with AI Guard
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PHASE 2: ANALYSIS RESULT */}
        {result && (
          <div className="space-y-4">
            {result.status === 'RESOLVED_BY_AI' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    {result.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {result.solutionSteps && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs space-y-2">
                    <span className="font-semibold text-white">AI Resolution Breakdown:</span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {result.solutionSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close & Acknowledge Resolution
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                    <PhoneForwarded className="w-5 h-5 flex-shrink-0" />
                    {result.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Direct Dial or Time Window */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Priority Ticket:</span>
                    <span className="font-mono text-blue-400 font-bold">{result.ticketId}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Authorized Support Line:</span>
                    <span className="font-semibold text-white">{contact?.phone || '+1 (800) 555-0199'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Hours:</span>
                    <span className="text-slate-300">Mon-Fri, 9:30 AM – 6:30 PM</span>
                  </div>
                </div>

                {isWithinOperationalHours ? (
                  <a
                    href={`tel:${contact?.phone || '+18005550199'}`}
                    onClick={() => {
                      toast.success(`Dialing authorized line for ${contact?.name}`);
                      handleReset();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Dial Direct Support Line Now</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Ticket Logged (Lines open Mon-Fri 9:30 AM) · Close
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
