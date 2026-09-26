'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Loader2, Sparkles,
  MapPin, Clock, Phone, ExternalLink
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { useAuth, useEmployeeData } from '@/lib/context';
import { generateGenesisAIResponse } from '@/lib/genesis-ai';

const SUGGESTED_QUESTIONS = [
  "What are standard working hours?",
  "What should I do next?",
  "How does overtime work?",
  "Where is IT Helpdesk & laptop setup?",
  "Tell me about the company culture",
  "How do I connect to Enterprise WiFi?",
  "What are today's priorities?",
  "Who can I contact for HR help?",
];

export default function AskGenesis() {
  const { employee, user } = useAuth();
  const { tasks, journeyMilestones, supportContacts, companyRules } = useEmployeeData();

  const companyName = employee?.company_name || user?.company_name || 'Your Company';
  const firstName = (employee?.name || user?.name || 'Colleague').split(' ')[0];
  const day = employee?.onboarding_day || 1;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${firstName}! 👋 I'm Genesis, your AI onboarding & workplace intelligence assistant at **${companyName}**.\n\nYou are on **Day ${day}** of your journey in the **${employee?.department_name || 'Operations'}** team.\n\nAsk me anything — about working hours (9:30 AM – 6:30 PM), overtime, today's tasks, IT hardware, campus directions, or just say hello!`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let answerText = '';
    let sourcesList: string[] | undefined = undefined;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          company: companyName,
          department: employee?.department_name,
          employeeName: employee?.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply && !data.reply.includes('In demo mode without a live GEMINI_API_KEY')) {
          answerText = data.reply;
          sourcesList = data.sources;
        }
      }
    } catch {
      // fallback
    }

    if (!answerText) {
      const response = generateGenesisAIResponse({
        query: text,
        employee,
        user,
        tasks,
        journeyMilestones,
        supportContacts,
        companyRules,
      });
      answerText = response.answer;
      sourcesList = response.sources;
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: answerText,
      timestamp: new Date().toISOString(),
      sources: sourcesList,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  }, [companyName, employee, user, tasks, journeyMilestones, supportContacts, companyRules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    const parts = content.split('\n');
    return parts.map((line, i) => {
      // Bold
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('📍') || line.startsWith('🕐') || line.startsWith('✅') ||
          line.startsWith('🎯') || line.startsWith('⚡') || line.startsWith('📅') ||
          line.startsWith('💡') || line.startsWith('⚠️') || line.startsWith('📧') ||
          line.startsWith('📞') || line.startsWith('💼') || line.startsWith('⏰') ||
          line.startsWith('▶️') || line.startsWith('🔄') || line.startsWith('⏳') ||
          line.startsWith('🔒') || line.startsWith('📚') || line.startsWith('💳')) {
        return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* Persistent bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:left-64">
        <div
          className={cn(
            'mx-4 mb-4 rounded-2xl border border-violet-500/30 bg-slate-950/95 backdrop-blur-xl',
            'shadow-lg shadow-violet-500/10'
          )}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">Ask Genesis</p>
              <p className="text-xs text-slate-400">AI Onboarding Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-1 rounded-full">
                {isOpen ? 'Close' : 'Ask anything'}
              </span>
              <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-40 w-full max-w-sm lg:right-6"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[520px]">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-gradient-to-r from-violet-500/10 to-blue-500/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">Ask Genesis</p>
                  <p className="text-xs text-slate-400">{companyName} AI · Day {day} of 5</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-3 space-y-1',
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                      )}
                    >
                      {msg.role === 'assistant' ? renderContent(msg.content) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map(src => (
                              <span key={src} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                                📄 {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.slice(0, 4).map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-slate-800 hover:bg-violet-500/20 text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-full border border-slate-700 hover:border-violet-500/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
