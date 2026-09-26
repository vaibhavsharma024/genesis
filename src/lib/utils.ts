import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return formatDate(d);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getDaysSinceJoining(joiningDate: string): number {
  const joined = new Date(joiningDate);
  const now = new Date();
  const diff = now.getTime() - joined.getTime();
  return Math.floor(diff / 86400000) + 1; // +1 for Day 1
}

export function getOnboardingDay(joiningDate: string): number {
  const days = getDaysSinceJoining(joiningDate);
  return Math.min(days, 5);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    LOCKED: 'text-gray-400 bg-gray-100 dark:bg-gray-800',
    READY: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    IN_PROGRESS: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    BLOCKED: 'text-red-600 bg-red-50 dark:bg-red-900/30',
    COMPLETED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
    OVERDUE: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
    // Support
    REQUESTED: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
    AI_REVIEWING: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30',
    HUMAN_REQUIRED: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    ASSIGNED: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30',
    IN_PROGRESS_SUPPORT: 'text-amber-600 bg-amber-50',
    RESOLVED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
    CLOSED: 'text-gray-600 bg-gray-50 dark:bg-gray-800',
    // Resource
    Provided: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
    Pending: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
    'Not Provided': 'text-gray-500 bg-gray-50 dark:bg-gray-800',
    'Action Required': 'text-red-600 bg-red-50 dark:bg-red-900/30',
    // Location
    Open: 'text-emerald-600 bg-emerald-50',
    Closed: 'text-red-600 bg-red-50',
    'Closing Soon': 'text-amber-600 bg-amber-50',
    '24/7': 'text-violet-600 bg-violet-50',
  };
  return map[status] || 'text-gray-600 bg-gray-50';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-amber-500',
    critical: 'text-red-500',
  };
  return map[priority] || 'text-gray-500';
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    HR: '👥',
    IT: '💻',
    Security: '🔒',
    Team: '🤝',
    Role: '🎯',
    Training: '📚',
    Administrative: '📋',
    Facilities: '🏢',
  };
  return map[category] || '📌';
}

export function getDayTheme(day: number): { label: string; from: string; to: string; color: string } {
  const themes: Record<number, { label: string; from: string; to: string; color: string }> = {
    1: { label: 'HR & Documentation', from: 'HR', to: 'IT', color: 'from-violet-500 to-purple-600' },
    2: { label: 'IT Setup', from: 'IT', to: 'Security', color: 'from-blue-500 to-cyan-600' },
    3: { label: 'Security', from: 'Security', to: 'Team', color: 'from-red-500 to-orange-600' },
    4: { label: 'Team Integration', from: 'Team', to: 'Role', color: 'from-emerald-500 to-teal-600' },
    5: { label: 'Role Setup', from: 'Role', to: 'Ready!', color: 'from-amber-500 to-yellow-600' },
  };
  return themes[day] || themes[1];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
