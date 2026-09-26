'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './splash-screen.css';

export function SplashScreen() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('genesis-splash-seen')) {
      router.replace('/portal-select');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const exitTimer = window.setTimeout(() => setIsExiting(true), prefersReducedMotion ? 480 : 1320);
    const navigationTimer = window.setTimeout(() => {
      sessionStorage.setItem('genesis-splash-seen', 'true');
      router.replace('/portal-select');
    }, prefersReducedMotion ? 760 : 1740);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <main
      className={`genesis-splash${isExiting ? ' genesis-splash--exiting' : ''}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="genesis-splash__content">
        <div className="genesis-splash__logo-wrap">
          <span className="genesis-splash__glow" aria-hidden="true" />
          <Image
            className="genesis-splash__logo"
            src="/branding/genesis-logo-transparent.png"
            alt="Genesis, New Beginnings · Creation"
            width={1408}
            height={768}
            priority
          />
        </div>
        <div className="genesis-splash__loading" role="status">
          <p>Preparing your journey...</p>
          <span className="genesis-splash__progress" aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}