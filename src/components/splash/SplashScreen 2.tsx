'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './splash-screen.module.css';

interface SplashScreenProps {
  ready: boolean;
  onComplete: () => void;
}

export function SplashScreen({ ready, onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [logoAvailable, setLogoAvailable] = useState(true);

  useEffect(() => {
    if (!ready || isExiting) return;

    const timer = window.setTimeout(() => setIsExiting(true), 1650);
    return () => window.clearTimeout(timer);
  }, [isExiting, ready]);

  useEffect(() => {
    if (!isExiting) return;

    const timer = window.setTimeout(onComplete, 380);
    return () => window.clearTimeout(timer);
  }, [isExiting, onComplete]);

  return (
    <main
      className={`${styles.splash} ${isExiting ? styles.exiting : ''}`}
      role="status"
      aria-label="Preparing your journey"
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        {logoAvailable && (
          <Image
            className={styles.logo}
            src="/branding/genesis-logo.png"
            alt="Genesis — New Beginnings · Creation"
            width={1400}
            height={540}
            priority
            onError={() => setLogoAvailable(false)}
          />
        )}
        <p className={styles.loadingText}>Preparing your journey...</p>
        <div className={styles.progressTrack} aria-hidden="true">
          <span className={styles.progressBar} />
        </div>
      </div>
    </main>
  );
}
