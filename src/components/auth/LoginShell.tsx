'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './login-shell.module.css';

interface LoginShellProps {
  portalName: string;
  onBack: () => void;
  children: ReactNode;
}

export function LoginShell({ portalName, onBack, children }: LoginShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <section className={styles.art} aria-label="Genesis clay characters">
          <div className={styles.artBrand}>
            <span className={styles.brandGlyph} aria-hidden="true"><i /><i /><i /></span>
            <span>GENESIS</span>
          </div>
          <p className={styles.artLabel}>{portalName}</p>
          <div className={styles.creatureStage} aria-hidden="true">
            <div className={`${styles.creature} ${styles.orange}`}><i className={styles.eye} /><i className={styles.eye} /><i className={styles.smile} /></div>
            <div className={`${styles.creature} ${styles.purple}`}><i className={styles.eye} /><i className={styles.eye} /><i className={styles.smile} /></div>
            <div className={`${styles.creature} ${styles.magenta}`}><i className={styles.eye} /><i className={styles.eye} /><i className={styles.smile} /></div>
            <div className={`${styles.creature} ${styles.yellow}`}><i className={styles.eye} /><i className={styles.eye} /><i className={styles.smile} /></div>
            <div className={styles.platform} />
            <span className={`${styles.spark} ${styles.sparkOne}`}>✳</span>
            <span className={`${styles.spark} ${styles.sparkTwo}`}>✦</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelTop}>
            <span>{portalName}</span>
            <button type="button" onClick={onBack} className={styles.backButton}>
              <ArrowLeft size={15} aria-hidden="true" />
              All portals
            </button>
          </div>
          <div className={styles.panelBrand} aria-hidden="true">
            <span className={styles.brandGlyph}><i /><i /><i /></span>
            <span>genesis</span>
          </div>
          <div className={styles.content}>{children}</div>
          <p className={styles.legal}>By continuing, you agree to Genesis’ terms and privacy policy.</p>
        </section>
      </div>
    </main>
  );
}
