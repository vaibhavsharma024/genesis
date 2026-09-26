'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Bot, Send, MapPin, Compass, Navigation,
  ArrowRight, Shield, Layers, CornerDownRight, CheckCircle2
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { generateGenesisAIResponse } from '@/lib/genesis-ai';

interface TiltState {
  rotateX: number;
  rotateY: number;
  x: number;
  y: number;
  isHovered: boolean;
}

export default function Dynamic3DLeftSidebar() {
  const { employee, user } = useAuth();
  const { tasks, journeyMilestones, supportContacts, companyRules } = useEmployeeData();

  // Tilt states for Card 1 (AI) and Card 2 (Map)
  const [aiTilt, setAiTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, x: 0, y: 0, isHovered: false });
  const [mapTilt, setMapTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, x: 0, y: 0, isHovered: false });

  // AI mini chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<TiltState>>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setter({ rotateX, rotateY, x, y, isHovered: true });
  };

  const handleMouseLeave = (setter: React.Dispatch<React.SetStateAction<TiltState>>) => {
    setter({ rotateX: 0, rotateY: 0, x: 0, y: 0, isHovered: false });
  };

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiAnswer(null);

    setTimeout(() => {
      setIsAiLoading(false);
      const res = generateGenesisAIResponse({
        query: aiQuery,
        employee,
        user,
        tasks,
        journeyMilestones,
        supportContacts,
        companyRules,
      });
      setAiAnswer(res.answer);
      setAiQuery('');
    }, 450);
  };

  const companyName = employee?.company_name || user?.company_name || 'Enterprise Workspace';
  const branchTitle = employee?.branch_name || user?.branch_name || 'Main Campus';
  const departmentTitle = employee?.department_name || user?.department_name || 'Engineering';

  return (
    <aside className="w-full xl:w-80 flex flex-col gap-5 flex-shrink-0">
      {/* ======================================================== */}
      {/* CARD 1: ASK GENESIS AI ASSISTANT                         */}
      {/* ======================================================== */}
      <div
        style={{ perspective: '1000px' }}
        className="w-full"
      >
        <motion.div
          onMouseMove={(e) => handleMouseMove(e, setAiTilt)}
          onMouseLeave={() => handleMouseLeave(setAiTilt)}
          animate={{
            rotateX: aiTilt.rotateX,
            rotateY: aiTilt.rotateY,
            scale: aiTilt.isHovered ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-violet-950/30 p-5 shadow-2xl backdrop-blur-xl overflow-hidden cursor-default transition-shadow hover:shadow-violet-500/20"
        >
          {/* Specular Light Flare following cursor */}
          {aiTilt.isHovered && (
            <div
              className="pointer-events-none absolute -inset-px opacity-70 transition-opacity duration-300 rounded-3xl"
              style={{
                background: `radial-gradient(220px circle at ${aiTilt.x}px ${aiTilt.y}px, rgba(167, 139, 250, 0.25), transparent 70%)`,
              }}
            />
          )}

          {/* Card Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Ask Genesis AI
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{companyName} Intelligence</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed relative z-10">
            Ask any question about working hours (9:30-6:30), tasks, {companyName} rules, or chat naturally!
          </p>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
            {['Working Hours', 'My Tasks', 'IT & WiFi', 'Campus Map'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setAiQuery(chip);
                  setIsAiLoading(true);
                  setAiAnswer(null);
                  setTimeout(() => {
                    setIsAiLoading(false);
                    const res = generateGenesisAIResponse({
                      query: chip,
                      employee,
                      user,
                      tasks,
                      journeyMilestones,
                      supportContacts,
                      companyRules,
                    });
                    setAiAnswer(res.answer);
                    setAiQuery('');
                  }, 400);
                }}
                className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-300 hover:text-violet-200 border border-white/10 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* AI Response Display */}
          {aiAnswer && (
            <div className="mb-3 p-3 rounded-xl bg-violet-950/70 border border-violet-500/40 text-xs text-violet-200 space-y-1 relative z-10 max-h-56 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-1 border-b border-violet-500/20">
                <span className="font-semibold text-white flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Genesis Answer:
                </span>
                <button onClick={() => setAiAnswer(null)} className="text-[10px] text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap">{aiAnswer}</div>
            </div>
          )}

          {/* Interactive Chat Input */}
          <form onSubmit={handleAiAsk} className="relative z-10 flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={`Ask about ${companyName} or say hi...`}
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiQuery.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* CARD 2: INTERACTIVE CAMPUS MAP & FLOOR ROUTING CARD      */}
      {/* ======================================================== */}
      <div
        style={{ perspective: '1000px' }}
        className="w-full"
      >
        <motion.div
          onMouseMove={(e) => handleMouseMove(e, setMapTilt)}
          onMouseLeave={() => handleMouseLeave(setMapTilt)}
          animate={{
            rotateX: mapTilt.rotateX,
            rotateY: mapTilt.rotateY,
            scale: mapTilt.isHovered ? 1.02 : 1,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-blue-950/30 p-5 shadow-2xl backdrop-blur-xl overflow-hidden cursor-default transition-shadow hover:shadow-blue-500/20"
        >
          {/* Specular Light Flare following cursor */}
          {mapTilt.isHovered && (
            <div
              className="pointer-events-none absolute -inset-px opacity-70 transition-opacity duration-300 rounded-3xl"
              style={{
                background: `radial-gradient(220px circle at ${mapTilt.x}px ${mapTilt.y}px, rgba(96, 165, 250, 0.25), transparent 70%)`,
              }}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate max-w-[150px]">{companyName} Map</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{branchTitle}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Zone
            </span>
          </div>

          {/* Interactive Routing Visual Tailored to User's Company */}
          <div className="relative z-10 mb-4 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Work Zone:
              </span>
              <span className="font-semibold text-white truncate max-w-[130px]">{departmentTitle} Wing · Floor 2</span>
            </div>

            {/* Stylized routing path */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
              <span className="truncate max-w-[65px]">Main Atrium</span>
              <span className="text-slate-500">→</span>
              <span className="truncate max-w-[65px]">Elevator W</span>
              <span className="text-slate-500">→</span>
              <span className="font-bold text-white truncate max-w-[75px]">{departmentTitle} Pod</span>
            </div>
          </div>

          {/* CTA Link to full interactive map */}
          <Link
            href="/employee/company-map"
            className="relative z-10 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
          >
            <span>Explore {companyName} Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </aside>
  );
}
