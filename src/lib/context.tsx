'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Employee, User } from '@/types';
import {
  DEMO_EMPLOYEE, DEMO_EMPLOYEE_TASKS, DEMO_EMPLOYEE_RESOURCES,
  DEMO_PROJECTS, DEMO_SKILLS, DEMO_EMPLOYEE_EXPERIENCE,
  DEMO_NOTIFICATIONS, DEMO_ACTIVITY, DEMO_SUPPORT_REQUESTS,
  MOCK_TASKS, MOCK_CONTACTS, MOCK_LOCATIONS, MOCK_WORKING_HOURS,
  resolveTaskStatuses
} from '@/lib/mock-data';
import type { EmployeeTask } from '@/types';

// ============================================================
// Auth Context (using localStorage for demo — replace with Supabase)
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'employee' | 'hr_manager';
  name: string;
  profile_photo?: string;
  company_name?: string;
  branch_name?: string;
  department_name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  employee: Employee | null;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  loginEmployee: (email: string, password: string, additionalDetails?: Partial<Employee>) => Promise<{ error?: string }>;
  loginHR: (email: string, password: string, additionalDetails?: Partial<AuthUser>) => Promise<{ error?: string }>;
  logout: () => void;
  setSessionUser: (user: AuthUser, customEmp?: Partial<Employee>) => void;
  updateEmployee: (updates: Partial<Employee>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo credentials fallback
const DEMO_CREDENTIALS = {
  employee: { email: 'vaibhav.sharma@microsoft.com', password: 'Genesis@2024' },
  hr: { email: 'hr@microsoft.com', password: 'HRGenesis@2024' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage
    try {
      const storedTheme = localStorage.getItem('genesis-theme') as 'dark' | 'light';
      if (storedTheme) {
        setTheme(storedTheme);
        if (storedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.add('dark');
      }

      const stored = localStorage.getItem('genesis-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        if (parsed.user?.role === 'employee') {
          setEmployee(parsed.employee || {
            id: parsed.user.id,
            user_id: parsed.user.id,
            company_id: 'org-current',
            name: parsed.user.name,
            email: parsed.user.email,
            company_name: parsed.user.company_name || 'Organization',
            branch_name: parsed.user.branch_name || 'Main Campus',
            department_name: parsed.user.department_name || 'Engineering',
            role: 'Team Member',
            start_date: new Date().toISOString(),
            onboarding_day: 1,
            total_days: 5,
            progress_percentage: 0,
            status: 'ACTIVE',
            setup_completed: true,
          });
        }
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('genesis-theme', next);
      } catch {}
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const setSessionUser = useCallback((authUser: AuthUser, customEmp?: Partial<Employee>) => {
    setUser(authUser);
    const emp: Employee = {
      id: authUser.id,
      user_id: authUser.id,
      company_id: 'org-current',
      branch_id: 'branch-1',
      department_id: 'dept-1',
      employee_id: `EMP-${Date.now().toString().slice(-4)}`,
      name: authUser.name,
      email: authUser.email,
      profile_photo: authUser.profile_photo || customEmp?.profile_photo,
      company_name: customEmp?.company_name || authUser.company_name || 'Organization',
      branch_name: customEmp?.branch_name || authUser.branch_name || 'Main Campus',
      department_name: customEmp?.department_name || authUser.department_name || 'Engineering',
      role: customEmp?.role || 'Team Member',
      joining_date: new Date().toISOString(),
      work_type: 'hybrid',
      preferred_language: 'en',
      setup_completed: true,
      onboarding_day: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...customEmp,
    };
    setEmployee(emp);
    try {
      localStorage.setItem('genesis-auth', JSON.stringify({ user: authUser, employee: emp }));
      if (emp.email) {
        const reg = localStorage.getItem('genesis_registered_users');
        const all = reg ? JSON.parse(reg) : {};
        all[emp.email.toLowerCase()] = { ...(all[emp.email.toLowerCase()] || {}), ...emp };
        localStorage.setItem('genesis_registered_users', JSON.stringify(all));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateEmployee = useCallback((updates: Partial<Employee>) => {
    setEmployee(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setUser(u => u ? { ...u, name: updates.name || u.name, profile_photo: updates.profile_photo || u.profile_photo } : u);
      try {
        const stored = localStorage.getItem('genesis-auth');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem('genesis-auth', JSON.stringify({
          ...parsed,
          user: { ...parsed.user, name: updates.name || parsed.user?.name, profile_photo: updates.profile_photo || parsed.user?.profile_photo },
          employee: updated
        }));
        if (updated.email) {
          const reg = localStorage.getItem('genesis_registered_users');
          const all = reg ? JSON.parse(reg) : {};
          all[updated.email.toLowerCase()] = { ...(all[updated.email.toLowerCase()] || {}), ...updated };
          localStorage.setItem('genesis_registered_users', JSON.stringify(all));
        }
      } catch {}
      return updated;
    });
  }, []);

  const loginEmployee = useCallback(async (email: string, password: string, additionalDetails?: Partial<Employee>) => {
    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }
    let savedProfile: any = {};
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg) {
        const parsed = JSON.parse(reg);
        if (parsed[email.toLowerCase()]) {
          savedProfile = parsed[email.toLowerCase()];
        }
      }
    } catch {}

    const displayName = additionalDetails?.name || savedProfile.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const company = additionalDetails?.company_name || savedProfile.company_name || (email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : 'Genesis Enterprise');
    const branch = additionalDetails?.branch_name || savedProfile.branch_name || 'Main Campus';
    const dept = additionalDetails?.department_name || savedProfile.department_name || 'Engineering';
    const role = additionalDetails?.role || savedProfile.role || 'Software Engineer';
    const photo = additionalDetails?.profile_photo || savedProfile.profile_photo || undefined;

    const authUser: AuthUser = {
      id: savedProfile.id || `user-${Date.now()}`,
      email,
      role: 'employee',
      name: displayName,
      profile_photo: photo,
      company_name: company,
      branch_name: branch,
      department_name: dept,
    };
    setUser(authUser);

    const emp: Employee = {
      id: authUser.id,
      user_id: authUser.id,
      company_id: 'org-current',
      branch_id: 'branch-1',
      department_id: 'dept-1',
      employee_id: savedProfile.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
      name: displayName,
      email: email,
      profile_photo: photo,
      company_name: company,
      branch_name: branch,
      department_name: dept,
      role: role,
      joining_date: savedProfile.joining_date || new Date().toISOString(),
      work_type: 'hybrid',
      preferred_language: 'en',
      setup_completed: true,
      onboarding_day: savedProfile.onboarding_day || 1,
      is_active: true,
      created_at: savedProfile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...additionalDetails,
    };
    setEmployee(emp);
    try {
      localStorage.setItem('genesis-auth', JSON.stringify({ user: authUser, employee: emp }));
      const reg = localStorage.getItem('genesis_registered_users');
      const all = reg ? JSON.parse(reg) : {};
      all[email.toLowerCase()] = emp;
      localStorage.setItem('genesis_registered_users', JSON.stringify(all));
    } catch {}
    return {};
  }, []);

  const loginHR = useCallback(async (email: string, password: string, additionalDetails?: Partial<AuthUser>) => {
    if (!email || !password) {
      return { error: 'Please enter HR credentials.' };
    }
    let savedProfile: any = {};
    try {
      const reg = localStorage.getItem('genesis_registered_hr');
      if (reg) {
        const parsed = JSON.parse(reg);
        if (parsed[email.toLowerCase()]) {
          savedProfile = parsed[email.toLowerCase()];
        }
      }
    } catch {}

    const displayName = additionalDetails?.name || savedProfile.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'HR Coordinator';
    const company = additionalDetails?.company_name || savedProfile.company_name || 'Genesis Enterprise';
    const branch = additionalDetails?.branch_name || savedProfile.branch_name || 'Global HQ';
    const dept = additionalDetails?.department_name || savedProfile.department_name || 'People Operations';
    const photo = additionalDetails?.profile_photo || savedProfile.profile_photo || undefined;

    const authUser: AuthUser = {
      id: savedProfile.id || `user-hr-${Date.now()}`,
      email,
      role: 'hr_manager',
      name: displayName,
      profile_photo: photo,
      company_name: company,
      branch_name: branch,
      department_name: dept,
    };
    setUser(authUser);
    try {
      localStorage.setItem('genesis-auth', JSON.stringify({ user: authUser }));
      const reg = localStorage.getItem('genesis_registered_hr');
      const all = reg ? JSON.parse(reg) : {};
      all[email.toLowerCase()] = authUser;
      localStorage.setItem('genesis_registered_hr', JSON.stringify(all));
    } catch {}
    return {};
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setEmployee(null);
    localStorage.removeItem('genesis-auth');
    router.push('/portal-select');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      employee,
      isLoading,
      theme,
      toggleTheme,
      loginEmployee,
      loginHR,
      logout,
      setSessionUser,
      updateEmployee
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ============================================================
// Employee Data Context (User-Inputted, Zero-Prefill Data)
// ============================================================

import type { OnboardingTask, PreviousCompany, Project, Skill, TaskStatus } from '@/types';

export interface UserJourneyMilestone {
  id: string;
  day: number;
  label: string;
  description: string;
  department: string;
  status: 'Completed' | 'Current' | 'Upcoming' | 'Blocked';
}

export interface UserSupportContact {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  office: string;
  availability: string;
  status: string;
}

export interface UserCompanyRule {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
}

export interface EmployeeDataContextValue {
  // Tasks
  tasks: EmployeeTask[];
  onboardingTasks: OnboardingTask[];
  addTask: (task: Partial<OnboardingTask>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, extra?: Partial<EmployeeTask>) => void;
  completeStep: (taskId: string, stepId: string) => void;

  // Experience, Projects, Skills
  experience: PreviousCompany[];
  addExperience: (exp: PreviousCompany) => void;
  deleteExperience: (index: number) => void;

  projects: Project[];
  addProject: (proj: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  skills: Skill[];
  addSkill: (skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  // Journey Milestones
  journeyMilestones: UserJourneyMilestone[];
  addJourneyMilestone: (milestone: Partial<UserJourneyMilestone>) => void;
  deleteJourneyMilestone: (id: string) => void;

  // Support Contacts
  supportContacts: UserSupportContact[];
  addSupportContact: (contact: Partial<UserSupportContact>) => void;
  deleteSupportContact: (id: string) => void;

  // Company Rules & About
  companyRules: UserCompanyRule[];
  addCompanyRule: (rule: Partial<UserCompanyRule>) => void;
  deleteCompanyRule: (id: string) => void;

  // Notifications & Activity
  notifications: any[];
  markNotificationRead: (id: string) => void;
  activity: any[];
  resources: any[];
  supportRequests: any[];
  addSupportRequest: (req: any) => void;
}

const EmployeeDataContext = createContext<EmployeeDataContextValue | null>(null);

export const INITIAL_SUPPORT_CONTACTS: UserSupportContact[] = [
  {
    id: 'it-helpdesk',
    name: 'IT Enterprise Helpdesk',
    role: 'Hardware Provisioning, SSO & VPN',
    department: 'Information Technology',
    phone: '+1 (800) 555-0144',
    email: 'it-support@genesis.internal',
    office: 'Building A, Floor 2, Room 204',
    availability: 'Mon–Fri, 9:30 AM – 6:30 PM',
    status: 'Operational',
  },
  {
    id: 'hr-ops',
    name: 'People Operations & HR Desk',
    role: 'Onboarding Roadmap, Leave & Benefits',
    department: 'Human Resources',
    phone: '+1 (800) 555-0188',
    email: 'hr-people@genesis.internal',
    office: 'Building B, Floor 4, Suite 410',
    availability: 'Mon–Fri, 9:30 AM – 6:00 PM',
    status: 'Operational',
  },
  {
    id: 'facilities',
    name: 'Workplace & Facilities Management',
    role: 'RFID Badges, Campus Parking & Ergonomics',
    department: 'Facilities',
    phone: '+1 (800) 555-0199',
    email: 'workplace@genesis.internal',
    office: 'Ground Floor, Reception Central',
    availability: 'Mon–Fri, 8:00 AM – 8:00 PM',
    status: 'Operational',
  },
  {
    id: 'infosec',
    name: 'Cybersecurity & Compliance Guard',
    role: 'Credentials, Device Encryption & Data Safety',
    department: 'Security Operations',
    phone: '+1 (800) 555-0100',
    email: 'infosec@genesis.internal',
    office: 'SOC Control Room 101',
    availability: '24/7 Active Hotline',
    status: '24/7 Active',
  },
];

export const INITIAL_COMPANY_RULES: UserCompanyRule[] = [
  {
    id: 'rule-hours',
    title: 'Operating Hours & Overtime Policy',
    category: 'Workplace Schedule',
    summary: 'Standard operational hours are 9:30 AM to 6:30 PM, Monday through Friday. Saturdays and Sundays are official weekly offs.',
    details: [
      'Standard business hours: 9:30 AM to 6:30 PM (Mon–Fri)',
      'Overtime triggers dynamically after 6:30 PM on workdays',
      'Weekend active hours count as overtime (Saturday & Sunday closed)',
      'Managers automatically notified on extended overtime sessions'
    ],
  },
  {
    id: 'rule-security',
    title: 'Clean Desk & Data Privacy Framework',
    category: 'Information Security',
    summary: 'All employees must safeguard proprietary information and secure corporate hardware when unattended.',
    details: [
      'Always lock workstations (Win+L / Cmd+Ctrl+Q) when stepping away',
      'Never store credentials or sensitive tokens in plain text',
      'Physical RFID badges must be worn visibly within campus perimeter',
      'Promptly report lost badges or unusual phishing attempts to SOC'
    ],
  },
  {
    id: 'rule-hybrid',
    title: 'Hybrid Work Arrangement & Attendance',
    category: 'Attendance & Remote Policy',
    summary: 'Employees operating in hybrid roles coordinate on-site anchor days with their engineering leads.',
    details: [
      'Designate in-office anchor days via Genesis Portal',
      'Core synchronous collaboration hours: 10:30 AM – 4:30 PM',
      'Emergency remote requests can be submitted in 1-click',
      'Home ergonomics reimbursement eligible after initial 90 days'
    ],
  },
];

export const INITIAL_JOURNEY_MILESTONES: UserJourneyMilestone[] = [
  {
    id: 'jrn-1',
    day: 1,
    label: 'HR Welcome & Legal Verification',
    description: 'Executive orientation, document submission, and physical RFID badge issuance.',
    department: 'HR Operations',
    status: 'Current',
  },
  {
    id: 'jrn-2',
    day: 2,
    label: 'IT Hardware & SSO Credentials',
    description: 'Corporate laptop setup, GitHub organization invite, Slack & VPN configuration.',
    department: 'Information Technology',
    status: 'Upcoming',
  },
  {
    id: 'jrn-3',
    day: 3,
    label: 'Cybersecurity & Compliance Training',
    description: 'Mandatory security briefing, 2FA hardware key pairing, and SOC policies sign-off.',
    department: 'Security Operations',
    status: 'Upcoming',
  },
  {
    id: 'jrn-4',
    day: 4,
    label: 'Team Integration & Buddy Walkthrough',
    description: '1:1 Buddy alignment, codebase architecture tour, and team sprint rhythm introduction.',
    department: 'Engineering Team',
    status: 'Upcoming',
  },
  {
    id: 'jrn-5',
    day: 5,
    label: 'Role Handover & First Sprint PR',
    description: 'Role roadmap briefing, first repository PR review, and 30-day KPI alignment.',
    department: 'Engineering Management',
    status: 'Upcoming',
  },
];

export function EmployeeDataProvider({ children }: { children: React.ReactNode }) {
  // Tasks are given, but completed by user!
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(() => {
    if (typeof window === 'undefined') return MOCK_TASKS;
    try {
      const stored = localStorage.getItem('genesis_user_tasks');
      return stored ? JSON.parse(stored) : MOCK_TASKS;
    } catch {
      return MOCK_TASKS;
    }
  });

  const [tasks, setTasks] = useState<EmployeeTask[]>(() => {
    const defaultEmpTasks = MOCK_TASKS.map(t => ({
      id: `et-${t.id}`,
      employee_id: 'emp-current',
      task_id: t.id,
      status: 'READY' as TaskStatus, // GIVEN, but READY to be completed by user!
      task: t,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (typeof window === 'undefined') return defaultEmpTasks;
    try {
      const stored = localStorage.getItem('genesis_user_emp_tasks');
      return stored ? JSON.parse(stored) : defaultEmpTasks;
    } catch {
      return defaultEmpTasks;
    }
  });

  const [experience, setExperience] = useState<PreviousCompany[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_experience');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_projects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_skills');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Journey milestones are given
  const [journeyMilestones, setJourneyMilestones] = useState<UserJourneyMilestone[]>(() => {
    if (typeof window === 'undefined') return INITIAL_JOURNEY_MILESTONES;
    try {
      const stored = localStorage.getItem('genesis_user_journey');
      return stored ? JSON.parse(stored) : INITIAL_JOURNEY_MILESTONES;
    } catch {
      return INITIAL_JOURNEY_MILESTONES;
    }
  });

  // Support Contacts are given
  const [supportContacts, setSupportContacts] = useState<UserSupportContact[]>(() => {
    if (typeof window === 'undefined') return INITIAL_SUPPORT_CONTACTS;
    try {
      const stored = localStorage.getItem('genesis_user_contacts');
      return stored ? JSON.parse(stored) : INITIAL_SUPPORT_CONTACTS;
    } catch {
      return INITIAL_SUPPORT_CONTACTS;
    }
  });

  // Company Rules are given
  const [companyRules, setCompanyRules] = useState<UserCompanyRule[]>(() => {
    if (typeof window === 'undefined') return INITIAL_COMPANY_RULES;
    try {
      const stored = localStorage.getItem('genesis_user_rules');
      return stored ? JSON.parse(stored) : INITIAL_COMPANY_RULES;
    } catch {
      return INITIAL_COMPANY_RULES;
    }
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activity, setActivity] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_activity');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [supportRequests, setSupportRequests] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('genesis_user_support_requests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Task Mutations
  const addTask = useCallback((taskData: Partial<OnboardingTask>) => {
    const id = taskData.id || `task-${Date.now()}`;
    const newTask: OnboardingTask = {
      id,
      company_id: 'user-company',
      name: taskData.name || 'Untitled Task',
      description: taskData.description || 'Custom user created task',
      category: taskData.category || 'HR',
      priority: taskData.priority || 'medium',
      estimated_minutes: taskData.estimated_minutes || 30,
      day_number: taskData.day_number || 1,
      is_required: taskData.is_required ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      steps: taskData.steps || [
        { id: `step-1`, task_id: id, step_number: 1, title: 'Review task details and objectives', description: '', is_required: true, created_at: new Date().toISOString() },
        { id: `step-2`, task_id: id, step_number: 2, title: 'Execute action item', description: '', is_required: true, created_at: new Date().toISOString() },
        { id: `step-3`, task_id: id, step_number: 3, title: 'Verify and submit response', description: '', is_required: true, created_at: new Date().toISOString() }
      ],
      ...taskData,
    };

    const newEmpTask: EmployeeTask = {
      id: `et-${Date.now()}`,
      employee_id: 'emp-current',
      task_id: id,
      status: 'READY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: newTask,
    };

    setOnboardingTasks(prev => {
      const updated = [newTask, ...prev];
      try { localStorage.setItem('genesis_user_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setTasks(prev => {
      const updated = [newEmpTask, ...prev];
      try { localStorage.setItem('genesis_user_emp_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setActivity(prev => {
      const act = [{
        id: `act-${Date.now()}`,
        action: `Created task: ${newTask.name}`,
        created_at: new Date().toISOString(),
      }, ...prev];
      try { localStorage.setItem('genesis_user_activity', JSON.stringify(act)); } catch {}
      return act;
    });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setOnboardingTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      try { localStorage.setItem('genesis_user_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setTasks(prev => {
      const updated = prev.filter(t => t.task_id !== taskId);
      try { localStorage.setItem('genesis_user_emp_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const updateTaskStatus = useCallback((
    taskId: string,
    status: TaskStatus,
    extra: Partial<EmployeeTask> = {}
  ) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.task_id === taskId ? { ...t, status, ...extra, updated_at: new Date().toISOString() } : t
      );
      try { localStorage.setItem('genesis_user_emp_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const completeStep = useCallback((taskId: string, stepId: string) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.task_id === taskId
          ? { ...t, completed_steps: [...(t.completed_steps || []), stepId], updated_at: new Date().toISOString() }
          : t
      );
      try { localStorage.setItem('genesis_user_emp_tasks', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Experience Mutations
  const addExperience = useCallback((exp: PreviousCompany) => {
    setExperience(prev => {
      const updated = [exp, ...prev];
      try { localStorage.setItem('genesis_user_experience', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteExperience = useCallback((index: number) => {
    setExperience(prev => {
      const updated = prev.filter((_, i) => i !== index);
      try { localStorage.setItem('genesis_user_experience', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Project Mutations
  const addProject = useCallback((projData: Partial<Project>) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      employee_id: 'emp-current',
      name: projData.name || 'Untitled Project',
      type: projData.type || 'Professional',
      role: projData.role || 'Contributor',
      duration: projData.duration || '2024',
      description: projData.description || '',
      tech_stack: projData.tech_stack || [],
      created_at: new Date().toISOString(),
      ...projData,
    };
    setProjects(prev => {
      const updated = [newProj, ...prev];
      try { localStorage.setItem('genesis_user_projects', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      try { localStorage.setItem('genesis_user_projects', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Skill Mutations
  const addSkill = useCallback((skillData: Partial<Skill>) => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      employee_id: 'emp-current',
      name: skillData.name || 'New Skill',
      category: skillData.category || 'Programming',
      proficiency: skillData.proficiency || 'Intermediate',
      created_at: new Date().toISOString(),
      ...skillData,
    };
    setSkills(prev => {
      const updated = [newSkill, ...prev];
      try { localStorage.setItem('genesis_user_skills', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setSkills(prev => {
      const updated = prev.filter(s => s.id !== id);
      try { localStorage.setItem('genesis_user_skills', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Journey Milestone Mutations
  const addJourneyMilestone = useCallback((m: Partial<UserJourneyMilestone>) => {
    const newMilestone: UserJourneyMilestone = {
      id: `m-${Date.now()}`,
      day: m.day || 1,
      label: m.label || 'Custom Milestone',
      description: m.description || '',
      department: m.department || 'Operations',
      status: m.status || 'Upcoming',
      ...m,
    };
    setJourneyMilestones(prev => {
      const updated = [...prev, newMilestone];
      try { localStorage.setItem('genesis_user_journey', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteJourneyMilestone = useCallback((id: string) => {
    setJourneyMilestones(prev => {
      const updated = prev.filter(m => m.id !== id);
      try { localStorage.setItem('genesis_user_journey', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Support Contact Mutations
  const addSupportContact = useCallback((contactData: Partial<UserSupportContact>) => {
    const newContact: UserSupportContact = {
      id: `sc-${Date.now()}`,
      name: contactData.name || 'Support Desk',
      role: contactData.role || 'Support Lead',
      department: contactData.department || 'Operations',
      phone: contactData.phone || '+1 (800) 555-0100',
      email: contactData.email || 'support@enterprise.internal',
      office: contactData.office || 'Main Building',
      availability: contactData.availability || 'Mon–Fri, 9:30 AM – 6:30 PM',
      status: contactData.status || 'Operational',
      ...contactData,
    };
    setSupportContacts(prev => {
      const updated = [newContact, ...prev];
      try { localStorage.setItem('genesis_user_contacts', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteSupportContact = useCallback((id: string) => {
    setSupportContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      try { localStorage.setItem('genesis_user_contacts', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Company Rule Mutations
  const addCompanyRule = useCallback((ruleData: Partial<UserCompanyRule>) => {
    const newRule: UserCompanyRule = {
      id: `rule-${Date.now()}`,
      title: ruleData.title || 'Enterprise Policy',
      category: ruleData.category || 'Workplace Policy',
      summary: ruleData.summary || 'Summary of rule',
      details: ruleData.details || ['Adhere to standard corporate protocols'],
      ...ruleData,
    };
    setCompanyRules(prev => {
      const updated = [newRule, ...prev];
      try { localStorage.setItem('genesis_user_rules', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const deleteCompanyRule = useCallback((id: string) => {
    setCompanyRules(prev => {
      const updated = prev.filter(r => r.id !== id);
      try { localStorage.setItem('genesis_user_rules', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
      try { localStorage.setItem('genesis_user_notifications', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const addSupportRequest = useCallback((req: any) => {
    const newReq = {
      ...req,
      id: `sup-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSupportRequests(prev => {
      const updated = [newReq, ...prev];
      try { localStorage.setItem('genesis_user_support_requests', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  return (
    <EmployeeDataContext.Provider value={{
      tasks,
      onboardingTasks,
      addTask,
      deleteTask,
      updateTaskStatus,
      completeStep,
      experience,
      addExperience,
      deleteExperience,
      projects,
      addProject,
      deleteProject,
      skills,
      addSkill,
      deleteSkill,
      journeyMilestones,
      addJourneyMilestone,
      deleteJourneyMilestone,
      supportContacts,
      addSupportContact,
      deleteSupportContact,
      companyRules,
      addCompanyRule,
      deleteCompanyRule,
      notifications,
      markNotificationRead,
      activity,
      resources: [],
      supportRequests,
      addSupportRequest,
    }}>
      {children}
    </EmployeeDataContext.Provider>
  );
}

export function useEmployeeData() {
  const ctx = useContext(EmployeeDataContext);
  if (!ctx) throw new Error('useEmployeeData must be used within EmployeeDataProvider');
  return ctx;
}
