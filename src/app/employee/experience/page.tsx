'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Code2, Star, Trophy, Users, Calendar, Plus, Trash2,
  FolderGit2, Sparkles, Building, MapPin, X
} from 'lucide-react';
import { useAuth, useEmployeeData } from '@/lib/context';
import { cn, formatDate, getInitials } from '@/lib/utils';
import type { SkillProficiency, ProjectType } from '@/types';
import toast from 'react-hot-toast';

export default function ExperiencePage() {
  const { user, employee } = useAuth();
  const {
    experience, addExperience, deleteExperience,
    projects, addProject, deleteProject,
    skills, addSkill, deleteSkill
  } = useEmployeeData();

  // Modals for user inputs
  const [showExpModal, setShowExpModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // New Experience Form State
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // New Project Form State
  const [projName, setProjName] = useState('');
  const [projRole, setProjRole] = useState('');
  const [projType, setProjType] = useState<ProjectType>('Professional');
  const [projDuration, setProjDuration] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // New Skill Form State
  const [skillName, setSkillName] = useState('');
  const [skillProf, setSkillProf] = useState<SkillProficiency>('Intermediate');

  const displayName = employee?.name || user?.name || 'Genesis Member';
  const displayRole = employee?.role || 'New Team Member';
  const displayCompany = employee?.company_name || user?.company_name || 'Genesis Enterprise';
  const displayBranch = employee?.branch_name || user?.branch_name || 'Main Campus';
  const displayDept = employee?.department_name || user?.department_name || 'Operations';
  const displayPhoto = employee?.profile_photo || user?.profile_photo;

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expRole.trim()) {
      toast.error('Please enter company and role');
      return;
    }
    addExperience({
      company_name: expCompany.trim(),
      role: expRole.trim(),
      duration: expDuration.trim() || '2023 - Present',
      description: expDesc.trim(),
    });
    toast.success('Experience record added!');
    setExpCompany('');
    setExpRole('');
    setExpDuration('');
    setExpDesc('');
    setShowExpModal(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) {
      toast.error('Please enter project name');
      return;
    }
    addProject({
      name: projName.trim(),
      role: projRole.trim() || 'Lead Contributor',
      type: projType,
      duration: projDuration.trim() || '2024',
      description: projDesc.trim(),
      tech_stack: projTech.split(',').map(s => s.trim()).filter(Boolean),
    });
    toast.success('Project added to portfolio!');
    setProjName('');
    setProjRole('');
    setProjDuration('');
    setProjTech('');
    setProjDesc('');
    setShowProjModal(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      toast.error('Please enter a skill');
      return;
    }
    addSkill({
      name: skillName.trim(),
      proficiency: skillProf,
      category: 'Programming',
    });
    toast.success('Skill added to profile!');
    setSkillName('');
    setShowSkillModal(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          My Experience & Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Zero prefilled records. Manage your background, skills, and projects here.
        </p>
      </div>

      {/* Dynamic Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white flex-shrink-0 shadow-md">
              {getInitials(displayName)}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
              <p className="text-violet-600 dark:text-violet-400 font-semibold text-sm">{displayRole}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Building className="w-3.5 h-3.5 text-violet-500" />
                {displayCompany}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {displayBranch}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                {displayDept}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skills & Competencies</h3>
          </div>
          <button
            onClick={() => setShowSkillModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 text-xs font-bold hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Skill</span>
          </button>
        </div>

        {skills.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
            No skills added yet. Click "+ Add Skill" to list your tech stack.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {skills.map((s, idx) => (
              <div
                key={s.id || idx}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-2 text-xs font-medium"
              >
                <span className="text-slate-900 dark:text-white font-bold">{s.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px]">
                  {s.proficiency}
                </span>
                <button
                  onClick={() => deleteSkill(s.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Work Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Past Work Experience</h3>
          </div>
          <button
            onClick={() => setShowExpModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Experience</span>
          </button>
        </div>

        {experience.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
            No past experience added yet. Add past employment, internships, or academic background.
          </div>
        ) : (
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{exp.role}</h4>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{exp.company_name}</p>
                  <p className="text-xs text-slate-400">{exp.duration}</p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{exp.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteExperience(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Portfolio Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Highlighted Projects</h3>
          </div>
          <button
            onClick={() => setShowProjModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
            No projects added yet. Showcase your previous projects, deliverables, or hackathons.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{p.role}</p>
                    </div>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {p.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{p.description}</p>
                  )}
                </div>

                {p.tech_stack && p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {p.tech_stack.map((t, ti) => (
                      <span
                        key={ti}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Experience Modal */}
      <AnimatePresence>
        {showExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Past Experience</h3>
                <button onClick={() => setShowExpModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddExperience} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    value={expCompany}
                    onChange={e => setExpCompany(e.target.value)}
                    required
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Job Role / Title *</label>
                  <input
                    type="text"
                    value={expRole}
                    onChange={e => setExpRole(e.target.value)}
                    required
                    placeholder="e.g. Full-Stack Developer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={expDuration}
                    onChange={e => setExpDuration(e.target.value)}
                    placeholder="e.g. June 2022 - Aug 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Highlights / Description</label>
                  <textarea
                    value={expDesc}
                    onChange={e => setExpDesc(e.target.value)}
                    rows={2}
                    placeholder="Briefly describe your key responsibilities and impact..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExpModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25"
                  >
                    Save Experience
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showProjModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Project to Portfolio</h3>
                <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={e => setProjName(e.target.value)}
                    required
                    placeholder="e.g. Distributed Analytics Engine"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Your Role</label>
                    <input
                      type="text"
                      value={projRole}
                      onChange={e => setProjRole(e.target.value)}
                      placeholder="e.g. Lead Architect"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={projTech}
                      onChange={e => setProjTech(e.target.value)}
                      placeholder="e.g. React, Go, Docker"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea
                    value={projDesc}
                    onChange={e => setProjDesc(e.target.value)}
                    rows={2}
                    placeholder="Summary of project and outcomes..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProjModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Skill</h3>
                <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                    required
                    placeholder="e.g. TypeScript, GraphQL, PyTorch"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Proficiency Level</label>
                  <select
                    value={skillProf}
                    onChange={e => setSkillProf(e.target.value as SkillProficiency)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSkillModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-500/25"
                  >
                    Add Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
