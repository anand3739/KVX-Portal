-- Employee Management hardening migration (safe to run on existing Supabase databases)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS cover_picture_url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES employees(id);
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;
ALTER TABLE employees ADD CONSTRAINT employees_status_check CHECK (status IN ('active','probation','on-leave','inactive','resigned','terminated'));
CREATE INDEX IF NOT EXISTS idx_employees_status_created ON employees(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_created ON leave_requests(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_employee_created ON documents(employee_id, created_at DESC);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;
