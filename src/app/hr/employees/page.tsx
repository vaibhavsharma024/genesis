'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Plus, ArrowUpRight,
  AlertTriangle, CheckCircle2, Clock, Mail, Shield, UserCheck,
  Building, UserPlus, Eye, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import { type HREmployeeRecord } from '@/lib/mock-data';
import { cn, formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function HREmployeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<HREmployeeRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'At Risk' | 'Completed' | 'Active'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load and sync real registered users working under this HR (zero mock/dummy data)
  const refreshEmployees = () => {
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg) {
        const parsed = JSON.parse(reg);
        const rawList = Array.isArray(parsed) ? parsed : Object.values(parsed);

        const hrCompany = (user?.company_name || '').trim().toLowerCase();
        const hrName = (user?.name || '').trim().toLowerCase();
        const hrEmail = (user?.email || '').trim().toLowerCase();

        const filteredList: HREmployeeRecord[] = rawList
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

        setEmployees(filteredList);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    refreshEmployees();
  }, [user]);

  // New employee state for modal
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newEmail, setNewEmail] = useState('');

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'All' || emp.department === filterDept;
      const matchStatus =
        filterStatus === 'All' ||
        (filterStatus === 'At Risk' && emp.is_at_risk) ||
        (filterStatus === 'Completed' && emp.onboarding_complete) ||
        (filterStatus === 'Active' && !emp.onboarding_complete);

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, filterDept, filterStatus]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please enter employee name and email.');
      return;
    }

    const newEmpId = `emp-${Date.now()}`;
    const newEmpData = {
      id: newEmpId,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole.trim() || 'Software Engineer',
      department_name: newDept,
      company_name: user?.company_name || 'Genesis Enterprise',
      branch_name: user?.branch_name || 'Main Campus',
      manager: user?.name || 'HR Management',
      joining_date: new Date().toISOString().split('T')[0],
      onboarding_day: 1,
      total_days: 5,
      progress_percentage: 0,
      completed_tasks_count: 0,
      total_tasks_count: 16,
      status: 'ONBOARDING',
      created_at: new Date().toISOString(),
    };

    try {
      const reg = localStorage.getItem('genesis_registered_users');
      const all = reg ? JSON.parse(reg) : {};
      all[newEmail.trim().toLowerCase()] = newEmpData;
      localStorage.setItem('genesis_registered_users', JSON.stringify(all));
    } catch {}

    refreshEmployees();
    setShowAddModal(false);
    setNewName('');
    setNewRole('');
    setNewEmail('');
    toast.success(`Welcome journey & Day 1 access dispatched to ${newEmpData.name}!`);
  };

  const handleNudge = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`Nudge & support notification sent to ${name}!`);
  };

  const handleNavigateToDetails = (empId: string) => {
    router.push(`/hr/employee-details?employeeId=${encodeURIComponent(empId)}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20 mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Scope: {user?.company_name || 'Your Organization'} · Real Joiners Only</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Employee Onboarding Roster</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Showing only employees working under your management. Click on any employee to view their full progress and mind map dossier.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Onboard New Joiner
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, role, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Active', 'At Risk', 'Completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer',
                filterStatus === status
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table / Cards */}
      <div className="grid gap-3">
        {filtered.map((emp, i) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => handleNavigateToDetails(emp.id)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/50 hover:bg-slate-900/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group shadow-sm"
          >
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-transform group-hover:scale-105',
                emp.is_at_risk
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-gradient-to-br from-violet-600/30 to-indigo-600/30 text-violet-300 border border-violet-500/30'
              )}>
                {getInitials(emp.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                    {emp.name}
                  </h3>
                  {emp.is_at_risk && (
                    <span className="badge bg-red-500/20 text-red-300 text-[11px] border border-red-500/30">
                      Roadblock Reported
                    </span>
                  )}
                  {emp.onboarding_complete && (
                    <span className="badge bg-emerald-500/20 text-emerald-300 text-[11px] border border-emerald-500/30">
                      Ready to Deploy
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {emp.role} · <span className="text-violet-400 font-medium">{emp.department}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {emp.email} · Joined {formatDate(emp.joining_date)}
                </p>
              </div>
            </div>

            {/* Progress & Stats */}
            <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-xs text-slate-400 font-medium">Day {emp.onboarding_day} of 5</span>
                  <span className="text-xs font-bold text-white">{emp.onboarding_progress}%</span>
                </div>
                <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      emp.is_at_risk ? 'bg-red-500' : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400'
                    )}
                    style={{ width: `${emp.onboarding_progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {emp.completed_tasks_count}/{emp.total_tasks_count} tasks completed
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleNudge(e, emp.name)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Nudge
                </button>
                <Link
                  href={`/hr/employee-details?employeeId=${encodeURIComponent(emp.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="View Complete Progress & Dossier"
                >
                  <span>View Progress</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Employees Registered Under Your Scope</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only real employees assigned to your organization ({user?.company_name || 'Genesis Enterprise'}) who are working under you appear in this roster. Click below to onboard a new joiner.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Joiner</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Joiner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard New Joiner</h3>
                  <p className="text-[11px] text-slate-400">Assigned under {user?.company_name || 'Your Organization'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram.rao@company.internal"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Engineer"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Confirm & Dispatch Day 1 Journey
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
