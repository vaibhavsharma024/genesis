# GENESIS 🌌
> **“From the First-Week Maze to a Clear Journey.”**

[![Hackathon](https://img.shields.io/badge/Hackathon-Bennett%20University%202026-blueviolet?style=for-the-badge)](https://bennett.edu.in)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20TypeSafe-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4%20Design-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-21%20Table%20Schema-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

---

## 👥 The Genesis Team (Bennett University 2026)
* **Team Leader:** Vaibhav Sharma
* **Team Members:** Vanshika, Manvi, Navya, Reshma

---

## 🎯 The Problem: "The First-Week Maze"
Starting a new job is overwhelming. New joiners face:
1. **The Maze of Tools & Portals:** Fragmented documents, lost emails, and uncoordinated tools.
2. **Missing Dependencies:** Sitting idle because Task B requires Task A, but nobody communicated the prerequisite.
3. **Office Bewilderment:** Not knowing which building, floor, or desk to visit, or arriving when the IT desk is closed.
4. **Slow Escalations:** Blockers take days to reach the right HR or IT person.
5. **Lack of HR Visibility:** HR managers only find out someone was blocked when their onboarding velocity is already tanked.

**GENESIS transforms this chaos into a personalized, guided, real-time trackable journey.**

---

## 🚀 Key Features

### 1. Dual-Portal Experience
- 🧑‍💻 **Employee Portal (`/employee`):** Designed to eliminate anxiety. Clear daily priorities ("What Should I Do Now?"), interactive checklists, live campus mapping, and an instant AI buddy.
- 👔 **HR Command Center (`/hr`):** Real-time visibility into new joiner cohorts, automated at-risk warnings, task bottleneck analytics, team velocities, and daily sentiment pulse tracking.

### 2. Multi-Company Dynamic Engine
Genesis is not hard-coded to a single company. Out of the box, it dynamically loads policies, branches, departments, roles, and onboarding paths for:
- 🏢 **Microsoft** (Noida, Redmond, Bangalore, Hyderabad)
- 🔍 **Google** (Bangalore, Mountain View, Gurugram)
- 📦 **Amazon** (Hyderabad, Seattle, Chennai)
- ⚡ **TechNova Solutions** (Gurugram)
- 🌿 **GreenByte Systems** (Pune)

### 3. Interactive 9-Step Onboarding Setup Wizard (`/employee/setup`)
Empowers new joiners to configure their journey step-by-step:
1. **Welcome:** Mission overview
2. **Company:** Dynamic organization selector
3. **Office:** Branch & campus selection
4. **Department:** Engineering, Product, Design, Sales, Marketing, etc.
5. **Profile:** Role, work type (Hybrid, On-Site, Remote)
6. **Experience:** Fresher vs. Experienced track calibration
7. **Projects:** Highlight past experience
8. **Skills:** Tailor recommended buddies and initial technical tasks
9. **Equipment & Resources:** Instant equipment requisition verification

### 4. 5-Day Onboarding Journey Maze (`/employee/journey`)
- Visual roadmap broken down from Day 1 to Day 5.
- Task status engine: `LOCKED`, `READY`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`.
- Automatic dependency resolution: Tasks unlock dynamically as prerequisites complete.

### 5. Campus & Office Live Navigation (`/employee/company-map`)
- Real-time **Open / Closed** indicator based on current operating hours.
- Building, floor, room numbers, and direct contact details.
- Working hours for HR Desks, IT Support, Security Desks, Cafeterias, and Meeting Rooms.

### 6. "Ask Genesis" Persistent AI Assistant
- Grounded in company policy, employee branch, and current onboarding state.
- Powered by Google Gemini (`/api/ai/chat`) with robust intelligent fallback responses.
- One-click blocker resolution: When a task is blocked, Ask Genesis explains why, connects with the right contact, or auto-files an HR ticket.

### 7. HR Analytics & Pulse (`/hr/analytics`, `/hr/pulse`)
- **Time-to-Productivity Tracking**
- **Cohort Velocity & Bottleneck Heatmap**
- **Daily Mood & Sentiment Tracker:** Real-time pulse with one-click HR intervention.

---

## 🔑 Demo Access & Credentials

Genesis is pre-configured with demo credentials for both portals:

| Portal | URL | Demo Email | Password |
| :--- | :--- | :--- | :--- |
| **Portal Selector** | `/portal-select` | — | — |
| **Employee Portal** | `/employee/login` | `vaibhav.sharma@microsoft.com` | `Genesis@2024` |
| **Interactive Wizard** | `/employee/setup` | *(Instant interactive onboarding)* | *(No password required)* |
| **HR Command Center**| `/hr/login` | `hr@microsoft.com` | `HRGenesis@2024` |

---

## 🛠️ Architecture & Tech Stack

```
genesis/
├── src/
│   ├── app/
│   │   ├── api/ai/chat/          # Gemini AI chat endpoint
│   │   ├── employee/             # Employee Portal Routes
│   │   │   ├── dashboard/        # "What Should I Do Now?" & active task
│   │   │   ├── journey/          # 5-Day visual journey maze
│   │   │   ├── tasks/            # Task list & task detail with blocker triage
│   │   │   ├── company-map/      # Real-time campus & office locator
│   │   │   ├── resources/        # Hardware, credentials, docs
│   │   │   ├── experience/       # Bio, skills, projects
│   │   │   ├── help/             # Support tickets with AI triage
│   │   │   ├── setup/            # 9-Step Onboarding Setup Wizard
│   │   │   └── login/            # Employee auth
│   │   ├── hr/                   # HR Command Center Routes
│   │   │   ├── dashboard/        # Key metrics, at-risk joiners, activity
│   │   │   ├── employees/        # Employee roster & dispatch modal
│   │   │   ├── tasks/            # 16-task onboarding catalog
│   │   │   ├── analytics/        # Velocity, bottleneck detection
│   │   │   ├── pulse/            # Sentiment vibe scores & roadblocks
│   │   │   └── login/            # HR auth
│   │   ├── portal-select/        # Portal selection gateway
│   │   └── layout.tsx            # Global Providers & Toast Notifications
│   ├── components/
│   │   ├── ai/AskGenesis.tsx     # Persistent floating AI chat assistant
│   │   └── Providers.tsx         # Auth & Data context providers
│   ├── lib/
│   │   ├── context.tsx           # Session management & task state store
│   │   ├── mock-data.ts          # Comprehensive multi-company seed data
│   │   └── utils.ts              # Styling & format helpers
│   └── types/                    # Full TypeScript domain models
└── supabase/
    ├── migrations/               # 21-table production PostgreSQL schema
    └── seed.sql                  # Comprehensive multi-company seed data
```

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/vaibhav-sharma-genesis/genesis.git
cd genesis

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start!

---

## 🏆 Bennett University Hackathon 2026
Crafted with passion by **Team Genesis**:
* Vaibhav Sharma (Lead Full-Stack & AI)
* Vanshika
* Manvi
* Navya
* Reshma
