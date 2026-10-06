'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  User,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  CalendarDays,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface CompanyMeetingRecord {
  id: string;
  company_name: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  organizer: string;
  organizer_email: string;
  meeting_type: 'Onboarding' | '1:1 Sync' | 'Department Review' | 'All Hands' | 'General';
  participants: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location_or_url: string;
  created_at: string;
}

export default function HRMeetingsFeedPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<CompanyMeetingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states for scheduling
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 AM – 10:45 AM');
  const [newType, setNewType] = useState<CompanyMeetingRecord['meeting_type']>('Onboarding');
  const [newParticipants, setNewParticipants] = useState('');
  const [newLocation, setNewLocation] = useState('Genesis Virtual Conference Room 1');

  const hrCompany = (user?.company_name || '').trim().toLowerCase();

  // Load real company-scoped meetings from storage / backend
  const loadMeetings = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('genesis_company_meetings');
      if (stored) {
        const parsed: CompanyMeetingRecord[] = JSON.parse(stored);
        const scoped = parsed.filter((m) => {
          if (!m || !m.company_name) return false;
          const mComp = m.company_name.trim().toLowerCase();
          return !hrCompany || mComp === hrCompany || mComp.includes(hrCompany) || hrCompany.includes(mComp);
        });
        setMeetings(scoped);
      } else {
        setMeetings([]);
      }
    } catch {
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [user]);

  // Handle scheduling a new meeting
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    const participantsList = newParticipants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const newMeeting: CompanyMeetingRecord = {
      id: `mtg-${Date.now()}`,
      company_name: user?.company_name || 'Genesis Enterprise',
      title: newTitle.trim(),
      date: newDate,
      time: newTime.trim(),
      organizer: user?.name || 'HR Operations',
      organizer_email: user?.email || 'hr@genesis.internal',
      meeting_type: newType,
      participants: participantsList.length > 0 ? participantsList : ['All Onboardees'],
      status: 'SCHEDULED',
      location_or_url: newLocation.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('genesis_company_meetings');
      const all: CompanyMeetingRecord[] = stored ? JSON.parse(stored) : [];
      all.unshift(newMeeting);
      localStorage.setItem('genesis_company_meetings', JSON.stringify(all));
      toast.success(`Meeting "${newMeeting.title}" scheduled successfully!`);
      loadMeetings();
      setShowScheduleModal(false);
      setNewTitle('');
      setNewParticipants('');
    } catch {
      toast.error('Failed to save meeting.');
    }
  };

  const handleUpdateStatus = (id: string, newStatus: CompanyMeetingRecord['status']) => {
    try {
      const stored = localStorage.getItem('genesis_company_meetings');
      if (stored) {
        const all: CompanyMeetingRecord[] = JSON.parse(stored);
        const updated = all.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
        localStorage.setItem('genesis_company_meetings', JSON.stringify(updated));
        loadMeetings();
        toast.success(`Meeting status updated to ${newStatus}`);
      }
    } catch {}
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.organizer.toLowerCase().includes(search.toLowerCase()) ||
        m.participants.some((p) => p.toLowerCase().includes(search.toLowerCase()));

      const matchType = filterType === 'All' || m.meeting_type === filterType;
      const matchStatus = filterStatus === 'All' || m.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [meetings, search, filterType, filterStatus]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Scope: {user?.company_name || 'Organization'} · Real Meetings Feed</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Meeting Feed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm mt-1">
            Dynamic company-scoped meeting feeds, 1:1 check-ins, and onboarding review sessions
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meetings by title, organizer, participant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer',
                filterStatus === st
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 font-bold'
                  : 'bg-white dark:bg-[#0e172f] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
              )}
            >
              {st === 'All' ? 'All Status' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting Cards List / Empty State */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading meeting feed...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e172f] border border-dashed border-slate-300 dark:border-white/15 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No meetings available
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              There are currently no company-scoped meetings scheduled for {user?.company_name || 'your organization'}.
            </p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Meeting</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 rounded-md',
                      meeting.meeting_type === 'Onboarding'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : meeting.meeting_type === '1:1 Sync'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                    )}
                  >
                    {meeting.meeting_type}
                  </span>

                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      meeting.status === 'COMPLETED'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : meeting.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 animate-pulse'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {meeting.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {meeting.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(meeting.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{meeting.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Host: {meeting.organizer}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[200px]">{meeting.location_or_url}</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Participants ({meeting.participants.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {meeting.participants.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                {meeting.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => handleUpdateStatus(meeting.id, 'COMPLETED')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Concluded
                  </span>
                )}

                <a
                  href={`#join-${meeting.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success(`Joining session: ${meeting.title}`);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Join Room</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e172f] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Schedule New Company Meeting
                  </h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Day 1 Orientation & IT Sync"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Date *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM – 11:00 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Meeting Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) =>
                        setNewType(e.target.value as CompanyMeetingRecord['meeting_type'])
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Onboarding">Onboarding</option>
                      <option value="1:1 Sync">1:1 Sync</option>
                      <option value="Department Review">Department Review</option>
                      <option value="All Hands">All Hands</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Location / Room
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Participants (comma-separated names/emails)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe, Sarah Smith, Engineering Team"
                    value={newParticipants}
                    onChange={(e) => setNewParticipants(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/25 transition-colors cursor-pointer"
                  >
                    Save & Schedule
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
