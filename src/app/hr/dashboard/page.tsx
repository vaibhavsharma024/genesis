'use client';

import React, { Suspense } from 'react';
import MindMapDashboard from '@/components/hr/MindMapDashboard';

export default function HRDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading HR Mind Map Hub...</span>
        </div>
      </div>
    }>
      <MindMapDashboard />
    </Suspense>
  );
}
