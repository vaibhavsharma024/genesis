'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, Shield, AlertTriangle, Mail,
  Bell, CheckCircle2, ChevronRight, X, Eye,
  Lock, GitBranch, Sparkles, Send, Edit3, ArrowRight,
  TrendingUp, Activity, Layers, CornerDownRight,
  Compass, CheckSquare, Star, HelpCircle, Plus,
  PhoneCall, Laptop, Building, BookOpen, Clock,
  Maximize2, RotateCcw, ZoomIn, ZoomOut, Network,
  FolderTree, Share2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth, useEmployeeData } from '@/lib/context';
import { type HREmployeeRecord } from '@/lib/mock-data';
import { cn, formatDate } from '@/lib/utils';
import AiCallInterceptorModal from '@/components/support/AiCallInterceptorModal';
import toast from 'react-hot-toast';

export type BranchCategory = 'journey' | 'tasks' | 'experience' | 'support_about';

export interface HRMindMapNode {
  id: string;
  branch: BranchCategory;
  title: string;
  subtitle: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'READY' | 'BLOCKED';
  deliverable: string;
  details?: string;
  isCustom?: boolean;
}

const BRANCH_CONFIG: Record<BranchCategory, { label: string; icon: any; color: string; bgLight: string; border: string; stroke: string; glow: string }> = {
  journey: {
    label: 'My Journey',
    icon: Compass,
    color: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-violet-500/10 dark:bg-violet-500/10',
    border: 'border-violet-500/40',
    stroke: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  tasks: {
    label: 'Tasks (Unfilled)',
    icon: CheckSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-500/10 dark:bg-blue-500/10',
    border: 'border-blue-500/40',
    stroke: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  experience: {
    label: 'Experience',
    icon: Star,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    border: 'border-emerald-500/40',
    stroke: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  support_about: {
    label: 'Support & About',
    icon: HelpCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500/10 dark:bg-amber-500/10',
    border: 'border-amber-500/40',
    stroke: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
};

export default function MindMapDashboard() {
  const { user, employee } = useAuth();
  const {
    tasks, onboardingTasks, updateTaskStatus,
    journeyMilestones,
    supportContacts,
    companyRules,
  } = useEmployeeData();
  const searchParams = useSearchParams();

  // HR User Profile data
  const hrName = user?.name || employee?.name || 'HR Operations Lead';
  const hrPhoto = user?.profile_photo || employee?.profile_photo;
  const hrCompany = user?.company_name || employee?.company_name || 'Genesis Enterprise';
  const hrBranch = user?.branch_name || employee?.branch_name || 'Global Campus';

  // Custom added nodes by HR persisted in localStorage
  const [customNodes, setCustomNodes] = useState<HRMindMapNode[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_mindmap_custom_nodes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('genesis_mindmap_custom_nodes', JSON.stringify(customNodes));
    } catch {}
  }, [customNodes]);

  const [nodeOverrides, setNodeOverrides] = useState<Record<string, { status: HRMindMapNode['status']; details?: string }>>({});

  const [activeNode, setActiveNode] = useState<HRMindMapNode | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree');

  // Sync selectedBranch from URL query parameter (e.g. ?branch=tasks)
  React.useEffect(() => {
    const branchParam = searchParams.get('branch') as BranchCategory | null;
    if (branchParam && ['journey', 'tasks', 'experience', 'support_about'].includes(branchParam)) {
      setSelectedBranch(branchParam);
    } else if (!branchParam) {
      setSelectedBranch('ALL');
    }
  }, [searchParams]);



  const [customResponseText, setCustomResponseText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Top-Right Notifications & Directory State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inspectedEmployee, setInspectedEmployee] = useState<HREmployeeRecord | null>(null);
  const [interceptorContact, setInterceptorContact] = useState<any>(null);

  // Filtered Employee Roster (Real employees working under this HR, zero mock data)
  const employeeRoster = useMemo(() => {
    let list: HREmployeeRecord[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('genesis_registered_users');
        if (stored) {
          const parsed = JSON.parse(stored);
          const rawList = Array.isArray(parsed) ? parsed : Object.values(parsed);

          const hrCompany = (user?.company_name || '').trim().toLowerCase();
          const hrName = (user?.name || '').trim().toLowerCase();
          const hrEmail = (user?.email || '').trim().toLowerCase();

          list = rawList
            .filter((u: any) => {
              if (!u || !u.email) return false;

              // 1. Must NOT be an HR account
              const roleUpper = String(u.role || '').toUpperCase();
              const deptUpper = String(u.department_name || u.department || '').toUpperCase();
              if (
                u.role === 'hr_manager' ||
                u.role === 'HR' ||
                roleUpper.includes('HR') ||
                roleUpper.includes('HUMAN RESOURCES') ||
                deptUpper.includes('HUMAN RESOURCES')
              ) {
                return false;
              }

              // 2. Must NOT be current HR user's own email
              if (hrEmail && u.email.toLowerCase() === hrEmail) {
                return false;
              }

              // 3. Must work under this HR coordinator
              const empCompany = (u.company_name || u.company || '').trim().toLowerCase();
              const empManager = (u.manager || '').trim().toLowerCase();

              if (hrCompany && empCompany) {
                const isCompanyMatch = empCompany === hrCompany || empCompany.includes(hrCompany) || hrCompany.includes(empCompany);
                const isManagerMatch = hrName && empManager.includes(hrName);
                if (!isCompanyMatch && !isManagerMatch) {
                  return false;
                }
              }

              return true;
            })
            .map((u: any) => {
              const day = Number(u.onboarding_day) || 1;
              const progress = typeof u.progress_percentage === 'number'
                ? u.progress_percentage
                : (typeof u.onboarding_progress === 'number'
                  ? u.onboarding_progress
                  : (day > 1 ? Math.min(100, Math.round(((day - 1) / 5) * 100)) : 0));

              const totalTasks = typeof u.total_tasks_count === 'number' ? u.total_tasks_count : 16;
              const completedTasks = typeof u.completed_tasks_count === 'number'
                ? u.completed_tasks_count
                : Math.round((progress / 100) * totalTasks);

              return {
                id: u.id || `emp-${u.email}`,
                name: u.name || 'New Joiner',
                role: u.role || 'Team Member',
                department: u.department_name || u.department || 'Engineering',
                email: u.email,
                joining_date: u.joining_date || new Date().toISOString().split('T')[0],
                onboarding_day: Math.min(Math.max(1, day), 5),
                onboarding_progress: progress,
                onboarding_complete: progress >= 100,
                is_at_risk: false,
                completed_tasks_count: completedTasks,
                total_tasks_count: totalTasks,
                pending_tasks_count: Math.max(0, totalTasks - completedTasks),
                blocked_tasks_count: 0,
              };
            });
        }
      } catch {}
    }
    return list;
  }, [user]);

  // BUILD DYNAMIC LIVE NODES (All tasks & items start UNFILLED / READY as requested!)
  const allNodes: HRMindMapNode[] = useMemo(() => {
    // 1. My Journey Branch (Unfilled, 0% complete)
    const journeyNodes: HRMindMapNode[] = (journeyMilestones && journeyMilestones.length > 0 ? journeyMilestones : [
      { id: 'jrn-1', day: 1, label: 'Day 1: HR Welcome & Legal Verification', description: 'Executive orientation, document submission, and physical badge issuance.', status: 'Upcoming' },
      { id: 'jrn-2', day: 2, label: 'Day 2: IT Hardware & SSO Setup', description: 'MacBook configuration, GitHub & Slack access provisioning.', status: 'Upcoming' },
      { id: 'jrn-3', day: 3, label: 'Day 3: Cybersecurity & Compliance Check', description: 'Zero Trust security enrollment & compliance sign-off.', status: 'Upcoming' },
      { id: 'jrn-4', day: 4, label: 'Day 4: Team Integration & Buddy Sync', description: '1:1 Buddy alignment, codebase architecture walkthrough.', status: 'Upcoming' },
      { id: 'jrn-5', day: 5, label: 'Day 5: Role Handover & First Sprint PR', description: 'Role expectation sign-off and 30-day KPI alignment.', status: 'Upcoming' },
    ]).map((m: any) => ({
      id: m.id,
      branch: 'journey' as BranchCategory,
      title: m.label || `Day ${m.day}: Milestone`,
      subtitle: `Day ${m.day} Milestone`,
      status: (nodeOverrides[m.id]?.status || (m.status === 'Completed' ? 'COMPLETED' : 'READY')) as HRMindMapNode['status'],
      deliverable: m.description || 'Milestone verification',
      details: nodeOverrides[m.id]?.details || 'Unfilled onboarding milestone awaiting employee completion.',
    }));

    // 2. Tasks Branch (LIVE UNFILLED TASKS from context)
    const taskNodes: HRMindMapNode[] = (tasks && tasks.length > 0 ? tasks : []).map(t => {
      const taskMeta = t.task || onboardingTasks?.find(ot => ot.id === t.task_id);
      const title = taskMeta?.name || 'Untitled Task';
      const category = taskMeta?.category || 'General';
      const deliverable = taskMeta?.description || 'Task execution deliverable';
      const liveStatus = (nodeOverrides[t.task_id]?.status || t.status || 'READY') as HRMindMapNode['status'];
      return {
        id: t.task_id,
        branch: 'tasks' as BranchCategory,
        title,
        subtitle: `${category} Task (Unfilled)`,
        status: liveStatus,
        deliverable,
        details: nodeOverrides[t.task_id]?.details || `Task estimated time: ${taskMeta?.estimated_minutes || 30} mins. Priority: ${taskMeta?.priority || 'Medium'}. Unfilled by default.`,
      };
    });

    // 3. Experience Branch (User Input Slots - Unfilled)
    const experienceNodes: HRMindMapNode[] = [
      {
        id: 'exp-1',
        branch: 'experience',
        title: 'Career History & Prior Roles',
        subtitle: 'Experience Input',
        status: nodeOverrides['exp-1']?.status || 'READY',
        deliverable: 'Unfilled: Pending user input of previous engineering roles.',
        details: 'Awaiting candidate input in Experience tab.',
      },
      {
        id: 'exp-2',
        branch: 'experience',
        title: 'Technical Portfolio & Highlights',
        subtitle: 'Projects Input',
        status: nodeOverrides['exp-2']?.status || 'READY',
        deliverable: 'Unfilled: Pending user submission of key projects.',
        details: 'Candidate can link repositories and architecture artifacts.',
      },
      {
        id: 'exp-3',
        branch: 'experience',
        title: 'Skills & Competencies Matrix',
        subtitle: 'Skillset Endorsement',
        status: nodeOverrides['exp-3']?.status || 'READY',
        deliverable: 'Unfilled: Pending user proficiency ratings.',
        details: 'Skills assessment pending peer validation.',
      },
      {
        id: 'exp-4',
        branch: 'experience',
        title: '30-60-90 Day Goal Blueprint',
        subtitle: 'Performance Alignment',
        status: nodeOverrides['exp-4']?.status || 'READY',
        deliverable: 'Unfilled: Pending manager & candidate goal alignment.',
        details: 'Quarterly milestone framework ready for input.',
      },
    ];

    // 4. Support & About Branch (Enterprise Contacts & Operating Rules dynamically synced)
    const contactNodes: HRMindMapNode[] = (supportContacts || []).map(c => ({
      id: c.id,
      branch: 'support_about' as BranchCategory,
      title: `${c.name} (${c.role})`,
      subtitle: `${c.department} Support`,
      status: (nodeOverrides[c.id]?.status || 'READY') as HRMindMapNode['status'],
      deliverable: `${c.phone} · ${c.email}`,
      details: `Office: ${c.office}. Availability: ${c.availability || '9:30 AM – 6:30 PM'}.`,
    }));

    const ruleNodes: HRMindMapNode[] = (companyRules || []).map(r => ({
      id: r.id,
      branch: 'support_about' as BranchCategory,
      title: r.title,
      subtitle: `${r.category} Guideline`,
      status: (nodeOverrides[r.id]?.status || 'READY') as HRMindMapNode['status'],
      deliverable: r.summary,
      details: r.details ? r.details.join('; ') : r.summary,
    }));

    const fallbackSupportNodes: HRMindMapNode[] = [
      {
        id: 'sup-1',
        branch: 'support_about',
        title: 'IT Enterprise Helpdesk (Ext. 1044)',
        subtitle: 'Technical Support',
        status: nodeOverrides['sup-1']?.status || 'READY',
        deliverable: 'Operational: Mon–Fri, 9:30 AM – 6:30 PM',
        details: 'Direct hotline for laptop provisioning, BitLocker keys, and VPN access.',
      },
      {
        id: 'sup-2',
        branch: 'support_about',
        title: 'Cybersecurity SOC (24/7 Hotline)',
        subtitle: 'Incident Response',
        status: nodeOverrides['sup-2']?.status || 'READY',
        deliverable: 'Active 24/7: +1 (800) 555-0100',
        details: 'Emergency line for security credentials, phishing alerts, and lost devices.',
      },
      {
        id: 'sup-3',
        branch: 'support_about',
        title: 'Hours & Overtime Policy (9:30 - 6:30)',
        subtitle: 'Schedule Policy',
        status: nodeOverrides['sup-3']?.status || 'READY',
        deliverable: 'Weekdays 9:30 AM – 6:30 PM | Weekends Off (Overtime active)',
        details: 'Operating hours with automatic live overtime calculation beyond 18:30.',
      },
      {
        id: 'sup-4',
        branch: 'support_about',
        title: 'Clean Desk & Privacy Framework',
        subtitle: 'Compliance Policy',
        status: nodeOverrides['sup-4']?.status || 'READY',
        deliverable: 'Mandatory screen lock & no plain-text credential storage',
        details: 'Strict GDPR & SOC2 compliance policy sign-off.',
      },
    ];

    const supportNodes: HRMindMapNode[] = [...contactNodes, ...ruleNodes, ...fallbackSupportNodes];

    return [...journeyNodes, ...taskNodes, ...experienceNodes, ...supportNodes, ...customNodes];
  }, [journeyMilestones, tasks, onboardingTasks, supportContacts, companyRules, customNodes, nodeOverrides]);

  // Filter nodes based on selected branch and search query
  const filteredNodes = useMemo(() => {
    return allNodes.filter(n => {
      if (selectedBranch !== 'ALL' && n.branch !== selectedBranch) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.deliverable.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allNodes, selectedBranch, search]);

  // Overall Statistics (unfilled starts at 0% completed)
  const stats = useMemo(() => {
    const total = allNodes.length;
    const completed = allNodes.filter(n => n.status === 'COMPLETED').length;
    const inProgress = allNodes.filter(n => n.status === 'IN_PROGRESS').length;
    const blocked = allNodes.filter(n => n.status === 'BLOCKED').length;
    const ready = allNodes.filter(n => n.status === 'READY').length;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, blocked, ready, completionPercent };
  }, [allNodes]);



  const handleUpdateNodeStatus = (newStatus: HRMindMapNode['status'], note?: string) => {
    if (!activeNode) return;

    setNodeOverrides(prev => ({
      ...prev,
      [activeNode.id]: {
        status: newStatus,
        details: note ? `${activeNode.details || ''} [Note: ${note}]` : activeNode.details,
      }
    }));

    // If it's a task in context, update its status there as well
    if (activeNode.branch === 'tasks') {
      updateTaskStatus(activeNode.id, newStatus as any);
    }

    toast.success(`Node "${activeNode.title}" updated to ${newStatus}!`);
    setActiveNode(null);
    setIsCustomMode(false);
    setCustomResponseText('');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ======================================================== */}
      {/* TOP COMMAND BAR: STATS & TREE CONTROLS                   */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              Connected Tree Mind Map
            </span>
            <span className="text-xs text-slate-400">· Real-time Hierarchy</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            HR Operations Mind Map Tree
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Tree hierarchy connecting Central Genesis Core to My Journey, Tasks, Experience, and Support branches.
          </p>
        </div>

        {/* Live Metrics Cards */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Progress / Completion Rate (Starts at 0% when unfilled) */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Completion</div>
            <div className="text-base font-black text-violet-600 dark:text-violet-400">
              {stats.completionPercent}%
              {stats.completionPercent === 0 && <span className="text-[10px] text-amber-500 ml-1">Unfilled</span>}
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Ready/Pending</div>
            <div className="text-base font-black text-blue-600 dark:text-blue-400">
              {stats.ready}
            </div>
          </div>

          {/* Employee Roster Quick Access (Strictly regular new joiners, no HR) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Employee Roster ({employeeRoster.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER BAR & TREE VIEW TOGGLE                            */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedBranch('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              selectedBranch === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All 4 Connected Branches ({allNodes.length})
          </button>

          {(Object.keys(BRANCH_CONFIG) as BranchCategory[]).map(cat => {
            const config = BRANCH_CONFIG[cat];
            const count = allNodes.filter(n => n.branch === cat).length;
            const Icon = config.icon;
            const isActive = selectedBranch === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedBranch(cat)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                    : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{config.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('tree')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all',
                viewMode === 'tree' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs' : 'text-slate-500'
              )}
            >
              <FolderTree className="w-3 h-3" />
              <span>Tree View</span>
            </button>
            <button
              onClick={() => setViewMode('mindmap')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all',
                viewMode === 'mindmap' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-300 shadow-xs' : 'text-slate-500'
              )}
            >
              <Network className="w-3 h-3" />
              <span>Radial View</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter nodes..."
              className="w-36 md:w-44 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.25))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.75))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONNECTED TREE MIND MAP CANVAS                           */}
      {/* ======================================================== */}
      <div
        className="w-full min-h-[850px] rounded-3xl bg-slate-50/70 dark:bg-[#060712] border border-slate-200 dark:border-white/10 shadow-2xl p-6 md:p-10 relative overflow-hidden transition-all duration-300"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* SVG TREE CONNECTOR PATHS LAYER */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grad-root-journey" x1="50%" y1="0%" x2="12%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-root-tasks" x1="50%" y1="0%" x2="37%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-root-experience" x1="50%" y1="0%" x2="63%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-root-support" x1="50%" y1="0%" x2="88%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="treeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Curved Tree Connector Lines from Central Root to 4 Branch Nodes */}
          {/* Trunk 1: To My Journey (Leftmost) */}
          <path
            d="M 50% 170 C 50% 210, 14% 210, 14% 250"
            fill="none"
            stroke="url(#grad-root-journey)"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#treeGlow)"
          />
          {/* Trunk 2: To Tasks (Mid-Left) */}
          <path
            d="M 50% 170 C 50% 210, 38% 210, 38% 250"
            fill="none"
            stroke="url(#grad-root-tasks)"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#treeGlow)"
          />
          {/* Trunk 3: To Experience (Mid-Right) */}
          <path
            d="M 50% 170 C 50% 210, 62% 210, 62% 250"
            fill="none"
            stroke="url(#grad-root-experience)"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#treeGlow)"
          />
          {/* Trunk 4: To Support & About (Rightmost) */}
          <path
            d="M 50% 170 C 50% 210, 86% 210, 86% 250"
            fill="none"
            stroke="url(#grad-root-support)"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            filter="url(#treeGlow)"
          />
        </svg>

        {/* ======================================================== */}
        {/* LEVEL 0: ROOT TREE NODE (Central Genesis Core)           */}
        {/* ======================================================== */}
        <div className="w-full flex justify-center relative z-20 mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Outer Glow Halo */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 opacity-25 blur-xl animate-pulse -z-10" />

            <div
              className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-violet-500/60 shadow-2xl flex flex-col items-center text-center max-w-sm relative"
              style={{
                boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
              }}
            >
              {/* Avatar / Core Symbol */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/40 mb-2.5">
                {hrPhoto ? (
                  <img src={hrPhoto} alt={hrName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>G</span>
                )}
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/40 mb-1">
                Central Genesis Core
              </span>

              <h2 className="text-lg font-black text-slate-900 dark:text-white">{hrName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {hrCompany} · {hrBranch}
              </p>

              {/* Status footer inside root node */}
              <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Tree Hub
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {allNodes.length} Connected Items
                </span>
              </div>

              {/* Tree Root Connector Bottom Dot */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* LEVEL 1 & 2: 4 CONNECTED TREE BRANCHES & LEAF NODES      */}
        {/* ======================================================== */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-2">
          {(['journey', 'tasks', 'experience', 'support_about'] as BranchCategory[]).map(cat => {
            const config = BRANCH_CONFIG[cat];
            const branchNodes = filteredNodes.filter(n => n.branch === cat);
            const Icon = config.icon;

            return (
              <div key={cat} className="space-y-4 flex flex-col relative group">
                {/* Branch Top Connector Anchor Pin */}
                <div className="flex justify-center -mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center animate-bounce"
                    style={{ backgroundColor: config.stroke }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Branch Header Node (Tree Trunk Node) */}
                <div
                  className={cn(
                    'p-4 rounded-2xl border-2 flex items-center justify-between shadow-lg transition-all',
                    config.bgLight,
                    config.border,
                    'bg-white dark:bg-slate-900/95'
                  )}
                  style={{
                    boxShadow: `0 10px 20px -5px ${config.glow}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm', config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{config.label}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {branchNodes.length} connected item{branchNodes.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vertical Tree Branch Stem Connector */}
                <div className="flex justify-center -my-2 py-1">
                  <div
                    className="w-0.5 h-4"
                    style={{ backgroundColor: config.stroke, opacity: 0.6 }}
                  />
                </div>

                {/* Connected Leaf Nodes / Task Cards */}
                <div className="space-y-3 flex-1">
                  {branchNodes.map(node => {
                    const isCompleted = node.status === 'COMPLETED';
                    const isBlocked = node.status === 'BLOCKED';
                    const isInProgress = node.status === 'IN_PROGRESS';
                    const isReady = node.status === 'READY';

                    return (
                      <motion.div
                        key={node.id}
                        layout
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => setActiveNode(node)}
                        className={cn(
                          'p-4 rounded-2xl border transition-all cursor-pointer relative shadow-sm hover:shadow-xl',
                          'bg-white dark:bg-slate-900/90',
                          isCompleted && 'border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/20',
                          isBlocked && 'border-red-500/50 bg-red-50/10 dark:bg-red-950/20',
                          isInProgress && 'border-blue-500/50 bg-blue-50/10 dark:bg-blue-950/20',
                          isReady && 'border-slate-200/90 dark:border-white/10 hover:border-violet-500/50'
                        )}
                        style={{
                          boxShadow: isCompleted
                            ? '0 6px 16px -3px rgba(16, 185, 129, 0.15)'
                            : isBlocked
                            ? '0 6px 16px -3px rgba(239, 68, 68, 0.2)'
                            : undefined,
                        }}
                      >
                        {/* Tree Branch Side Connector Pin */}
                        <div
                          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white dark:border-slate-900"
                          style={{ backgroundColor: config.stroke }}
                        />

                        {/* Top Metadata & Status Chip */}
                        <div className="flex items-center justify-between gap-2 mb-2 pl-2">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                            {node.subtitle}
                          </span>
                          <span className={cn(
                            'text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider',
                            isCompleted && 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
                            isBlocked && 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-500/30 animate-pulse',
                            isInProgress && 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/30',
                            isReady && 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                          )}>
                            {node.status}
                          </span>
                        </div>

                        {/* Node Title */}
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-snug pl-2">
                          {node.title}
                        </h4>

                        {/* Deliverable snippet */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 pl-2">
                          {node.deliverable}
                        </p>

                        {/* Footer action trigger */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 pl-2">
                          <span className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1">
                            <span>Inspect & Resolve Matrix</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                          {node.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-400">Custom</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {branchNodes.length === 0 && (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400">
                      No nodes currently in this branch.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* NODE INTERACTION / RESOLUTION MATRIX MODAL               */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {BRANCH_CONFIG[activeNode.branch].label} Node
                    </span>
                    <span className="text-xs text-slate-400">Node ID: {activeNode.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeNode.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeNode.subtitle}</p>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Node Details & Deliverable */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Deliverable</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeNode.deliverable}</p>
                {activeNode.details && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-white/5">
                    {activeNode.details}
                  </p>
                )}
              </div>

              {/* 4-Card Workflow Resolution Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Select Workflow Resolution (4-Card Matrix)
                  </h4>
                  <span className="text-xs text-violet-500 font-semibold">Current: {activeNode.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Mark Completed */}
                  <button
                    onClick={() => handleUpdateNodeStatus('COMPLETED')}
                    className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/30 hover:bg-emerald-500/20 text-left transition-all cursor-pointer space-y-1 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Complete</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sign off on deliverable as fully resolved and filled.</p>
                  </button>

                  {/* Option 2: Mark In Progress */}
                  <button
                    onClick={() => handleUpdateNodeStatus('IN_PROGRESS')}
                    className="p-4 rounded-2xl border border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/30 hover:bg-blue-500/20 text-left transition-all cursor-pointer space-y-1 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      <Activity className="w-4 h-4" />
                      <span>Active In Progress</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Mark item as currently executing.</p>
                  </button>

                  {/* Option 3: Escalate Blocker */}
                  <button
                    onClick={() => handleUpdateNodeStatus('BLOCKED')}
                    className="p-4 rounded-2xl border border-red-500/40 bg-red-50/20 dark:bg-red-950/30 hover:bg-red-500/20 text-left transition-all cursor-pointer space-y-1 shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag as Blocker</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Escalate blocking dependency to coordinator.</p>
                  </button>

                  {/* Option 4: Custom Note / Input */}
                  <button
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 shadow-xs',
                      isCustomMode
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 dark:border-white/10 hover:border-violet-500/40 bg-white dark:bg-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
                      <Edit3 className="w-4 h-4" />
                      <span>Custom Resolution Note</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Attach specific guidance or telemetry comment.</p>
                  </button>
                </div>

                {/* Custom Note Input Box */}
                {isCustomMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 space-y-3"
                  >
                    <textarea
                      value={customResponseText}
                      onChange={e => setCustomResponseText(e.target.value)}
                      placeholder="Type custom resolution, guidance note, or SLA escalation..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsCustomMode(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNodeStatus(activeNode.status, customResponseText)}
                        className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Save Note & Update
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* AI Call Interceptor test modal */}
      {interceptorContact && (
        <AiCallInterceptorModal
          isOpen={!!interceptorContact}
          onClose={() => setInterceptorContact(null)}
          contact={interceptorContact}
        />
      )}

      {/* Employee Roster Slide-Over Drawer (Strictly regular new joiners, user.role !== 'HR') */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 h-full flex flex-col p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Roster</h3>
                    <p className="text-[11px] text-slate-400">Regular new joiners only ({employeeRoster.length} active)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Roster List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {employeeRoster.map(emp => (
                  <Link
                    key={emp.id}
                    href={`/hr/employee-details?employeeId=${encodeURIComponent(emp.id)}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-violet-500/50 hover:bg-violet-50/10 dark:hover:bg-violet-950/20 transition-all space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-500 font-bold text-xs flex items-center justify-center border border-violet-500/30 group-hover:scale-105 transition-transform">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-400 transition-colors">{emp.name}</h4>
                          <p className="text-[10px] text-slate-400">{emp.role} · {emp.department}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Day {emp.onboarding_day}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${emp.onboarding_progress}%` }}
                      />
                    </div>
                  </Link>
                ))}

                {employeeRoster.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No new joiners found in roster.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <Link
                  href="/hr/employee-details"
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Employee Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
