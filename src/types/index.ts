// ============================================================
// GENESIS — Core Type Definitions
// ============================================================

// --- Enums ---

export type UserRole = 'employee' | 'hr_manager' | 'admin';

export type WorkType = 'on-site' | 'remote' | 'hybrid';

export type ExperienceType = 'fresher' | 'experienced';

export type TaskStatus =
  | 'LOCKED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'OVERDUE';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskCategory =
  | 'HR'
  | 'IT'
  | 'Security'
  | 'Team'
  | 'Role'
  | 'Training'
  | 'Administrative'
  | 'Facilities';

export type ResourceCategory =
  | 'Device & Equipment'
  | 'Accounts & Access'
  | 'Development Tools'
  | 'Communication'
  | 'Training'
  | 'Documents'
  | 'Benefits'
  | 'Other';

export type ResourceStatus =
  | 'Provided'
  | 'Pending'
  | 'Not Provided'
  | 'Action Required';

export type SkillCategory =
  | 'Programming'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud'
  | 'AI'
  | 'ML'
  | 'DevOps'
  | 'Cybersecurity'
  | 'Other';

export type SkillProficiency =
  | 'Beginner'
  | 'Familiar'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

export type ProjectType =
  | 'Professional'
  | 'Internship'
  | 'Academic'
  | 'Personal'
  | 'Hackathon'
  | 'Open Source';

export type LocationCategory =
  | 'HR Office'
  | 'IT Help Desk'
  | 'Security Desk'
  | 'Meeting Room'
  | 'Training Room'
  | 'Cafeteria'
  | 'Parking'
  | 'Reception'
  | 'Department Office'
  | 'Other';

export type SupportRequestStatus =
  | 'REQUESTED'
  | 'AI_REVIEWING'
  | 'HUMAN_REQUIRED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportType =
  | 'HR'
  | 'IT'
  | 'Security'
  | 'Manager'
  | 'Onboarding Buddy'
  | 'Facilities'
  | 'Department Admin'
  | 'General';

export type BlockReason =
  | "Don't understand"
  | 'No access'
  | 'Resource missing'
  | 'Location closed'
  | 'Technical problem'
  | 'Human assistance needed'
  | 'Other';

export type OnboardingDay = 1 | 2 | 3 | 4 | 5;

export type JourneyDayStatus = 'Completed' | 'Current' | 'Upcoming' | 'Blocked' | 'Overdue' | 'Locked';

// --- Core Entities ---

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  description?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  address: string;
  timezone: string;
  is_headquarters: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Department {
  id: string;
  company_id: string;
  branch_id?: string;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  branch?: Branch;
}

export interface WorkingHours {
  id: string;
  entity_type: 'department' | 'location' | 'branch';
  entity_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  opens_at: string; // HH:MM
  closes_at: string; // HH:MM
  is_closed: boolean;
  is_24_7: boolean;
  timezone: string;
}

export interface Holiday {
  id: string;
  company_id: string;
  branch_id?: string;
  name: string;
  date: string; // YYYY-MM-DD
  is_optional: boolean;
  description?: string;
}

export interface Location {
  id: string;
  company_id: string;
  branch_id: string;
  name: string;
  category: LocationCategory;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  working_hours?: WorkingHours[];
  branch?: Branch;
  notes?: string;
}

export interface Contact {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  office?: string;
  availability?: string;
  is_hr_contact: boolean;
  is_it_contact: boolean;
  is_security_contact: boolean;
  is_buddy: boolean;
  created_at: string;
}

// --- Users & Employees ---

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  branch_id: string;
  department_id: string;
  employee_id: string; // company-assigned ID
  name: string;
  email: string;
  role: string; // job title
  joining_date: string;
  work_type: WorkType;
  manager_id?: string;
  buddy_id?: string;
  preferred_language: string;
  setup_completed: boolean;
  onboarding_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
  branch?: Branch;
  department?: Department;
  manager?: Employee;
  buddy?: Employee;
  bio?: string;
  profile_photo?: string;
  company_name?: string;
  branch_name?: string;
  department_name?: string;
}

