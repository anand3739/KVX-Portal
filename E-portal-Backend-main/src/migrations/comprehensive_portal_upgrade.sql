-- =========================================================================
-- KRAVIX ENTERPRISE PORTAL: COMPREHENSIVE SCHEMA UPGRADE
-- Idempotent Migration: Creates tables, indexes, and constraints safely
-- =========================================================================

-- 1. Two-Factor Authentication & Security
CREATE TABLE IF NOT EXISTS auth_two_factor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL,
    backup_codes JSONB DEFAULT '[]'::jsonb,
    is_enabled BOOLEAN DEFAULT false,
    method VARCHAR(50) DEFAULT 'authenticator',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_two_factor_user ON auth_two_factor(user_id);

-- 2. Policies, SOPs, and Do's & Don'ts Knowledge Base
CREATE TABLE IF NOT EXISTS policy_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'HR', 'Attendance', 'Leave', 'Overtime', 'Security', 'SOP', 'Code of Conduct'
    summary TEXT,
    content TEXT NOT NULL,
    dos_and_donts JSONB DEFAULT '{"dos": [], "donts": []}'::jsonb,
    version VARCHAR(50) DEFAULT '1.0',
    effective_date DATE DEFAULT CURRENT_DATE,
    requires_acknowledgement BOOLEAN DEFAULT false,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'published',
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_policy_category ON policy_documents(category);

-- 3. Policy Acknowledgement Tracking
CREATE TABLE IF NOT EXISTS policy_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policy_documents(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature_data TEXT, -- e-signature timestamp or typed confirmation
    ip_address VARCHAR(45),
    UNIQUE(policy_id, employee_id)
);
CREATE INDEX IF NOT EXISTS idx_policy_ack_emp ON policy_acknowledgements(employee_id);

-- 4. My Action Center (Consolidated Task & Approval items)
CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'attendance', 'training', 'policy', 'document', 'approval', 'review'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    deadline TIMESTAMP WITH TIME ZONE,
    action_link VARCHAR(255),
    reference_id UUID,
    reference_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'dismissed'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_action_items_emp_status ON action_items(employee_id, status);

-- 5. Monthly Employee Scorecards
CREATE TABLE IF NOT EXISTS employee_scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    productivity_score DECIMAL(5,2) DEFAULT 92.00,
    quality_score DECIMAL(5,2) DEFAULT 95.00,
    attendance_rate DECIMAL(5,2) DEFAULT 98.00,
    overall_rating VARCHAR(50) DEFAULT 'Exceeds Expectations',
    improvement_areas JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    manager_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);
CREATE INDEX IF NOT EXISTS idx_scorecards_emp ON employee_scorecards(employee_id, year, month);

-- 6. Skills Intelligence & Competencies
CREATE TABLE IF NOT EXISTS skill_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Technical', 'Leadership', 'Domain', 'Communication'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skill_catalog(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    proficiency_level VARCHAR(50) DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    years_experience DECIMAL(4,1) DEFAULT 1.0,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, skill_name)
);
CREATE INDEX IF NOT EXISTS idx_emp_skills_emp ON employee_skills(employee_id);

-- 7. Rewards & Recognition System
CREATE TABLE IF NOT EXISTS employee_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    award_title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Best Performer', 'Top Performer', 'Consistent Performer', 'Most Improved Performer', 'Quarterly Star Performer', 'Yearly Star Performer'
    badge_icon VARCHAR(50) DEFAULT 'Award',
    period VARCHAR(50) NOT NULL, -- 'Q1 2026', 'August 2026', 'Annual 2025'
    citation TEXT,
    awarded_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    awarded_at DATE DEFAULT CURRENT_DATE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_awards_emp ON employee_awards(employee_id);

-- 8. Employee Wellbeing Resources & Check-ins
CREATE TABLE IF NOT EXISTS wellbeing_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 5),
    workload_rating INTEGER CHECK (workload_rating BETWEEN 1 AND 5),
    support_rating INTEGER CHECK (support_rating BETWEEN 1 AND 5),
    comments TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- 9. Surveys, Polls & Feedback
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'survey', -- 'survey', 'quick_poll', 'connect_feedback'
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_anonymous BOOLEAN DEFAULT true,
    target_role VARCHAR(50) DEFAULT 'all',
    status VARCHAR(50) DEFAULT 'active',
    due_date DATE,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(survey_id, employee_id)
);

-- 10. Idea & Innovation Hub
CREATE TABLE IF NOT EXISTS innovation_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'process', 'technology', 'productivity', 'employee_experience'
    status VARCHAR(50) DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Approved', 'Implemented', 'Archived'
    submitter_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    submitter_name VARCHAR(150),
    department VARCHAR(100),
    upvotes INTEGER DEFAULT 1,
    reviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    review_comments TEXT,
    recognized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_innovation_ideas_status ON innovation_ideas(status);

-- 11. Attendance Corrections Workflow
CREATE TABLE IF NOT EXISTS attendance_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    current_check_in TIMESTAMP WITH TIME ZONE,
    current_check_out TIMESTAMP WITH TIME ZONE,
    requested_check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    requested_check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_att_corr_emp ON attendance_corrections(employee_id);
