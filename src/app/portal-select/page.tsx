'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context';
import './portal-selection.css';

export default function PortalSelectPage() {
  const router = useRouter();
  const { setSessionUser } = useAuth();

  const handleSelectPortal = (portalId: 'employee' | 'hr') => {
    if (portalId === 'hr') {
      router.push('/hr/login');
    } else {
      router.push('/employee/login');
    }
  };

  const portals = [
    {
      id: 'employee' as const,
      title: 'Employee Portal',
      subtitle: 'For new joiners & team members',
      description: 'Follow your onboarding journey, complete assigned tasks, explore resources, and track your progress.',
      icon: Users,
    },
    {
      id: 'hr' as const,
      title: 'HR & Administrator Portal',
      subtitle: 'For HR & people operations',
      description: 'Manage employees, onboarding journeys, assigned tasks, and organizational resources from one workspace.',
      icon: LayoutDashboard,
    },
  ];

  return (
    <main className="genesis-portal-select">
      <div className="genesis-portal-shell">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="genesis-portal-header"
        >
          <Image
            className="genesis-portal-logo"
            src="/branding/genesis-logo-transparent.png"
            alt="GENESIS, New Beginnings · Creation"
            width={1408}
            height={768}
            priority
          />
          <h1>Welcome to the Genesis Portal</h1>
          <p>Please Select Your Access</p>
        </motion.div>

        <div className="genesis-portal-grid">
          {portals.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.article
                key={portal.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`genesis-portal-card genesis-portal-card--${portal.id}`}
              >
                <div className="genesis-portal-card__icon">
                  <Icon aria-hidden="true" />
                </div>
                <h2>{portal.title}</h2>
                <p className="genesis-portal-card__subtitle">{portal.subtitle}</p>
                <p className="genesis-portal-card__description">{portal.description}</p>
                <div className="genesis-portal-card__action">
                  <button type="button" onClick={() => handleSelectPortal(portal.id)}>
                    Login
                    <ArrowRight aria-hidden="true" />
                  </button>
                  {portal.id === 'employee' && (
                    <button type="button" onClick={() => handleSelectPortal('employee')}>
                      New User Request
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
