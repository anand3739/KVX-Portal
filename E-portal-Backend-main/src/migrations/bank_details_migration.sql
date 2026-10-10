-- ====================================================================
-- MIGRATION: Employee Bank Details & Payroll Integration
-- Purpose: Dedicated secure banking structure for direct deposit / payroll
-- ====================================================================

CREATE TABLE IF NOT EXISTS employee_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'Savings',
    routing_number VARCHAR(50),
    branch_name VARCHAR(150),
    branch_code VARCHAR(50),
    swift_code VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    is_primary BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(50) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
    verification_notes TEXT,
    verified_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_bank_details_emp_id ON employee_bank_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_bank_details_status ON employee_bank_details(verification_status);
