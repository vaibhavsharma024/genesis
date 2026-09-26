'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Heart, Smile, Frown, Meh, MessageSquare,
  Sparkles, CheckCircle2, UserCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PULSE_FEED = [
  {
    id: 1,
    name: 'Vaibhav Sharma',
    role: 'Software Developer',
    day: 2,
    sentiment: 'excited',
    score: 5,
    comment: 'Got my Surface Pro and set up VS Code quickly. Arjun (my buddy) showed me around the engineering bay.',
    time: '2 hours ago',
    flagged: false,
  },
  {
    id: 2,
    name: 'Manvi',
    role: 'Product Designer',
    day: 3,
    sentiment: 'overwhelmed',
    score: 2,
    comment: 'Access card is taking longer than expected at the reception. Cannot get past security to reach design studio.',
    time: '3 hours ago',
    flagged: true,
    actionNeeded: 'Reception badge expedite requested',
  },
  {
    id: 3,
    name: 'Vanshika',
    role: 'Frontend Engineer',
    day: 4,
    sentiment: 'confident',
    score: 5,
    comment: 'Joined team daily standup today and picked up my first starter issue in the repo! Clear instructions.',
    time: '5 hours ago',
    flagged: false,
  },
  {
    id: 4,
    name: 'Rohan Gupta',
    role: 'Cloud Architect',
    day: 3,
    sentiment: 'blocked',
    score: 2,
    comment: 'VPN connection times out when trying to pull enterprise cloud configurations. IT ticket submitted.',
    time: 'Yesterday',
    flagged: true,
    actionNeeded: 'IT Support escalation required',
  },
];

export default function HRPulsePage() {
  const [feed, setFeed] = useState(PULSE_FEED);

  const resolveRoadblock = (id: number, name: string) => {
    setFeed(prev => prev.map(item => item.id === id ? { ...item, flagged: false } : item));
    toast.success(`Action marked resolved for ${name}. Buddy notified!`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">New Joiner Pulse & Sentiment</h1>
        <p className="text-slate-400 text-sm mt-1">
          Daily micro-feedback, emotional sentiment scores, and proactive intervention alerts
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Positive Sentiment', value: '88%', icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Needs Intervention', value: '2 Joiners', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Avg Daily Vibe', value: '4.6 / 5', icon: Heart, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Check-In Rate', value: '100%', icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="text-2xl font-black text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Pulse Feed */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg">Daily Check-In Feed</h3>
        <div className="grid gap-3">
          {feed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all ${
                item.flagged ? 'border-red-500/30 bg-red-950/10' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.role} · Day {item.day} Check-in</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${
                    item.score >= 4 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    ★ {item.score} / 5
                  </span>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 pl-12 leading-relaxed">
                “{item.comment}”
              </p>

              {item.flagged && (
                <div className="mt-3 ml-12 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-red-400">Action Required:</p>
                    <p className="text-xs text-red-300">{item.actionNeeded}</p>
                  </div>
                  <button
                    onClick={() => resolveRoadblock(item.id, item.name)}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Resolve & Notify
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
