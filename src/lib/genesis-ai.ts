/**
 * Genesis AI Response Engine
 * Answers every question about work and the user's company, handles basic conversation,
 * and incorporates live context (employee, company, department, tasks, journey, contacts, rules).
 */

import type { Employee, EmployeeTask } from '@/types';
import type { AuthUser, UserJourneyMilestone, UserSupportContact, UserCompanyRule } from '@/lib/context';

export interface GenesisAIContext {
  query: string;
  employee: Employee | null;
  user?: AuthUser | null;
  tasks?: EmployeeTask[];
  journeyMilestones?: UserJourneyMilestone[];
  supportContacts?: UserSupportContact[];
  companyRules?: UserCompanyRule[];
}

export interface GenesisAIResult {
  answer: string;
  sources?: string[];
  category?: 'conversation' | 'policy' | 'schedule' | 'tasks' | 'it' | 'facility' | 'contacts';
}

export function generateGenesisAIResponse(ctx: GenesisAIContext): GenesisAIResult {
  const q = ctx.query.toLowerCase().trim();
  const emp = ctx.employee;
  const company = emp?.company_name || ctx.user?.company_name || 'Your Company';
  const branch = emp?.branch_name || ctx.user?.branch_name || 'Main Campus';
  const dept = emp?.department_name || ctx.user?.department_name || 'Engineering';
  const role = emp?.role || 'Team Member';
  const name = emp?.name || ctx.user?.name || 'Colleague';
  const firstName = name.split(' ')[0] || 'Friend';
  const day = emp?.onboarding_day || 1;

  const tasks = ctx.tasks || [];
  const milestones = ctx.journeyMilestones || [];
  const contacts = ctx.supportContacts || [];
  const rules = ctx.companyRules || [];

  // =========================================================================
  // 1. BASIC CONVERSATION & SOCIAL INTERACTION
  // =========================================================================

  // Greetings
  if (/^(hi|hello|hey|greetings|hola|howdy|good\s*(morning|afternoon|evening)|namaste|yo)(\b|[!.,?])/i.test(q)) {
    const timeHour = new Date().getHours();
    let timeGreeting = 'Good day';
    if (timeHour < 12) timeGreeting = 'Good morning';
    else if (timeHour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    return {
      category: 'conversation',
      answer: `Hello ${firstName}! 👋 ${timeGreeting}.\n\nI am **Genesis AI**, your dedicated workplace & onboarding intelligence partner at **${company}** (${branch}).\n\nI can assist you with:\n• ⏰ **Timings & Overtime** (9:30 AM – 6:30 PM & live overtime policy)\n• 📋 **Tasks & Deliverables** (review Day ${day} priorities)\n• 💻 **IT & Hardware** (laptop provisioning, WiFi, VPN)\n• 🗺️ **Campus Navigation** (finding ${dept} wing & facilities)\n• 👥 **Support Contacts** (direct lines for IT, HR & Security)\n\nWhat can I assist you with right now?`,
      sources: [`${company} Employee Handbook`],
    };
  }

  // How are you
  if (q.includes('how are you') || q.includes('how are u') || q.includes("how's it going") || q.includes('how do you do')) {
    return {
      category: 'conversation',
      answer: `I'm operating at peak efficiency and excited to assist you, ${firstName}! 🚀\n\nEverything is set up for your Day ${day} journey in the **${dept}** division at **${company}**. How is your onboarding going so far? Let me know if you need help with your tasks, equipment, or finding meeting rooms!`,
      sources: [`${company} Portal`],
    };
  }

  // Who are you / What can you do
  if (q.includes('who are you') || q.includes('what are you') || q.includes('what can you do') || q.includes('what is genesis') || q.includes('your purpose')) {
    return {
      category: 'conversation',
      answer: `I am **Genesis AI**, the unified corporate knowledge engine designed specifically for **${company}** employees.\n\nMy core capabilities include:\n1. 🏢 **Company Intelligence**: Instant answers about ${company}'s policies, culture, departments, and executive leadership.\n2. ⏱️ **Workplace Schedule**: Guiding you through standard working hours (9:30 AM – 6:30 PM) and overtime tracking.\n3. 🎯 **Onboarding Roadmaps**: Tracking your 5-day journey from Day 1 welcome to Day 5 role handover.\n4. 🛠️ **IT & Access Guidance**: Setting up SSO credentials, security VPN, hardware peripherals, and WiFi.\n5. 📍 **Campus Routing**: Directing you to meeting rooms, cafeteria, and ${dept} department zones.\n\nFeel free to ask me any question in plain language!`,
      sources: [`Genesis AI Architecture`],
    };
  }

  // Thanks / Gratitude
  if (q.includes('thank') || q.includes('thanks') || q.includes('thx') || q.includes('appreciate')) {
    return {
      category: 'conversation',
      answer: `You're very welcome, ${firstName}! Always glad to help make your experience at **${company}** seamless. If anything else comes up regarding your tasks, schedule, or team, just ask! ✨`,
    };
  }

  // Goodbye / Sign-off
  if (q.includes('bye') || q.includes('goodbye') || q.includes('see you') || q.includes('good night') || q.includes('cya')) {
    return {
      category: 'conversation',
      answer: `Goodbye ${firstName}! Have a productive and fulfilling day at **${company}**. Don't forget to lock your workstation before stepping away! 👋`,
    };
  }

  // Humor / Small Talk
  if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
    const jokes = [
      `Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛 Fortunately, here at ${company}, our code is thoroughly reviewed!`,
      `There are 10 types of people in the world: those who understand binary, and those who don't! 😄 Welcome to the ${dept} team!`,
      `Why did the JavaScript developer wear glasses?\nBecause they didn't C#! 🤓 Hope that brings a smile to your Day ${day} at ${company}!`,
    ];
    const pick = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      category: 'conversation',
      answer: `${pick}\n\nNeed help with any actual onboarding tasks or company policies? I'm ready!`,
    };
  }

  // Compliments
  if (q.includes('awesome') || q.includes('great') || q.includes('cool') || q.includes('good job') || q.includes('nice')) {
    return {
      category: 'conversation',
      answer: `Thank you, ${firstName}! I'm always here to keep your journey at **${company}** running smoothly. Let me know if you need anything else! ⭐`,
    };
  }

  // =========================================================================
  // 2. WORKING HOURS, SCHEDULE & OVERTIME POLICY (9:30 AM - 6:30 PM)
  // =========================================================================
  if (
    q.includes('working hour') || q.includes('work hour') || q.includes('timings') ||
    q.includes('office time') || q.includes('shift') || q.includes('overtime') ||
    q.includes('weekend') || q.includes('what time') || q.includes('work late') ||
    q.includes('schedule') || q.includes('hours')
  ) {
    return {
      category: 'schedule',
      answer: `**${company} Workplace Schedule & Overtime Policy:**\n\n🕒 **Standard Core Hours:**\n• **9:30 AM – 6:30 PM (IST / Local Time)**, Monday through Friday.\n• Core collaboration block: 10:30 AM – 4:30 PM.\n\n⚡ **Live Overtime Computation:**\n• Automatic overtime tracking activates past **18:30 (6:30 PM)** on weekdays.\n• All work performed on Saturdays and Sundays counts as **Full Overtime** with automated compensatory off or overtime allowance.\n• Your live overtime accumulation is reflected in real-time on your **3D Top Ribbon Status**.\n\n☕ **Breaks:**\n• Lunch hour: 1:00 PM – 2:00 PM (Cafeteria)\n• Evening refresh break: 4:30 PM – 5:00 PM.`,
      sources: [`${company} HR Time & Attendance Policy`, `Genesis Overtime Calculator`],
    };
  }

  // =========================================================================
  // 3. COMPANY PROFILE, CULTURE & RULES
  // =========================================================================
  if (
    q.includes('about company') || q.includes('company culture') || q.includes('values') ||
    q.includes('mission') || q.includes('rules') || q.includes('dress code') ||
    (q.includes('about') && q.includes(company.toLowerCase())) || q.includes('policy')
  ) {
    const rulesList = rules.length > 0
      ? rules.map(r => `• **${r.title}**: ${r.summary}`).join('\n')
      : `• **Security & Clean Desk Policy**: Screen lock mandatory when leaving desk; badge must be visible.\n• **Collaborative Innovation**: Open communication across ${dept} and cross-functional teams.\n• **Respect & Inclusion**: Zero-tolerance for discrimination; open-door executive policy.`;

    return {
      category: 'policy',
      answer: `**Welcome to ${company}!** 🏢\n\n• **Campus Location:** ${branch}\n• **Assigned Division:** ${dept}\n• **Your Role:** ${role}\n\n**Core Operational Guidelines & Policies:**\n${rulesList}\n\n👔 **Dress Code:** Smart casual (business casual for client presentations).\n🔐 **Data Security:** Strict Zero Trust environment. Never write down or share SSO passwords.`,
      sources: [`${company} Corporate Governance Handbook`],
    };
  }

  // =========================================================================
  // 4. TASKS & WHAT TO DO NEXT
  // =========================================================================
  if (
    q.includes('task') || q.includes('what should i do') || q.includes('what to do') ||
    q.includes('next') || q.includes('todo') || q.includes('deliverable') ||
    q.includes('progress') || q.includes('status')
  ) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const readyTasks = tasks.filter(t => t.status === 'READY');

    if (tasks.length === 0) {
      return {
        category: 'tasks',
        answer: `**No Tasks Registered Yet for ${company}:**\n\nYour task board is completely clean with zero pre-filled demo clutter! You can create custom onboarding deliverables anytime:\n\n1. Click **"+ Add New Task"** from the top ribbon or **Tasks** page.\n2. Or add tasks directly to your **HR Mind Map Tree** under the Tasks branch.\n\nRecommended first tasks for Day 1:\n• Complete physical ID badge verification\n• Set up work laptop and configure enterprise SSO\n• Meet your ${dept} lead and onboarding buddy`,
        sources: [`${company} Task Registry`],
      };
    }

    let statusSummary = `You have **${tasks.length} total tasks** on your roadmap for ${company}:\n`;
    statusSummary += `• ✅ Completed: ${completedTasks.length}\n`;
    statusSummary += `• 🔄 In Progress: ${inProgressTasks.length}\n`;
    statusSummary += `• ⏳ Ready to Start: ${readyTasks.length}\n\n`;

    if (inProgressTasks.length > 0) {
      const current = inProgressTasks[0];
      const taskName = current.task?.name || 'Assigned Task';
      statusSummary += `🎯 **Current Priority:**\nYou are currently executing: **"${taskName}"**.\nFocus on finishing this deliverable before moving to upcoming items.`;
    } else if (readyTasks.length > 0) {
      const next = readyTasks[0];
      const nextName = next.task?.name || 'Upcoming Task';
      statusSummary += `🚀 **Next Recommended Step:**\nStart working on: **"${nextName}"**.\nMark it as "In Progress" when you begin.`;
    } else {
      statusSummary += `🎉 **Outstanding!** All registered tasks are currently completed. You are ahead of schedule for Day ${day}!`;
    }

    return {
      category: 'tasks',
      answer: statusSummary,
      sources: [`Live ${company} Tasks Database`],
    };
  }

  // =========================================================================
  // 5. ONBOARDING JOURNEY & MILESTONES (DAYS 1 TO 5)
  // =========================================================================
  if (
    q.includes('journey') || q.includes('roadmap') || q.includes('day 1') ||
    q.includes('day 2') || q.includes('day 3') || q.includes('day 4') ||
    q.includes('day 5') || q.includes('milestone') || q.includes('week 1')
  ) {
    const journeyList = milestones.length > 0
      ? milestones.map(m => `• **Day ${m.day}**: ${m.label} (${m.status}) - ${m.description}`).join('\n')
      : `• **Day 1**: Welcome & Identity Verification (Badge, HR docs, orientation)\n• **Day 2**: IT Hardware & Enterprise SSO (MacBook/Dell setup, GitHub, Slack)\n• **Day 3**: Security Compliance & SOC2 (Zero Trust enrollment, security training)\n• **Day 4**: Team Integration & Buddy Sync (${dept} architecture walkthrough)\n• **Day 5**: Role Handover & Goal Blueprint (30-60-90 day KPI alignment)`;

    return {
      category: 'policy',
      answer: `**${company} 5-Day Onboarding Journey Roadmap:**\n\nYou are currently on **Day ${day}** as a ${role} in ${dept}.\n\n${journeyList}\n\nYou can customize or add milestones anytime from the **My Journey** tab or the HR Mind Map.`,
      sources: [`${company} Onboarding Framework`],
    };
  }

  // =========================================================================
  // 6. IT HARDWARE, WIFI, LAPTOP & VPN
  // =========================================================================
  if (
    q.includes('wifi') || q.includes('internet') || q.includes('laptop') ||
    q.includes('macbook') || q.includes('computer') || q.includes('hardware') ||
    q.includes('vpn') || q.includes('password') || q.includes('it') ||
    q.includes('helpdesk') || q.includes('charger') || q.includes('monitor')
  ) {
    return {
      category: 'it',
      answer: `**${company} IT Hardware & Access Guide:**\n\n📶 **Enterprise WiFi Access:**\n• Network SSID: **"${company.replace(/\s+/g, '')}-Enterprise-5G"**\n• Security Protocol: WPA3 Enterprise (802.1X)\n• Credentials: Your corporate work email and master SSO password.\n\n💻 **Laptop & Hardware Provisioning:**\n• Location: **IT Helpdesk & Tech Depot (Level 2, Wing B, Room 204)**\n• Operating Hours: Mon–Fri, 9:30 AM – 6:30 PM\n• Requirement: Present your ${company} employee badge or government ID.\n• Package includes: Laptop, USB-C dual-display hub, 96W charger, and secure YubiKey.\n\n🔒 **Corporate VPN & Zero Trust:**\n• Install the pre-packaged GlobalProtect / Cloudflare WARP client from your company portal.\n• Connect using MFA verification code.`,
      sources: [`${company} IT Operations Manual`, `Security Standards`],
    };
  }

  // =========================================================================
  // 7. CAMPUS MAP, LOCATION & FACILITIES
  // =========================================================================
  if (
    q.includes('where is') || q.includes('location') || q.includes('map') ||
    q.includes('cafeteria') || q.includes('food') || q.includes('lunch') ||
    q.includes('coffee') || q.includes('parking') || q.includes('restroom') ||
    q.includes('gym') || q.includes('building') || q.includes('room')
  ) {
    return {
      category: 'facility',
      answer: `**${company} Campus Directory (${branch}):**\n\n📍 **Your Assigned Desk & Pod:**\n• **${dept} Innovation Wing**: Level 2, Pod A-14.\n• Navigation: Main Entrance Atrium → West Elevator → Level 2.\n\n🍽️ **Cafeteria & Dining:**\n• **Central Atrium Food Court**: Ground Floor, West Concourse.\n• Breakfast: 8:00 AM – 10:00 AM | Lunch: 12:30 PM – 2:30 PM | Evening Snacks: 4:30 PM – 6:00 PM.\n\n☕ **Espresso & Beverage Stations:**\n• Available on every floor near the elevator core (24/7 complimentary).\n\n🚗 **Parking & EV Charging:**\n• Basement Levels B1 & B2. Scan your employee RFID badge at the barrier.\n\n🏋️ **Wellness & Recreation:**\n• Fitness Center, Quiet Pods & Medical Room: Level 1, East Annex.`,
      sources: [`${company} Facility & Campus Guide`],
    };
  }

  // =========================================================================
  // 8. SUPPORT CONTACTS, HR & ESCALATIONS
  // =========================================================================
  if (
    q.includes('contact') || q.includes('who to call') || q.includes('phone') ||
    q.includes('email') || q.includes('hr') || q.includes('manager') ||
    q.includes('buddy') || q.includes('help') || q.includes('emergency') ||
    q.includes('security desk')
  ) {
    let contactsList = '';
    if (contacts.length > 0) {
      contactsList = contacts.map(c => `• **${c.name}** (${c.role} - ${c.department})\n  📞 ${c.phone} | 📧 ${c.email} | 📍 ${c.office}`).join('\n\n');
    } else {
      contactsList = `• **IT Enterprise Helpdesk**: Ext. 1044 | it-support@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal\n• **People & HR Operations**: Floor 4, Suite 402 | hr@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal\n• **Cybersecurity GSOC (24/7)**: +1 (800) 555-0199 | gsoc@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal\n• **Campus Facilities**: Ext. 2000 | facilities@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.internal`;
    }

    return {
      category: 'contacts',
      answer: `**${company} Support & Directory Contacts:**\n\n${contactsList}\n\n💡 You can initiate direct calls or trigger the AI Call Interceptor from the **Support & About** page.`,
      sources: [`${company} Directory`],
    };
  }

  // =========================================================================
  // 9. LEAVES, HOLIDAYS & HR POLICIES
  // =========================================================================
  if (
    q.includes('leave') || q.includes('holiday') || q.includes('sick') ||
    q.includes('casual') || q.includes('pto') || q.includes('vacation') ||
    q.includes('salary') || q.includes('payroll') || q.includes('insurance')
  ) {
    return {
      category: 'policy',
      answer: `**${company} Leave & Benefits Framework:**\n\n🏖️ **Annual Leave Quota:**\n• **Paid Time Off (PTO)**: 18 days per calendar year (accrued monthly).\n• **Casual / Sick Leave**: 12 days per year for medical emergencies or personal needs.\n• **Optional Holidays**: 2 floating holidays chosen from the cultural calendar.\n\n🏥 **Health & Wellness Insurance:**\n• Comprehensive medical coverage for employee + immediate dependents.\n• Cashless network at top hospitals. Coverage card available in your HR portal.\n\n💰 **Payroll & Compensation:**\n• Salary disbursement: Last business day of each month.\n• Payslips and tax declarations are managed via the Finance portal.`,
      sources: [`${company} Total Rewards & Benefits Policy`],
    };
  }

  // =========================================================================
  // 10. COMPREHENSIVE INTELLIGENT EXECUTIVE FALLBACK
  // =========================================================================
  return {
    category: 'policy',
    answer: `**${company} Enterprise Workplace Intelligence:**\n\nRegarding your question about **"${ctx.query}"**:\n\nAs a **${role}** in the **${dept}** division at **${company} (${branch})**, here is how to navigate this:\n\n1. 🔍 **Operating Standards**: All activities align with standard office timings (9:30 AM – 6:30 PM, Mon–Fri) and live overtime governance.\n2. 📋 **Onboarding Day ${day} Alignment**: Check your current task board and journey milestones to verify any prerequisites or dependencies.\n3. 🤝 **Team Escalation**: You can reach out directly to your ${dept} lead, your onboarding buddy, or the IT Helpdesk for real-time support.\n4. 🗺️ **Campus Routing**: Visit the interactive 3D map to locate relevant departments and facilities.\n\nIf you need something specific, ask about: *"working hours"*, *"my tasks"*, *"laptop setup"*, *"WiFi password"*, *"leave policy"*, or *"support contacts"*.`,
    sources: [`${company} Operational Blueprint`, `Day ${day} Guide`],
  };
}
