'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  User, Building, MapPin, Briefcase, BadgeCheck,
  LogIn, UserPlus, Camera, Upload, X
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import toast from 'react-hot-toast';
import { LoginShell } from '@/components/auth/LoginShell';

export default function EmployeeLoginPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Input state - 100% user-entered, zero hardcoded prefill
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [department, setDepartment] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loginEmployee, setSessionUser } = useAuth();
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
        toast.success('Profile photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your work email and password.');
      return;
    }
    setIsLoading(true);
    const result = await loginEmployee(email.trim(), password, {
      profile_photo: profilePhoto || undefined,
    });
    setIsLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Signed in successfully! 👋');
      router.push('/employee/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your work email and password.');
      return;
    }
    if (!companyName.trim()) {
      toast.error('Please enter your company / organization name.');
      return;
    }

    setIsLoading(true);

    const userObj = {
      id: `user-${Date.now()}`,
      email: email.trim(),
      role: 'employee' as const,
      name: fullName.trim(),
      profile_photo: profilePhoto || undefined,
      company_name: companyName.trim(),
      branch_name: branchName.trim() || 'Main Campus',
      department_name: department.trim() || 'Engineering',
    };

    const empObj = {
      id: userObj.id,
      user_id: userObj.id,
      company_id: 'org-current',
      name: fullName.trim(),
      email: email.trim(),
      profile_photo: profilePhoto || undefined,
      company_name: companyName.trim(),
      branch_name: branchName.trim() || 'Main Campus',
      department_name: department.trim() || 'Engineering',
      role: roleTitle.trim() || 'Team Member',
      start_date: new Date().toISOString(),
      onboarding_day: 1,
      total_days: 5,
      progress_percentage: 0,
      status: 'ACTIVE' as const,
      setup_completed: true,
    };

    // Save directly to user registry
    try {
      const reg = localStorage.getItem('genesis_registered_users');
      const all = reg ? JSON.parse(reg) : {};
      all[email.toLowerCase()] = empObj;
      localStorage.setItem('genesis_registered_users', JSON.stringify(all));
    } catch {}

    setSessionUser(userObj, empObj);
    setIsLoading(false);
    toast.success(`Welcome, ${fullName.trim()}! Workspace ready.`);
    router.push('/employee/dashboard');
  };

  // Reusable Profile Photo Picker Block
  const renderPhotoPicker = () => (
    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-violet-400" />
          <span>Profile Photo</span>
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
          className="relative w-14 h-14 rounded-2xl border-2 border-dashed border-violet-500/50 hover:border-violet-400 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group flex-shrink-0 transition-all shadow-md"
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
            className="text-xs px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from Device</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <LoginShell portalName="EMPLOYEE PORTAL" onBack={() => router.push('/portal-select')}>
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
                : 'Set up your profile and workspace'}
            </p>
          </div>

          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Registration</span>
            </button>
          </div>

          {/* Form */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="employee-email" className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="employee-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="employee-password" className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="employee-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
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

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  New team member?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-violet-400 hover:text-violet-300 font-semibold underline cursor-pointer"
                  >
                    Create account here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* PROFILE PHOTO IN SIGN UP */}
              {renderPhotoPicker()}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="e.g. Vanshika Gupta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="e.g. vanshika@google.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Org *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="e.g. Google"
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
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="e.g. Metro Campus"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Job Role / Title</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={e => setRoleTitle(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="e.g. Software Developer"
                    />
                  </div>
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Creating workspace...' : 'Register & Enter Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-violet-400 hover:text-violet-300 font-semibold underline cursor-pointer"
                  >
                    Sign in to account
                  </button>
                </p>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-slate-400 text-xs">
              HR Manager?{' '}
              <button
                type="button"
                onClick={() => router.push('/hr/login')}
                className="text-violet-400 hover:text-violet-300 font-semibold underline cursor-pointer"
              >
                Switch to HR Portal
              </button>
            </p>
          </div>
        </motion.div>
    </LoginShell>
  );
}
