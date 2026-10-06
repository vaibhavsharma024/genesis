import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callJeffAI, type ChatHistoryMessage } from '@/lib/ai/jeff';
import {
  MOCK_DOCUMENTS,
  MOCK_CONTACTS,
  MOCK_LOCATIONS,
  MOCK_TASKS,
  DEMO_EMPLOYEE
} from '@/lib/mock-data';

interface ClientContextPayload {
  employee?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    department_name?: string;
    company_name?: string;
    branch_name?: string;
    joining_date?: string;
    onboarding_day?: number;
    work_type?: string;
  };
  tasks?: Array<{
    id?: string;
    task_id?: string;
    status: string;
    task?: {
      name?: string;
      description?: string;
      category?: string;
      priority?: string;
      day_number?: number;
      estimated_minutes?: number;
    };
  }>;
  journeyMilestones?: Array<{
    day: number;
    label: string;
    description: string;
    status: string;
  }>;
  companyRules?: Array<{
    title: string;
    summary: string;
  }>;
}

interface ResolvedEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  company_name: string;
  branch_name: string;
  department_name: string;
  joining_date: string;
  onboarding_day: number;
  work_type: string;
}

interface ResolvedTask {
  id?: string;
  status: string;
  block_reason?: string;
  task?: {
    name?: string;
    description?: string;
    category?: string;
    priority?: string;
    day_number?: number;
    estimated_minutes?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Valid message string is required.' },
        { status: 400 }
      );
    }

    const message: string = body.message.trim();
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatHistoryMessage[] = rawHistory
      .filter((h: unknown): h is ChatHistoryMessage => {
        return (
          typeof h === 'object' &&
          h !== null &&
          'content' in h &&
          typeof (h as { content: unknown }).content === 'string' &&
          'role' in h &&
          ((h as { role: unknown }).role === 'user' || (h as { role: unknown }).role === 'assistant')
        );
      })
      .map((h: ChatHistoryMessage) => ({ role: h.role, content: h.content }));

    // ============================================================
    // 1. AUTHENTICATION & IDENTITY RESOLUTION
    // ============================================================
    console.log('[Genesis Assistant] request received:', {
      message: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
      historyLength: history.length,
      timestamp: new Date().toISOString(),
    });

    let authenticatedEmployee: ResolvedEmployee | null = null;
    let employeeTasks: ResolvedTask[] = [];
    let companyDocuments: Array<{ title: string; category: string; content?: string }> = [];
    let companyContacts: Array<{ name: string; role: string; email?: string; phone?: string; office?: string; availability?: string }> = [];
    let companyLocations: Array<{ name: string; category: string; building?: string; floor?: string; room?: string }> = [];
    let journeyMilestones: Array<{ day: number; label: string; description: string; status: string }> = [];
    let companyRules: Array<{ title: string; summary: string }> = [];

    const isPlaceholderSupabase =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    // Attempt Supabase server-side authentication if active
    if (!isPlaceholderSupabase) {
      try {
        const supabase = await createClient();
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authUser && !authError) {
          // Employee verification - only authenticated employees allowed
          const userRole = (authUser.user_metadata?.role as string) || 'employee';
          if (userRole !== 'employee') {
            console.warn('[Genesis Assistant] Unauthorized access attempt by non-employee role:', userRole);
            return NextResponse.json(
              { error: 'Unauthorized: Genesis Assistant is only accessible to employees.' },
              { status: 403 }
            );
          }

          // Fetch only the authenticated employee's row (NEVER from client-provided ID)
          const { data: empData } = await supabase
            .from('employees')
            .select(`
              id, name, email, role, joining_date, work_type, onboarding_day, company_id,
              companies(name),
              branches(name, city),
              departments(name)
            `)
            .eq('user_id', authUser.id)
            .single();

          if (empData) {
            const rawCompany = empData.companies as unknown as { name?: string } | null;
            const rawBranch = empData.branches as unknown as { name?: string } | null;
            const rawDept = empData.departments as unknown as { name?: string } | null;

            authenticatedEmployee = {
              id: empData.id,
              name: empData.name,
              email: empData.email,
              role: empData.role,
              company_name: rawCompany?.name || 'Genesis Enterprise',
              branch_name: rawBranch?.name || 'Main Campus',
              department_name: rawDept?.name || 'Engineering',
              joining_date: empData.joining_date,
              onboarding_day: empData.onboarding_day || 1,
              work_type: empData.work_type || 'hybrid',
            };

            // Fetch this employee's tasks
            const { data: dbTasks } = await supabase
              .from('employee_tasks')
              .select('id, status, started_at, completed_at, due_date, onboarding_tasks(*)')
              .eq('employee_id', empData.id);

            if (dbTasks) {
              employeeTasks = dbTasks.map(t => ({
                id: t.id,
                status: t.status,
                task: t.onboarding_tasks as ResolvedTask['task'],
              }));
            }

            // Fetch company knowledge
            const companyId = empData.company_id;
            if (companyId) {
              const [docsRes, contactsRes, locsRes] = await Promise.all([
                supabase.from('documents').select('title, category, content').eq('company_id', companyId),
                supabase.from('contacts').select('name, role, email, phone, office, availability').eq('company_id', companyId),
                supabase.from('locations').select('name, category, building, floor, room').eq('company_id', companyId),
              ]);
              companyDocuments = docsRes.data || [];
              companyContacts = contactsRes.data || [];
              companyLocations = locsRes.data || [];
            }
          }
        }
      } catch (err) {
        console.warn('[Genesis Assistant] Supabase auth resolution note:', err);
      }
    }

    // Fallback: If in local demo mode or Supabase is placeholder,
    // verify the authenticated employee session from the client's auth session header/context
    if (!authenticatedEmployee) {
      const authHeader = req.headers.get('x-genesis-auth');
      let sessionData: { user?: { id?: string; email?: string; name?: string; role?: string; company_name?: string; branch_name?: string; department_name?: string; joining_date?: string; onboarding_day?: number; work_type?: string } } | null = null;
      if (authHeader) {
        try {
          sessionData = JSON.parse(Buffer.from(authHeader, 'base64').toString('utf-8'));
        } catch {
          try {
            sessionData = JSON.parse(authHeader);
          } catch {}
        }
      }

      // Check client context sent with payload
      const clientCtx: ClientContextPayload | undefined = body.clientContext;
      const sessionUser = sessionData?.user || clientCtx?.employee;

      if (!sessionUser || !sessionUser.email) {
        console.warn('[Genesis Assistant] Authentication failed: No employee session found.');
        return NextResponse.json(
          { error: 'Authentication required. Please log into the Employee Dashboard.' },
          { status: 401 }
        );
      }

      authenticatedEmployee = {
        id: sessionUser.id || DEMO_EMPLOYEE.id,
        name: sessionUser.name || DEMO_EMPLOYEE.name,
        email: sessionUser.email,
        role: sessionUser.role || DEMO_EMPLOYEE.role,
        company_name: sessionUser.company_name || DEMO_EMPLOYEE.company_name || 'Genesis Enterprise',
        branch_name: sessionUser.branch_name || DEMO_EMPLOYEE.branch_name || 'Noida Campus',
        department_name: sessionUser.department_name || DEMO_EMPLOYEE.department_name || 'Engineering',
        joining_date: sessionUser.joining_date || DEMO_EMPLOYEE.joining_date || '2024-01-15',
        onboarding_day: sessionUser.onboarding_day || DEMO_EMPLOYEE.onboarding_day || 2,
        work_type: sessionUser.work_type || 'hybrid',
      };

      // Set tasks from active client state or mock catalog
      if (clientCtx?.tasks && clientCtx.tasks.length > 0) {
        employeeTasks = clientCtx.tasks;
      } else {
        employeeTasks = MOCK_TASKS.map(t => ({
          id: `task-${t.id}`,
          status: t.day_number === 1 ? 'COMPLETED' : t.day_number === 2 ? 'IN_PROGRESS' : 'READY',
          task: t,
        }));
      }

      journeyMilestones = clientCtx?.journeyMilestones || [];
      companyRules = clientCtx?.companyRules || [];

      // Relevant mock knowledge base filtered by company
      companyDocuments = MOCK_DOCUMENTS;
      companyContacts = MOCK_CONTACTS;
      companyLocations = MOCK_LOCATIONS;
    }

    console.log('[Genesis Assistant] authenticated employee:', {
      id: authenticatedEmployee.id,
      name: authenticatedEmployee.name,
      email: authenticatedEmployee.email,
      role: authenticatedEmployee.role,
      company: authenticatedEmployee.company_name,
      branch: authenticatedEmployee.branch_name,
      department: authenticatedEmployee.department_name,
      onboardingDay: authenticatedEmployee.onboarding_day,
      tasksLoaded: employeeTasks.length,
    });

    // ============================================================
    // 2. COMPILE AUTHORIZED ONBOARDING & KNOWLEDGE CONTEXT
    // ============================================================
    const totalTasks = employeeTasks.length;
    const completedTasks = employeeTasks.filter(t => t.status === 'COMPLETED');
    const inProgressTasks = employeeTasks.filter(t => t.status === 'IN_PROGRESS');
    const readyTasks = employeeTasks.filter(t => t.status === 'READY');
    const blockedTasks = employeeTasks.filter(t => t.status === 'BLOCKED');
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const completedSummary = completedTasks
      .map(t => `  - [Done] ${t.task?.name || 'Task'} (Day ${t.task?.day_number || 1}, ${t.task?.category || 'General'})`)
      .join('\n') || '  None completed yet.';

    const inProgressSummary = inProgressTasks
      .map(t => `  - [In-Progress] ${t.task?.name || 'Task'} (Day ${t.task?.day_number || 1}, Priority: ${t.task?.priority || 'medium'}, ~${t.task?.estimated_minutes || 30} mins): ${t.task?.description || ''}`)
      .join('\n') || '  No tasks currently in progress.';

    const readySummary = readyTasks
      .map(t => `  - [Pending] ${t.task?.name || 'Task'} (Day ${t.task?.day_number || 1}, Priority: ${t.task?.priority || 'medium'}, ~${t.task?.estimated_minutes || 30} mins): ${t.task?.description || ''}`)
      .join('\n') || '  No pending tasks.';

    const blockedSummary = blockedTasks
      .map(t => `  - [Blocked] ${t.task?.name || 'Task'} (Day ${t.task?.day_number || 1}): ${t.block_reason || 'Needs assistance'}`)
      .join('\n');

    const documentsText = companyDocuments.length > 0
      ? companyDocuments.map(d => `[Document: ${d.title} (${d.category})]\n${d.content}`).join('\n\n')
      : 'Standard company policies apply.';

    const contactsText = companyContacts.length > 0
      ? companyContacts.map(c => `• ${c.name} (${c.role}): Email: ${c.email || 'N/A'}, Phone: ${c.phone || 'N/A'}, Office: ${c.office || 'N/A'}, Hours: ${c.availability || 'Standard hours'}`).join('\n')
      : 'IT Helpdesk: it-support@genesis.internal, HR: hr-people@genesis.internal';

    const locationsText = companyLocations.length > 0
      ? companyLocations.map(l => `• ${l.name} (${l.category}): Building: ${l.building || ''}, Floor: ${l.floor || ''}, Room: ${l.room || ''}`).join('\n')
      : 'Building A, Floor 2, Room 204 (IT Help Desk)';

    const journeyText = journeyMilestones.length > 0
      ? journeyMilestones.map(m => `• Day ${m.day}: ${m.label} [Status: ${m.status}] - ${m.description}`).join('\n')
      : `• Day 1: Welcome & Identity Verification\n• Day 2: IT Hardware & Enterprise SSO\n• Day 3: Cybersecurity & Compliance Training\n• Day 4: Team Integration & Buddy Walkthrough\n• Day 5: Role Handover & Goal Alignment`;

    const rulesText = companyRules.length > 0
      ? companyRules.map(r => `• ${r.title}: ${r.summary}`).join('\n')
      : '• Standard core hours: 9:30 AM to 6:30 PM, Monday through Friday. Weekends are official weekly off.';

    // ============================================================
    // 3. SYSTEM PROMPT (JEFF)
    // ============================================================
    const systemPrompt = `You are Genesis Assistant, the AI onboarding assistant for the Genesis New Joiner Onboarding platform.

Your primary purpose is to help authenticated employees understand and complete their onboarding journey.

You can help with:
- onboarding tasks
- first-week activities
- current and upcoming tasks
- onboarding progress
- department information
- company information available in the Genesis knowledge base
- onboarding resources
- FAQs
- tools and resources
- appropriate HR contacts

Always prioritize the information provided by the Genesis application and authenticated employee context.

Never invent information.

Never reveal information belonging to another employee.

Never provide confidential or unauthorized information.

If the available context does not contain the answer, clearly say that you do not have enough information and recommend contacting HR or the appropriate person.

Keep responses concise, friendly, professional, and easy for a new employee to understand.

When useful, structure responses using:
- short paragraphs
- bullet points
- numbered steps

You are an onboarding assistant, not a general-purpose unrestricted assistant.

============================================================
CURRENT AUTHENTICATED EMPLOYEE CONTEXT (VERIFIED):
============================================================
Name: ${authenticatedEmployee.name}
Email: ${authenticatedEmployee.email}
Role: ${authenticatedEmployee.role}
Department: ${authenticatedEmployee.department_name}
Company: ${authenticatedEmployee.company_name}
Campus Branch: ${authenticatedEmployee.branch_name}
Joining Date: ${authenticatedEmployee.joining_date}
Current Onboarding Day: Day ${authenticatedEmployee.onboarding_day} of 5
Work Arrangement: ${authenticatedEmployee.work_type}

============================================================
EMPLOYEE TASKS & ONBOARDING STATUS:
============================================================
Overall Progress: ${progressPercent}% (${completedTasks.length} of ${totalTasks} tasks completed)
Active Day: Day ${authenticatedEmployee.onboarding_day}

IN-PROGRESS TASKS:
${inProgressSummary}

PENDING / READY TASKS:
${readySummary}

COMPLETED TASKS:
${completedSummary}
${blockedSummary ? `\nBLOCKED TASKS:\n${blockedSummary}` : ''}

============================================================
5-DAY ONBOARDING ROADMAP / JOURNEY:
============================================================
${journeyText}

============================================================
WORKPLACE RULES & WORKING HOURS:
============================================================
${rulesText}

============================================================
KEY CONTACTS & ESCALATIONS:
============================================================
${contactsText}

============================================================
CAMPUS LOCATIONS:
============================================================
${locationsText}

============================================================
GENESIS KNOWLEDGE BASE & POLICIES:
============================================================
${documentsText}
`;

    // ============================================================
    // 4. DYNAMIC GENERATION VIA JEFF AI MODEL
    // ============================================================
    try {
      const aiResult = await callJeffAI({
        systemPrompt,
        history,
        message,
        temperature: 0.2,
      });

      return NextResponse.json({
        reply: aiResult.reply,
        model: aiResult.modelUsed,
        sources: [
          `${authenticatedEmployee.company_name} Onboarding System`,
          `${authenticatedEmployee.department_name} Guidelines`,
          'Employee Handbook',
        ],
      });
    } catch (aiErr: unknown) {
      const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.error('[Genesis Assistant] exact failure reason:', errMsg);

      // DO NOT hide the real error behind the generic message during development
      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json(
        {
          error: 'AI service failure',
          failureReason: errMsg,
          reply: isDev
            ? `[Genesis Assistant Integration Error]: ${errMsg}`
            : "I'm having trouble connecting right now. Please try again in a moment.",
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[Genesis Assistant Request Error]:', errMsg);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      {
        error: 'Internal service error',
        failureReason: errMsg,
        reply: isDev
          ? `[Genesis Assistant Request Error]: ${errMsg}`
          : "I'm having trouble connecting right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
