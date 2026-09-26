'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';
import PersistentTopRibbons from '@/components/navigation/PersistentTopRibbons';

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
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#07070d] text-slate-900 dark:text-white flex flex-col transition-colors duration-250">
      {/* 3-TIER PERSISTENT 3D TOP RIBBONS */}
      <PersistentTopRibbons />

      {/* Main page content */}
      <main className="flex-1 w-full overflow-auto">
        {children}
      </main>
    </div>
  );
}
