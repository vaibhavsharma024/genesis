'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';
import PersistentTopRibbons from '@/components/navigation/PersistentTopRibbons';

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
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#07070d] text-slate-900 dark:text-white flex flex-col transition-colors duration-250">
      {/* 3-TIER PERSISTENT 3D TOP RIBBONS */}
      <PersistentTopRibbons />

      {/* Main HR page content */}
      <main className="flex-1 w-full overflow-auto">
        {children}
      </main>
    </div>
  );
}
