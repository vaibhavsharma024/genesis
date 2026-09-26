-- ============================================================
-- GENESIS SEED DATA
-- Companies: Microsoft, Google, Amazon, TechNova, GreenByte
-- Demo Joiner: Vaibhav Sharma (Day 2 of 5)
-- ============================================================

-- Companies
INSERT INTO companies (id, name, industry, description, website) VALUES
('11111111-1111-1111-1111-111111111111', 'Microsoft', 'Technology', 'Empowering every person and organization to achieve more.', 'https://microsoft.com'),
('22222222-2222-2222-2222-222222222222', 'Google', 'Technology', 'Organizing the worlds information and making it accessible.', 'https://google.com'),
('33333333-3333-3333-3333-333333333333', 'Amazon', 'Cloud & E-Commerce', 'Earths most customer-centric enterprise.', 'https://amazon.com'),
('44444444-4444-4444-4444-444444444444', 'TechNova', 'Software Solutions', 'Pioneering next-generation enterprise platforms.', 'https://technova.io'),
('55555555-5555-5555-5555-555555555555', 'GreenByte', 'GreenTech', 'Sustainable algorithms for cleaner energy futures.', 'https://greenbyte.com');

-- Branches (Microsoft Noida)
INSERT INTO branches (id, company_id, name, city, state, country, address, timezone, is_headquarters) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Noida Campus', 'Noida', 'Uttar Pradesh', 'India', 'Tower B, Plot C-1, Sector 63, Noida 201301', 'Asia/Kolkata', false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Hyderabad Campus', 'Hyderabad', 'Telangana', 'India', 'Gachibowli, Hyderabad 500032', 'Asia/Kolkata', true);

