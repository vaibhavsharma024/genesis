'use client';

import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Clock, AlertTriangle,
  CheckCircle2, Users, Star, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const VELOCITY_DATA = [
  { day: 'Day 1 (HR)', targetHours: 4, actualHours: 3.5 },
  { day: 'Day 2 (IT)', targetHours: 6, actualHours: 7.2 },
  { day: 'Day 3 (Sec)', targetHours: 4, actualHours: 4.1 },
  { day: 'Day 4 (Team)', targetHours: 5, actualHours: 4.8 },
  { day: 'Day 5 (Role)', targetHours: 5, actualHours: 4.5 },
];

const DEPARTMENT_METRICS = [
  { name: 'Engineering', rate: 92, count: 24, atRisk: 1 },
  { name: 'Design', rate: 88, count: 8, atRisk: 1 },
  { name: 'Product', rate: 96, count: 6, atRisk: 0 },
  { name: 'Human Resources', rate: 100, count: 4, atRisk: 0 },
  { name: 'Security', rate: 94, count: 5, atRisk: 0 },
];

const BOTTLENECK_TASKS = [
  { name: 'Global VPN Access & MFA', avgDelay: '+2.4 hrs', reason: 'MFA Push timeout & IT desk line', category: 'IT' },
  { name: 'Access Badge Activation', avgDelay: '+1.8 hrs', reason: 'Biometric capture wait times', category: 'Security' },
  { name: 'GitHub Enterprise Provisioning', avgDelay: '+1.2 hrs', reason: 'Manual organization invite review', category: 'Engineering' },
];

export default function HRAnalyticsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Onboarding Intelligence & Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time metrics, bottleneck identification, and department-wide velocity
        </p>
      </div>

      {/* Top metrics summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Time-to-Productivity', value: '4.2 Days', change: '-1.8 days vs benchmark', color: 'text-emerald-400' },
          { label: 'Completion Rate', value: '94.8%', change: '+6.2% this quarter', color: 'text-violet-400' },
          { label: 'Roadblock Resolution', value: '1.4 Hours', change: 'Avg turnaround', color: 'text-cyan-400' },
          { label: 'Joiner CSAT', value: '4.9 / 5', change: 'Based on 48 surveys', color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className="text-2xl lg:text-3xl font-black text-white mt-1.5">{stat.value}</p>
            <p className={`text-xs mt-1 font-medium ${stat.color}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Actual vs Target Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">Stage Completion Duration</h3>
            <span className="text-xs text-slate-500">Target vs Actual (Hours)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={VELOCITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(30 41 59)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
              <Bar dataKey="targetHours" name="Target (hrs)" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualHours" name="Actual (hrs)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Success Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">Department Readiness</h3>
            <span className="text-xs text-slate-500">% Onboarding On-Time</span>
          </div>
          <div className="space-y-4 pt-1">
            {DEPARTMENT_METRICS.map(dept => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-medium">{dept.name} ({dept.count} joiners)</span>
                  <span className="text-emerald-400 font-bold">{dept.rate}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Identified Bottlenecks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">AI Detected Process Bottlenecks</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {BOTTLENECK_TASKS.map((b, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="badge bg-amber-500/20 text-amber-300 text-xs">{b.category}</span>
                <span className="text-xs font-bold text-red-400">{b.avgDelay}</span>
              </div>
              <h4 className="text-sm font-semibold text-white">{b.name}</h4>
              <p className="text-xs text-slate-400">{b.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
