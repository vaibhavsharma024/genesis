'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop, Shield, Key, CheckSquare, Square,
  CheckCircle2, Clock, Search, Filter, Sparkles,
  RotateCcw, CheckCheck, FileText, Building, Package,
  ExternalLink, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface ResourceItem {
  id: string;
  name: string;
  category: 'Hardware' | 'Security & Access' | 'Software & Tools' | 'Documents' | 'Facilities';
  description: string;
  department: string;
  location?: string;
  essential: boolean;
}

export const INITIAL_RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'res-laptop',
    name: 'Corporate Laptop & Charger',
    category: 'Hardware',
    description: 'Pre-configured enterprise laptop with encrypted SSD, power adapter, and USB-C cable.',
    department: 'IT Equipment Desk',
    location: 'Building B, Floor 1 (IT Hub)',
    essential: true,
  },
  {
    id: 'res-monitor',
    name: 'Dual 4K External Displays & Dock',
    category: 'Hardware',
    description: 'Ultra-wide / dual monitor workstation setup with docking station and HDMI/DisplayPort cables.',
    department: 'IT Hardware & Facilities',
    location: 'Assigned Desk Pod',
    essential: false,
  },
  {
    id: 'res-peripherals',
    name: 'Ergonomic Keyboard, Mouse & Headset',
    category: 'Hardware',
    description: 'Wireless Bluetooth keyboard, precision mouse, and noise-cancelling meeting headset.',
    department: 'IT Logistics',
    location: 'Welcome Desk / Locker',
    essential: false,
  },
  {
    id: 'res-smart-badge',
    name: 'Smart Access ID Badge & Lanyard',
    category: 'Security & Access',
    description: 'NFC photo badge for turnstile building access, cafeteria, and secure floor entry.',
    department: 'Campus Security',
    location: 'Security Reception, Main Gate',
    essential: true,
  },
  {
    id: 'res-yubikey',
    name: 'Hardware Security Key (YubiKey 5C)',
    category: 'Security & Access',
    description: 'FIDO2 / U2F cryptographic hardware token for multi-factor authentication and SSH signing.',
    department: 'InfoSec Compliance',
    location: 'IT Onboarding Desk',
    essential: true,
  },
  {
    id: 'res-vpn-sso',
    name: 'Zero-Trust VPN & SSO Login Access',
    category: 'Security & Access',
    description: 'Active Directory SSO credentials with configured WireGuard / GlobalProtect VPN profile.',
    department: 'Identity & Access (IAM)',
    location: 'Remote / Genesis Cloud Portal',
    essential: true,
  },
  {
    id: 'res-github-org',
    name: 'GitHub / GitLab Enterprise Invitation',
    category: 'Software & Tools',
    description: 'Membership invited and verified in official company code repositories and CI/CD pipelines.',
    department: 'Engineering Operations',
    location: 'Cloud Invite / Email',
    essential: true,
  },
  {
    id: 'res-slack-comm',
    name: 'Slack / Teams Workplace Workspace',
    category: 'Software & Tools',
    description: 'Enterprise messaging workspace invitation with default channel auto-enrollments.',
    department: 'IT Workplace Tech',
    location: 'Corporate SSO',
    essential: true,
  },
  {
    id: 'res-email-calendar',
    name: 'Corporate Mail & Calendar Suite',
    category: 'Software & Tools',
    description: 'Company email inbox and shared calendar schedules configured on laptop and mobile.',
    department: 'IT Workplace Tech',
    location: 'Google Workspace / Outlook',
    essential: true,
  },
  {
    id: 'res-nda-handbook',
    name: 'Signed NDA & Employee Handbook',
    category: 'Documents',
    description: 'Executed confidentiality contract, intellectual property assignment, and handbook acknowledgment.',
    department: 'HR & Legal Compliance',
    location: 'DocuSign / Genesis Documents',
    essential: true,
  },
  {
    id: 'res-direct-deposit',
    name: 'Payroll & Direct Deposit Form',
    category: 'Documents',
    description: 'Verified bank routing details and tax withholding declarations (W-4 / Tax Declarations).',
    department: 'Finance & Payroll',
    location: 'HR Portal Documents',
    essential: true,
  },
  {
    id: 'res-emergency-contact',
    name: 'Emergency Contact & Health Declaration',
    category: 'Documents',
    description: 'Primary and secondary emergency points of contact registered in employee directory.',
    department: 'People Operations',
    location: 'Genesis HR Registry',
    essential: false,
  },
  {
    id: 'res-welcome-swag',
    name: 'Genesis Welcome Kit & Company Swag',
    category: 'Facilities',
    description: 'Branded backpack, thermal water bottle, notebook, pen, and employee welcome manual.',
    department: 'People Operations',
    location: 'Welcome Desk / Mailed Parcel',
    essential: false,
  },
  {
    id: 'res-desk-pod',
    name: 'Assigned Workstation & Ergonomic Chair',
    category: 'Facilities',
    description: 'Designated desk pod number with adjustable standing desk and ergonomic chair.',
    department: 'Facilities Management',
    location: 'Floor 2, Pod C-14',
    essential: false,
  },
];

