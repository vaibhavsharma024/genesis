'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Briefcase, User, Award,
  Code2, Laptop, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, Shield, Rocket, Clock, Star, Camera, Upload, X, Calendar, Hash
} from 'lucide-react';
import { MOCK_COMPANIES, MOCK_BRANCHES, MOCK_DEPARTMENTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Welcome', desc: 'Journey Introduction' },
  { id: 2, title: 'Company', desc: 'Organization Details' },
  { id: 3, title: 'Office', desc: 'Campus & Location' },
  { id: 4, title: 'Department', desc: 'Team Assignment' },
  { id: 5, title: 'Profile', desc: 'Photo, Role & Identity' },
  { id: 6, title: 'Experience', desc: 'Seniority Level' },
  { id: 7, title: 'Projects', desc: 'Past Work' },
  { id: 8, title: 'Skills', desc: 'Tech Stack' },
  { id: 9, title: 'Resources', desc: 'Equipment Checklist' },
];

const SKILL_OPTIONS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js',
  'Python', 'Go', 'Docker', 'Kubernetes', 'AWS', 'GCP',
  'PostgreSQL', 'GraphQL', 'TailwindCSS', 'Figma', 'System Design'
];

const RESOURCE_OPTIONS = [
  'MacBook Pro / Surface Laptop', 'Single Sign-On (SSO) Account',
  'GitHub Enterprise Access', 'Access Security RFID Badge',
  'Slack / Teams Workspace', 'Cloud Infrastructure Access',
  'Ergonomic Desk Setup', 'Corporate Credit Card'
];