export interface EmployeeExperience {
  id: string;
  employee_id: string;
  experience_type: ExperienceType;
  // For experienced
  total_years?: number;
  previous_companies?: PreviousCompany[];
  // For fresher
  has_internship?: boolean;
  has_academic_projects?: boolean;
  has_personal_projects?: boolean;
  has_hackathons?: boolean;
  has_open_source?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreviousCompany {
  company_name: string;
  role: string;
  duration: string;
  location?: string;
  description?: string;
}

export interface Project {
  id: string;
  employee_id: string;
  name: string;
  type: ProjectType;
  organization?: string;
  role?: string;
  duration?: string;
  description?: string;
  status?: string;
  impact?: string;
  tech_stack?: string[];
  created_at: string;
}

export interface Skill {
  id: string;
  employee_id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  created_at: string;
}

// --- Tasks ---

export interface OnboardingTask {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  name: string;
  description: string;
  why_required?: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimated_minutes: number;
  day_number: OnboardingDay; // Which day this task belongs to
  location_id?: string;
  contact_id?: string;
  applicable_roles?: string[]; // empty = all roles
  applicable_departments?: string[]; // empty = all departments
  applicable_work_types?: WorkType[]; // empty = all work types
  is_required: boolean;
  created_at: string;
  updated_at: string;
  location?: Location;
  contact?: Contact;
  steps?: TaskStep[];
  dependencies?: TaskDependency[];
}

export interface TaskStep {
  id: string;
  task_id: string;
  step_number: number;
  title: string;
  description: string;
  is_required: boolean;
  created_at: string;
}

export interface TaskDependency {
  id: string;
  task_id: string; // The task that depends
  depends_on_task_id: string; // The task it depends on
  created_at: string;
}

export interface EmployeeTask {
  id: string;
  employee_id: string;
  task_id: string;
  status: TaskStatus;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  block_reason?: BlockReason;
  block_notes?: string;
  created_at: string;
  updated_at: string;
  task?: OnboardingTask;
  completed_steps?: string[]; // task_step ids
}

// --- Resources ---

export interface Resource {
  id: string;
  company_id: string;
  branch_id?: string;
  department_id?: string;
  name: string;
  description?: string;
  category: ResourceCategory;
  link?: string;
  contact_name?: string;
  contact_email?: string;
  location?: string;
  applicable_roles?: string[];
  applicable_departments?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeResource {
  id: string;
  employee_id: string;
  resource_id: string;
  status: ResourceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  resource?: Resource;
}

// --- Documents ---

export interface Document {
  id: string;
  company_id: string;
  branch_id?: string;
  title: string;
  category: string;
  description?: string;
  file_url?: string;
  content?: string;
  is_active: boolean;
  applicable_roles?: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
}

// --- Support ---

export interface SupportRequest {
  id: string;
  employee_id: string;
  task_id?: string;
  type: SupportType;
  subject: string;
  description: string;
  status: SupportRequestStatus;
  assigned_to?: string;
  ai_response?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  employee?: Employee;
  task?: OnboardingTask;
}

// --- Notifications ---

export interface Notification {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
}

// --- Activity ---

export interface ActivityLog {
  id: string;
  employee_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// --- AI / Ask Genesis ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface AskGenesisContext {
  employee: Employee;
  currentDay: number;
  currentTask?: EmployeeTask;
  pendingTasks: EmployeeTask[];
  completedTasks: EmployeeTask[];
  locations: Location[];
  workingHours: WorkingHours[];
  holidays: Holiday[];
  contacts: Contact[];
}

// --- Analytics ---

export interface OnboardingMetrics {
  totalEmployees: number;
  onTrack: number;
  needsAttention: number;
  delayed: number;
  completed: number;
  avgProgress: number;
  overdueTasks: number;
  pendingTasks: number;
  completedTasks: number;
  supportRequests: number;
}

export interface DepartmentProgress {
  department: string;
  total: number;
  avgProgress: number;
  onTrack: number;
  delayed: number;
}

// --- Forms ---

export interface SetupFormData {
  // Company step
  company_id: string;
  branch_id: string;
  department_id: string;
  location: string;

  // Details step
  name: string;
  employee_id: string;
  email: string;
  role: string;
  joining_date: string;
  work_type: WorkType;
  manager_name: string;
  buddy_name: string;
  preferred_language: string;

  // Experience step
  experience_type: ExperienceType;
  total_years?: number;
  previous_companies: PreviousCompany[];
  has_internship: boolean;
  has_academic_projects: boolean;
  has_personal_projects: boolean;
  has_hackathons: boolean;
  has_open_source: boolean;

  // Projects step
  projects: Omit<Project, 'id' | 'employee_id' | 'created_at'>[];

  // Skills step
  skills: Omit<Skill, 'id' | 'employee_id' | 'created_at'>[];
}

// --- API Response Types ---

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Journey ---

export interface JourneyDay {
  day: OnboardingDay;
  label: string;
  theme: string;
  description: string;
  status: JourneyDayStatus;
  tasks: EmployeeTask[];
  completedCount: number;
  totalCount: number;
}

export interface JourneyProgress {
  currentDay: OnboardingDay;
  totalProgress: number;
  days: JourneyDay[];
  nextRecommendedTask?: EmployeeTask;
}
