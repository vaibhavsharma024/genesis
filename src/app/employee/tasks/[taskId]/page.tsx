'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, MapPin, Phone, Mail, CheckCircle2,
  Play, Pause, AlertTriangle, Lock, ChevronRight,
  HelpCircle, FileText, User, BookOpen, CheckSquare, X
} from 'lucide-react';
import { useEmployeeData } from '@/lib/context';
import {
  MOCK_TASKS, MOCK_TASK_STEPS, MOCK_TASK_DEPENDENCIES,
  MOCK_LOCATIONS, MOCK_CONTACTS, getLocationStatus
} from '@/lib/mock-data';
import { cn, formatDuration, getStatusColor, getPriorityColor, getCategoryIcon } from '@/lib/utils';
import type { BlockReason, SupportType } from '@/types';
import toast from 'react-hot-toast';
import TaskResponseMatrix from '@/components/tasks/TaskResponseMatrix';

const BLOCK_REASONS: BlockReason[] = [
  "Don't understand",
  'No access',
  'Resource missing',
  'Location closed',
  'Technical problem',
  'Human assistance needed',
  'Other',
];

function BlockModal({
  taskId, onClose, onBlock
}: {
  taskId: string;
  onClose: () => void;
  onBlock: (reason: BlockReason, notes: string) => void;
}) {
  const [reason, setReason] = useState<BlockReason | ''>('');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Block Task</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Tell us why you're blocked and we'll help you get unstuck.
        </p>
        <div className="space-y-2 mb-4">
          {BLOCK_REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                reason === r
                  ? 'border-red-500/50 bg-red-500/10 text-red-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add more details (optional)..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!reason}
            onClick={() => reason && onBlock(reason, notes)}
            className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-40"
          >
            Block Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompleteModal({
  taskName, onClose, onComplete
}: {
  taskName: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Complete Task?</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
          <p className="text-emerald-300 text-sm font-medium">{taskName}</p>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Please confirm you have fully completed this task. This action will unlock any dependent tasks.
        </p>
        <label className="flex items-center gap-3 cursor-pointer mb-5">
          <div
            onClick={() => setConfirmed(!confirmed)}
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
              confirmed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
            )}
          >
            {confirmed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <span className="text-slate-300 text-sm">I confirm this task is fully completed.</span>
        </label>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!confirmed}
            onClick={onComplete}
            className="flex-1 py-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const router = useRouter();
  const { tasks, onboardingTasks, updateTaskStatus, completeStep, addSupportRequest } = useEmployeeData();
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const employeeTask = tasks.find(t => t.task_id === taskId);
  const task = onboardingTasks.find(t => t.id === taskId) || MOCK_TASKS.find(t => t.id === taskId) || employeeTask?.task;
  const steps = (task?.steps && task.steps.length > 0) ? task.steps : MOCK_TASK_STEPS.filter(s => s.task_id === taskId);
  const deps = MOCK_TASK_DEPENDENCIES.filter(d => d.task_id === taskId);
  const location = task?.location_id ? MOCK_LOCATIONS.find(l => l.id === task.location_id) : null;
  const contact = task?.contact_id ? MOCK_CONTACTS.find(c => c.id === task.contact_id) : null;

  if (!task || !employeeTask) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Task not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-violet-400">← Go back</button>
      </div>
    );
  }

  const locationStatus = location ? getLocationStatus(location.id) : null;
  const completedSteps = employeeTask.completed_steps || [];
  const requiredSteps = steps.filter(s => s.is_required);
  const allRequiredDone = requiredSteps.every(s => completedSteps.includes(s.id));

  const handleStart = () => {
    if (employeeTask.status !== 'READY') return;
    updateTaskStatus(taskId, 'IN_PROGRESS', { started_at: new Date().toISOString() });
    toast.success('Task started! Good luck 🚀');
  };

  const handleBlock = (reason: BlockReason, notes: string) => {
    updateTaskStatus(taskId, 'BLOCKED', { block_reason: reason, block_notes: notes });
    addSupportRequest({
      employee_id: 'emp-vaibhav',
      task_id: taskId,
      type: reason === 'Technical problem' || reason === 'No access' ? 'IT' :
            reason === 'Location closed' ? 'Facilities' : 'HR',
      subject: `Blocked on: ${task.name}`,
      description: `Reason: ${reason}${notes ? '\n\nDetails: ' + notes : ''}`,
      status: 'AI_REVIEWING',
      ai_response: `I understand you're blocked on "${task.name}" because: ${reason}. Let me help resolve this.`,
    });
    setShowBlockModal(false);
    toast('Task blocked. A support request has been created.', { icon: '⚠️' });
    router.push('/employee/help');
  };

  const handleComplete = () => {
    updateTaskStatus(taskId, 'COMPLETED', { completed_at: new Date().toISOString() });
    setShowCompleteModal(false);
    toast.success('Task completed! 🎉 Dependent tasks have been unlocked.');
    router.push('/employee/tasks');
  };

  const handleStepToggle = (stepId: string) => {
    if (employeeTask.status !== 'IN_PROGRESS' && employeeTask.status !== 'READY') return;
    if (completedSteps.includes(stepId)) return; // Can't un-complete
    completeStep(taskId, stepId);
    toast.success('Step completed!');
  };

    // Check if prerequisites are met
  const prereqTasks = deps.map(d => tasks.find(t => t.task_id === d.depends_on_task_id)).filter(Boolean);
  const allPrereqsMet = prereqTasks.every(t => t?.status === 'COMPLETED');

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </button>
      </div>

      {/* TASK SHOWCASE & 4-OPTION RESPONSE MATRIX (SPLIT LAYOUT) */}
      <TaskResponseMatrix
        task={task}
        currentStatus={employeeTask.status}
        onSelectResponse={(newStatus, customNote) => {
          updateTaskStatus(taskId, newStatus, {
            block_reason: (newStatus === 'BLOCKED' ? customNote : undefined) as any,
            completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
          });
        }}
      />

      {/* Task info cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <p className="text-xs text-slate-500 mb-1">Est. Duration</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <p className="font-semibold text-white">{formatDuration(task.estimated_minutes)}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <p className="text-xs text-slate-500 mb-1">Priority</p>
          <p className={cn('font-semibold', getPriorityColor(task.priority))}>
            {task.priority.toUpperCase()}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <p className="text-xs text-slate-500 mb-1">Required</p>
          <p className={cn('font-semibold', task.is_required ? 'text-red-400' : 'text-slate-400')}>
            {task.is_required ? 'Mandatory' : 'Optional'}
          </p>
        </div>
      </div>

      {/* Description & Why */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Description
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{task.description}</p>
        </div>
        {task.why_required && (
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Why is this required?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{task.why_required}</p>
          </div>
        )}
      </div>

      {/* Location */}
      {location && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </h3>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{location.name}</p>
              <p className="text-sm text-slate-400">{location.building}, {location.floor}</p>
              {location.room && <p className="text-xs text-slate-500">{location.room}</p>}
            </div>
            {locationStatus && (
              <span className={cn(
                'badge text-xs flex-shrink-0',
                locationStatus.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300' :
                locationStatus.status === 'Closing Soon' ? 'bg-amber-500/20 text-amber-300' :
                'bg-red-500/20 text-red-300'
              )}>
                {locationStatus.status}
              </span>
            )}
          </div>
          {locationStatus && (
            <p className="text-xs text-slate-500 mt-2">{locationStatus.message}</p>
          )}
          {location.map_url && (
            <a
              href={location.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <MapPin className="w-3 h-3" /> View on Map →
            </a>
          )}
        </div>
      )}

      {/* Contact */}
      {contact && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Contact
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white">
              {contact.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{contact.name}</p>
              <p className="text-xs text-slate-400">{contact.role}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300">
                <Mail className="w-3.5 h-3.5" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300">
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {deps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Prerequisites
          </h3>
          <div className="space-y-2">
            {deps.map(dep => {
              const depTask = MOCK_TASKS.find(t => t.id === dep.depends_on_task_id);
              const depEmployeeTask = tasks.find(t => t.task_id === dep.depends_on_task_id);
              const isDone = depEmployeeTask?.status === 'COMPLETED';
              return (
                <div key={dep.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0" />
                  )}
                  <span className={cn('text-sm', isDone ? 'text-slate-400 line-through' : 'text-white')}>
                    {depTask?.name}
                  </span>
                  {isDone && <span className="ml-auto text-xs text-emerald-400">✓ Done</span>}
                </div>
              );
            })}
          </div>
          {!allPrereqsMet && (
            <p className="mt-3 text-xs text-amber-400">⚠️ Complete the prerequisites above before starting this task.</p>
          )}
        </div>
      )}

      {/* Task steps */}
      {steps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Steps
            <span className="ml-auto text-xs text-violet-400">{completedSteps.length}/{steps.length} done</span>
          </h3>
          <div className="space-y-2">
            {steps.map((step, i) => {
              const isDone = completedSteps.includes(step.id);
              const canComplete = employeeTask.status === 'IN_PROGRESS' && !isDone;
              return (
                <div
                  key={step.id}
                  onClick={() => canComplete && handleStepToggle(step.id)}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-all',
                    isDone ? 'border-emerald-500/20 bg-emerald-500/5 opacity-75' :
                    canComplete ? 'border-slate-700 bg-slate-800 cursor-pointer hover:border-violet-500/40' :
                    'border-slate-800 bg-slate-800/50'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                  )}>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                    {!isDone && <span className="text-[10px] text-slate-500 font-bold">{i+1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', isDone ? 'text-slate-500 line-through' : 'text-white')}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    {step.is_required && !isDone && (
                      <span className="text-xs text-amber-500 mt-1 block">Required</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        {employeeTask.status === 'READY' && (
          <button
            onClick={handleStart}
            disabled={!allPrereqsMet}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" />
            Start Task
          </button>
        )}

        {employeeTask.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={!allRequiredDone}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Complete
            </button>
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
            >
              <AlertTriangle className="w-4 h-4" />
              I'm Blocked
            </button>
          </>
        )}

        {employeeTask.status === 'BLOCKED' && (
          <div className="flex-1 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm font-medium">Task is blocked</p>
            <p className="text-red-400/70 text-xs mt-1">Reason: {employeeTask.block_reason}</p>
            <button
              onClick={() => router.push('/employee/help')}
              className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
            >
              View support request →
            </button>
          </div>
        )}

        {employeeTask.status === 'COMPLETED' && (
          <div className="flex-1 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-300 text-sm font-medium">Task completed! ✓</p>
          </div>
        )}

        {employeeTask.status === 'LOCKED' && (
          <div className="flex-1 p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
            <Lock className="w-5 h-5 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Complete prerequisites to unlock this task</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBlockModal && (
          <BlockModal
            taskId={taskId}
            onClose={() => setShowBlockModal(false)}
            onBlock={handleBlock}
          />
        )}
        {showCompleteModal && (
          <CompleteModal
            taskName={task.name}
            onClose={() => setShowCompleteModal(false)}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