export default function EmployeeSetupWizard() {
  const router = useRouter();
  const { setSessionUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ZERO HARDCODING: All fields start completely blank!
  const [companyName, setCompanyName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Profile fields (Blank)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [workType, setWorkType] = useState<'hybrid' | 'on-site' | 'remote' | ''>('');

  // Experience, Projects, Skills (Blank)
  const [experienceType, setExperienceType] = useState<'experienced' | 'fresher' | ''>('');
  const [yearsExp, setYearsExp] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectImpact, setProjectImpact] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfilePhoto(result);
      toast.success('Profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    // Validate required steps if needed
    if (currentStep === 2 && !companyName.trim()) {
      toast.error('Please enter or select your organization name.');
      return;
    }
    if (currentStep === 3 && !branchName.trim()) {
      toast.error('Please enter or select your branch/office location.');
      return;
    }
    if (currentStep === 4 && !departmentName.trim()) {
      toast.error('Please enter or select your department.');
      return;
    }
    if (currentStep === 5 && (!name.trim() || !email.trim())) {
      toast.error('Please provide your full name and corporate email.');
      return;
    }

    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Step 9 finish -> synthesize
      setIsSynthesizing(true);
      setTimeout(() => {
        setIsSynthesizing(false);

        const finalCompanyName = companyName.trim() || 'Genesis Technologies';
        const finalBranchName = branchName.trim() || 'Headquarters';
        const finalDeptName = departmentName.trim() || 'Engineering';

        const authUser = {
          id: `user-${Date.now()}`,
          email: email.trim(),
          role: 'employee' as const,
          name: name.trim(),
          profile_photo: profilePhoto || undefined,
          company_name: finalCompanyName,
          branch_name: finalBranchName,
          department_name: finalDeptName,
        };

        setSessionUser(authUser, {
          name: name.trim(),
          email: email.trim(),
          employee_id: employeeId.trim() || `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
          role: role.trim() || 'Software Engineer',
          joining_date: joiningDate || new Date().toISOString().split('T')[0],
          company_id: selectedCompanyId || 'company-custom',
          company_name: finalCompanyName,
          branch_id: selectedBranchId || 'branch-custom',
          branch_name: finalBranchName,
          department_id: selectedDeptId || 'dept-custom',
          department_name: finalDeptName,
          work_type: (workType || 'hybrid') as any,
          profile_photo: profilePhoto || undefined,
          setup_completed: true,
        });

        toast.success('Your personalized 5-Day Onboarding Journey has been generated!');
        router.push('/employee/dashboard');
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      const val = customSkillInput.trim();
      if (!selectedSkills.includes(val)) {
        setSelectedSkills(prev => [...prev, val]);
      }
      setCustomSkillInput('');
    }
  };

  const toggleResource = (res: string) => {
    setSelectedResources(prev =>
      prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
    );
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-violet-500/20">
            G
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight">GENESIS SETUP</h1>
            <p className="text-xs text-slate-400">Step {currentStep} of 9 — {STEPS[currentStep - 1].desc}</p>
          </div>
        </div>
        <div className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
          {Math.round((currentStep / 9) * 100)}% Completed
        </div>
      </div>

      {/* Main Step Body */}
      <div className="max-w-2xl mx-auto w-full my-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Welcome to Genesis</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  From the First-Week Maze to a Clear Journey. Enter your company and role details to customize your personalized 5-day onboarding roadmap.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 text-left">
                {[
                  { title: 'Tailored Journey', desc: '5 milestone days with zero ambiguity' },
                  { title: 'Ask Genesis AI', desc: 'Instant answers grounded in company policy' },
                  { title: 'Campus Routing', desc: 'Real-time open status and floor directions' },
                ].map((f, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-xs font-bold text-violet-300">{f.title}</p>
                    <p className="text-[11px] text-slate-400">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: COMPANY (Zero Hardcoding) */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Organization Details</h2>
                <p className="text-slate-400 text-xs">Enter your employer name or select from popular setups</p>
              </div>

              {/* Custom Input */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-violet-400" />
                  Your Company / Employer Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => {
                    setCompanyName(e.target.value);
                    setSelectedCompanyId('company-custom');
                  }}
                  placeholder="e.g. Acme Innovations, Microsoft, Tech Corp..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#050508] px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">Or pick template</span>
              </div>

              <div className="grid gap-2.5">
                {MOCK_COMPANIES.map(company => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompanyId(company.id);
                      setCompanyName(company.name);
                    }}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer',
                      companyName === company.name
                        ? 'border-violet-500 bg-violet-500/15 shadow-md shadow-violet-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-sm text-white">
                        {company.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{company.name}</p>
                        <p className="text-xs text-slate-400">{company.description}</p>
                      </div>
                    </div>
                    {companyName === company.name && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: BRANCH / OFFICE (Zero Hardcoding) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Office Campus & Location</h2>
                <p className="text-slate-400 text-xs">Working hours and floor routing will be centered around this facility</p>
              </div>

              {/* Custom Input */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  Your Campus / Branch Location *
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => {
                    setBranchName(e.target.value);
                    setSelectedBranchId('branch-custom');
                  }}
                  placeholder="e.g. Bangalore Tech Park, Noida Sector 62, Austin Campus..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#050508] px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">Or pick template</span>
              </div>

              <div className="grid gap-2.5">
                {MOCK_BRANCHES.slice(0, 4).map(branch => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setBranchName(`${branch.name} — ${branch.city}`);
                    }}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer',
                      branchName.includes(branch.name)
                        ? 'border-violet-500 bg-violet-500/15'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="font-bold text-sm text-white">{branch.name} — {branch.city}</p>
                        <p className="text-xs text-slate-400">{branch.address}</p>
                      </div>
                    </div>
                    {branchName.includes(branch.name) && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: DEPARTMENT (Zero Hardcoding) */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Department & Unit</h2>
                <p className="text-slate-400 text-xs">Directs buddy assignments, tools checklist, and team channels</p>
              </div>

              {/* Custom Input */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  Your Department / Team Name *
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={e => {
                    setDepartmentName(e.target.value);
                    setSelectedDeptId('dept-custom');
                  }}
                  placeholder="e.g. Cloud Infrastructure, Product Design, Security Operations..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#050508] px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">Or pick template</span>
              </div>

              <div className="grid gap-2.5">
                {MOCK_DEPARTMENTS.slice(0, 4).map(dept => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      setDepartmentName(dept.name);
                    }}
                    className={cn(
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer',
                      departmentName === dept.name
                        ? 'border-violet-500 bg-violet-500/15'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div>
                      <p className="font-bold text-sm text-white">{dept.name}</p>
                      <p className="text-xs text-slate-400">{dept.description}</p>
                    </div>
                    {departmentName === dept.name && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: PROFILE PHOTO & DETAILS (Zero Hardcoding + Profile Photo Upload) */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-2xl font-bold">Profile & Identity</h2>
                <p className="text-slate-400 text-xs">Upload your profile image and fill in your identification details</p>
              </div>

              {/* Profile Photo Upload with Live Preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  {profilePhoto ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-violet-500 shadow-lg shadow-violet-500/30">
                      <img
                        src={profilePhoto}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500 rounded-full text-white transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-slate-700 hover:border-violet-500/50 transition-colors cursor-pointer"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
                    <p className="text-xs text-slate-400">
                      Upload avatar for your persistent 3D ribbons, badge, and directory view
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {profilePhoto ? 'Change Photo' : 'Upload Image'}
                    </button>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity Form (Blank inputs) */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-violet-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Navya Verma"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" /> Job Title / Role *
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">Corporate Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. navya@company.com"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-violet-400" /> Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-98214"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" /> Joining Date
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={e => setJoiningDate(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Work Arrangement</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['hybrid', 'on-site', 'remote'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setWorkType(type)}
                        className={cn(
                          'py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer',
                          workType === type
                            ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: EXPERIENCE */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-2xl font-bold">Experience Level</h2>
                <p className="text-slate-400 text-xs">Determines whether starter trainings or accelerated milestones are queued</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setExperienceType('experienced')}
                  className={cn(
                    'p-5 rounded-2xl border text-left transition-all space-y-2 cursor-pointer',
                    experienceType === 'experienced'
                      ? 'border-violet-500 bg-violet-500/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <Briefcase className="w-6 h-6 text-violet-400" />
                  <p className="font-bold text-white text-sm">Experienced Professional</p>
                  <p className="text-xs text-slate-400">Fast-tracked technical onboarding with focus on architecture & production</p>
                </button>
                <button
                  type="button"
                  onClick={() => setExperienceType('fresher')}
                  className={cn(
                    'p-5 rounded-2xl border text-left transition-all space-y-2 cursor-pointer',
                    experienceType === 'fresher'
                      ? 'border-violet-500 bg-violet-500/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <Award className="w-6 h-6 text-blue-400" />
                  <p className="font-bold text-white text-sm">Graduate / Fresher</p>
                  <p className="text-xs text-slate-400">Step-by-step guidance, deep-dive buddy sessions, and hands-on lab orientation</p>
                </button>
              </div>

              {experienceType === 'experienced' && (
                <div className="pt-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="text-xs text-slate-300 font-medium">Total Years of Experience: {yearsExp} years</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={yearsExp || 1}
                    onChange={e => setYearsExp(Number(e.target.value))}
                    className="w-full mt-2 accent-violet-500"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: PROJECTS */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-2xl font-bold">Past Work & Portfolio</h2>
                <p className="text-slate-400 text-xs">Optional: showcase past achievements for your internal intro card</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Key Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Distributed Analytics Platform"
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium">Business Impact / Metric</label>
                <input
                  type="text"
                  value={projectImpact}
                  onChange={e => setProjectImpact(e.target.value)}
                  placeholder="e.g. Reduced API latency by 45% across 2M daily queries"
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 8: SKILLS (Zero Prefill: starts empty, selectable + custom input) */}
          {currentStep === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 mb-2">
                <h2 className="text-2xl font-bold">Skills Inventory</h2>
                <p className="text-slate-400 text-xs">Pick or type your technical and operational competencies</p>
              </div>

              {/* Custom skill adder */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={e => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
                      setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
                      setCustomSkillInput('');
                    }
                  }}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {/* Available skill chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {SKILL_OPTIONS.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/20 text-violet-300 shadow-sm'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      )}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              {selectedSkills.length > 0 && (
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                  <p className="text-xs text-violet-300 font-semibold mb-1">Selected Skills ({selectedSkills.length}):</p>
                  <p className="text-xs text-slate-300">{selectedSkills.join(', ')}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 9: RESOURCES CHECKLIST */}
          {currentStep === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-2xl font-bold">Equipment & Access Checklist</h2>
                <p className="text-slate-400 text-xs">Select items you will need prepared before Day 1</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {RESOURCE_OPTIONS.map(res => {
                  const isChecked = selectedResources.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      onClick={() => toggleResource(res)}
                      className={cn(
                        'p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer',
                        isChecked
                          ? 'border-violet-500 bg-violet-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      )}
                    >
                      <span>{res}</span>
                      <div className={cn(
                        'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                        isChecked ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-600'
                      )}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1 || isSynthesizing}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold transition-all',
            currentStep === 1
              ? 'opacity-30 cursor-not-allowed text-slate-600'
              : 'hover:bg-white/5 text-slate-300 hover:text-white'
          )}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSynthesizing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSynthesizing ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Synthesizing 5-Day Roadmap...
            </span>
          ) : currentStep === 9 ? (
            <span className="flex items-center gap-2">
              Complete & Launch Genesis <Rocket className="w-4 h-4" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
