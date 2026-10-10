const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🌱 Seeding database...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const hrPassword = await bcrypt.hash('HR@123', 10);
    const ceoPassword = await bcrypt.hash('CEO@123', 10);
    const empPassword = await bcrypt.hash('Emp@123', 10);

    // Insert departments
    await pool.query(`
      INSERT INTO departments (name, description) VALUES 
      ('Executive', 'Executive leadership team'),
      ('Human Resources', 'HR and people operations'),
      ('Engineering', 'Software development and engineering'),
      ('Sales', 'Sales and business development'),
      ('Marketing', 'Marketing and communications'),
      ('Finance', 'Finance and accounting'),
      ('Operations', 'Operations and administration')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert admin user
    await pool.query(`
      INSERT INTO employees (
        employee_id, email, password_hash, role, first_name, last_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING;
    `, ['ADMIN001', 'admin@kravix.com', adminPassword, 'admin', 'Admin', 'User', 'active']);

    // Insert HR user
    await pool.query(`
      INSERT INTO employees (
        employee_id, email, password_hash, role, first_name, last_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING;
    `, ['HR001', 'hr@kravix.com', hrPassword, 'hr', 'HR', 'Manager', 'active']);

    // Insert CEO user
    await pool.query(`
      INSERT INTO employees (
        employee_id, email, password_hash, role, first_name, last_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING;
    `, ['CEO001', 'ceo@kravix.com', ceoPassword, 'ceo', 'Sarah', 'CEO', 'active']);

    // Insert employee user
    await pool.query(`
      INSERT INTO employees (
        employee_id, email, password_hash, role, first_name, last_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING;
    `, ['EMP001', 'employee@kravix.com', empPassword, 'employee', 'John', 'Employee', 'active']);

    // ⭐ GRANT HR PERMISSIONS
    console.log('📝 Granting HR permissions...');
    
    const hrPermissions = [
      'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
      'recruitment.view', 'recruitment.create', 'recruitment.edit',
      'attendance.view', 'attendance.edit',
      'leaves.view', 'leaves.approve', 'leaves.reject',
      'payroll.view', 'payroll.edit',
      'performance.view', 'performance.edit',
      'training.view', 'training.edit',
      'reports.view', 'reports.generate'
    ];

    for (const permission of hrPermissions) {
      await pool.query(`
        INSERT INTO permissions (role, permission) 
        VALUES ($1, $2) 
        ON CONFLICT (role, permission) DO NOTHING
      `, ['hr', permission]);
    }

    console.log('✅ Seeding completed successfully with HR permissions');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDatabase();