// Genesis — Comprehensive Mock Data for Demo
// This powers the entire demo without requiring a live Supabase connection

import type {
  Company, Branch, Department, Employee, OnboardingTask, TaskStep,
  TaskDependency, Resource, Location, WorkingHours, Holiday, Contact,
  Document, EmployeeTask, Skill, Project, EmployeeExperience,
  SupportRequest, Notification, ActivityLog, EmployeeResource
} from '@/types';

// ============================================================
// COMPANIES
// ============================================================
export const MOCK_COMPANIES: Company[] = [
  {
    id: 'company-microsoft',
    name: 'Microsoft',
    logo_url: '/logos/microsoft.svg',
    industry: 'Technology',
    description: 'Empowering every person and every organization on the planet to achieve more.',
    website: 'https://microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-google',
    name: 'Google',
    logo_url: '/logos/google.svg',
    industry: 'Technology',
    description: 'Organizing the world\'s information and making it universally accessible.',
    website: 'https://google.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-amazon',
    name: 'Amazon',
    logo_url: '/logos/amazon.svg',
    industry: 'E-Commerce & Cloud',
    description: 'Earth\'s most customer-centric company.',
    website: 'https://amazon.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-technova',
    name: 'TechNova',
    logo_url: '/logos/technova.svg',
    industry: 'Software',
    description: 'Next-generation software solutions for modern enterprises.',
    website: 'https://technova.io',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-greenbyte',
    name: 'GreenByte',
    logo_url: '/logos/greenbyte.svg',
    industry: 'GreenTech',
    description: 'Sustainable technology for a better tomorrow.',
    website: 'https://greenbyte.co',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// BRANCHES
// ============================================================
export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'branch-msft-noida',
    company_id: 'company-microsoft',
    name: 'Noida Campus',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    address: 'Microsoft India, Tower B, 15th Floor, Plot C-1, Sector 63, Noida, UP 201301',
    timezone: 'Asia/Kolkata',
    is_headquarters: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'branch-msft-bangalore',
    company_id: 'company-microsoft',
    name: 'Bangalore Campus',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    address: 'Microsoft India, 9, Lavelle Road, Bangalore, Karnataka 560001',
    timezone: 'Asia/Kolkata',
    is_headquarters: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'branch-technova-delhi',
    company_id: 'company-technova',
    name: 'Delhi HQ',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    address: 'TechNova India, Tower A, Cyber Hub, Gurugram, Delhi NCR 122002',
    timezone: 'Asia/Kolkata',
    is_headquarters: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'branch-google-hyderabad',
    company_id: 'company-google',
    name: 'Hyderabad Campus',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    address: 'Google India, Salarpuria Sattva Knowledge City, Raidurg, Hyderabad 500081',
    timezone: 'Asia/Kolkata',
    is_headquarters: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// DEPARTMENTS
// ============================================================
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-engineering',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Engineering',
    description: 'Software development, architecture, and platform teams.',
    head_name: 'Rajesh Kumar',
    head_email: 'rajesh.kumar@microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-hr',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Human Resources',
    description: 'People, culture, and talent management.',
    head_name: 'Priya Sharma',
    head_email: 'priya.sharma@microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-it',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'IT & Infrastructure',
    description: 'Internal IT support and enterprise infrastructure.',
    head_name: 'Arun Mehta',
    head_email: 'arun.mehta@microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-security',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Security',
    description: 'Enterprise security, compliance, and information security.',
    head_name: 'Vikram Singh',
    head_email: 'vikram.singh@microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-design',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Design',
    description: 'UI/UX and product design teams.',
    head_name: 'Neha Gupta',
    head_email: 'neha.gupta@microsoft.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// CONTACTS
// ============================================================
export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-hr-priya',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    department_id: 'dept-hr',
    name: 'Priya Sharma',
    role: 'HR Manager',
    email: 'priya.sharma@microsoft.com',
    phone: '+91-9876543210',
    office: 'Tower B, Floor 3, Room 302',
    availability: 'Mon–Fri, 9:00 AM – 6:00 PM',
    is_hr_contact: true,
    is_it_contact: false,
    is_security_contact: false,
    is_buddy: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contact-it-arun',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    department_id: 'dept-it',
    name: 'Arun Mehta',
    role: 'IT Support Lead',
    email: 'arun.mehta@microsoft.com',
    phone: '+91-9876543211',
    office: 'Tower B, Floor 2, IT Help Desk',
    availability: 'Mon–Fri, 8:00 AM – 8:00 PM',
    is_hr_contact: false,
    is_it_contact: true,
    is_security_contact: false,
    is_buddy: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contact-security-vikram',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    department_id: 'dept-security',
    name: 'Vikram Singh',
    role: 'Security Officer',
    email: 'vikram.singh@microsoft.com',
    phone: '+91-9876543212',
    office: 'Ground Floor, Security Desk',
    availability: 'Mon–Sat, 7:00 AM – 9:00 PM',
    is_hr_contact: false,
    is_it_contact: false,
    is_security_contact: true,
    is_buddy: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contact-buddy-arjun',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    department_id: 'dept-engineering',
    name: 'Arjun Kapoor',
    role: 'Senior Software Engineer (Buddy)',
    email: 'arjun.kapoor@microsoft.com',
    phone: '+91-9876543213',
    office: 'Tower B, Floor 10, Engineering Bay',
    availability: 'Mon–Fri, 9:00 AM – 7:00 PM',
    is_hr_contact: false,
    is_it_contact: false,
    is_security_contact: false,
    is_buddy: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contact-manager-rajesh',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    department_id: 'dept-engineering',
    name: 'Rajesh Kumar',
    role: 'Engineering Manager',
    email: 'rajesh.kumar@microsoft.com',
    phone: '+91-9876543214',
    office: 'Tower B, Floor 10, Room 1002',
    availability: 'Mon–Fri, 10:00 AM – 7:00 PM',
    is_hr_contact: false,
    is_it_contact: false,
    is_security_contact: false,
    is_buddy: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// LOCATIONS
// ============================================================
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-reception',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Main Reception',
    category: 'Reception',
    building: 'Tower B',
    floor: 'Ground Floor',
    room: 'Main Entrance',
    description: 'Main entrance and visitor registration. Collect your access card here on Day 1.',
    contact_name: 'Reception Team',
    contact_email: 'reception.noida@microsoft.com',
    contact_phone: '+91-120-1234567',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-hr-office',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'HR Office',
    category: 'HR Office',
    building: 'Tower B',
    floor: '3rd Floor',
    room: 'Room 302',
    description: 'Human Resources team. Visit for documentation, policies, and onboarding queries.',
    contact_name: 'Priya Sharma',
    contact_email: 'priya.sharma@microsoft.com',
    contact_phone: '+91-9876543210',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+Tower+B',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-it-helpdesk',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'IT Help Desk',
    category: 'IT Help Desk',
    building: 'Tower B',
    floor: '2nd Floor',
    room: 'IT Wing',
    description: 'Collect your laptop, set up accounts, and get technical support here.',
    contact_name: 'Arun Mehta',
    contact_email: 'arun.mehta@microsoft.com',
    contact_phone: '+91-9876543211',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+IT',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-security-desk',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Security Desk',
    category: 'Security Desk',
    building: 'Tower B',
    floor: 'Ground Floor',
    room: 'Near Main Entrance',
    description: 'Complete security registration, biometrics, and access badge activation.',
    contact_name: 'Vikram Singh',
    contact_email: 'vikram.singh@microsoft.com',
    contact_phone: '+91-9876543212',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+Security',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-cafeteria',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Cafe B',
    category: 'Cafeteria',
    building: 'Tower B',
    floor: 'Ground Floor',
    room: 'West Wing',
    description: 'Company cafeteria. Breakfast, lunch, and snacks available. Subsidized meals for employees.',
    contact_name: 'Cafeteria Team',
    contact_email: 'cafeteria.noida@microsoft.com',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+Cafeteria',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-training-room',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Training Room TR-1',
    category: 'Training Room',
    building: 'Tower B',
    floor: '4th Floor',
    room: 'TR-101',
    description: 'Main training room for onboarding sessions, workshops, and learning programs.',
    contact_name: 'Learning & Development Team',
    contact_email: 'learning@microsoft.com',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+Training',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'loc-engineering-bay',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Engineering Bay',
    category: 'Department Office',
    building: 'Tower B',
    floor: '10th Floor',
    room: 'Open Bay',
    description: 'Engineering team workspace. Find your assigned desk, meet your team.',
    contact_name: 'Rajesh Kumar',
    contact_email: 'rajesh.kumar@microsoft.com',
    map_url: 'https://maps.google.com/?q=Microsoft+India+Noida+Engineering',
    latitude: 28.6271,
    longitude: 77.3717,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// WORKING HOURS
// ============================================================
export const MOCK_WORKING_HOURS: WorkingHours[] = [
  // HR Office: Mon-Fri 9-6
  ...([1,2,3,4,5].map(day => ({
    id: `wh-hr-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-hr-office',
    day_of_week: day,
    opens_at: '09:00',
    closes_at: '18:00',
    is_closed: false,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  }))),
  ...[0,6].map(day => ({
    id: `wh-hr-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-hr-office',
    day_of_week: day,
    opens_at: '00:00',
    closes_at: '00:00',
    is_closed: true,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  })),
  // IT Help Desk: Mon-Fri 8-8
  ...([1,2,3,4,5].map(day => ({
    id: `wh-it-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-it-helpdesk',
    day_of_week: day,
    opens_at: '08:00',
    closes_at: '20:00',
    is_closed: false,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  }))),
  ...[0,6].map(day => ({
    id: `wh-it-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-it-helpdesk',
    day_of_week: day,
    opens_at: '00:00',
    closes_at: '00:00',
    is_closed: true,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  })),
  // Security Desk: Mon-Sat 7-9
  ...([1,2,3,4,5,6].map(day => ({
    id: `wh-security-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-security-desk',
    day_of_week: day,
    opens_at: '07:00',
    closes_at: '21:00',
    is_closed: false,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  }))),
  {
    id: 'wh-security-0',
    entity_type: 'location',
    entity_id: 'loc-security-desk',
    day_of_week: 0,
    opens_at: '00:00',
    closes_at: '00:00',
    is_closed: true,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  },
  // Cafeteria: Mon-Fri 7:30-8:30 PM
  ...([1,2,3,4,5].map(day => ({
    id: `wh-cafe-${day}`,
    entity_type: 'location' as const,
    entity_id: 'loc-cafeteria',
    day_of_week: day,
    opens_at: '07:30',
    closes_at: '20:30',
    is_closed: false,
    is_24_7: false,
    timezone: 'Asia/Kolkata',
  }))),
];

// ============================================================
// HOLIDAYS
// ============================================================
export const MOCK_HOLIDAYS: Holiday[] = [
  {
    id: 'holiday-republic',
    company_id: 'company-microsoft',
    name: 'Republic Day',
    date: '2026-01-26',
    is_optional: false,
    description: 'National public holiday — Republic Day of India.',
  },
  {
    id: 'holiday-holi',
    company_id: 'company-microsoft',
    name: 'Holi',
    date: '2026-03-14',
    is_optional: true,
    description: 'Festival of Colors — optional holiday.',
  },
  {
    id: 'holiday-diwali',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Diwali',
    date: '2026-10-20',
    is_optional: false,
    description: 'Festival of Lights — branch holiday.',
  },
];

// ============================================================
// TASKS (Day 1–5, with dependencies)
// ============================================================
export const MOCK_TASKS: OnboardingTask[] = [
  // DAY 1: HR + Documentation
  {
    id: 'task-welcome-hr',
    company_id: 'company-microsoft',
    name: 'Welcome HR Meeting',
    description: 'Attend your welcome meeting with the HR team. Get your welcome kit and learn about company culture.',
    why_required: 'This meeting officially onboards you to the company and provides essential first-day information.',
    category: 'HR',
    priority: 'critical',
    estimated_minutes: 60,
    day_number: 1,
    location_id: 'loc-hr-office',
    contact_id: 'contact-hr-priya',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-documentation',
    company_id: 'company-microsoft',
    name: 'Submit Employment Documents',
    description: 'Submit all required documents: ID proof, address proof, educational certificates, bank account details, and emergency contact information.',
    why_required: 'Required by law and company policy for employee verification and payroll setup.',
    category: 'HR',
    priority: 'critical',
    estimated_minutes: 45,
    day_number: 1,
    location_id: 'loc-hr-office',
    contact_id: 'contact-hr-priya',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-access-card',
    company_id: 'company-microsoft',
    name: 'Collect Access Badge',
    description: 'Visit the reception to collect your employee access badge. This gives you access to the building and secured areas.',
    why_required: 'Your access badge is mandatory for building entry and system access.',
    category: 'HR',
    priority: 'critical',
    estimated_minutes: 20,
    day_number: 1,
    location_id: 'loc-reception',
    contact_id: 'contact-hr-priya',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-office-tour',
    company_id: 'company-microsoft',
    name: 'Office Orientation Tour',
    description: 'Take a guided tour of the office. Learn where key departments, facilities, emergency exits, and amenities are located.',
    why_required: 'Helps you navigate the office independently from Day 2.',
    category: 'HR',
    priority: 'high',
    estimated_minutes: 45,
    day_number: 1,
    location_id: 'loc-reception',
    contact_id: 'contact-buddy-arjun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // DAY 2: IT Setup
  {
    id: 'task-laptop-collection',
    company_id: 'company-microsoft',
    name: 'Collect Laptop & Equipment',
    description: 'Visit the IT Help Desk to collect your assigned laptop, accessories (keyboard, mouse, monitor if applicable), and equipment.',
    why_required: 'You need your work device to complete all subsequent setup and work tasks.',
    category: 'IT',
    priority: 'critical',
    estimated_minutes: 30,
    day_number: 2,
    location_id: 'loc-it-helpdesk',
    contact_id: 'contact-it-arun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-account-setup',
    company_id: 'company-microsoft',
    name: 'Corporate Account Setup',
    description: 'Set up your corporate email, Microsoft 365 account, Teams, SharePoint access, and other communication tools.',
    why_required: 'Required to communicate with your team and access company resources.',
    category: 'IT',
    priority: 'critical',
    estimated_minutes: 60,
    day_number: 2,
    location_id: 'loc-it-helpdesk',
    contact_id: 'contact-it-arun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-vpn-setup',
    company_id: 'company-microsoft',
    name: 'VPN & Remote Access Setup',
    description: 'Install and configure the company VPN client. Test connectivity to internal systems and verify remote access works.',
    why_required: 'VPN access is mandatory for accessing internal systems and working remotely.',
    category: 'IT',
    priority: 'high',
    estimated_minutes: 45,
    day_number: 2,
    location_id: 'loc-it-helpdesk',
    contact_id: 'contact-it-arun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // DAY 3: Security
  {
    id: 'task-security-training',
    company_id: 'company-microsoft',
    name: 'Security Awareness Training',
    description: 'Complete the mandatory Security Awareness Training module. Covers phishing, data handling, password policies, and incident reporting.',
    why_required: 'Mandatory compliance requirement. Required before gaining production system access.',
    category: 'Security',
    priority: 'critical',
    estimated_minutes: 120,
    day_number: 3,
    location_id: 'loc-training-room',
    contact_id: 'contact-security-vikram',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-device-verification',
    company_id: 'company-microsoft',
    name: 'Device Security Verification',
    description: 'Visit the Security Desk to verify your device is properly enrolled in the company\'s mobile device management (MDM) system.',
    why_required: 'All company devices must be enrolled in MDM before accessing company data.',
    category: 'Security',
    priority: 'critical',
    estimated_minutes: 30,
    day_number: 3,
    location_id: 'loc-security-desk',
    contact_id: 'contact-security-vikram',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-2fa-setup',
    company_id: 'company-microsoft',
    name: 'Multi-Factor Authentication Setup',
    description: 'Set up Microsoft Authenticator app for multi-factor authentication on all corporate accounts.',
    why_required: 'MFA is mandatory for all corporate accounts as per company security policy.',
    category: 'Security',
    priority: 'critical',
    estimated_minutes: 20,
    day_number: 3,
    contact_id: 'contact-it-arun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // DAY 4: Team Integration
  {
    id: 'task-team-introduction',
    company_id: 'company-microsoft',
    name: 'Team Introduction Meeting',
    description: 'Meet your immediate team members. Your manager will facilitate introductions and explain the team\'s mission and current projects.',
    why_required: 'Builds relationships and gives context on the team\'s work and your place in it.',
    category: 'Team',
    priority: 'high',
    estimated_minutes: 90,
    day_number: 4,
    location_id: 'loc-engineering-bay',
    contact_id: 'contact-manager-rajesh',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-buddy-meeting',
    company_id: 'company-microsoft',
    name: '1:1 with Onboarding Buddy',
    description: 'Have a casual 1:1 with your assigned buddy, Arjun Kapoor. Ask anything — no question is too small.',
    why_required: 'Your buddy is your go-to person for informal guidance, team culture, and day-to-day tips.',
    category: 'Team',
    priority: 'high',
    estimated_minutes: 60,
    day_number: 4,
    location_id: 'loc-engineering-bay',
    contact_id: 'contact-buddy-arjun',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-tools-access',
    company_id: 'company-microsoft',
    name: 'Developer Tools & Repository Access',
    description: 'Get access to GitHub/Azure DevOps repositories, CI/CD pipelines, development environments, and any team-specific tools.',
    why_required: 'Required to start contributing to the codebase and participate in team workflows.',
    category: 'IT',
    priority: 'high',
    estimated_minutes: 60,
    day_number: 4,
    contact_id: 'contact-it-arun',
    applicable_departments: ['dept-engineering'],
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },

  // DAY 5: Role Setup
  {
    id: 'task-role-setup',
    company_id: 'company-microsoft',
    name: 'Role & Responsibilities Overview',
    description: 'Meet with your manager to understand your role, responsibilities, KPIs, expectations for the first 30-60-90 days.',
    why_required: 'Clarity on expectations helps you hit the ground running and align with team goals.',
    category: 'Role',
    priority: 'critical',
    estimated_minutes: 90,
    day_number: 5,
    location_id: 'loc-engineering-bay',
    contact_id: 'contact-manager-rajesh',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-first-project',
    company_id: 'company-microsoft',
    name: 'First Project Kickoff',
    description: 'Get briefed on your first assignment. Review the project scope, team structure, and immediate action items.',
    why_required: 'Starting with a real task accelerates your integration and demonstrates value to the team.',
    category: 'Role',
    priority: 'high',
    estimated_minutes: 60,
    day_number: 5,
    contact_id: 'contact-manager-rajesh',
    applicable_departments: ['dept-engineering'],
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task-learning-plan',
    company_id: 'company-microsoft',
    name: 'Create Your 30-Day Learning Plan',
    description: 'Work with your manager and buddy to identify key learning areas, required certifications, and training for your first month.',
    why_required: 'Structured learning accelerates your growth and ensures you have the right skills for your role.',
    category: 'Training',
    priority: 'medium',
    estimated_minutes: 45,
    day_number: 5,
    contact_id: 'contact-buddy-arjun',
    is_required: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// TASK STEPS
// ============================================================
export const MOCK_TASK_STEPS: TaskStep[] = [
  // Steps for Security Training
  {
    id: 'step-sec-1',
    task_id: 'task-security-training',
    step_number: 1,
    title: 'Open Training Portal',
    description: 'Navigate to https://learning.microsoft.com and log in with your corporate account.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-sec-2',
    task_id: 'task-security-training',
    step_number: 2,
    title: 'Complete Phishing Awareness Module',
    description: 'Watch the 30-minute phishing awareness video and pass the quiz with a score of 80% or above.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-sec-3',
    task_id: 'task-security-training',
    step_number: 3,
    title: 'Complete Data Handling Policy',
    description: 'Read the Data Classification and Handling Policy and confirm understanding.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-sec-4',
    task_id: 'task-security-training',
    step_number: 4,
    title: 'Complete Password Security Module',
    description: 'Complete the Password Security best practices module.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-sec-5',
    task_id: 'task-security-training',
    step_number: 5,
    title: 'Submit Completion Certificate',
    description: 'Download and submit the completion certificate to HR via the onboarding portal.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  // Steps for Account Setup
  {
    id: 'step-acc-1',
    task_id: 'task-account-setup',
    step_number: 1,
    title: 'Activate Corporate Email',
    description: 'Use the temporary credentials from IT to activate your @microsoft.com email address.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-acc-2',
    task_id: 'task-account-setup',
    step_number: 2,
    title: 'Set Up Microsoft Teams',
    description: 'Install and configure Microsoft Teams. Join your team channels.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-acc-3',
    task_id: 'task-account-setup',
    step_number: 3,
    title: 'Configure Outlook',
    description: 'Set up Outlook calendar, configure signature, and add team members.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-acc-4',
    task_id: 'task-account-setup',
    step_number: 4,
    title: 'Access SharePoint',
    description: 'Log into SharePoint and bookmark your team\'s document library.',
    is_required: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  // Steps for Laptop Collection
  {
    id: 'step-lap-1',
    task_id: 'task-laptop-collection',
    step_number: 1,
    title: 'Visit IT Help Desk',
    description: 'Go to Tower B, 2nd Floor, IT Wing. Bring your employee access badge.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-lap-2',
    task_id: 'task-laptop-collection',
    step_number: 2,
    title: 'Sign Equipment Receipt',
    description: 'Sign the equipment acknowledgment form listing all items received.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'step-lap-3',
    task_id: 'task-laptop-collection',
    step_number: 3,
    title: 'Verify Equipment Condition',
    description: 'Inspect the laptop and accessories. Report any damage immediately.',
    is_required: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// TASK DEPENDENCIES
// ============================================================
export const MOCK_TASK_DEPENDENCIES: TaskDependency[] = [
  // Access card needed before office tour
  { id: 'dep-1', task_id: 'task-office-tour', depends_on_task_id: 'task-access-card', created_at: '2024-01-01T00:00:00Z' },
  // Docs needed before laptop (HR clear first)
  { id: 'dep-2', task_id: 'task-laptop-collection', depends_on_task_id: 'task-documentation', created_at: '2024-01-01T00:00:00Z' },
  // Laptop needed for account setup
  { id: 'dep-3', task_id: 'task-account-setup', depends_on_task_id: 'task-laptop-collection', created_at: '2024-01-01T00:00:00Z' },
  // Account needed for VPN
  { id: 'dep-4', task_id: 'task-vpn-setup', depends_on_task_id: 'task-account-setup', created_at: '2024-01-01T00:00:00Z' },
  // Security training needed before device verification
  { id: 'dep-5', task_id: 'task-device-verification', depends_on_task_id: 'task-security-training', created_at: '2024-01-01T00:00:00Z' },
  // Device verification needed before 2FA
  { id: 'dep-6', task_id: 'task-2fa-setup', depends_on_task_id: 'task-device-verification', created_at: '2024-01-01T00:00:00Z' },
  // Account setup needed before developer tools
  { id: 'dep-7', task_id: 'task-tools-access', depends_on_task_id: 'task-account-setup', created_at: '2024-01-01T00:00:00Z' },
  // Tools access needed for first project
  { id: 'dep-8', task_id: 'task-first-project', depends_on_task_id: 'task-tools-access', created_at: '2024-01-01T00:00:00Z' },
  // Role setup needed for learning plan
  { id: 'dep-9', task_id: 'task-learning-plan', depends_on_task_id: 'task-role-setup', created_at: '2024-01-01T00:00:00Z' },
];

// ============================================================
// RESOURCES
// ============================================================
export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-laptop',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Work Laptop (Surface Pro)',
    description: 'Company-issued Microsoft Surface Pro. Pre-configured with required software.',
    category: 'Device & Equipment',
    contact_name: 'Arun Mehta',
    contact_email: 'arun.mehta@microsoft.com',
    location: 'IT Help Desk, Tower B, Floor 2',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-m365',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Microsoft 365 Account',
    description: 'Corporate email, Teams, SharePoint, OneDrive, and Office apps.',
    category: 'Accounts & Access',
    link: 'https://office.microsoft.com',
    contact_name: 'IT Support',
    contact_email: 'itsupport.noida@microsoft.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-github',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'GitHub Enterprise Access',
    description: 'Access to company GitHub organization for code repositories and collaboration.',
    category: 'Development Tools',
    link: 'https://github.com/microsoft',
    contact_name: 'Arun Mehta',
    contact_email: 'arun.mehta@microsoft.com',
    applicable_departments: ['dept-engineering'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-vpn',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Global VPN Access',
    description: 'Company VPN for secure remote access to internal systems.',
    category: 'Accounts & Access',
    link: 'https://aka.ms/vpn',
    contact_name: 'IT Support',
    contact_email: 'itsupport.noida@microsoft.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-handbook',
    company_id: 'company-microsoft',
    name: 'Employee Handbook 2024',
    description: 'Complete guide to company policies, benefits, leave, and culture.',
    category: 'Documents',
    link: '/docs/employee-handbook',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-learning',
    company_id: 'company-microsoft',
    name: 'Microsoft Learn Platform',
    description: 'Free access to Microsoft Learn for certifications and training.',
    category: 'Training',
    link: 'https://learn.microsoft.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'res-health',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    name: 'Health Insurance (Star Health)',
    description: 'Company-provided health insurance covering employee and dependents.',
    category: 'Benefits',
    link: 'https://aka.ms/msft-health-india',
    contact_name: 'HR Team',
    contact_email: 'hr.noida@microsoft.com',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// DOCUMENTS (for RAG)
// ============================================================
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-handbook',
    company_id: 'company-microsoft',
    title: 'Employee Handbook 2024',
    category: 'Policy',
    description: 'Complete guide to company policies, culture, and procedures.',
    content: `MICROSOFT INDIA EMPLOYEE HANDBOOK 2024

WELCOME TO MICROSOFT
Our mission is to empower every person and every organization on the planet to achieve more.

WORKING HOURS
Standard working hours are 9:00 AM to 6:00 PM, Monday to Friday. Flexible working hours may be available subject to manager approval. Core hours are 10:00 AM to 4:00 PM.

LEAVE POLICY
Annual Leave: 21 days per calendar year
Sick Leave: 12 days per year
Casual Leave: 6 days per year
Maternity Leave: 26 weeks as per applicable law
Paternity Leave: 5 days

DRESS CODE
Business casual attire is the standard. Smart casuals are acceptable. Formal dress required for client meetings.

REMOTE WORK
Hybrid work is supported. Employees may work remotely up to 2 days per week with manager approval. Full remote work is available for specific roles.

EMPLOYEE BENEFITS
- Health Insurance: Comprehensive medical coverage for employee and family
- Life Insurance: Coverage equal to 3x annual CTC
- Provident Fund (PF): As per statutory requirements
- Employee Stock Purchase Plan (ESPP)
- Microsoft 365 for personal use
- LinkedIn Learning subscription
- Meal card (for on-site employees)

CODE OF CONDUCT
All employees must adhere to Microsoft's Standards of Business Conduct. Report any ethics concerns to the Ethics Helpline at 1-800-ETHICS.

IT SECURITY
- Use strong, unique passwords (minimum 12 characters)
- Enable MFA on all corporate accounts
- Do not share credentials under any circumstances
- Report phishing emails to phishing@microsoft.com
- Company data must not be stored on personal devices

ONBOARDING PROCESS
New joiners complete a structured 5-day onboarding journey covering HR, IT, Security, Team Integration, and Role Setup.`,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-it-guide',
    company_id: 'company-microsoft',
    title: 'IT Setup Guide for New Joiners',
    category: 'IT',
    description: 'Step-by-step guide to setting up all IT systems.',
    content: `IT SETUP GUIDE FOR NEW JOINERS

STEP 1: COLLECT YOUR DEVICE
Visit the IT Help Desk at Tower B, 2nd Floor during business hours (8 AM - 8 PM, Mon-Fri).
Bring your employee access badge.
You will receive: Surface Pro laptop, USB-C hub, power adapter, and accessories.

STEP 2: ACTIVATE YOUR ACCOUNT
Your temporary login credentials will be emailed to your personal email address.
Login at: https://login.microsoftonline.com
Username: firstname.lastname@microsoft.com
Temporary password: Check your personal email from IT_Onboarding@microsoft.com

STEP 3: CHANGE YOUR PASSWORD
Upon first login, you will be prompted to change your password.
Requirements: Minimum 14 characters, uppercase, lowercase, number, and special character.

STEP 4: SET UP MFA
Download Microsoft Authenticator app on your mobile phone.
Go to https://mysignins.microsoft.com and add the authenticator method.

STEP 5: INSTALL REQUIRED SOFTWARE
All required software will be available via Microsoft Intune Company Portal.
Engineering team specific: VS Code, Docker Desktop, Git, Node.js, Postman.

STEP 6: VPN SETUP
Download Microsoft Global VPN from https://aka.ms/vpn
Your credentials are the same as your corporate account.

STEP 7: TEAMS AND COMMUNICATION
Microsoft Teams is pre-installed. Log in with your corporate credentials.
Join channels: #general, #engineering, #onboarding-class-2024

IT SUPPORT
Email: itsupport.noida@microsoft.com
Phone: +91-120-1234567
Hours: Monday-Friday, 8 AM to 8 PM IST
Location: Tower B, 2nd Floor, IT Wing

COMMON ISSUES
Q: I can't log in with my temporary credentials.
A: Ensure your email is firstname.lastname@microsoft.com. Contact IT at itsupport.noida@microsoft.com

Q: My laptop won't connect to WiFi.
A: Connect to MSFT-Corp network using your corporate credentials. If issue persists, visit IT Help Desk.

Q: I need additional software.
A: Submit a request via the IT Portal at https://itportal.microsoft.com`,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-security-policy',
    company_id: 'company-microsoft',
    title: 'Security Policy & Guidelines',
    category: 'Security',
    description: 'Information security policy for all employees.',
    content: `MICROSOFT INDIA SECURITY POLICY

DATA CLASSIFICATION
Confidential: Customer data, financial data, personal employee information
Internal: Internal communications, project data, process documents
Public: Marketing materials, public announcements

PASSWORD POLICY
Minimum 14 characters
Must include: uppercase, lowercase, number, special character
Cannot reuse last 24 passwords
MFA is mandatory for all accounts

DEVICE SECURITY
All devices must be enrolled in Microsoft Intune
Enable BitLocker encryption
Install Microsoft Defender Antivirus
Lock screen after 5 minutes of inactivity
Do not disable security software

PHISHING AND SOCIAL ENGINEERING
Never click suspicious links
Verify sender before opening attachments
Report phishing to phishing@microsoft.com
Do not share credentials via email or phone

INCIDENT REPORTING
Security incidents must be reported within 1 hour
Report to: security@microsoft.com or call +91-120-7654321
Security Desk: Ground Floor, Tower B

PHYSICAL SECURITY
Always wear your access badge
Do not let others tailgate through secure doors
Report lost badges immediately to Security Desk
Secure your workspace when leaving

VPN USAGE
Always use VPN when working from non-office networks
VPN is mandatory for accessing internal systems remotely

SECURITY TRAINING
Annual Security Awareness Training is mandatory
Completion certificate must be submitted to HR
Failure to complete results in access suspension`,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-office-guide',
    company_id: 'company-microsoft',
    branch_id: 'branch-msft-noida',
    title: 'Noida Office Guide',
    category: 'Office',
    description: 'Complete guide to the Noida campus facilities and layout.',
    content: `NOIDA CAMPUS GUIDE

LOCATION
Microsoft India, Tower B, 15th Floor (main office spans floors 2-15)
Plot C-1, Sector 63, Noida, Uttar Pradesh 201301

GETTING THERE
Metro: Noida Electronic City Metro Station (Blue Line) - 10 min walk
Bus: Multiple DTC and private buses stop near Sector 63
Car: Parking available in basement (2 levels, approx 200 spots)

BUILDING ACCESS
Main Reception: Ground Floor, Tower B - Open 8 AM to 9 PM, Mon-Sat
Security Desk: Ground Floor, near main entrance - Open Mon-Sat 7 AM to 9 PM
Access badge required for all floors above Ground Floor

CAFETERIA (CAFE B)
Location: Ground Floor, West Wing
Hours: Monday to Friday, 7:30 AM to 8:30 PM
Breakfast: 7:30 AM - 10:00 AM
Lunch: 12:00 PM - 3:00 PM
Snacks: 3:00 PM - 6:00 PM
Accepts meal card and UPI payments

IT HELP DESK
Location: Tower B, 2nd Floor, IT Wing
Hours: Monday to Friday, 8:00 AM to 8:00 PM
Services: Device pickup, software support, account help

HR OFFICE
Location: Tower B, 3rd Floor, Room 302
Hours: Monday to Friday, 9:00 AM to 6:00 PM
Services: Documentation, policies, payroll, leave

TRAINING ROOMS
TR-101: 4th Floor, capacity 30 persons
TR-102: 4th Floor, capacity 15 persons
Book via the internal calendar system

ENGINEERING FLOORS
Floors 8-12: Engineering teams
Floor 10: Main Engineering Bay (where your team sits)

PARKING
Basement Level 1 & 2: 200 spots
Access with employee badge
Electric vehicle charging stations available

EMERGENCY
Emergency Number: 100 (Police), 101 (Fire), 102 (Ambulance)
Internal Security: +91-120-7654321
First Aid: Ground Floor, near Security Desk`,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// DEMO EMPLOYEE: VAIBHAV SHARMA
// ============================================================
export const DEMO_EMPLOYEE: Employee = {
  id: 'emp-vaibhav',
  user_id: 'user-vaibhav',
  company_id: 'company-microsoft',
  branch_id: 'branch-msft-noida',
  department_id: 'dept-engineering',
  employee_id: 'EMP-2024-001',
  name: 'Vaibhav Sharma',
  email: 'vaibhav.sharma@microsoft.com',
  role: 'Software Developer',
  joining_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // yesterday
  work_type: 'hybrid',
  manager_id: 'contact-manager-rajesh',
  buddy_id: 'contact-buddy-arjun',
  preferred_language: 'English',
  setup_completed: true,
  onboarding_day: 2,
  is_active: true,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_EMPLOYEE_EXPERIENCE: EmployeeExperience = {
  id: 'exp-vaibhav',
  employee_id: 'emp-vaibhav',
  experience_type: 'experienced',
  total_years: 2,
  previous_companies: [
    {
      company_name: 'Infosys',
      role: 'Software Engineer',
      duration: '1.5 years',
      location: 'Bangalore',
      description: 'Full stack development with React and Node.js for banking clients.',
    },
    {
      company_name: 'Wipro',
      role: 'Trainee Developer',
      duration: '6 months',
      location: 'Hyderabad',
      description: 'Training program and initial project assignments.',
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    employee_id: 'emp-vaibhav',
    name: 'Banking Portal Redesign',
    type: 'Professional',
    organization: 'Infosys',
    role: 'Frontend Developer',
    duration: '8 months',
    description: 'Redesigned the customer banking portal using React 18, TypeScript, and improved UX. Reduced page load time by 40%.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    employee_id: 'emp-vaibhav',
    name: 'AI Onboarding Assistant',
    type: 'Hackathon',
    organization: 'Bennett University Hackathon 2026',
    role: 'Team Lead & Full Stack Developer',
    duration: '24 hours',
    description: 'Genesis — AI-powered new joiner onboarding platform. Won 1st place.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    employee_id: 'emp-vaibhav',
    name: 'Open Source: React Component Library',
    type: 'Open Source',
    organization: 'GitHub',
    role: 'Contributor',
    duration: '6 months',
    description: 'Contributed 15+ components to a popular React UI library with 2k+ stars.',
    created_at: new Date().toISOString(),
  },
];

export const DEMO_SKILLS: Skill[] = [
  { id: 'skill-1', employee_id: 'emp-vaibhav', name: 'TypeScript', category: 'Programming', proficiency: 'Advanced', created_at: new Date().toISOString() },
  { id: 'skill-2', employee_id: 'emp-vaibhav', name: 'React', category: 'Frontend', proficiency: 'Advanced', created_at: new Date().toISOString() },
  { id: 'skill-3', employee_id: 'emp-vaibhav', name: 'Next.js', category: 'Frontend', proficiency: 'Intermediate', created_at: new Date().toISOString() },
  { id: 'skill-4', employee_id: 'emp-vaibhav', name: 'Node.js', category: 'Backend', proficiency: 'Intermediate', created_at: new Date().toISOString() },
  { id: 'skill-5', employee_id: 'emp-vaibhav', name: 'PostgreSQL', category: 'Database', proficiency: 'Familiar', created_at: new Date().toISOString() },
  { id: 'skill-6', employee_id: 'emp-vaibhav', name: 'Git', category: 'DevOps', proficiency: 'Advanced', created_at: new Date().toISOString() },
  { id: 'skill-7', employee_id: 'emp-vaibhav', name: 'Docker', category: 'DevOps', proficiency: 'Familiar', created_at: new Date().toISOString() },
];

// ============================================================
// DEMO EMPLOYEE TASKS (Vaibhav's assigned tasks with statuses)
// ============================================================
export const DEMO_EMPLOYEE_TASKS: EmployeeTask[] = [
  // Day 1 - Completed
  { id: 'et-1', employee_id: 'emp-vaibhav', task_id: 'task-welcome-hr', status: 'COMPLETED', started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: ['step-sec-1'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-2', employee_id: 'emp-vaibhav', task_id: 'task-documentation', status: 'COMPLETED', started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-3', employee_id: 'emp-vaibhav', task_id: 'task-access-card', status: 'COMPLETED', started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9000000).toISOString(), due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-4', employee_id: 'emp-vaibhav', task_id: 'task-office-tour', status: 'COMPLETED', started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12000000).toISOString(), due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Day 2 - In Progress / Ready
  { id: 'et-5', employee_id: 'emp-vaibhav', task_id: 'task-laptop-collection', status: 'COMPLETED', started_at: new Date().toISOString(), completed_at: new Date(Date.now() + 1800000).toISOString(), due_date: new Date().toISOString().split('T')[0], completed_steps: ['step-lap-1', 'step-lap-2', 'step-lap-3'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-6', employee_id: 'emp-vaibhav', task_id: 'task-account-setup', status: 'IN_PROGRESS', started_at: new Date().toISOString(), due_date: new Date().toISOString().split('T')[0], completed_steps: ['step-acc-1'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-7', employee_id: 'emp-vaibhav', task_id: 'task-vpn-setup', status: 'LOCKED', due_date: new Date().toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Day 3 - Locked
  { id: 'et-8', employee_id: 'emp-vaibhav', task_id: 'task-security-training', status: 'LOCKED', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-9', employee_id: 'emp-vaibhav', task_id: 'task-device-verification', status: 'LOCKED', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-10', employee_id: 'emp-vaibhav', task_id: 'task-2fa-setup', status: 'LOCKED', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Day 4 - Locked
  { id: 'et-11', employee_id: 'emp-vaibhav', task_id: 'task-team-introduction', status: 'LOCKED', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-12', employee_id: 'emp-vaibhav', task_id: 'task-buddy-meeting', status: 'LOCKED', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-13', employee_id: 'emp-vaibhav', task_id: 'task-tools-access', status: 'LOCKED', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Day 5 - Locked
  { id: 'et-14', employee_id: 'emp-vaibhav', task_id: 'task-role-setup', status: 'LOCKED', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-15', employee_id: 'emp-vaibhav', task_id: 'task-first-project', status: 'LOCKED', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'et-16', employee_id: 'emp-vaibhav', task_id: 'task-learning-plan', status: 'LOCKED', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed_steps: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ============================================================
// DEMO EMPLOYEE RESOURCES
// ============================================================
export const DEMO_EMPLOYEE_RESOURCES: EmployeeResource[] = [
  { id: 'er-1', employee_id: 'emp-vaibhav', resource_id: 'res-laptop', status: 'Provided', notes: 'Surface Pro 9 collected on Day 2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-2', employee_id: 'emp-vaibhav', resource_id: 'res-m365', status: 'Provided', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-3', employee_id: 'emp-vaibhav', resource_id: 'res-github', status: 'Pending', notes: 'Requested — IT team processing access', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-4', employee_id: 'emp-vaibhav', resource_id: 'res-vpn', status: 'Action Required', notes: 'Download VPN client and configure', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-5', employee_id: 'emp-vaibhav', resource_id: 'res-handbook', status: 'Provided', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-6', employee_id: 'emp-vaibhav', resource_id: 'res-learning', status: 'Provided', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'er-7', employee_id: 'emp-vaibhav', resource_id: 'res-health', status: 'Pending', notes: 'HR processing within 30 days', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    employee_id: 'emp-vaibhav',
    title: 'Welcome to Microsoft!',
    message: 'Your onboarding journey has begun. Complete Day 1 tasks to get started.',
    type: 'info',
    is_read: true,
    link: '/employee/journey',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    employee_id: 'emp-vaibhav',
    title: 'Laptop Collected ✓',
    message: 'Equipment collected successfully. Next: Set up your corporate accounts.',
    type: 'success',
    is_read: false,
    link: '/employee/tasks/task-account-setup',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    employee_id: 'emp-vaibhav',
    title: 'Action Required: VPN Setup',
    message: 'Your VPN access is pending setup. Complete account setup first.',
    type: 'warning',
    is_read: false,
    link: '/employee/tasks/task-vpn-setup',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================
// ACTIVITY LOG
// ============================================================
export const DEMO_ACTIVITY: ActivityLog[] = [
  { id: 'act-1', employee_id: 'emp-vaibhav', action: 'Completed task: Welcome HR Meeting', entity_type: 'task', entity_id: 'task-welcome-hr', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000).toISOString() },
  { id: 'act-2', employee_id: 'emp-vaibhav', action: 'Completed task: Submit Employment Documents', entity_type: 'task', entity_id: 'task-documentation', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString() },
  { id: 'act-3', employee_id: 'emp-vaibhav', action: 'Completed task: Collect Access Badge', entity_type: 'task', entity_id: 'task-access-card', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9000000).toISOString() },
  { id: 'act-4', employee_id: 'emp-vaibhav', action: 'Completed task: Office Orientation Tour', entity_type: 'task', entity_id: 'task-office-tour', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12000000).toISOString() },
  { id: 'act-5', employee_id: 'emp-vaibhav', action: 'Completed task: Collect Laptop & Equipment', entity_type: 'task', entity_id: 'task-laptop-collection', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'act-6', employee_id: 'emp-vaibhav', action: 'Started task: Corporate Account Setup', entity_type: 'task', entity_id: 'task-account-setup', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

// ============================================================
// SUPPORT REQUESTS
// ============================================================
export const DEMO_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'sup-1',
    employee_id: 'emp-vaibhav',
    task_id: 'task-account-setup',
    type: 'IT',
    subject: 'Cannot activate corporate email',
    description: 'I received my temporary credentials but the login page says "Account not found".',
    status: 'RESOLVED',
    assigned_to: 'Arun Mehta',
    ai_response: 'Your account may still be provisioning. Common fix: wait 30 minutes and try again. If it persists, contact IT at itsupport.noida@microsoft.com or visit the IT Help Desk at Tower B, Floor 2.',
    resolution_notes: 'Account was still provisioning. Resolved by IT team within 2 hours.',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCompanyById(id: string): Company | undefined {
  return MOCK_COMPANIES.find(c => c.id === id);
}

export function getBranchesByCompany(companyId: string): Branch[] {
  return MOCK_BRANCHES.filter(b => b.company_id === companyId);
}

export function getDepartmentsByBranch(branchId: string): Department[] {
  return MOCK_DEPARTMENTS.filter(d => d.branch_id === branchId);
}

export function getLocationsByBranch(branchId: string): Location[] {
  return MOCK_LOCATIONS.filter(l => l.branch_id === branchId);
}

export function getWorkingHoursByLocation(locationId: string): WorkingHours[] {
  return MOCK_WORKING_HOURS.filter(wh => wh.entity_id === locationId);
}

export function getTaskById(id: string): OnboardingTask | undefined {
  return MOCK_TASKS.find(t => t.id === id);
}

export function getTaskSteps(taskId: string): TaskStep[] {
  return MOCK_TASK_STEPS.filter(s => s.task_id === taskId);
}

export function getTaskDependencies(taskId: string): TaskDependency[] {
  return MOCK_TASK_DEPENDENCIES.filter(d => d.task_id === taskId);
}

export function getContactById(id: string): Contact | undefined {
  return MOCK_CONTACTS.find(c => c.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return MOCK_LOCATIONS.find(l => l.id === id);
}

export function getResourceById(id: string): Resource | undefined {
  return MOCK_RESOURCES.find(r => r.id === id);
}

// Calculate overall progress for an employee's tasks
export function calculateProgress(tasks: EmployeeTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
}

// Get location status based on current time
export function getLocationStatus(locationId: string): {
  status: 'Open' | 'Closed' | 'Closing Soon' | '24/7';
  message: string;
} {
  const now = new Date();
  const day = now.getDay();
  const hours = MOCK_WORKING_HOURS.filter(wh => wh.entity_id === locationId);
  const todayHours = hours.find(wh => wh.day_of_week === day);

  if (!todayHours) return { status: 'Closed', message: 'Closed today.' };
  if (todayHours.is_24_7) return { status: '24/7', message: 'Open 24/7.' };
  if (todayHours.is_closed) return { status: 'Closed', message: 'Closed today.' };

  const [openH, openM] = todayHours.opens_at.split(':').map(Number);
  const [closeH, closeM] = todayHours.closes_at.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes < openMinutes) {
    return { status: 'Closed', message: `Opens today at ${todayHours.opens_at}.` };
  }
  if (currentMinutes >= closeMinutes) {
    // Find next opening
    let nextDay = (day + 1) % 7;
    for (let i = 0; i < 7; i++) {
      const next = hours.find(wh => wh.day_of_week === nextDay);
      if (next && !next.is_closed) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return { status: 'Closed', message: `Opens ${dayNames[nextDay]} at ${next.opens_at}.` };
      }
      nextDay = (nextDay + 1) % 7;
    }
    return { status: 'Closed', message: 'Currently closed.' };
  }
  // Closing soon (within 30 min)
  if (closeMinutes - currentMinutes <= 30) {
    const minsLeft = closeMinutes - currentMinutes;
    return { status: 'Closing Soon', message: `Closing in ${minsLeft} minutes (at ${todayHours.closes_at}).` };
  }
  return { status: 'Open', message: `Open until ${todayHours.closes_at}.` };
}

// Resolve which tasks are unlocked for an employee based on completed dependencies
export function resolveTaskStatuses(employeeTasks: EmployeeTask[]): EmployeeTask[] {
  return employeeTasks.map(et => {
    if (et.status !== 'LOCKED') return et;
    const deps = getTaskDependencies(et.task_id);
    if (deps.length === 0) return { ...et, status: 'READY' };
    const allDepsCompleted = deps.every(dep => {
      const depTask = employeeTasks.find(t => t.task_id === dep.depends_on_task_id);
      return depTask?.status === 'COMPLETED';
    });
    if (allDepsCompleted) return { ...et, status: 'READY' };
    return et;
  });
}

// ============================================================
// HR PORTAL EMPLOYEES ROSTER
// ============================================================
export interface HREmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  joining_date: string;
  onboarding_day: number;
  onboarding_progress: number;
  onboarding_complete: boolean;
  is_at_risk: boolean;
  risk_reason?: string;
  completed_tasks_count: number;
  total_tasks_count: number;
  pending_tasks_count: number;
  blocked_tasks_count: number;
}

export const MOCK_HR_EMPLOYEES: HREmployeeRecord[] = [
  {
    id: 'emp-vaibhav',
    name: 'Vaibhav Sharma',
    role: 'Software Developer',
    department: 'Engineering',
    email: 'vaibhav.sharma@microsoft.com',
    joining_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 2,
    onboarding_progress: 31,
    onboarding_complete: false,
    is_at_risk: false,
    completed_tasks_count: 5,
    total_tasks_count: 16,
    pending_tasks_count: 11,
    blocked_tasks_count: 0,
  },
  {
    id: 'emp-vanshika',
    name: 'Vanshika',
    role: 'Frontend Engineer',
    department: 'Engineering',
    email: 'vanshika@microsoft.com',
    joining_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 4,
    onboarding_progress: 75,
    onboarding_complete: false,
    is_at_risk: false,
    completed_tasks_count: 12,
    total_tasks_count: 16,
    pending_tasks_count: 4,
    blocked_tasks_count: 0,
  },
  {
    id: 'emp-manvi',
    name: 'Manvi',
    role: 'Product Designer',
    department: 'Design',
    email: 'manvi@microsoft.com',
    joining_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 3,
    onboarding_progress: 50,
    onboarding_complete: false,
    is_at_risk: true,
    risk_reason: 'Access badge pending pickup for 48h',
    completed_tasks_count: 8,
    total_tasks_count: 16,
    pending_tasks_count: 7,
    blocked_tasks_count: 1,
  },
  {
    id: 'emp-navya',
    name: 'Navya',
    role: 'Backend Engineer',
    department: 'Engineering',
    email: 'navya@microsoft.com',
    joining_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 5,
    onboarding_progress: 100,
    onboarding_complete: true,
    is_at_risk: false,
    completed_tasks_count: 16,
    total_tasks_count: 16,
    pending_tasks_count: 0,
    blocked_tasks_count: 0,
  },
  {
    id: 'emp-reshma',
    name: 'Reshma',
    role: 'AI / ML Engineer',
    department: 'Engineering',
    email: 'reshma@microsoft.com',
    joining_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 1,
    onboarding_progress: 25,
    onboarding_complete: false,
    is_at_risk: false,
    completed_tasks_count: 4,
    total_tasks_count: 16,
    pending_tasks_count: 12,
    blocked_tasks_count: 0,
  },
  {
    id: 'emp-rohan',
    name: 'Rohan Gupta',
    role: 'Cloud Architect',
    department: 'Engineering',
    email: 'rohan.gupta@microsoft.com',
    joining_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onboarding_day: 3,
    onboarding_progress: 40,
    onboarding_complete: false,
    is_at_risk: true,
    risk_reason: 'VPN setup blocked due to MFA timeout',
    completed_tasks_count: 6,
    total_tasks_count: 16,
    pending_tasks_count: 9,
    blocked_tasks_count: 1,
  },
];

