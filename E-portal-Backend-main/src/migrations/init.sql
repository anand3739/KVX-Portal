-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_id UUID,
    budget DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_encrypted TEXT,
    role VARCHAR(50) CHECK (role IN ('admin', 'hr', 'ceo', 'employee')) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    profile_picture_url TEXT,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
    join_date DATE,
    probation_end_date DATE,
    confirmation_date DATE,
    resignation_date DATE,
    exit_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'probation', 'inactive', 'resigned', 'terminated')),
    reports_to UUID REFERENCES employees(id),
    salary DECIMAL(10,2),
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    updated_by UUID REFERENCES employees(id)
);

-- Add foreign key for department head after employees table exists
ALTER TABLE departments ADD CONSTRAINT fk_department_head FOREIGN KEY (head_id) REFERENCES employees(id);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    date DATE NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE,
    logout_time TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    status VARCHAR(50) CHECK (status IN ('present', 'absent', 'late', 'half-day', 'wfh', 'holiday', 'leave')),
    late_minutes INT DEFAULT 0,
    early_departure_minutes INT DEFAULT 0,
    ip_address INET,
    device_info TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    leave_type VARCHAR(50) CHECK (leave_type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'bereavement', 'marriage')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    documents TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave balance table
CREATE TABLE leave_balance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    total_days INT DEFAULT 0,
    used_days INT DEFAULT 0,
    pending_days INT DEFAULT 0,
    remaining_days INT DEFAULT 0,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    category VARCHAR(100) CHECK (category IN ('id-proof', 'address-proof', 'education', 'certification', 'contract', 'payslip', 'tax', 'onboarding', 'other')),
    file_url TEXT NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES employees(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    expiry_date DATE,
    is_confidential BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job postings table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    location VARCHAR(100),
    employment_type VARCHAR(50),
    experience_required VARCHAR(100),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    description TEXT,
    requirements TEXT[],
    responsibilities TEXT[],
    skills_required TEXT[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'on-hold')),
    published_date DATE,
    closing_date DATE,
    openings INT DEFAULT 1,
    filled_positions INT DEFAULT 0,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES job_postings(id) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resume_url TEXT,
    cover_letter TEXT,
    experience_years INT,
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    expected_salary DECIMAL(10,2),
    notice_period INT,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected')),
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    interview_date TIMESTAMP WITH TIME ZONE,
    interviewer_id UUID REFERENCES employees(id),
    feedback TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES employees(id),
    assigned_by UUID REFERENCES employees(id),
    department_id UUID REFERENCES departments(id),
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'on-hold')),
    start_date DATE,
    due_date DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    attachments TEXT[],
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance reviews table
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    reviewer_id UUID REFERENCES employees(id) NOT NULL,
    review_type VARCHAR(50) CHECK (review_type IN ('quarterly', 'annual', 'probation', 'promotion')),
    review_date DATE NOT NULL,
    review_period_start DATE,
    review_period_end DATE,
    technical_skills INT CHECK (technical_skills >= 1 AND technical_skills <= 5),
    communication INT CHECK (communication >= 1 AND communication <= 5),
    teamwork INT CHECK (teamwork >= 1 AND teamwork <= 5),
    leadership INT CHECK (leadership >= 1 AND leadership <= 5),
    productivity INT CHECK (productivity >= 1 AND productivity <= 5),
    initiative INT CHECK (initiative >= 1 AND initiative <= 5),
    overall_rating DECIMAL(3,2),
    strengths TEXT,
    improvements TEXT,
    goals TEXT,
    comments TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(10,2),
    hra DECIMAL(10,2),
    conveyance DECIMAL(10,2),
    medical DECIMAL(10,2),
    special DECIMAL(10,2),
    bonus DECIMAL(10,2),
    overtime DECIMAL(10,2),
    other_earnings DECIMAL(10,2),
    gross_salary DECIMAL(10,2),
    pf DECIMAL(10,2),
    esi DECIMAL(10,2),
    professional_tax DECIMAL(10,2),
    tds DECIMAL(10,2),
    loan DECIMAL(10,2),
    advance DECIMAL(10,2),
    other_deductions DECIMAL(10,2),
    total_deductions DECIMAL(10,2),
    net_salary DECIMAL(10,2) GENERATED ALWAYS AS (gross_salary - total_deductions) STORED,
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
    payslip_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES employees(id),
    UNIQUE(employee_id, month, year)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES employees(id) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('info', 'success', 'warning', 'error', 'task', 'leave', 'document', 'payroll')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES employees(id) NOT NULL,
    recipient_id UUID REFERENCES employees(id) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    attachments TEXT[],
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES messages(id),
    is_starred BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_leave_requests_employee_status ON leave_requests(employee_id, status);
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read, created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_activity_logs_employee ON activity_logs(employee_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('Executive', 'Executive leadership team'),
('Human Resources', 'HR and people operations'),
('Engineering', 'Software development and engineering'),
('Sales', 'Sales and business development'),
('Marketing', 'Marketing and communications'),
('Finance', 'Finance and accounting'),
('Operations', 'Operations and administration');

-- Insert admin user (password: Admin@123)
INSERT INTO employees (
    employee_id, email, password_hash, role, first_name, last_name, status
) VALUES (
    'ADMIN001',
    'admin@kravix.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
    'admin',
    'Admin',
    'User',
    'active'
);

-- Insert HR user (password: HR@123)
INSERT INTO employees (
    employee_id, email, password_hash, role, first_name, last_name, status
) VALUES (
    'HR001',
    'hr@kravix.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
    'hr',
    'HR',
    'Manager',
    'active'
);

-- Insert CEO user (password: CEO@123)
INSERT INTO employees (
    employee_id, email, password_hash, role, first_name, last_name, status
) VALUES (
    'CEO001',
    'ceo@kravix.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
    'ceo',
    'Sarah',
    'CEO',
    'active'
);

-- Insert employee user (password: Emp@123)
INSERT INTO employees (
    employee_id, email, password_hash, role, first_name, last_name, status
) VALUES (
    'EMP001',
    'employee@kravix.com',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash
    'employee',
    'John',
    'Employee',
    'active'
);
