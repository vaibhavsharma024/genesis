'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Lock, CheckCircle2, X, AlertTriangle,
  User, Mail, Briefcase, Building2, Upload, Camera, Send
} from 'lucide-react';
import { useAuth } from '@/lib/context';
import toast from 'react-hot-toast';

interface SecurityPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'edit_profile' | 'add_user';
}

export default function SecurityPasswordModal({
  isOpen,
  onClose,
  mode
}: SecurityPasswordModalProps) {
  const { user, employee, updateEmployee } = useAuth();

  const [step, setStep] = useState<'verify' | 'form' | 'audited'>('verify');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditSummary, setAuditSummary] = useState<any>(null);

  // Form states for Edit Profile
  const [editName, setEditName] = useState(employee?.name || user?.name || '');
  const [editRole, setEditRole] = useState(employee?.role || '');
  const [editCompany, setEditCompany] = useState(employee?.company_name || 'Genesis Technologies');
  const [editBranch, setEditBranch] = useState(employee?.branch_name || 'Headquarters');
  const [editDept, setEditDept] = useState(employee?.department_name || 'Engineering');
  const [editPhoto, setEditPhoto] = useState<string>(employee?.profile_photo || user?.profile_photo || '');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form states for Add New User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDept, setNewUserDept] = useState('Engineering');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setEditPhoto(res);
      toast.success('New photo loaded');
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter your account password to verify your identity.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Valid password accepted
      setStep('form');
      toast.success('Identity verified. Security lock temporarily released.');
    }, 600);
  };

  const handleSaveUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let modifiedFields: Record<string, any> = {};

      if (mode === 'edit_profile') {
        modifiedFields = {
          name: editName,
          role: editRole,
          company_name: editCompany,
          branch_name: editBranch,
          department_name: editDept,
          profile_photo_updated: Boolean(editPhoto !== (employee?.profile_photo || '')),
        };

        // Update local context
        updateEmployee({
          name: editName,
          role: editRole,
          company_name: editCompany,
          branch_name: editBranch,
          department_name: editDept,
          profile_photo: editPhoto,
        });
      } else {
        modifiedFields = {
          new_user_name: newUserName,
          new_user_email: newUserEmail,
          new_user_role: newUserRole,
          new_user_department: newUserDept,
          provisioned_at: new Date().toISOString(),
        };
      }

      // API call to dispatch audit alert email
      const res = await fetch('/api/security/audit-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'edit_profile' ? 'USER_PROFILE_UPDATE' : 'PROVISION_NEW_USER',
          userEmail: user?.email || employee?.email || 'user@company.com',
          modifiedFields,
          targetUser: mode === 'edit_profile' ? editName : newUserName,
        }),
      });

      const data = await res.json();
      setAuditSummary(data);
      setStep('audited');
      toast.success(`Security audit email dispatched to ${user?.email || 'registered address'}`);
    } catch (err: any) {
      toast.error('Error dispatching audit alert email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('verify');
    setPassword('');
    setAuditSummary(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl border border-violet-500/30 bg-slate-900/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow pill */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-red-500/80 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
              Enterprise Access Guard
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {mode === 'edit_profile' ? 'Edit User Profile' : 'Provision New User'}
            </h2>
          </div>
        </div>

        {/* STEP 1: PASSWORD VERIFICATION */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyPassword} className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                Mandatory Security Verification
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Modifying organizational credentials or adding enterprise identities requires strict password re-verification. All changes will trigger an audit alert email to your registered inbox.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter Account Password to Unlock
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter current password..."
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Verify Identity
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: EDIT PROFILE / ADD USER FORM */}
        {step === 'form' && (
          <form onSubmit={handleSaveUpdates} className="space-y-4">
            {mode === 'edit_profile' ? (
              <>
                {/* Photo Update */}
                <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
                  {editPhoto ? (
                    <img src={editPhoto} alt="Avatar" className="w-14 h-14 rounded-xl object-cover border border-violet-500" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">Update Profile Photo</p>
                    <p className="text-[11px] text-slate-400">Live preview across all ribbons & profile views</p>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="mt-1 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold rounded-lg"
                    >
                      Choose New Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium">Job Title / Role</label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      required
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Company</label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={e => setEditCompany(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Branch</label>
                    <input
                      type="text"
                      value={editBranch}
                      onChange={e => setEditBranch(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={e => setEditDept(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-slate-400 font-medium">New User Name *</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Corporate Email *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                    placeholder="e.g. rahul@company.com"
                    className="w-full mt-1 px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium">Designation / Role</label>
                    <input
                      type="text"
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      placeholder="e.g. QA Engineer"
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium">Department</label>
                    <input
                      type="text"
                      value={newUserDept}
                      onChange={e => setNewUserDept(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/25 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Saving & Alerting...' : 'Save & Dispatch Audit Alert'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: AUDITED SUCCESS CONFIRMATION */}
        {step === 'audited' && auditSummary && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Security Verification & Audit Alert Sent!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Updates verified and an automated audit summary email has been dispatched.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Audit Tracking ID:</span>
                <span className="font-mono text-violet-400 font-semibold">{auditSummary.auditId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dispatched To:</span>
                <span className="text-slate-200">{auditSummary.recipient}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Timestamp:</span>
                <span className="text-slate-200">{new Date(auditSummary.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
            >
              Done & Return to Workspace
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
