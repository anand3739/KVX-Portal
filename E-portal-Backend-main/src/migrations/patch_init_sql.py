from pathlib import Path

path = Path(__file__).with_name('init.sql')
text = path.read_text(encoding='utf-8')

# Make table and index creation idempotent
text = text.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ')
text = text.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ')
text = text.replace('CREATE TABLE IF NOT EXISTS IF NOT EXISTS', 'CREATE TABLE IF NOT EXISTS')
text = text.replace('CREATE INDEX IF NOT EXISTS IF NOT EXISTS', 'CREATE INDEX IF NOT EXISTS')

# Make seed inserts idempotent
text = text.replace(
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'ADMIN001',\n    'admin@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'admin',\n    'Admin',\n    'User',\n    'active'\n);",
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'ADMIN001',\n    'admin@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'admin',\n    'Admin',\n    'User',\n    'active'\n) ON CONFLICT (employee_id) DO NOTHING;"
)
text = text.replace(
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'HR001',\n    'hr@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'hr',\n    'HR',\n    'Manager',\n    'active'\n);",
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'HR001',\n    'hr@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'hr',\n    'HR',\n    'Manager',\n    'active'\n) ON CONFLICT (employee_id) DO NOTHING;"
)
text = text.replace(
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'CEO001',\n    'ceo@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'ceo',\n    'Sarah',\n    'CEO',\n    'active'\n);",
    "INSERT INTO employees (\n    employee_id, email, password_hash, role, first_name, last_name, status\n) VALUES (\n    'CEO001',\n    'ceo@kravix.com',\n    '$2a$10$YourHashedPasswordHere', -- Replace with actual hash\n    'ceo',\n    'Sarah',\n    'CEO',\n    'active'\n) ON CONFLICT (employee_id) DO NOTHING;"
)

# Optionally make default department insert idempotent
if 'INSERT INTO departments (name, description) VALUES' in text:
    seeded = (
        "INSERT INTO departments (name, description) VALUES \n"
        "('Executive', 'Executive leadership team'),\n"
        "('Human Resources', 'HR and people operations'),\n"
        "('Engineering', 'Software development and engineering'),\n"
        "('Sales', 'Sales and business development'),\n"
        "('Marketing', 'Marketing and communications'),\n"
        "('Finance', 'Finance and accounting'),\n"
        "('Operations', 'Operations and administration');"
    )
    if seeded in text:
        replacement = (
            "INSERT INTO departments (name, description) VALUES \n"
            "('Executive', 'Executive leadership team') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Human Resources', 'HR and people operations') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Engineering', 'Software development and engineering') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Sales', 'Sales and business development') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Marketing', 'Marketing and communications') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Finance', 'Finance and accounting') ON CONFLICT (name) DO NOTHING;\n"
            "INSERT INTO departments (name, description) VALUES \n"
            "('Operations', 'Operations and administration') ON CONFLICT (name) DO NOTHING;"
        )
        text = text.replace(seeded, replacement)

path.write_text(text, encoding='utf-8')
print('patched init.sql')
