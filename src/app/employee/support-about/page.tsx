'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, PhoneCall, Clock, ShieldAlert,
  ChevronLeft, ChevronRight, Laptop, Building,
  HelpCircle, CheckCircle2, Lock, Zap, FileText, Trash2
} from 'lucide-react';
import { useEmployeeData } from '@/lib/context';
import AiCallInterceptorModal from '@/components/support/AiCallInterceptorModal';

export default function SupportAboutPage() {
  const {
    supportContacts, deleteSupportContact,
    companyRules, deleteCompanyRule
  } = useEmployeeData();

  const [activeTab, setActiveTab] = useState<'contacts' | 'rules'>('contacts');
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);

  // AI Call Interceptor Modal state
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isInterceptorOpen, setIsInterceptorOpen] = useState(false);

  const handleCallSupport = (contact: any) => {
    setSelectedContact(contact);
    setIsInterceptorOpen(true);
  };

  const currentRule = companyRules[currentRuleIndex];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20">
            Genesis Enterprise Directory
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Support & Company Rules
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Zero prefilled contacts or rules. Input and maintain your verified directory.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'contacts'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contacts ({supportContacts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rules'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guidelines ({companyRules.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SUPPORT CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {supportContacts.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No Support Contacts Available
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Support points of contact including IT helpdesk, HR leads, and security operations are synchronized directly from company registry.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportContacts.map(contact => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                          {contact.department}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {contact.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{contact.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{contact.role}</p>
                    </div>

                    <button
                      onClick={() => deleteSupportContact(contact.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/5">
                    <p><strong className="text-slate-800 dark:text-slate-200">Office:</strong> {contact.office}</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Email:</strong> {contact.email}</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Hours:</strong> {contact.availability}</p>
                  </div>

                  {/* Direct Call Button (Intercepted by AI Guard) */}
                  <button
                    onClick={() => handleCallSupport(contact)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Support ({contact.phone})</span>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPANY RULES & ABOUT */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {companyRules.length === 0 ? (
            <div className="py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-white/15 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No Company Rules or Guidelines Added
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Official attendance rules, security guidelines, and code of conduct are managed by HR and compliance.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Carousel / Presentation Slider */}
              <div className="relative p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    Rule {currentRuleIndex + 1} of {companyRules.length} · {currentRule?.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentRuleIndex(prev => (prev - 1 + companyRules.length) % companyRules.length)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentRuleIndex(prev => (prev + 1) % companyRules.length)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCompanyRule(currentRule?.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {currentRule?.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentRule?.summary}
                  </p>
                </div>

                {/* Details list */}
                {currentRule?.details && currentRule.details.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Provisions</h4>
                    <ul className="space-y-1.5">
                      {currentRule.details.map((d, di) => (
                        <li key={di} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}



      {/* AI Call Interceptor Modal */}
      <AiCallInterceptorModal
        isOpen={isInterceptorOpen}
        onClose={() => setIsInterceptorOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
}
