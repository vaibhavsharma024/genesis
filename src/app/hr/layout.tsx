'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';
import PersistentTopRibbons from '@/components/navigation/PersistentTopRibbons';
import HRSidebar from '@/components/navigation/HRSidebar';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setSessionUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/hr/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && (!user || user.role !== 'hr_manager')) {
      router.push('/hr/login');
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#080d1a] text-slate-900 dark:text-white flex flex-col transition-colors duration-250">
      {/* Persistent Top Ribbon */}
      <PersistentTopRibbons />

      {/* Main Container with Left Sidebar */}
      <div className="flex-1 flex flex-row min-h-[calc(100vh-80px)] overflow-hidden relative">
        <HRSidebar />

        {/* Main HR page content */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