CREATE INDEX IF NOT EXISTS idx_att_corr_status ON attendance_corrections(status);

-- 12. Employee Relations & Highly Restricted HR Cases
CREATE TABLE IF NOT EXISTS employee_relations_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'grievance', 'workplace_concern', 'complaint', 'investigation', 'policy_violation'
    description TEXT NOT NULL,
    complainant_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    respondent_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'mediation', 'resolved', 'closed'
    severity VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_hr_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    investigation_notes JSONB DEFAULT '[]'::jsonb,
    resolution_summary TEXT,
    is_confidential BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_er_cases_status ON employee_relations_cases(status);

-- 13. Employee Asset Management
CREATE TABLE IF NOT EXISTS employee_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'KVX-LAP-042'
    asset_type VARCHAR(100) NOT NULL, -- 'Laptop', 'Headset', 'ID Card', 'Access Card', 'Monitor', 'Mobile'
    brand_model VARCHAR(200),
    serial_number VARCHAR(150),
    assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    condition VARCHAR(50) DEFAULT 'Good', -- 'New', 'Good', 'Fair', 'Damaged'
    status VARCHAR(50) DEFAULT 'assigned', -- 'available', 'assigned', 'returned', 'maintenance', 'lost'
    return_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assets_employee ON employee_assets(assigned_employee_id);

-- 14. Workplace / Facility Service Portal
CREATE TABLE IF NOT EXISTS facility_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'IT Support', 'Equipment', 'Maintenance', 'Access Card', 'Transport', 'Parking', 'Meeting Room', 'Facilities'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    assigned_technician VARCHAR(150),
    location VARCHAR(150),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_facility_emp ON facility_requests(employee_id);

-- 15. Workplace Safety, Emergency & Incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    reported_by UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL, -- 'Injury', 'Near Miss', 'Hazard', 'Security Breach', 'Property Damage'
    location VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(50) DEFAULT 'Reported', -- 'Reported', 'Under Investigation', 'Action Required', 'Resolved'
    corrective_actions TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 16. Corporate Volunteering & CSR
CREATE TABLE IF NOT EXISTS volunteering_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    cause VARCHAR(100) NOT NULL, -- 'Education', 'Environment', 'Healthcare', 'Community Outreach'
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER DEFAULT 50,
    hours_credited DECIMAL(4,1) DEFAULT 4.0,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteering_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES volunteering_events(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    hours_logged DECIMAL(4,1) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'registered', -- 'registered', 'attended', 'cancelled'
    signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, employee_id)
);

-- 17. Exit & Offboarding Lifecycle
CREATE TABLE IF NOT EXISTS offboarding_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    resignation_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'initiated', 'in_progress', 'cleared', 'completed'
    notice_period_days INTEGER DEFAULT 30,
    it_clearance BOOLEAN DEFAULT false,
    hr_clearance BOOLEAN DEFAULT false,
    finance_clearance BOOLEAN DEFAULT false,
    admin_clearance BOOLEAN DEFAULT false,
    assets_returned BOOLEAN DEFAULT false,
    access_revoked BOOLEAN DEFAULT false,
    exit_interview_completed BOOLEAN DEFAULT false,
    exit_interview_notes TEXT,
    experience_letter_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Personal Compensation & Benefits Records (Strictly RBAC Secured)
CREATE TABLE IF NOT EXISTS compensation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    base_salary DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    pay_grade VARCHAR(50) DEFAULT 'L3',
    annual_ctc DECIMAL(12,2) NOT NULL,
    last_increment_date DATE,
    last_increment_percentage DECIMAL(5,2) DEFAULT 0.0,
    performance_bonus DECIMAL(12,2) DEFAULT 0.0,
    overtime_rate_per_hour DECIMAL(8,2) DEFAULT 0.0,
    medical_insurance_coverage VARCHAR(100) DEFAULT '₹5,00,000 Family Floater',
    provident_fund_opted BOOLEAN DEFAULT true,
    benefits JSONB DEFAULT '["Health Insurance", "Gratuity", "Annual Health Checkup", "Learning Allowance"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comp_emp ON compensation_records(employee_id);

-- 19. Change Management Hub (Track process/policy updates)
CREATE TABLE IF NOT EXISTS change_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    reason TEXT NOT NULL,
    effective_date DATE NOT NULL,
    affected_teams JSONB DEFAULT '["All"]'::jsonb,
    related_policy_id UUID REFERENCES policy_documents(id) ON DELETE SET NULL,
    required_training_id UUID REFERENCES training_courses(id) ON DELETE SET NULL,
    requires_acknowledgement BOOLEAN DEFAULT true,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Employee Referrals
CREATE TABLE IF NOT EXISTS employee_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    candidate_email VARCHAR(150) NOT NULL,
    candidate_phone VARCHAR(50),
    job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
    job_title VARCHAR(150) NOT NULL,
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'Received', -- 'Received', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected'
    referral_bonus_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Eligible', 'Paid'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON employee_referrals(referrer_id);
