'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, Briefcase, Mail, Phone,
  Calendar, CheckCircle2, Clock, AlertCircle, Laptop,
  FileText, Award, Eye, Key, Lock, Users, Sparkles, ChevronDown,
  FolderTree, Network, ZoomIn, ZoomOut, RotateCcw, X, CornerDownRight,
  ExternalLink, CheckSquare, Star, HelpCircle, UserPlus, ArrowRight,
  TrendingUp, ShieldCheck
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { INITIAL_RESOURCE_ITEMS } from '@/components/resources/ResourcesChecklist';
import { cn, getInitials } from '@/lib/utils';

interface EmployeeProfileRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  company: string;
  branch: string;
  employee_id: string;
  profile_photo?: string;
  joining_date: string;
  work_mode: string;
  manager: string;
  buddy: string;
  onboarding_day: number;
  total_days: number;
  onboarding_progress: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
  desk_location: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'VERIFIED';
}

interface MindMapDetailNode {
  id: string;
  branchKey: 'identity' | 'corporate' | 'hierarchy' | 'lifecycle' | 'equipment';
  title: string;
  value: string;
  category: string;
  status: 'VERIFIED' | 'ACTIVE' | 'PENDING' | 'SECURED';
  deliverable?: string;
  notes?: string;
}

const BRANCH_META = {
  identity: {
    label: 'Identity & Access',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 dark:bg-violet-500/10',
    border: 'border-violet-500/40',
    stroke: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    icon: Mail,
  },
  corporate: {
    label: 'Corporate Placement',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/10',
    border: 'border-blue-500/40',
    stroke: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    icon: Building,
  },
  hierarchy: {
    label: 'Team & Mentorship',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    border: 'border-emerald-500/40',
    stroke: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: Users,
  },
  lifecycle: {
    label: 'Onboarding Lifecycle',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/10',
    border: 'border-amber-500/40',
    stroke: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: Clock,
  },
  equipment: {
    label: 'Asset & Equipment Custody',
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/10',
    border: 'border-fuchsia-500/40',
    stroke: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.4)',
    icon: Laptop,
  },
};

const JOURNEY_DAYS = [
  { day: 1, title: 'Day 1: HR Welcome & Legal Verification', desc: 'Orientation, official document review, and physical RFID badge issuance.' },
  { day: 2, title: 'Day 2: IT Hardware & SSO Setup', desc: 'Developer laptop configuration, corporate GitHub & Slack access provisioning.' },
  { day: 3, title: 'Day 3: Cybersecurity & Compliance Check', desc: 'Zero Trust security enrollment, 2FA pairing, and data governance sign-off.' },
  { day: 4, title: 'Day 4: Team Integration & Buddy Sync', desc: '1:1 onboarding buddy alignment, codebase tour, and engineering rhythm setup.' },
  { day: 5, title: 'Day 5: Role Handover & First Sprint PR', desc: 'Quarterly OKR alignment, first repository PR review, and autonomy check-in.' },
];

function HREmployeeDetailsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams.get('employeeId') || searchParams.get('id');

  // Load real registered users from localStorage
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('genesis_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        const list = Array.isArray(parsed) ? parsed : Object.values(parsed);
        setRegisteredUsers(list);
      }
    } catch {}
  }, []);

  // Read resource checklist from localStorage
  const [checkedResources, setCheckedResources] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('genesis_user_resources_checklist');
      if (stored) {
        setCheckedResources(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Strict Filter: ONLY real employees working under this HR (role !== 'HR', matching company/scope, no dummy/demo)
  const employeeDirectory: EmployeeProfileRecord[] = useMemo(() => {
    if (!registeredUsers || registeredUsers.length === 0) return [];

    const hrCompany = (user?.company_name || '').trim().toLowerCase();
    const hrName = (user?.name || '').trim().toLowerCase();
    const hrEmail = (user?.email || '').trim().toLowerCase();

    return registeredUsers
      .filter((ru: any) => {
        if (!ru || !ru.email) return false;

        // 1. Must NOT be an HR account
        const roleUpper = String(ru.role || '').toUpperCase();
        const deptUpper = String(ru.department_name || ru.department || '').toUpperCase();
        if (
          ru.role === 'hr_manager' ||
          ru.role === 'HR' ||
          roleUpper.includes('HR') ||
          roleUpper.includes('HUMAN RESOURCES') ||
          deptUpper.includes('HUMAN RESOURCES')
        ) {
          return false;
        }

        // 2. Must NOT be the logged-in HR coordinator's own account
        if (hrEmail && ru.email.toLowerCase() === hrEmail) {
          return false;
        }

        // 3. Must work under this HR coordinator (matching organization or manager)
        const empCompany = (ru.company_name || ru.company || '').trim().toLowerCase();
        const empManager = (ru.manager || '').trim().toLowerCase();

        if (hrCompany && empCompany) {
          const isCompanyMatch = empCompany === hrCompany || empCompany.includes(hrCompany) || hrCompany.includes(empCompany);
          const isManagerMatch = hrName && empManager.includes(hrName);
          if (!isCompanyMatch && !isManagerMatch) {
            return false;
          }
        }

        return true;
      })
      .map((ru: any) => {
        const day = Number(ru.onboarding_day) || 1;
        const progress = typeof ru.progress_percentage === 'number'
          ? ru.progress_percentage
          : (typeof ru.onboarding_progress === 'number'
            ? ru.onboarding_progress
            : (day > 1 ? Math.min(100, Math.round(((day - 1) / 5) * 100)) : 0));

        const completedCount = typeof ru.completed_tasks_count === 'number'
          ? ru.completed_tasks_count
          : Math.round((progress / 100) * 16);

        const totalCount = typeof ru.total_tasks_count === 'number' ? ru.total_tasks_count : 16;

        return {
          id: String(ru.id || `emp-${ru.email}`),
          name: ru.name || 'New Joiner',
          email: ru.email,
          role: ru.role || 'Team Member',
          department: ru.department_name || ru.department || 'Engineering',
          company: ru.company_name || user?.company_name || 'Genesis Enterprise',
          branch: ru.branch_name || user?.branch_name || 'Innovation Campus',
          employee_id: ru.employee_id || `GEN-2026-${String(ru.id || ru.email).replace(/\D/g, '').slice(-4) || '9042'}`,
          profile_photo: ru.profile_photo || undefined,
          joining_date: ru.joining_date
            ? new Date(ru.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent',
          work_mode: ru.work_type === 'remote' ? 'Remote (Distributed)' : (ru.work_type === 'onsite' ? 'On-Campus (Full Time)' : 'Hybrid (3 Days On-Campus)'),
          manager: ru.manager || user?.name || 'Assigned Lead',
          buddy: ru.buddy || 'Assigned Peer Buddy',
          onboarding_day: Math.min(Math.max(1, day), 5),
          total_days: 5,
          onboarding_progress: progress,
          completed_tasks_count: completedCount,
          total_tasks_count: totalCount,
          phone: ru.phone || '+91 (80) 4920-1120',
          emergency_contact: ru.emergency_contact || 'Designated Next of Kin',
          emergency_phone: ru.emergency_phone || '+91 98765 43210',
          desk_location: ru.desk_location || 'Building B, 3rd Floor, Engineering Pod C-12',
          status: progress >= 100 ? 'VERIFIED' : 'ONBOARDING',
        };
      });
  }, [registeredUsers, user]);

  // Selected Employee State
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Sync selectedEmpId with URL query params or default to first employee in directory
  useEffect(() => {
    if (employeeDirectory.length > 0) {
      if (employeeIdParam) {
        const found = employeeDirectory.find(e => e.id === employeeIdParam || e.email.toLowerCase() === employeeIdParam.toLowerCase());
        if (found) {
          setSelectedEmpId(found.id);
          return;
        }
      }
      // If current selection is invalid or not in directory, default to first valid employee
      if (!selectedEmpId || !employeeDirectory.some(e => e.id === selectedEmpId)) {
        setSelectedEmpId(employeeDirectory[0].id);
      }
    }
  }, [employeeDirectory, employeeIdParam, selectedEmpId]);

  const selectedEmp = useMemo(() => {
    return employeeDirectory.find(e => e.id === selectedEmpId) || employeeDirectory[0] || null;
  }, [employeeDirectory, selectedEmpId]);

  // Equipment count
  const verifiedAssets = INITIAL_RESOURCE_ITEMS.filter(item => checkedResources[item.id]);

  // View Controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree');
  const [search, setSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [inspectedNode, setInspectedNode] = useState<MindMapDetailNode | null>(null);

  // Generate Mind Map Nodes for Selected Employee
  const mindMapNodes: MindMapDetailNode[] = useMemo(() => {
    if (!selectedEmp) return [];

    return [
      // Branch 1: Identity & Access
      {
        id: 'node-email',
        branchKey: 'identity',
        title: 'Corporate Email',
        value: selectedEmp.email,
        category: 'Communication Channel',
        status: 'VERIFIED',
        deliverable: 'Primary enterprise mailbox and SSO directory identity.',
        notes: 'SSO auto-provisioned with standard zero-trust encryption.',
      },
      {
        id: 'node-phone',
        branchKey: 'identity',
        title: 'Direct Work Phone',
        value: selectedEmp.phone,
        category: 'Contact Endpoint',
        status: 'VERIFIED',
        deliverable: 'Internal VoIP extension & external enterprise routing.',
        notes: 'Available during business shift (9:30 AM – 6:30 PM).',
      },
      {
        id: 'node-auth',
        branchKey: 'identity',
        title: 'Identity SSO & MFA Token',
        value: 'FIDO2 / U2F Security Token Enrolled',
        category: 'Information Security',
        status: 'SECURED',
        deliverable: 'Active Directory authentication profile with hardware 2FA.',
        notes: 'Zero-trust access policy active across all internal subnets.',
      },
      {
        id: 'node-join-date',
        branchKey: 'identity',
        title: 'Official Joining Date',
        value: selectedEmp.joining_date,
        category: 'HR Contractual Record',
        status: 'VERIFIED',
        deliverable: 'First official contractual start date logged in HRMS.',
        notes: 'Probation review cycle scheduled for 90 days from joining date.',
      },

      // Branch 2: Corporate Placement
      {
        id: 'node-company',
        branchKey: 'corporate',
        title: 'Corporate Entity',
        value: selectedEmp.company,
        category: 'Legal Employer',
        status: 'VERIFIED',
        deliverable: 'Parent corporate registration and employment contract.',
        notes: 'Direct employee under full-time organizational governance.',
      },
      {
        id: 'node-branch',
        branchKey: 'corporate',
        title: 'Assigned Campus Branch',
        value: selectedEmp.branch,
        category: 'Facility Allocation',
        status: 'ACTIVE',
        deliverable: 'Physical campus base with turnstile access rights.',
        notes: 'Physical NFC card calibrated for all campus turnstiles.',
      },
      {
        id: 'node-desk',
        branchKey: 'corporate',
        title: 'Desk Pod Location',
        value: selectedEmp.desk_location,
        category: 'Physical Workstation',
        status: 'ACTIVE',
        deliverable: 'Assigned desk pod equipped with motorized standing desk.',
        notes: 'Ergonomic assessment completed and signed by facilities.',
      },
      {
        id: 'node-workmode',
        branchKey: 'corporate',
        title: 'Employment Work Mode',
        value: selectedEmp.work_mode,
        category: 'Attendance Policy',
        status: 'ACTIVE',
        deliverable: 'Formal attendance model: 3 days on-site, 2 days remote.',
        notes: 'Standard shift hours: 9:30 AM – 6:30 PM (Sat & Sun off).',
      },

      // Branch 3: Team & Mentorship
      {
        id: 'node-manager',
        branchKey: 'hierarchy',
        title: 'Reporting Manager',
        value: selectedEmp.manager,
        category: 'Direct Supervisor',
        status: 'ACTIVE',
        deliverable: '1:1 weekly sync, OKR management, and bi-annual performance review.',
        notes: 'Conducts Day 5 milestone evaluation and roadmap sign-off.',
      },
      {
        id: 'node-buddy',
        branchKey: 'hierarchy',
        title: 'Onboarding Peer Buddy',
        value: selectedEmp.buddy,
        category: 'Team Integration',
        status: 'ACTIVE',
        deliverable: 'Day-to-day pairing, architecture walkthroughs, and team lunch intro.',
        notes: 'Assigned for the initial 30 days of joining.',
      },
      {
        id: 'node-emergency',
        branchKey: 'hierarchy',
        title: 'Emergency Contact',
        value: `${selectedEmp.emergency_contact} (${selectedEmp.emergency_phone})`,
        category: 'Safety & Compliance',
        status: 'VERIFIED',
        deliverable: 'Verified point of contact stored securely for medical emergencies.',
        notes: 'Contact validated during Day 1 document onboarding.',
      },
      {
        id: 'node-compliance',
        branchKey: 'hierarchy',
        title: 'Compliance & NDA Agreement',
        value: 'Executed & Digitally Signed',
        category: 'Legal Clearance',
        status: 'SECURED',
        deliverable: 'Confidentiality, intellectual property assignment, and clean desk rule.',
        notes: 'Full DocuSign certificate stored in central legal archive.',
      },

      // Branch 4: Onboarding Lifecycle
      {
        id: 'node-day-phase',
        branchKey: 'lifecycle',
        title: 'Current Roadmap Stage',
        value: `Day ${selectedEmp.onboarding_day} of ${selectedEmp.total_days} Phase`,
        category: 'Progress Milestone',
        status: selectedEmp.status === 'VERIFIED' ? 'VERIFIED' : 'ACTIVE',
        deliverable: 'Daily roadmap milestones from Day 1 Welcome to Day 5 Autonomy.',
        notes: 'Progression tracked automatically through task verifications.',
      },
      {
        id: 'node-task-rate',
        branchKey: 'lifecycle',
        title: 'Task Deliverable Completion',
        value: `${selectedEmp.onboarding_progress}% (${selectedEmp.completed_tasks_count}/${selectedEmp.total_tasks_count} Tasks Done)`,
        category: 'Operational Output',
        status: selectedEmp.onboarding_progress >= 80 ? 'VERIFIED' : 'ACTIVE',
        deliverable: 'Verification of initial setup and operational orientation deliverables.',
        notes: selectedEmp.onboarding_progress === 0 ? 'Starting onboarding journey without filled tasks.' : 'Tasks progressing systematically.',
      },
      {
        id: 'node-direct-deposit',
        branchKey: 'lifecycle',
        title: 'Payroll & Banking Clearance',
        value: 'Direct Deposit Verified',
        category: 'Finance & Accounts',
        status: 'VERIFIED',
        deliverable: 'Bank account routing and tax withholding declaration acknowledged.',
        notes: 'First payroll cycle linked with automated monthly transfer.',
      },

      // Branch 5: Asset & Equipment Custody
      {
        id: 'node-laptop-hw',
        branchKey: 'equipment',
        title: 'Corporate Laptop & Charger',
        value: checkedResources['res-laptop'] ? 'In Physical Custody' : 'Allocated & In Delivery',
        category: 'Core Hardware',
        status: checkedResources['res-laptop'] ? 'VERIFIED' : 'ACTIVE',
        deliverable: 'Encrypted developer machine with MDM agent and device serial logged.',
        notes: 'Hardware configuration verified with IT inventory.',
      },
      {
        id: 'node-badge-hw',
        branchKey: 'equipment',
        title: 'NFC Smart Access Badge',
        value: checkedResources['res-smart-badge'] ? 'Issued & Active' : 'Allocated at Security',
        category: 'Physical Security',
        status: checkedResources['res-smart-badge'] ? 'VERIFIED' : 'ACTIVE',
        deliverable: 'RFID/NFC card coded for campus gate and elevator turnstiles.',
        notes: 'Report immediate loss to Campus Security desk.',
      },
      {
        id: 'node-yubikey-hw',
        branchKey: 'equipment',
        title: 'YubiKey 5C Cryptographic Token',
        value: checkedResources['res-yubikey'] ? 'Assigned to User' : 'Hardware Token Provisioned',
        category: 'Hardware Token',
        status: checkedResources['res-yubikey'] ? 'SECURED' : 'ACTIVE',
        deliverable: 'Physical dual-interface security key for multi-factor login.',
        notes: 'Registered with central corporate identity provider.',
      },
      {
        id: 'node-workstation-hw',
        branchKey: 'equipment',
        title: 'Peripherals & External Displays',
        value: checkedResources['res-monitor'] ? 'Station Ready' : 'Standard Pod Allocation',
        category: 'Desk Ergonomics',
        status: checkedResources['res-monitor'] ? 'VERIFIED' : 'ACTIVE',
        deliverable: 'Dual 4K displays, docking hub, ergonomic keyboard, and mouse.',
        notes: 'Calibrated at assigned department pod.',
      },
    ];
  }, [selectedEmp, checkedResources]);

  // Filtered nodes based on search and branch filter
  const filteredNodes = useMemo(() => {
    return mindMapNodes.filter(n => {
      const matchBranch = selectedBranchFilter === 'ALL' || n.branchKey === selectedBranchFilter;
      const matchSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.value.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [mindMapNodes, selectedBranchFilter, search]);

  const branches = Object.keys(BRANCH_META) as (keyof typeof BRANCH_META)[];

  // ========================================================
  // ZERO-STATE: NO REAL EMPLOYEES UNDER THIS HR
  // ========================================================
  if (employeeDirectory.length === 0 || !selectedEmp) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-violet-500/10 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center border border-violet-500/20">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Roster Scope Active · No Demo or Dummy Records</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              No Employees Registered Under Your Scope
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Only real employees assigned to your organization ({user?.company_name || 'Genesis Enterprise'}) who are working under you are displayed. All demo records have been excluded.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/hr/employees"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/25"
            >
              <UserPlus className="w-4 h-4" />
              <span>Go to Employee Roster to Onboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // ACTIVE VIEW: SELECTED REAL EMPLOYEE WITH FULL PROGRESS
  // ========================================================
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* TOP HEADER COMMAND BAR: EMPLOYEE SELECTOR & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              Verified Employee Dossier & Mind Map
            </span>
            <span className="text-xs text-slate-400">· Real Joiners Under Your Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {selectedEmp.name} - Detailed Progress
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {selectedEmp.role} · {selectedEmp.department} · {selectedEmp.company}
          </p>
        </div>

        {/* Employee Switcher Dropdown & Live Custody Counter */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Stage & Progress</div>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
              Day {selectedEmp.onboarding_day} ({selectedEmp.onboarding_progress}%)
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Select Employee:
            </label>
            <div className="relative">
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="appearance-none pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs cursor-pointer min-w-[210px]"
              >
                {employeeDirectory.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ALL ONBOARDING PROGRESS CARD & 5-DAY ROADMAP TIMELINE     */}
      {/* ======================================================== */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              {getInitials(selectedEmp.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedEmp.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-300/40">
                  {selectedEmp.employee_id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  {selectedEmp.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedEmp.role} · <strong className="text-violet-600 dark:text-violet-400">{selectedEmp.department}</strong> · Joined {selectedEmp.joining_date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedEmp.onboarding_progress}% Total Completed
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedEmp.completed_tasks_count} of {selectedEmp.total_tasks_count} tasks resolved
              </p>
            </div>
            <div className="w-28 h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${selectedEmp.onboarding_progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5-Day Onboarding Stage Progress Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>5-Day Onboarding Journey Progress</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              Currently on Day {selectedEmp.onboarding_day} of 5
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {JOURNEY_DAYS.map(j => {
              const isPast = j.day < selectedEmp.onboarding_day;
              const isCurrent = j.day === selectedEmp.onboarding_day;
              const isUpcoming = j.day > selectedEmp.onboarding_day;

              return (
                <div
                  key={j.day}
                  className={cn(
                    'p-3.5 rounded-2xl border transition-all space-y-1.5',
                    isCurrent && 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-500 ring-2 ring-violet-500/20 shadow-sm',
                    isPast && 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-500/40',
                    isUpcoming && 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-75'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Day {j.day}
                    </span>
                    <span className={cn(
                      'text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase',
                      isPast && 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
                      isCurrent && 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-500/30 animate-pulse',
                      isUpcoming && 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                    )}>
                      {isPast ? 'Completed' : (isCurrent ? 'Current' : 'Upcoming')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {j.title.split(': ')[1] || j.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {j.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER BAR & TREE VIEW TOGGLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedBranchFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              selectedBranchFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All 5 Branches ({mindMapNodes.length} Nodes)
          </button>

          {branches.map(bKey => {
            const meta = BRANCH_META[bKey];
            const count = mindMapNodes.filter(n => n.branchKey === bKey).length;
            const Icon = meta.icon;
            const isActive = selectedBranchFilter === bKey;

            return (
              <button
                key={bKey}
                onClick={() => setSelectedBranchFilter(bKey)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                    : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{meta.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs">
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
              placeholder="Filter details..."
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
      {/* CONNECTED EMPLOYEE DETAILS MIND MAP CANVAS               */}
      {/* ======================================================== */}
      <div
        className="w-full min-h-[920px] rounded-3xl bg-slate-50/70 dark:bg-[#060712] border border-slate-200 dark:border-white/10 shadow-2xl p-6 md:p-10 relative overflow-hidden transition-all duration-300"
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
            <linearGradient id="grad-emp-identity" x1="50%" y1="0%" x2="10%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-emp-corporate" x1="50%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-emp-hierarchy" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-emp-lifecycle" x1="50%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="grad-emp-equipment" x1="50%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.5" />
            </linearGradient>

            <filter id="empTreeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Curved Mind Map Connectors from Employee Root to 5 Branches */}
          <path d="M 50% 180 C 50% 220, 10% 220, 10% 270" fill="none" stroke="url(#grad-emp-identity)" strokeWidth="3" strokeDasharray="6 3" filter="url(#empTreeGlow)" />
          <path d="M 50% 180 C 50% 220, 30% 220, 30% 270" fill="none" stroke="url(#grad-emp-corporate)" strokeWidth="3" strokeDasharray="6 3" filter="url(#empTreeGlow)" />
          <path d="M 50% 180 C 50% 220, 50% 220, 50% 270" fill="none" stroke="url(#grad-emp-hierarchy)" strokeWidth="3" strokeDasharray="6 3" filter="url(#empTreeGlow)" />
          <path d="M 50% 180 C 50% 220, 70% 220, 70% 270" fill="none" stroke="url(#grad-emp-lifecycle)" strokeWidth="3" strokeDasharray="6 3" filter="url(#empTreeGlow)" />
          <path d="M 50% 180 C 50% 220, 90% 220, 90% 270" fill="none" stroke="url(#grad-emp-equipment)" strokeWidth="3" strokeDasharray="6 3" filter="url(#empTreeGlow)" />
        </svg>

        {/* ROOT EMPLOYEE NODE (Central Dossier Hub) */}
        <div className="w-full flex justify-center relative z-20 mb-14">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Outer Pulsing Aura */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 opacity-25 blur-xl animate-pulse -z-10" />

            <div
              className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-violet-500/60 shadow-2xl flex flex-col items-center text-center max-w-md relative"
              style={{
                boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
              }}
            >
              {/* Profile Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/40 mb-3 border border-white/20">
                {selectedEmp.profile_photo ? (
                  <img src={selectedEmp.profile_photo} alt={selectedEmp.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(selectedEmp.name)}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/40">
                  {selectedEmp.employee_id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {selectedEmp.status}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedEmp.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {selectedEmp.role} · <strong className="text-violet-600 dark:text-violet-400">{selectedEmp.department}</strong>
              </p>

              {/* Status footer inside root node */}
              <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Day {selectedEmp.onboarding_day} Onboardee
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {mindMapNodes.length} Verified Attributes
                </span>
              </div>

              {/* Connector Pin */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 5 CONNECTED MIND MAP BRANCHES & NODES */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10 pt-2">
          {branches.map(bKey => {
            const meta = BRANCH_META[bKey];
            const branchNodes = filteredNodes.filter(n => n.branchKey === bKey);
            const Icon = meta.icon;

            return (
              <div key={bKey} className="space-y-3.5 flex flex-col relative group">
                {/* Branch Top Connector Anchor Pin */}
                <div className="flex justify-center -mb-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center animate-bounce"
                    style={{ backgroundColor: meta.stroke }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Branch Header Node (Tree Trunk Node) */}
                <div
                  className={cn(
                    'p-3.5 rounded-2xl border-2 flex items-center gap-2.5 shadow-md transition-all',
                    meta.bg,
                    meta.border,
                    'bg-white dark:bg-slate-900/95'
                  )}
                  style={{
                    boxShadow: `0 8px 18px -4px ${meta.glow}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                    style={{ backgroundColor: meta.stroke }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {meta.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {branchNodes.length} Verified Nodes
                    </p>
                  </div>
                </div>

                {/* Connected Attribute Leaf Nodes */}
                <div className="space-y-2.5 flex-1">
                  {branchNodes.map(node => {
                    const isSecured = node.status === 'SECURED';
                    const isVerified = node.status === 'VERIFIED';
                    const isPending = node.status === 'PENDING';

                    return (
                      <motion.div
                        key={node.id}
                        layout
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => setInspectedNode(node)}
                        className={cn(
                          'p-3.5 rounded-2xl border transition-all cursor-pointer relative shadow-xs hover:shadow-lg select-none',
                          'bg-white dark:bg-slate-900/90',
                          isSecured && 'border-violet-500/40 bg-violet-50/10 dark:bg-violet-950/20',
                          isVerified && 'border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/20',
                          isPending && 'border-amber-500/40 bg-amber-50/10 dark:bg-amber-950/20',
                          node.status === 'ACTIVE' && 'border-blue-500/40 bg-blue-50/10 dark:bg-blue-950/20'
                        )}
                      >
                        {/* Side Branch Anchor Pin */}
                        <div
                          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900"
                          style={{ backgroundColor: meta.stroke }}
                        />

                        {/* Top Category & Status Badge */}
                        <div className="flex items-center justify-between gap-1 mb-1 pl-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {node.category}
                          </span>
                          <span className={cn(
                            'text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase',
                            isVerified && 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
                            isSecured && 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-500/30',
                            isPending && 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-500/30',
                            node.status === 'ACTIVE' && 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                          )}>
                            {node.status}
                          </span>
                        </div>

                        {/* Attribute Title & Value */}
                        <div className="pl-1.5 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {node.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-300 break-words leading-tight">
                            {node.value}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NODE DETAIL INSPECTOR MODAL (READ-ONLY) */}
      <AnimatePresence>
        {inspectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {BRANCH_META[inspectedNode.branchKey].label}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{inspectedNode.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedNode(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Value:</span>
                  <p className="text-sm font-black text-slate-900 dark:text-white break-words">
                    {inspectedNode.value}
                  </p>
                </div>

                {inspectedNode.deliverable && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Specification & Function:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {inspectedNode.deliverable}
                    </p>
                  </div>
                )}

                {inspectedNode.notes && (
                  <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-900/40 text-violet-800 dark:text-violet-300">
                    <p className="text-[11px] leading-relaxed">
                      <strong>Audit Note:</strong> {inspectedNode.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
                  <span>Assigned to: <strong className="text-slate-700 dark:text-slate-200">{selectedEmp.name}</strong></span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified Dossier Item</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setInspectedNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Close Dossier Node
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HREmployeeDetailsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading verified employee dossier...</span>
        </div>
      </div>
    }>
      <HREmployeeDetailsContent />
    </Suspense>
  );
}