-- Departments
INSERT INTO departments (id, company_id, branch_id, name, description, head_name, head_email) VALUES
('dddddddd-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engineering', 'Core software engineering and architecture.', 'Rajesh Kumar', 'rajesh.kumar@microsoft.com'),
('dddddddd-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Human Resources', 'People, culture, and talent enablement.', 'Priya Sharma', 'priya.sharma@microsoft.com'),
('dddddddd-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'IT & Infrastructure', 'Device distribution and identity security.', 'Arun Mehta', 'arun.mehta@microsoft.com');

-- Locations
INSERT INTO locations (id, company_id, branch_id, name, category, building, floor, room, description, contact_name, contact_phone, map_url) VALUES
('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Reception', 'Reception', 'Tower B', 'Ground Floor', 'Lobby A', 'Check in for visitor badge and access card pickup on Day 1.', 'Front Desk', '+91-120-4567890', 'https://maps.google.com/?q=Microsoft+Noida'),
('cccccccc-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'IT Help Desk', 'IT Help Desk', 'Tower B', '2nd Floor', 'IT Wing', 'Pick up Surface Pro laptop, hardware peripherals, and account assistance.', 'Arun Mehta', '+91-120-4567891', 'https://maps.google.com/?q=Microsoft+Noida'),
('cccccccc-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HR Office', 'HR Office', 'Tower B', '3rd Floor', 'Room 302', 'Documentation verification, medical insurance enrollment, and payroll.', 'Priya Sharma', '+91-120-4567892', 'https://maps.google.com/?q=Microsoft+Noida');

-- Key Contacts
INSERT INTO contacts (company_id, branch_id, name, role, email, phone, office, availability, is_hr_contact, is_it_contact, is_buddy) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Sharma', 'HR Lead', 'priya.sharma@microsoft.com', '+91-9876543210', 'Tower B, Room 302', '9 AM - 6 PM Mon-Fri', true, false, false),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Arun Mehta', 'IT Systems Lead', 'arun.mehta@microsoft.com', '+91-9876543211', 'Tower B, 2nd Floor', '8 AM - 8 PM Mon-Fri', false, true, false),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Arjun Kapoor', 'Senior Software Engineer (Buddy)', 'arjun.kapoor@microsoft.com', '+91-9876543213', 'Tower B, Floor 10', '10 AM - 7 PM Mon-Fri', false, false, true);

-- Tasks Template (16 Tasks across Day 1 to 5)
INSERT INTO onboarding_tasks (name, description, why_required, category, priority, estimated_minutes, day_number, company_id) VALUES
('Welcome HR Meeting', 'Meet HR lead Priya Sharma and review compliance documentation.', 'Statutory onboarding requirement', 'HR', 'critical', 45, 1, '11111111-1111-1111-1111-111111111111'),
('Submit Employment Documents', 'Upload signed copy of offer letter, ID verification, and tax forms.', 'Identity verification and payroll enrollment', 'HR', 'high', 30, 1, '11111111-1111-1111-1111-111111111111'),
('Collect Access Badge', 'Visit Ground Floor Security Desk for biometric photo and RFID badge.', 'Physical access to campus turnstiles and elevators', 'Security', 'critical', 20, 1, '11111111-1111-1111-1111-111111111111'),
('Office Orientation Tour', 'Guided tour of Tower B floors, Cafeteria, Medical room, and Engineering bay.', 'Familiarity with physical campus layout', 'Team', 'medium', 60, 1, '11111111-1111-1111-1111-111111111111'),
('Collect Laptop & Equipment', 'Pick up pre-configured Surface Pro and USB-C hub from 2nd floor IT Help Desk.', 'Hardware necessary for work setup', 'IT', 'critical', 30, 2, '11111111-1111-1111-1111-111111111111'),
('Corporate Account Setup', 'Activate corporate credentials, Outlook calendar, and Teams channels.', 'Communication and identity access', 'IT', 'high', 45, 2, '11111111-1111-1111-1111-111111111111'),
('Global VPN Setup', 'Install Microsoft Global VPN client for secure intranet and cluster access.', 'Required for internal code repos and services', 'IT', 'high', 30, 2, '11111111-1111-1111-1111-111111111111'),
('Security & Compliance Training', 'Complete mandatory phishing awareness, data handling, and password hygiene course.', 'SOC2 & ISO 27001 regulatory compliance', 'Security', 'critical', 90, 3, '11111111-1111-1111-1111-111111111111'),
('Device Verification & BitLocker', 'Confirm device encryption and enroll in Microsoft Intune mobile device management.', 'Enterprise device integrity safeguard', 'Security', 'high', 30, 3, '11111111-1111-1111-1111-111111111111'),
('Two-Factor Authentication (2FA)', 'Set up Microsoft Authenticator on mobile with push notifications.', 'Multi-factor access requirement', 'Security', 'critical', 20, 3, '11111111-1111-1111-1111-111111111111'),
('Team Introduction & Standup', 'Attend daily engineering standup with Engineering Manager Rajesh Kumar.', 'Team alignment and sprint planning introduction', 'Team', 'medium', 45, 4, '11111111-1111-1111-1111-111111111111'),
('Meet Onboarding Buddy', 'Sync with Arjun Kapoor for 1-on-1 code walkthrough and architecture overview.', 'Peer mentorship and ramp-up support', 'Team', 'medium', 60, 4, '11111111-1111-1111-1111-111111111111'),
('Developer Tools Access', 'Request GitHub Enterprise access and join the team cloud sandbox.', 'Access to git repositories and pipeline build tools', 'Role', 'high', 45, 4, '11111111-1111-1111-1111-111111111111'),
('Development Environment Setup', 'Clone starter repository, configure Node.js runtime, and verify local build.', 'Local developer environment readiness', 'Role', 'high', 90, 5, '11111111-1111-1111-1111-111111111111'),
('Pick Up First Starter Task', 'Review Jira board with manager and assign your first bugfix or feature ticket.', 'First hands-on engineering contribution', 'Role', 'high', 60, 5, '11111111-1111-1111-1111-111111111111'),
('30-Day Learning Plan Review', 'Finalize 30-60-90 day milestone roadmap with your engineering manager.', 'Long-term growth and performance alignment', 'Role', 'medium', 45, 5, '11111111-1111-1111-1111-111111111111');
