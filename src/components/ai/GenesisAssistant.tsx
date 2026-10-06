'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RotateCcw, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useEmployeeData } from '@/lib/context';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  isError?: boolean;
}

const STARTER_SUGGESTIONS = [
  'What do I need to complete today?',
  'Show my pending tasks',
  'What is my onboarding progress?',
  'What should I do next?',
  'Tell me about my department',
  'Who should I contact for help?',
];

export default function GenesisAssistant() {
  const { user, employee } = useAuth();
  const { tasks, journeyMilestones, companyRules } = useEmployeeData();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const firstName = (employee?.name || user?.name || 'there').split(' ')[0];
  const companyName = employee?.company_name || user?.company_name || 'Genesis';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hi ${firstName} 👋\n\nHow can I help you with your onboarding today at **${companyName}**? You can ask about today's priorities, pending tasks, department guides, IT setup, campus navigation, or who to contact for assistance!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  // Listen for genesis-open-ai custom event from sidebar / dashboard
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('genesis-open-ai', handleOpen);
    return () => window.removeEventListener('genesis-open-ai', handleOpen);
  }, []);

  // Auto-scroll when messages change or while thinking
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus input on panel open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? input).trim();
      if (!query || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInput('');
      setIsThinking(true);

      // Prepare conversation history (exclude welcome or errors)
      const apiHistory = updatedHistory
        .filter(m => m.id !== 'welcome-msg' && !m.isError)
        .slice(-8)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      // Authorized client context for secure server validation
      const clientContext = {
        employee: employee || {
          name: user?.name,
          email: user?.email,
          role: 'Team Member',
          company_name: user?.company_name,
          branch_name: user?.branch_name,
          department_name: user?.department_name,
        },
        tasks: tasks.map(t => ({
          id: t.id,
          task_id: t.task_id,
          status: t.status,
          task: t.task ? {
            name: t.task.name,
            description: t.task.description,
            category: t.task.category,
            priority: t.task.priority,
            day_number: t.task.day_number,
            estimated_minutes: t.task.estimated_minutes,
          } : undefined,
        })),
        journeyMilestones: journeyMilestones.map(m => ({
          day: m.day,
          label: m.label,
          description: m.description,
          status: m.status,
        })),
        companyRules: companyRules.map(r => ({
          title: r.title,
          summary: r.summary,
        })),
      };

      try {
        // Send to server-side AI chatbot API
        const sessionPayload = {
          user: { id: user?.id, email: user?.email, name: user?.name, role: user?.role },
        };
        const authHeader = typeof window !== 'undefined' ? btoa(JSON.stringify(sessionPayload)) : '';

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-genesis-auth': authHeader,
          },
          body: JSON.stringify({
            message: query,
            history: apiHistory.slice(0, -1), // prior turns
            clientContext,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.reply) {
          const fallbackText =
            data.reply ||
            "I'm having trouble connecting right now. Please try again in a moment.";

          setMessages(prev => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: fallbackText,
              timestamp: new Date().toISOString(),
              isError: !data.reply,
            },
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
              sources: data.sources,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [input, isThinking, messages, employee, user, tasks, journeyMilestones, companyRules]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `Hi ${firstName} 👋\n\nHow can I help you with your onboarding today at **${companyName}**? Ask me about today's tasks, your first-week roadmap, department contacts, or IT setups!`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Render markdown text lines cleanly
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet points
          if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
            const raw = line.slice(2);
            const boldFormatted = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-violet-500 font-bold mt-1 text-xs">•</span>
                <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            const num = numMatch[1];
            const raw = numMatch[2];
            const boldFormatted = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-violet-500 font-bold text-xs mt-0.5">{num}.</span>
                <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
              </div>
            );
          }

          const boldFormatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          return <p key={idx} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
        })}
      </div>
    );
  };

  return (
    <>
      {/* ======================================================== */}
      {/* FLOATING ACTION BUTTON (BOTTOM-RIGHT)                    */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? 'Close Genesis Assistant' : 'Open Genesis Assistant'}
          className={cn(
            'group relative flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer shadow-2xl transition-all duration-300',
            isOpen
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-700 dark:border-white/20'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white border border-white/20'
          )}
          style={{
            boxShadow: isOpen
              ? '0 10px 30px rgba(0, 0, 0, 0.35)'
              : '0 10px 35px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Subtle Outer Glow Wave */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 opacity-40 blur-md group-hover:opacity-75 transition duration-500 -z-10 animate-pulse" />
          )}

          <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center flex-shrink-0">
            {isOpen ? (
              <X className="w-5 h-5 text-current" />
            ) : (
              <span className="text-xl leading-none">🤖</span>
            )}
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-black tracking-tight leading-tight">
              Genesis Assistant
            </span>
            <span className="text-[10px] font-medium opacity-85 leading-tight">
              {isOpen ? 'Close chat' : 'AI Onboarding Copilot'}
            </span>
          </div>
        </motion.button>
      </div>

      {/* ======================================================== */}
      {/* CHATBOT FLOATING PANEL                                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              // Mobile: full-screen or high modal; Desktop: floating panel on bottom-right
              'fixed z-50 flex flex-col',
              'inset-x-0 bottom-0 top-16 sm:top-auto sm:inset-auto sm:bottom-24 sm:right-6',
              'w-full sm:w-[440px] sm:h-[620px] max-h-[calc(100vh-80px)]',
              'rounded-t-3xl sm:rounded-3xl overflow-hidden',
              'bg-white/95 dark:bg-[#0b0d19]/95 backdrop-blur-2xl',
              'border border-slate-200 dark:border-white/10',
              'shadow-2xl shadow-violet-950/30'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 flex-shrink-0"
                  style={{
                    boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                  }}
                >
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                      Genesis Assistant
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your onboarding copilot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  aria-label="Close Genesis Assistant"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
                  >
                    <div className="flex items-start gap-2.5 max-w-[88%]">
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-violet-600/15 dark:bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                          🤖
                        </div>
                      )}

                      <div
                        className={cn(
                          'px-4 py-3 rounded-2xl text-sm leading-relaxed transition-colors',
                          isUser
                            ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-br-xs shadow-md shadow-violet-500/20'
                            : msg.isError
                            ? 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-bl-xs'
                            : 'bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                        )}
                        style={
                          isUser
                            ? {
                                boxShadow:
                                  '0 4px 14px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                              }
                            : undefined
                        }
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderMessageContent(msg.content)
                        )}

                        {/* Source Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Grounding:
                            </span>
                            {msg.sources.map((src, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                              >
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </motion.div>
                );
              })}

              {/* Thinking / Loading State Indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-violet-600/15 dark:bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                    🤖
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="font-medium">Genesis Assistant is thinking</span>
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Starter Questions (Interactive triggers) */}
            {messages.length <= 2 && !isThinking && (
              <div className="px-5 pb-2">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_SUGGESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-violet-500/10 dark:hover:bg-violet-500/20 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-300 border border-slate-200 dark:border-white/10 hover:border-violet-500/30 transition-all text-left cursor-pointer active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-inner">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Genesis Assistant..."
                    aria-label="Ask Genesis Assistant"
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-28 overflow-y-auto"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  aria-label="Send message"
                  className={cn(
                    'p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0',
                    input.trim() && !isThinking
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/30 active:scale-95'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  )}
                  style={
                    input.trim() && !isThinking
                      ? {
                          boxShadow:
                            '0 4px 12px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        }
                      : undefined
                  }
                >
                  {isThinking ? (
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-current" />
                  )}
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Enter to send · Shift + Enter for new line</span>
                <span className="font-semibold text-violet-500">Genesis Assistant</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
