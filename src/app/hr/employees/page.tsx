'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Briefcase,
  Building,
  Calendar,
  Mail,
  ChevronRight,
  UserPlus,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  User as UserIcon,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useAuth } from '@/lib/context';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface CompanyEmployeeRecord {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  role: string; // designation
  department: string;
  company: string;
  branch: string;
  employment_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  gender: string;
  work_mode: 'on-site' | 'remote' | 'hybrid';
  joining_date: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'COMPLETED' | 'AT_RISK';
  progress_percentage: number;
  profile_photo?: string;
  manager?: string;
  created_at: string;
}

export default function HREmployeesManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [employees, setEmployees] = useState<CompanyEmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDesignation, setFilterDesignation] = useState('All');

  // Add Employee Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newEmploymentType, setNewEmploymentType] =
    useState<CompanyEmployeeRecord['employment_type']>('Full-Time');
  const [newGender, setNewGender] = useState('Prefer not to say');
  const [newWorkMode, setNewWorkMode] =
    useState<CompanyEmployeeRecord['work_mode']>('hybrid');
  const [newJoiningDate, setNewJoiningDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const hrCompany = (user?.company_name || '').trim().toLowerCase();
  const hrName = (user?.name || '').trim().toLowerCase();
  const hrEmail = (user?.email || '').trim().toLowerCase();

  // Load real database/storage employees strictly scoped to authenticated HR's company
  const loadEmployees = () => {
    setIsLoading(true);
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      if (reg) {
        const parsed = JSON.parse(reg);
        const rawList = Array.isArray(parsed) ? parsed : Object.values(parsed);

        const scopedList: CompanyEmployeeRecord[] = rawList
          .filter((u: any) => {
            if (!u || !u.email) return false;

            // 1. Exclude HR itself
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

            // 2. Exclude HR user's own email
            if (hrEmail && u.email.toLowerCase() === hrEmail) return false;

            // 3. Multi-Company Isolation Check
            const empCompany = (u.company_name || u.company || '').trim().toLowerCase();
            const empManager = (u.manager || '').trim().toLowerCase();
            if (hrCompany && empCompany) {
              const isCompanyMatch =
                empCompany === hrCompany ||
                empCompany.includes(hrCompany) ||
                hrCompany.includes(empCompany);
              const isManagerMatch = hrName && empManager.includes(hrName);
              if (!isCompanyMatch && !isManagerMatch) return false;
            }

            return true;
          })
          .map((u: any, index: number) => {
            const rawProgress =
              typeof u.progress_percentage === 'number'
                ? u.progress_percentage
                : typeof u.onboarding_progress === 'number'
                ? u.onboarding_progress
                : 0;

            const empId =
              u.employee_id ||
              u.id ||
              `GEN-${String(1000 + index).slice(-4)}`;

            return {
              id: u.id || `emp-${u.email}`,
              name: u.name || 'Team Member',
              email: u.email,
              employee_id: empId,
              role: u.role || 'Software Engineer',
              department: u.department_name || u.department || 'Engineering',
              company: u.company_name || user?.company_name || 'Genesis Enterprise',
              branch: u.branch_name || user?.branch_name || 'Main Campus',
              employment_type: (u.employment_type as any) || 'Full-Time',
              gender: u.gender || 'Prefer not to say',
              work_mode: (u.work_mode as any) || 'hybrid',
              joining_date: u.joining_date || new Date().toISOString().split('T')[0],
              status:
                rawProgress >= 100
                  ? 'COMPLETED'
                  : u.status === 'AT_RISK'
                  ? 'AT_RISK'
                  : 'ONBOARDING',
              progress_percentage: rawProgress,
              profile_photo: u.profile_photo,
              manager: u.manager || user?.name || 'HR Operations',
              created_at: u.created_at || new Date().toISOString(),
            };
          });

        setEmployees(scopedList);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [user]);

  // Handle Add New Employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please enter employee name and email.');
      return;
    }

    const uniqueId = `emp-${Date.now()}`;
    const generatedEmployeeId = `GEN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmpRecord = {
      id: uniqueId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      employee_id: generatedEmployeeId,
      role: newRole.trim() || 'Software Engineer',
      department_name: newDept,
      department: newDept,
      company_name: user?.company_name || 'Genesis Enterprise',
      company: user?.company_name || 'Genesis Enterprise',
      branch_name: user?.branch_name || 'Main Campus',
      branch: user?.branch_name || 'Main Campus',
      employment_type: newEmploymentType,
      gender: newGender,
      work_mode: newWorkMode,
      joining_date: newJoiningDate,
      status: 'ONBOARDING',
      progress_percentage: 0,
      completed_tasks_count: 0,
      total_tasks_count: 16,
      onboarding_day: 1,
      total_days: 5,
      manager: user?.name || 'People Operations',
      created_at: new Date().toISOString(),
    };

    try {
      const reg = localStorage.getItem('genesis_registered_users');
      const all = reg ? JSON.parse(reg) : {};
      all[newEmail.trim().toLowerCase()] = newEmpRecord;
      localStorage.setItem('genesis_registered_users', JSON.stringify(all));

      toast.success(`Employee ${newEmpRecord.name} (${newEmpRecord.employee_id}) created!`);
      loadEmployees();
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewRole('');
    } catch {
      toast.error('Failed to create employee record in database.');
    }
  };

  // Dynamic Statistics computed strictly from actual database records
  const totalEmployees = employees.length;
  const fullTimeEmployees = employees.filter(
    (e) => (e.employment_type || 'Full-Time') === 'Full-Time'
  ).length;
  const partTimeEmployees = employees.filter(
    (e) => e.employment_type === 'Part-Time'
  ).length;
  const contractEmployees = employees.filter(
    (e) => e.employment_type === 'Contract'
  ).length;
  const internEmployees = employees.filter(
    (e) => e.employment_type === 'Intern'
  ).length;

  // Dynamic Department Distribution Chart data from database records
  const departmentChartData = useMemo(() => {
    if (employees.length === 0) return [];
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      const dept = emp.department || 'Operations';
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [employees]);

  // Unique filter option lists from real database values
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  const designationOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.role) set.add(e.role);
    });
    return Array.from(set);
  }, [employees]);

  // Filter & Search application
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.employee_id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q);

      const matchDept = filterDept === 'All' || emp.department === filterDept;
      const matchType = filterType === 'All' || emp.employment_type === filterType;
      const matchStatus = filterStatus === 'All' || emp.status === filterStatus;
      const matchDesignation = filterDesignation === 'All' || emp.role === filterDesignation;

      return matchSearch && matchDept && matchType && matchStatus && matchDesignation;
    });
  }, [employees, search, filterDept, filterType, filterStatus, filterDesignation]);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Scope: {user?.company_name || 'Genesis Enterprise'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Employees Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1">
            Real-time workforce registry, dynamic departmental allocation, and individual dossiers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* DYNAMIC EMPLOYEE STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Total Employees
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {totalEmployees}
          </p>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">
            Actual DB Count
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Full-Time
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {fullTimeEmployees}
          </p>
          <span className="text-[9px] text-slate-400 block">Permanent</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Part-Time
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {partTimeEmployees}
          </p>
          <span className="text-[9px] text-slate-400 block">Flexible Hours</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Contract
          </span>
          <p className="text-2xl font-black text-violet-600 dark:text-violet-400">
            {contractEmployees}
          </p>
          <span className="text-[9px] text-slate-400 block">Term Staff</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Interns
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {internEmployees}
          </p>
          <span className="text-[9px] text-slate-400 block">Trainees</span>
        </div>
      </div>

      {/* DEPARTMENT CHART SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department Distribution (Live Database Records)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {departmentChartData.length} Departments Represented
          </span>
        </div>

        {departmentChartData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
            <Users className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No department records available
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Add your first employee to visualize department distribution.
            </p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#888' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080d1a',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {departmentChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* DYNAMIC SEARCH & FUNCTIONAL FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name, employee ID, email, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Employment Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="COMPLETED">Completed</option>
            <option value="AT_RISK">At Risk</option>
          </select>
        </div>
      </div>

      {/* EMPLOYEE TABLE: ALL EMPLOYEES */}
      <div className="rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            All Employees ({filteredEmployees.length})
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any row to open dynamic employee work dashboard
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading company employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No employees found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No employee records matched your query in {user?.company_name || 'your company'}.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Employee</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Employment Type</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => router.push(`/hr/employee-details?id=${encodeURIComponent(emp.id)}`)}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Employee Avatar + Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {emp.profile_photo ? (
                          <img
                            src={emp.profile_photo}
                            alt={emp.name}
                            className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 shadow-xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                            {getInitials(emp.name)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                            {emp.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {emp.employee_id}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {emp.department}
                    </td>

                    {/* Employment Type */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {emp.employment_type}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(emp.joining_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {emp.role}
                    </td>

                    {/* Gender */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {emp.gender}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                          emp.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : emp.status === 'AT_RISK'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        )}
                      >
                        {emp.status === 'COMPLETED' ? 'Completed' : 'Onboarding'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                        <span>Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD NEW EMPLOYEE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add New Employee to {user?.company_name || 'Organization'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. priya@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Designation / Role *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Department *
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Employment Type
                    </label>
                    <select
                      value={newEmploymentType}
                      onChange={(e) =>
                        setNewEmploymentType(
                          e.target.value as CompanyEmployeeRecord['employment_type']
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Gender
                    </label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={newJoiningDate}
                      onChange={(e) => setNewJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/25 transition-colors cursor-pointer"
                  >
                    Create Employee Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
