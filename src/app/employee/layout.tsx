'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';
import PersistentTopRibbons from '@/components/navigation/PersistentTopRibbons';
import EmployeeSidebar from '@/components/navigation/EmployeeSidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setSessionUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/employee/login' || pathname === '/employee/setup';

  useEffect(() => {
    if (isPublicPage) return;
    if (!isLoading && !user) {
      router.push('/employee/login');
    }
  }, [user, isLoading, isPublicPage, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#080d1a] text-slate-900 dark:text-white flex flex-col transition-colors duration-250">
      {/* Persistent Top Ribbon */}
      <PersistentTopRibbons />

      {/* Horizontal Flex container with Left Sidebar */}
      <div className="flex-1 flex flex-row min-h-[calc(100vh-80px)] overflow-hidden relative">
        <EmployeeSidebar onOpenAi={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('genesis-open-ai'));
          }
        }} />

        {/* Main page content */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