const STORAGE_KEY = 'genesis_user_resources_checklist';

interface ResourcesChecklistProps {
  portalType: 'employee' | 'hr';
}

export default function ResourcesChecklist({ portalType }: ResourcesChecklistProps) {
  // Checklist state: key is resource item id, value is boolean
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Save to localStorage whenever checkedMap changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
    } catch (e) {
      console.error('Failed to save checklist state', e);
    }
  }, [checkedMap]);

  // Listen for storage events in case user updates in another tab/portal
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCheckedMap(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleItem = (id: string, name: string) => {
    setCheckedMap(prev => {
      const nextState = !prev[id];
      const updated = { ...prev, [id]: nextState };
      if (nextState) {
        toast.success(`Marked in possession: "${name}"`, { icon: '✅' });
      } else {
        toast(`Unchecked: "${name}"`, { icon: 'ℹ️' });
      }
      return updated;
    });
  };

  const handleTickAll = () => {
    const updated: Record<string, boolean> = {};
    INITIAL_RESOURCE_ITEMS.forEach(item => {
      updated[item.id] = true;
    });
    setCheckedMap(updated);
    toast.success('All resources marked in possession!', { icon: '🎉' });
  };

  const handleResetAll = () => {
    setCheckedMap({});
    toast('Checklist reset to unverified state.', { icon: '🔄' });
  };

  const categories = ['All', 'Hardware', 'Security & Access', 'Software & Tools', 'Documents', 'Facilities'];

  const filteredItems = useMemo(() => {
    return INITIAL_RESOURCE_ITEMS.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.department.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  const totalCount = INITIAL_RESOURCE_ITEMS.length;
  const checkedCount = useMemo(() => {
    return INITIAL_RESOURCE_ITEMS.filter(i => checkedMap[i.id]).length;
  }, [checkedMap]);

  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              {portalType === 'hr' ? 'HR Asset & Equipment Registry' : 'My Resource Checklist'}
            </span>
            <span className="text-xs text-slate-400">· Shared Synchronization</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Onboarding Resources Checklist
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Tick off each physical asset, credential, security token, and software workspace that you have received. 
            Tick states persist across both Employee and HR portals in real-time.
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2.5 relative z-10 self-start md:self-auto flex-shrink-0">
          <button
            onClick={handleTickAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tick All Received</span>
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            title="Reset all checkboxes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Live Checklist Progress Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Asset Custody</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {checkedCount} of {totalCount} Items In Possession ({progressPercent}%)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5',
              progressPercent === 100
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : progressPercent > 50
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/30'
            )}>
              {progressPercent === 100 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Fully Equipped</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{totalCount - checkedCount} Pending Receipt</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Progress Bar with 3D Gloss */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full transition-all',
              progressPercent === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30'
                : progressPercent > 50
                ? 'bg-gradient-to-r from-violet-600 to-blue-500 shadow-md shadow-violet-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30'
            )}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, laptop, VPN, badge, documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isChecked = !!checkedMap[item.id];

          return (
            <motion.div
              key={item.id}
              layout
              whileHover={{ y: -2 }}
              onClick={() => toggleItem(item.id, item.name)}
              className={cn(
                'p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none relative group',
                isChecked
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/15 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-white/10 shadow-xs hover:border-violet-500/40'
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {/* Custom Checkbox */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toggleItem(item.id, item.name);
                      }}
                      className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all mt-0.5 cursor-pointer flex-shrink-0',
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/40 scale-105'
                          : 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-800 hover:border-violet-500'
                      )}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider',
                          isChecked
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                        )}>
                          {item.category}
                        </span>
                        {item.essential && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                            Required Day 1
                          </span>
                        )}
                      </div>
                      <h3 className={cn(
                        'text-base font-bold mt-1 tracking-tight',
                        isChecked ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-85' : 'text-slate-900 dark:text-white'
                      )}>
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Verification Status Pill */}
                  <div className="flex-shrink-0">
                    <span className={cn(
                      'text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider',
                      isChecked
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                    )}>
                      {isChecked ? 'In Possession' : 'Unticked'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                  {item.description}
                </p>
              </div>

              {/* Footer Location & Issuer Dept */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pl-9">
                <span className="font-medium">
                  Issuer: <strong className="text-slate-700 dark:text-slate-200">{item.department}</strong>
                </span>
                {item.location && (
                  <span className="text-slate-400 dark:text-slate-500">
                    {item.location}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No resources found matching filter.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
