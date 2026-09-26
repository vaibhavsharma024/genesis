import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Genesis — AI-Powered Onboarding Platform',
  description: 'From the First-Week Maze to a Clear Journey. Genesis transforms new employee onboarding with AI-powered personalization.',
  keywords: ['onboarding', 'HR', 'employee', 'AI', 'Genesis'],
  authors: [{ name: 'Genesis Team — Bennett University Hackathon 2026' }],
  openGraph: {
    title: 'Genesis — AI-Powered Onboarding Platform',
    description: 'From the First-Week Maze to a Clear Journey.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e1e2e',
              color: '#e2e8f0',
              border: '1px solid #2d2d3e',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
