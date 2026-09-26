'use client';

import React from 'react';
import { AuthProvider, EmployeeDataProvider } from '@/lib/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EmployeeDataProvider>
        {children}
      </EmployeeDataProvider>
    </AuthProvider>
  );
}
