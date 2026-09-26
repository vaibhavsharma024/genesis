'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoginShellProps {
  portalName: string;
  onBack: () => void;
  children: ReactNode;
}

export function LoginShell({ portalName, onBack, children }: LoginShellProps) {
  return (
    <main className="genesis-login-page">
      <div className="genesis-login-shell">
        <section className="genesis-login-art" aria-label="Colorful Genesis characters">
          <div className="genesis-login-brand genesis-login-brand-art">
            <span className="genesis-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>genesis</span>
          </div>
          <div className="genesis-art-copy">
            <p className="genesis-art-eyebrow">A FRESH START, EVERY DAY</p>
            <h2>Good things<br />grow together.</h2>
            <p>Your next chapter starts with a<br />more human kind of work.</p>
          </div>
          <div className="genesis-creature-scene" aria-hidden="true">
            <span className="genesis-spark genesis-spark-one">✳</span>
            <span className="genesis-spark genesis-spark-two">✦</span>
            <div className="genesis-creature genesis-creature-orange"><i className="creature-eye eye-left" /><i className="creature-eye eye-right" /><i className="creature-mouth" /></div>
            <div className="genesis-creature genesis-creature-purple"><i className="creature-eye eye-left" /><i className="creature-eye eye-right" /><i className="creature-mouth" /></div>
            <div className="genesis-creature genesis-creature-pink"><i className="creature-eye eye-left" /><i className="creature-eye eye-right" /><i className="creature-mouth" /></div>
            <div className="genesis-creature genesis-creature-yellow"><i className="creature-eye eye-left" /><i className="creature-eye eye-right" /><i className="creature-mouth" /></div>
            <div className="genesis-art-platform" />
          </div>
          <p className="genesis-art-caption">A little more human, from day one.</p>
        </section>

        <section className="genesis-login-panel">
          <div className="genesis-login-panel-top">
            <span className="genesis-portal-label">{portalName}</span>
            <button type="button" onClick={onBack} className="genesis-back-link">
              <ArrowLeft size={15} aria-hidden="true" />
              All portals
            </button>
          </div>
          <div className="genesis-login-brand genesis-login-brand-panel">
            <span className="genesis-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>genesis</span>
          </div>
          {children}
          <p className="genesis-login-legal">By continuing, you agree to Genesis’ terms and privacy policy.</p>
        </section>
      </div>
    </main>
  );
}
