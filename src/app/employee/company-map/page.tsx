'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Phone, Mail, User, Search,
  Building, ChevronDown, ChevronUp, ExternalLink,
  Coffee, Laptop, Shield, Users, Star, Compass,
  Layers, Navigation, CheckCircle2, Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn } from '@/lib/utils';

export default function CompanyMapPage() {
  const { employee, user } = useAuth();
  const { supportContacts } = useEmployeeData();

  const companyName = employee?.company_name || user?.company_name || 'Enterprise Headquarters';
  const branchName = employee?.branch_name || user?.branch_name || 'Main Campus';
  const departmentName = employee?.department_name || user?.department_name || 'Engineering';
  const employeeRole = employee?.role || 'Team Member';
  const employeeName = employee?.name || user?.name || 'Colleague';

  const [search, setSearch] = useState('');
  const [activeFloor, setActiveFloor] = useState<number>(2); // Default to floor 2 where user's dept is
  const [tab, setTab] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(`loc-${departmentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);

  // Dynamic locations customized specifically to the user's entered company and department
  const campusLocations = useMemo(() => [
    {
      id: `loc-${departmentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${departmentName} Innovation Lab & Pod`,
      category: departmentName,
      building: `${companyName} Tower 1`,
      floor: 'Level 2',
      room: 'Pod B-14',
      status: 'Open',
      statusMessage: 'Active Workspace · Operating 9:30 AM – 6:30 PM',
      isAssigned: true,
      contact_name: `${departmentName} Lead`,
      contact_email: `${departmentName.toLowerCase().replace(/[^a-z0-9]/g, '')}-lead@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      notes: `Your assigned primary workstation pod at ${companyName}. Equipped with dual 4K monitors and high-speed enterprise LAN.`,
      icon: Laptop,
    },
    {
      id: 'loc-it-helpdesk',
      name: `${companyName} IT Helpdesk & Device Provisioning`,
      category: 'IT',
      building: `${companyName} Tower 1`,
      floor: 'Level 2',
      room: 'Room 204 (Wing A)',
      status: 'Open',
      statusMessage: 'Operating 9:30 AM – 6:30 PM',
      isAssigned: false,
      contact_name: 'IT Support Team',
      contact_email: `itsupport@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      contact_phone: 'Ext. 1044',
      notes: 'Hardware pickup (MacBook/Dell laptops), BitLocker keys, VPN setup, and tech accessories.',
      icon: Laptop,
    },
    {
      id: 'loc-hr-office',
      name: `${companyName} People & HR Experience Suite`,
      category: 'HR',
      building: `${companyName} Executive Tower`,
      floor: 'Level 4',
      room: 'Suite 402',
      status: 'Open',
      statusMessage: 'Operating 9:30 AM – 6:30 PM',
      isAssigned: false,
      contact_name: 'HR Operations',
      contact_email: `hr@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      contact_phone: 'Ext. 1020',
      notes: 'Physical ID card collection, document verification, benefits enrollment, and policy guidance.',
      icon: Users,
    },
    {
      id: 'loc-security-desk',
      name: `${companyName} Global Security Operations Center (GSOC)`,
      category: 'Security',
      building: `${companyName} Main Atrium`,
      floor: 'Ground Floor',
      room: 'Lobby Station 1',
      status: '24/7',
      statusMessage: 'Active 24/7 · Monitored Facility',
      isAssigned: false,
      contact_name: 'Campus Security Desk',
      contact_email: `security@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      contact_phone: '+1 (800) 555-0199',
      notes: 'Visitor badges, biometrics scanning, lost property, and 24/7 emergency response.',
      icon: Shield,
    },
    {
      id: 'loc-cafeteria',
      name: `${companyName} Central Dining & Coffee Pavilion`,
      category: 'Dining',
      building: `${companyName} West Concourse`,
      floor: 'Ground Floor',
      room: 'Atrium Food Hall',
      status: 'Open',
      statusMessage: 'Meals: 8:00 AM – 6:30 PM',
      isAssigned: false,
      contact_name: 'Campus Dining Services',
      contact_email: `dining@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      notes: 'Breakfast (8–10 AM), Lunch (12:30–2:30 PM), Afternoon High Tea (4:30–6 PM). Complimentary barista espresso bar.',
      icon: Coffee,
    },
    {
      id: 'loc-training-center',
      name: `${companyName} Training & Collaboration Center`,
      category: 'Training',
      building: `${companyName} Tower 1`,
      floor: 'Level 3',
      room: 'Innovation Amphitheater',
      status: 'Open',
      statusMessage: 'Reservable for team workshops',
      isAssigned: false,
      contact_name: 'Learning & Development',
      contact_email: `learning@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`,
      notes: 'Onboarding cohort presentations, guest speaker seminars, and hackathon workspace.',
      icon: Star,
    },
  ], [companyName, departmentName]);

  const tabs = ['All', departmentName, 'IT', 'HR', 'Security', 'Dining', 'Training'];

  const filteredLocations = campusLocations.filter(loc => {
    const matchSearch = search === '' ||
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.floor.toLowerCase().includes(search.toLowerCase()) ||
      loc.room.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All' || loc.category.toLowerCase() === tab.toLowerCase();
    return matchSearch && matchTab;
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Interactive 3D Campus
            </span>
            <span className="text-xs text-slate-400 font-medium">· {branchName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {companyName} Campus Navigator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personalized navigation, floor layouts, and facility directory tailored to <strong className="text-slate-700 dark:text-slate-200">{companyName}</strong>.
          </p>
        </div>

        {/* Assigned Desk Capsule */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600/15 via-blue-600/10 to-transparent border border-blue-500/30 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-400 animate-bounce" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Your Assigned Desk</div>
            <div className="text-xs font-black text-white">{departmentName} Wing · Floor 2 (Pod B-14)</div>
            <div className="text-[10px] text-slate-400">{employeeRole} · {employeeName}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE 3D/2.5D SVG CAMPUS MAP VISUALIZATION        */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-900/90 backdrop-blur-xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Floor Plan</h3>
              <p className="text-[11px] text-slate-400">{companyName} Tower 1 · Level {activeFloor}</p>
            </div>
          </div>

          {/* Floor Level Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
            {[0, 1, 2, 3, 4].map((fl) => (
              <button
                key={fl}
                onClick={() => setActiveFloor(fl)}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1',
                  activeFloor === fl
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <span>{fl === 0 ? 'Ground' : `Lvl ${fl}`}</span>
                {fl === 2 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Your assigned floor" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2.5D Isometric SVG Layout */}
        <div className="relative w-full h-64 md:h-80 bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="assignedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Isometric Floor Slab */}
            <polygon
              points="400,60 740,160 400,340 60,160"
              fill="url(#floorGrad)"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Walkway corridor line */}
            <path
              d="M 230,210 L 400,280 L 570,210 L 400,140 Z"
              fill="none"
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Room Zone 1: Elevator & Core */}
            <g transform="translate(370, 160)">
              <rect x="-35" y="-20" width="70" height="40" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
              <text x="0" y="3" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">Elevators</text>
            </g>

            {/* Zone 2: IT Tech Bay */}
            <g transform="translate(200, 150)">
              <rect x="-60" y="-30" width="120" height="60" rx="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="0" y="-8" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle">IT Tech Depot</text>
              <text x="0" y="8" fill="#64748b" fontSize="9" textAnchor="middle">Room 204 · Wing A</text>
            </g>

            {/* Zone 3: ASSIGNED WORKSTATION POD (User's Department) */}
            <g transform="translate(600, 190)">
              <rect
                x="-75" y="-35" width="150" height="70" rx="12"
                fill="url(#assignedGrad)"
                stroke="#60a5fa"
                strokeWidth="2"
                className="filter drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))"
              />
              <circle cx="0" cy="-45" r="8" fill="#3b82f6" className="animate-ping" opacity="0.7" />
              <circle cx="0" cy="-45" r="5" fill="#60a5fa" />
              <text x="0" y="-12" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
                {departmentName} Pod
              </text>
              <text x="0" y="5" fill="#e0e7ff" fontSize="9" fontWeight="bold" textAnchor="middle">
                ★ Assigned Desk B-14
              </text>
              <text x="0" y="20" fill="#c7d2fe" fontSize="8" textAnchor="middle">
                {employeeName}
              </text>
            </g>

            {/* Zone 4: Executive & Collaborative Pods */}
            <g transform="translate(300, 270)">
              <rect x="-55" y="-25" width="110" height="50" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <text x="0" y="-4" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">Focus Booths</text>
              <text x="0" y="10" fill="#64748b" fontSize="8" textAnchor="middle">Silent Zone</text>
            </g>

            {/* Zone 5: Coffee Lounge */}
            <g transform="translate(500, 110)">
              <rect x="-45" y="-20" width="90" height="40" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <text x="0" y="-2" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">☕ Coffee Bar</text>
              <text x="0" y="12" fill="#64748b" fontSize="8" textAnchor="middle">Complimentary</text>
            </g>

            {/* Wayfinding Animated Route Line from Elevator to Assigned Desk */}
            <path
              d="M 400,180 L 500,210 L 560,195"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Overlay Route Card */}
          <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:bottom-3 max-w-sm p-3 rounded-xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-md text-xs text-slate-300 flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-white">Live Wayfinding:</span> Main Atrium → West Elevator → Level 2 → <span className="text-blue-300 font-semibold">{departmentName} Pod</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
              2 Min Walk
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEARCH AND FACILITY CATEGORY FILTER                      */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search locations in ${companyName}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer',
                tab === t
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FACILITY DIRECTORY CARDS                                 */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {filteredLocations.map((loc) => {
          const expanded = expandedId === loc.id;
          const Icon = loc.icon;

          return (
            <motion.div
              key={loc.id}
              layout
              className={cn(
                'bg-slate-900/90 border rounded-2xl overflow-hidden transition-all backdrop-blur-md',
                loc.isAssigned
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              )}
            >
              {/* Header Bar */}
              <button
                onClick={() => setExpandedId(expanded ? null : loc.id)}
                className="w-full flex items-center gap-4 p-4 md:p-5 text-left cursor-pointer"
              >
                <div className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md',
                  loc.isAssigned
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30'
                    : 'bg-slate-800 text-slate-300'
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm truncate">{loc.name}</h3>
                    {loc.isAssigned && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Your Desk
                      </span>
                    )}
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                      loc.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      loc.status === '24/7' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                      'bg-slate-800 text-slate-400'
                    )}>
                      {loc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{loc.building} · {loc.floor} ({loc.room})</span>
                  </p>
                </div>

                <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-800 p-4 md:p-5 space-y-3 bg-slate-950/40 text-xs"
                  >
                    <p className="text-slate-300 leading-relaxed">{loc.notes}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Operating Timings:
                        </span>
                        <p className="font-bold text-white text-[11px]">{loc.statusMessage}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> Point of Contact:
                        </span>
                        <p className="font-bold text-white text-[11px]">{loc.contact_name}</p>
                        {loc.contact_email && (
                          <p className="text-[10px] text-blue-400 truncate">{loc.contact_email}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Support Escalation Footer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-slate-900/40 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
            ?
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Need physical guidance or lost on campus?</h4>
            <p className="text-[11px] text-slate-400">Security & Facility Helpdesk is active 24/7 on Ground Floor.</p>
          </div>
        </div>
        <a
          href="tel:+18005550199"
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all self-start sm:self-auto cursor-pointer shadow-sm"
        >
          Call Security Desk
        </a>
      </div>
    </div>
  );
}
