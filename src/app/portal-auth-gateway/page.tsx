'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Sparkles, ArrowRight, ArrowLeft, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/context';
import toast from 'react-hot-toast';

function AuthGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');
  const isHR = portalParam === 'hr';

  const { loginEmployee, loginHR, setSessionUser } = useAuth();

  // Mode: gateway options or direct sign-in form
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. "Sign In" directly bypasses setup and navigates straight to Dashboard
  const handleQuickSignInBypass = async () => {
    setIsLoading(true);
    if (isHR) {
      const authUser = {
        id: `user-hr-${Date.now()}`,
        email: email || 'hr@company.com',
        role: 'hr_manager' as const,
        name: email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Priya Sharma',
      };
      setSessionUser(authUser);
      toast.success('Signed in successfully! Loading HR Dashboard...');
      router.push('/hr/dashboard');
    } else {
      const authUser = {
        id: `user-${Date.now()}`,
        email: email || 'employee@company.com',
        role: 'employee' as const,
        name: email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Employee User',
      };
      setSessionUser(authUser, {
        setup_completed: true,
      });
      toast.success('Signed in successfully! Navigating to Dashboard...');
      router.push('/employee/dashboard');
    }
    setIsLoading(false);
  };

  const handleCredentialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your work email and password.');
      return;
    }
    setIsLoading(true);
    if (isHR) {
      const res = await loginHR(email, password);
      setIsLoading(false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Welcome! Navigating to HR Command Center...');
        router.push('/hr/dashboard');
      }
    } else {
      const res = await loginEmployee(email, password);
      setIsLoading(false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Welcome! Navigating to Employee Dashboard...');
        router.push('/employee/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 ${isHR ? 'bg-emerald-600' : 'bg-violet-600'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 ${isHR ? 'bg-teal-600' : 'bg-blue-600'}`} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center font-black text-xl shadow-lg ${isHR ? 'from-emerald-500 to-teal-600' : 'from-violet-500 to-blue-600'}`}>
            G
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-white">GENESIS</div>
            <div className="text-xs text-slate-400">
              {isHR ? 'HR Operations & Management Portal' : 'Employee Journey & Onboarding Portal'}
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isHR ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-violet-500/10 text-violet-300 border-violet-500/30'}`}>
          {isHR ? 'HR Gateway' : 'Employee Gateway'}
        </span>
      </header>

      {/* Main Content: Two Clear Options */}
      <main className="relative z-10 max-w-3xl mx-auto w-full my-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            {isHR ? 'HR Authentication Gateway' : 'Welcome to Genesis'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
            Choose how you would like to proceed into your workspace
          </p>
        </div>

        {/* 2 Clear Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: Sign In (Directly bypasses setup & navigates straight to Dashboard) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 flex flex-col justify-between hover:border-violet-500/40 hover:bg-white/[0.06] transition-all group shadow-xl"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">1. Sign In</h2>
              <p className="text-xs font-medium text-violet-400 mb-3 uppercase tracking-wider">Returning User / Quick Access</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Already registered or looking to bypass onboarding setup? Sign in directly to launch straight into your live dashboard.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleQuickSignInBypass}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 cursor-pointer"
              >
                <span>Bypass Setup & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSignInModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white text-xs font-medium transition-colors text-center cursor-pointer"
              >
                Sign in with custom email / credentials
              </button>
            </div>
          </motion.div>

          {/* Option 2: First-Time Setup (Login & Register -> Opens onboarding wizard) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 flex flex-col justify-between hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all group shadow-xl"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">2. First-Time Setup</h2>
              <p className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Login & Register / New Joiner</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Brand new to Genesis? Configure your company profile, upload your avatar photo, enter your department and skills, and generate your 5-day journey.
              </p>
            </div>

            <button
              onClick={() => router.push('/employee/setup')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <span>First-Time Setup (Login & Register)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </main>

      {/* BOTTOM-RIGHT: "Back to Portal Selection" button as required */}
      <footer className="relative z-10 w-full flex items-center justify-between pt-6 border-t border-white/10">
        <div className="text-xs text-slate-500">
          Genesis Onboarding Architecture · Enterprise Ready
        </div>

        <button
          onClick={() => router.push('/portal-select')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-slate-300 hover:text-white transition-all text-xs font-semibold shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-violet-400" />
          <span>Back to Portal Selection</span>
        </button>
      </footer>

      {/* Modal for custom credentials if desired */}
      <AnimatePresence>
        {showSignInModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="font-bold text-white text-lg">Sign In with Credentials</h3>
                <button onClick={() => setShowSignInModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
              </div>

              {/* Zero Hardcoding: Inputs start completely blank! */}
              <form onSubmit={handleCredentialSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {isLoading ? 'Signing in...' : 'Sign In Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] flex items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    }>
      <AuthGatewayContent />
    </Suspense>
  );
}
