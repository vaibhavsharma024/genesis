'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  User, Building, MapPin, Briefcase,
  Camera, Upload, X
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import toast from 'react-hot-toast';
import { LoginShell } from '@/components/auth/LoginShell';

export default function HRLoginPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Input state - 100% user-entered, zero hardcoded prefill
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [department, setDepartment] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loginHR, setSessionUser } = useAuth();
  const router = useRouter();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result as string);
        toast.success('Coordinator photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your HR work email and password.');
      return;
    }
    setIsLoading(true);
    const result = await loginHR(email.trim(), password, {
      profile_photo: profilePhoto || undefined,
    });
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Welcome! HR Command Center loaded.');
      router.push('/hr/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your coordinator full name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your work email and password.');
      return;
    }
    if (!companyName.trim()) {
      toast.error('Please enter your organization / company name.');
      return;
    }

    setIsLoading(true);

    const authUser = {
      id: `user-hr-${Date.now()}`,
      email: email.trim(),
      role: 'hr_manager' as const,
      name: fullName.trim(),
      profile_photo: profilePhoto || undefined,
      company_name: companyName.trim(),
      branch_name: branchName.trim() || 'Global HQ',
      department_name: department.trim() || 'People Operations',
    };

    // Save directly to HR registry
    try {
      const reg = localStorage.getItem('genesis_registered_hr');
      const all = reg ? JSON.parse(reg) : {};
      all[email.toLowerCase()] = authUser;
      localStorage.setItem('genesis_registered_hr', JSON.stringify(all));
    } catch {}

    setSessionUser(authUser);
    setIsLoading(false);
    toast.success(`Welcome, ${fullName.trim()}! HR Command Workspace configured.`);
    router.push('/hr/dashboard');
  };

  // Reusable Photo Picker for HR login
  const renderPhotoPicker = () => (
    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Coordinator Photo</span>
        </label>
        {profilePhoto && (
          <button
            type="button"
            onClick={() => setProfilePhoto('')}
            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Photo Preview Box (Starts completely blank until uploaded) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-14 h-14 rounded-2xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group flex-shrink-0 transition-all shadow-md"
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile preview" className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <LoginShell portalName="HR MANAGER" onBack={() => router.push('/portal-select')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="genesis-auth-content space-y-6"
        >
          <div className="text-center space-y-1">
            <h1>{authMode === 'signin' ? 'Welcome back!' : 'Create your account'}</h1>
            <p>
              {authMode === 'signin'
                ? 'Please enter your details'
                : 'Set up your profile and organization'}
            </p>
          </div>

          {/* Form */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="hr-email" className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="hr-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="hr@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hr-password" className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="hr-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="genesis-login-options">
                <label><input type="checkbox" /><span>Remember me</span></label>
                <button type="button" onClick={() => toast('Password recovery is not configured for demo accounts.')}>Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Log in'}</span>
              </button>

            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* PROFILE PHOTO IN HR SIGN UP */}
              {renderPhotoPicker()}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Coordinator Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">HR Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. hr-lead@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. Genesis Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Campus / Branch</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={branchName}
                      onChange={e => setBranchName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="e.g. Global HQ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. People Operations"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Configuring portal...' : 'Register as HR Lead & Launch'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-slate-400 text-xs">
              Employee?{' '}
              <button
                type="button"
                onClick={() => router.push('/employee/login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
              >
                Switch to Employee Portal
              </button>
            </p>
          </div>
        </motion.div>
    </LoginShell>
  );
}
