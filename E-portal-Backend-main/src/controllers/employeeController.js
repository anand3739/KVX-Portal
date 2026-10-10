const { query, transaction } = require('../config/database');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const { encryptPassword, decryptPassword, ensurePasswordEncryptedColumn } = require('../utils/passwordEncryption');

const normalizeEmploymentType = (value) => String(value || '').trim().toLowerCase();
const isInternEmploymentType = (value) => normalizeEmploymentType(value) === 'intern';
const parseSalaryValue = (value) => {
  const salaryText = String(value ?? '').trim();
  if (!salaryText) return null;
  if (salaryText.toLowerCase() === 'unpaid') return 0;
  const salary = parseFloat(salaryText);
  return Number.isNaN(salary) ? null : salary;
};
const removeSensitivePasswordFields = (employee) => {
  if (!employee) return employee;
  delete employee.password_hash;
  delete employee.password_encrypted;
  return employee;
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { department, status, role, search, employment_type, exclude_employment_type } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 1000, 1), 1000);
    const sortColumns = { created_at: 'e.created_at', first_name: 'e.first_name', last_name: 'e.last_name', employee_id: 'e.employee_id', salary: 'e.salary', join_date: 'e.join_date' };
    const sortBy = sortColumns[req.query.sort_by] || sortColumns.created_at;
    const sortOrder = String(req.query.sort_order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT e.*, d.name as department_name, COUNT(*) OVER() AS total_count,
             CONCAT(m.first_name, ' ', m.last_name) as reports_to_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.reports_to = m.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (department) {
      sql += ` AND e.department_id = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status) {
      sql += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      sql += ` AND e.role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (employment_type) {
      sql += ` AND LOWER(COALESCE(e.employment_type, '')) = LOWER($${paramIndex})`;
      params.push(employment_type);
      paramIndex++;
    }

    if (exclude_employment_type) {
      sql += ` AND LOWER(COALESCE(e.employment_type, '')) <> LOWER($${paramIndex})`;
      params.push(exclude_employment_type);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.employee_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Remove password hash from results
    const employees = result.rows.map(emp => {
      removeSensitivePasswordFields(emp);
      delete emp.total_count;
      return emp;
    });

    const total = Number(result.rows[0]?.total_count || 0);
    res.json({
      employees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT e.*, e.cover_picture_url AS banner_url, d.name as department_name,
              CONCAT(m.first_name, ' ', m.last_name) as reports_to_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN employees m ON e.reports_to = m.id
       WHERE e.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = result.rows[0];
    removeSensitivePasswordFields(employee);

    res.json({ employee });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeePassword = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await ensurePasswordEncryptedColumn(query);
    const result = await query(
      `SELECT id, employee_id, email, first_name, last_name, password_encrypted
       FROM employees
       WHERE id = $1`,
      [req.params.id]
    );

    const employee = result.rows[0];
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const password = decryptPassword(employee.password_encrypted);
    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Stored password is not available for this employee'
      });
    }

    res.json({
      success: true,
      data: {
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        password
      }
    });
  } catch (error) {
    console.error('Get employee password error:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve employee password' });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if employee exists
    const existing = await query('SELECT id FROM employees WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Build update query dynamically
    const allowedFields = [
      'employee_id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
      'address', 'city', 'state', 'country', 'postal_code',
      'department_id', 'position', 'employment_type', 'status',
      'salary', 'bank_name', 'bank_account', 'ifsc_code', 'pan_number',
      'reports_to', 'profile_picture_url', 'cover_picture_url',
      'bio', 'linkedin', 'twitter', 'join_date',
      'social_links', 'emergency_contact', 'profile_details'
    ];

    const updateFields = [];
    const nullableUuidFields = new Set(['department_id', 'reports_to']);
    const jsonbFields = new Set(['social_links', 'emergency_contact', 'profile_details', 'preferences']);

    const values = [];
    let valueIndex = 1;

    if (updates.banner_url !== undefined && updates.cover_picture_url === undefined) {
      updates.cover_picture_url = updates.banner_url;
    }

    Object.keys(updates).forEach(key => {
      let dbKey = key;
      if (key === 'banner_url') dbKey = 'cover_picture_url';
      if (key === 'profile_picture') dbKey = 'profile_picture_url';
      if (key === 'socialLinks') dbKey = 'social_links';

      if (allowedFields.includes(dbKey) && updates[key] !== undefined) {
        let value = updates[key];

        // UUID fields
        if (nullableUuidFields.has(dbKey) && value === "") {
          value = null;
        }

        if (dbKey === "salary") {
          value = parseSalaryValue(value);
        }

        // Nullable text fields
        if (
          ["position", "profile_picture_url", "bank_name", "bank_account", "ifsc_code", "pan_number"].includes(dbKey) &&
          value === ""
        ) {
          value = null;
        }

        // JSONB fields
        if (jsonbFields.has(dbKey) && typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        updateFields.push(`${dbKey} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const query_str = `
      UPDATE employees 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `;
    console.log("========== UPDATE DEBUG ==========");
    console.log("Fields:", updateFields);
    console.log("Values:", values);
    console.log("SQL:", query_str);
    console.log("==================================");
    const result = await query(query_str, values);
    const updatedEmployee = result.rows[0];
    removeSensitivePasswordFields(updatedEmployee);

    // Log activity
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const logUserId = (req.user && req.user.id && uuidRegex.test(req.user.id)) ? req.user.id : null;
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [logUserId, 'UPDATE_EMPLOYEE', 'employees', id, JSON.stringify(updates), req.ip]
      );
    } catch (logError) {
      console.error('Failed to log update activity:', logError.message);
    }

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
  console.error("========== UPDATE ERROR ==========");
  console.error("Message:", error.message);
  console.error("Code:", error.code);
  console.error("Detail:", error.detail);
  console.error("Where:", error.where);
  console.error("Stack:", error.stack);
  console.error("==================================");

  res.status(500).json({
    message: error.message,
    code: error.code,
    detail: error.detail
  });
}
};

// Get employee statistics
const getEmployeeStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(CASE WHEN LOWER(COALESCE(employment_type, '')) <> 'intern' THEN 1 END) as total_employees,
        COUNT(CASE WHEN status = 'active' AND LOWER(COALESCE(employment_type, '')) <> 'intern' THEN 1 END) as active_employees,
        COUNT(CASE WHEN status = 'probation' AND LOWER(COALESCE(employment_type, '')) <> 'intern' THEN 1 END) as probation_employees,
        COUNT(CASE WHEN status = 'inactive' AND LOWER(COALESCE(employment_type, '')) <> 'intern' THEN 1 END) as inactive_employees,
        COUNT(CASE WHEN LOWER(COALESCE(employment_type, '')) = 'intern' THEN 1 END) as total_interns,
        COUNT(CASE WHEN status = 'active' AND LOWER(COALESCE(employment_type, '')) = 'intern' THEN 1 END) as active_interns,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'hr' THEN 1 END) as hr_count,
        COUNT(CASE WHEN role = 'ceo' THEN 1 END) as ceo_count,
        COUNT(CASE WHEN role = 'employee' AND LOWER(COALESCE(employment_type, '')) <> 'intern' THEN 1 END) as employees,
        AVG(salary) as avg_salary
      FROM employees
    `);

    const departmentStats = await query(`
      SELECT 
        d.name as department,
        COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) <> 'intern' THEN 1 END) as employee_count,
        COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) = 'intern' THEN 1 END) as intern_count,
        AVG(e.salary) as avg_salary
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
    `);

    res.json({
      stats: stats.rows[0],
      departmentStats: departmentStats.rows
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const createEmployee = async (req, res) => {
  try {
    const b = req.body;
    if (!b.email || !b.first_name || !b.last_name) {
      return res.status(422).json({ success: false, message: 'email, first_name and last_name are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
      return res.status(422).json({ success: false, message: 'A valid email is required' });
    }

    const emailCheck = b.email.trim().toLowerCase();
    const exists = await query('SELECT id FROM employees WHERE LOWER(email) = LOWER($1)', [emailCheck]);
    if (exists.rows[0]) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    if (b.phone && String(b.phone).trim()) {
      const phoneCheck = String(b.phone).trim();
      const phoneExists = await query('SELECT id FROM employees WHERE phone = $1', [phoneCheck]);
      if (phoneExists.rows[0]) {
        return res.status(409).json({ success: false, message: 'Phone number already exists' });
      }
    }

    if (b.employee_id && String(b.employee_id).trim()) {
      const customIdCheck = String(b.employee_id).trim();
      const idExists = await query('SELECT id FROM employees WHERE employee_id = $1', [customIdCheck]);
      if (idExists.rows[0]) {
        return res.status(409).json({ success: false, message: 'Employee ID already exists' });
      }
    }

    const employmentType = normalizeEmploymentType(b.employment_type) || 'full-time';
    const isIntern = isInternEmploymentType(employmentType);

    // Unique role/employment-type-prefixed Employee ID generation
    let employeeId = b.employee_id ? String(b.employee_id).trim() : null;
    if (!employeeId) {
      const role = b.role || 'employee';
      let prefix = isIntern ? 'KVX-INT' : 'KVX-EMP';
      if (!isIntern) {
        if (role === 'admin') prefix = 'KVX-ADMIN';
        if (role === 'hr') prefix = 'KVX-HR';
        if (role === 'ceo') prefix = 'KVX-CEO';
      }

      const existingIdsRes = await query(
        "SELECT employee_id FROM employees WHERE employee_id LIKE $1",
        [`${prefix}%`]
      );
      let nextNum = 1;
      if (existingIdsRes.rows.length > 0) {
        const existingNums = existingIdsRes.rows.map(r => {
          const match = r.employee_id.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        });
        nextNum = Math.max(...existingNums, 0) + 1;
      }

      let candidateId = `${prefix}${String(nextNum).padStart(5, '0')}`;
      while ((await query("SELECT 1 FROM employees WHERE employee_id = $1", [candidateId])).rows.length > 0) {
        nextNum++;
        candidateId = `${prefix}${String(nextNum).padStart(5, '0')}`;
      }
      employeeId = candidateId;
    }

    // Department ID resolution
    let departmentId = b.department_id || null;
    if (departmentId && !/^[0-9a-f-]{36}$/i.test(departmentId)) {
      const departmentName = b.department_name || departmentId;
      const deptRes = departmentName ? await query('SELECT id FROM departments WHERE LOWER(name) = LOWER($1)', [departmentName]) : { rows: [] };
      departmentId = deptRes.rows[0]?.id || null;
    }

    // Generate temporary password if not provided
    const tempPassword = b.password || (
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).toUpperCase().slice(-2) +
      '@' + Math.floor(Math.random() * 100)
    );
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const encryptedPassword = encryptPassword(tempPassword);
    await ensurePasswordEncryptedColumn(query);

    const cols = [
      'employee_id', 'email', 'password_hash', 'password_encrypted', 'first_name', 'last_name', 'role', 'phone',
      'department_id', 'position', 'join_date', 'employment_type', 'status', 'salary',
      'address', 'city', 'state', 'country', 'postal_code', 'reports_to',
      'profile_picture_url', 'cover_picture_url', 'emergency_contact_name',
      'emergency_contact_phone', 'emergency_contact_relationship', 'created_by'
    ];

    const values = [
      employeeId,
      emailCheck,
      hashedPassword,
      encryptedPassword,
      b.first_name.trim(),
      b.last_name.trim(),
      b.role || 'employee',
      b.phone ? String(b.phone).trim() : null,
      departmentId,
      b.designation || b.position || null,
      b.joining_date || b.join_date || null,
      employmentType,
      b.status || 'active',
      parseSalaryValue(b.salary),
      b.address || null,
      b.city || null,
      b.state || null,
      b.country || null,
      b.postal_code || null,
      b.reports_to || null,
      b.profile_picture_url || null,
      b.banner_url || b.cover_picture_url || null,
      b.emergency_contact_name || null,
      b.emergency_contact_phone || null,
      b.emergency_contact_relationship || null,
      req.user?.id || null
    ];

    const result = await query(
      `INSERT INTO employees (${cols.join(',')}) VALUES (${cols.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`,
      values
    );

    const employee = result.rows[0];
    removeSensitivePasswordFields(employee);

    // Auto-seed initial leave balance for new employee
    try {
      const currentYear = new Date().getFullYear();
      const defaultBalances = [
        { type: 'annual', days: 20 },
        { type: 'sick', days: 10 },
        { type: 'personal', days: 5 }
      ];
      for (const item of defaultBalances) {
        await query(
          `INSERT INTO leave_balance (employee_id, leave_type, total_days, remaining_days, year)
           VALUES ($1, $2, $3, $3, $4) ON CONFLICT DO NOTHING`,
          [employee.id, item.type, item.days, currentYear]
        );
      }
    } catch (leaveErr) {
      console.warn('Auto leave balance seeding warning:', leaveErr.message);
    }

    // Send Welcome Email
    try {
      await sendWelcomeEmail(emailCheck, b.first_name, tempPassword, employeeId);
    } catch (emailErr) {
      console.warn('Welcome email warning:', emailErr.message);
    }

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'CREATE_EMPLOYEE', 'employees', employee.id, JSON.stringify({ email: employee.email, role: employee.role }), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log warning:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
      employee,
      temp_password: tempPassword
    });

  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === '23505') {
      const detail = (error.detail || '').toLowerCase();
      const constraint = (error.constraint || '').toLowerCase();

      if (constraint.includes('email') || detail.includes('email')) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      if (constraint.includes('employee_id') || detail.includes('employee_id')) {
        return res.status(409).json({ success: false, message: 'Employee ID already exists' });
      }
      if (constraint.includes('phone') || detail.includes('phone')) {
        return res.status(409).json({ success: false, message: 'Phone number already exists' });
      }
      return res.status(409).json({ success: false, message: 'An employee with these details already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Unable to create employee' });
  }
};

const getDirectory = async (req, res) => {
  try {
    const result = await query("SELECT e.id, e.employee_id, e.first_name, e.last_name, e.email, e.position, e.profile_picture_url, d.name AS department_name FROM employees e LEFT JOIN departments d ON d.id = e.department_id WHERE e.status IN ('active','probation') ORDER BY e.first_name, e.last_name");
    res.json({ success: true, data: result.rows });
  } catch (error) { console.error('Get directory error:', error); res.status(500).json({ success: false, message: 'Unable to retrieve employee directory' }); }
};
const getEmployeesByDepartment = async (req, res) => {
  try {
    const result = await query("SELECT e.*, d.name AS department_name FROM employees e JOIN departments d ON d.id=e.department_id WHERE e.department_id=$1 ORDER BY e.first_name,e.last_name", [req.params.departmentId]);
    res.json({ success: true, data: result.rows.map((row) => removeSensitivePasswordFields(row)) });
  } catch (error) { console.error('Get department employees error:', error); res.status(500).json({ success: false, message: 'Unable to retrieve department employees' }); }
};
const getEmployeeOverview = async (req, res) => {
  try {
    const id = req.params.id;
    const employeeResult = await query("SELECT e.*, d.name AS department_name, CONCAT_WS(' ',m.first_name,m.last_name) AS reports_to_name FROM employees e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN employees m ON m.id=e.reports_to WHERE e.id=$1", [id]);
    if (!employeeResult.rows[0]) return res.status(404).json({ success: false, message: 'Employee not found' });
    const [attendance, leave, payroll, documents, activity] = await Promise.all([
      query("SELECT COUNT(*) FILTER (WHERE status IN ('present','late','wfh'))::int AS present_days, COUNT(*) FILTER (WHERE status='late')::int AS late_days, COALESCE(SUM(total_hours),0) AS total_hours FROM attendance WHERE employee_id=$1 AND date >= date_trunc('month', CURRENT_DATE)", [id]),
      query("SELECT COUNT(*) FILTER (WHERE status='pending')::int AS pending, COUNT(*) FILTER (WHERE status='approved')::int AS approved, COALESCE(SUM(total_days) FILTER (WHERE status='approved'),0)::int AS days_taken FROM leave_requests WHERE employee_id=$1", [id]),
      query("SELECT month,year,gross_salary,total_deductions,net_salary,status,payment_date FROM payroll WHERE employee_id=$1 ORDER BY year DESC,month DESC LIMIT 6", [id]),
      query("SELECT id,document_name,category,status,file_url,created_at FROM documents WHERE employee_id=$1 ORDER BY created_at DESC", [id]),
      query("SELECT id,action,entity_type,entity_id,created_at FROM activity_logs WHERE employee_id=$1 OR entity_id=$1 ORDER BY created_at DESC LIMIT 20", [id])
    ]);
    const employee = employeeResult.rows[0]; removeSensitivePasswordFields(employee);
    res.json({ success: true, data: { employee, attendance: attendance.rows[0], leave: leave.rows[0], payroll: payroll.rows, documents: documents.rows, activity: activity.rows } });
  } catch (error) { console.error('Get employee overview error:', error); res.status(500).json({ success: false, message: 'Unable to retrieve employee overview' }); }
};
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const authUserId = req.user?.id;

  console.log("========== DELETE EMPLOYEE DEBUG ==========");
  console.log("Target Employee ID:", id);
  console.log("Authenticated User ID:", authUserId);

  try {
    if (authUserId === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const existing = await query('SELECT id, first_name, last_name, email FROM employees WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Wrap full cascading cleanup and employee deletion in a single DB transaction with SAVEPOINTs
    await transaction(async (client) => {
      console.log(`[Transaction BEGIN] Cleaning up dependent records for employee ${id}...`);

      const safeRun = async (sql, params = []) => {
        try {
          await client.query('SAVEPOINT cleanup_sp');
          await client.query(sql, params);
          await client.query('RELEASE SAVEPOINT cleanup_sp');
        } catch (err) {
          await client.query('ROLLBACK TO SAVEPOINT cleanup_sp');
          console.warn(`[Delete Employee Cleanup] Optional step bypassed (${err.message}): ${sql}`);
        }
      };

      // 1. Self-referential & Manager references
      await safeRun('UPDATE employees SET reports_to = NULL WHERE reports_to = $1', [id]);
      await safeRun('UPDATE employees SET created_by = NULL WHERE created_by = $1', [id]);
      await safeRun('UPDATE employees SET updated_by = NULL WHERE updated_by = $1', [id]);
      await safeRun('UPDATE departments SET head_id = NULL WHERE head_id = $1', [id]);

      // 2. Attendance & Leave
      await safeRun('DELETE FROM attendance WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM leave_requests WHERE employee_id = $1', [id]);
      await safeRun('UPDATE leave_requests SET approved_by = NULL WHERE approved_by = $1', [id]);
      await safeRun('DELETE FROM leave_balance WHERE employee_id = $1', [id]);

      // 3. Documents
      await safeRun('DELETE FROM documents WHERE employee_id = $1', [id]);
      await safeRun('UPDATE documents SET created_by = NULL WHERE created_by = $1', [id]);
      await safeRun('UPDATE documents SET verified_by = NULL WHERE verified_by = $1', [id]);

      // 4. Payroll
      await safeRun('DELETE FROM payroll WHERE employee_id = $1', [id]);
      await safeRun('UPDATE payroll SET processed_by = NULL WHERE processed_by = $1', [id]);

      // 5. Performance Reviews
      await safeRun('DELETE FROM performance_reviews WHERE employee_id = $1 OR reviewer_id = $1', [id]);

      // 6. Training
      await safeRun('DELETE FROM training_enrollments WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM employee_training_progress WHERE employee_id = $1', [id]);
      await safeRun('UPDATE training_courses SET created_by = NULL WHERE created_by = $1', [id]);
      await safeRun('UPDATE training_courses SET instructor_id = NULL WHERE instructor_id = $1', [id]);

      // 7. Tasks
      await safeRun('DELETE FROM task_comments WHERE user_id = $1', [id]);
      await safeRun('DELETE FROM task_collaborators WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM task_work_notes WHERE user_id = $1', [id]);
      await safeRun('DELETE FROM task_attachments WHERE uploaded_by = $1', [id]);
      await safeRun('DELETE FROM tasks WHERE assigned_to = $1', [id]);
      await safeRun('UPDATE tasks SET assigned_by = NULL WHERE assigned_by = $1', [id]);

      // 8. Communications & Notifications
      await safeRun('DELETE FROM notifications WHERE user_id = $1', [id]);
      await safeRun('DELETE FROM reminders WHERE user_id = $1', [id]);
      await safeRun('DELETE FROM user_settings WHERE user_id = $1', [id]);
      await safeRun('DELETE FROM auth_sessions WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM activity_logs WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM audit_logs WHERE user_id = $1', [id]);

      // 9. Chat & Messaging
      await safeRun('DELETE FROM message_reactions WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM conversation_members WHERE employee_id = $1', [id]);
      await safeRun('DELETE FROM chat_messages WHERE sender_id = $1', [id]);
      await safeRun('UPDATE conversations SET created_by = NULL WHERE created_by = $1', [id]);
      await safeRun('DELETE FROM messages WHERE sender_id = $1 OR recipient_id = $1', [id]);

      // 10. Recruitment & Announcements
      await safeRun('UPDATE job_postings SET created_by = NULL WHERE created_by = $1', [id]);
      await safeRun('UPDATE job_applications SET interviewer_id = NULL WHERE interviewer_id = $1', [id]);
      await safeRun('DELETE FROM announcements WHERE author_id = $1', [id]);
      await safeRun('DELETE FROM employee_online_status WHERE employee_id = $1', [id]);

      // 11. Final Employee Record Deletion
      const deleteResult = await client.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
      if (deleteResult.rowCount === 0) {
        throw new Error('Employee not found or already deleted');
      }
      console.log(`[Transaction COMMIT] Employee ${id} deleted successfully.`);
    });

    res.json({
      success: true,
      message: 'Employee and associated records deleted successfully',
      data: { id }
    });

  } catch (error) {
    console.error("❌ DELETE EMPLOYEE ERROR:");
    console.error("Error Message:", error.message);
    console.error("PG Error Code:", error.code);
    console.error("Constraint:", error.constraint);
    console.error("Table:", error.table);
    console.error("Detail:", error.detail);
    console.error("==========================================");

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: `Employee cannot be deleted because dependent records exist in ${error.table || 'another table'}.`,
        code: error.code,
        constraint: error.constraint || 'foreign_key_constraint',
        table: error.table || 'unknown',
        detail: error.detail
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Unable to delete employee'
    });
  }
};


// ─── Image upload helpers ──────────────────────────────────────────────────────

/**
 * POST /api/employees/:id/profile-picture
 * Accepts: multipart/form-data  field name: "profilePicture"
 */
const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    // multer already ran — req.file is populated or missing
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided. Please select a jpg, jpeg, png, or webp file.' });
    }

    const existing = await query('SELECT id FROM employees WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Build the public URL path (served by express static from /uploads)
    const imageUrl = `/uploads/employees/${req.file.filename}`;

    await query(
      'UPDATE employees SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2',
      [imageUrl, id]
    );

    res.json({
      success: true,
      imageUrl,
      message: 'Profile picture uploaded successfully',
    });
  } catch (error) {
    console.error('uploadProfilePicture error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
};

/**
 * POST /api/employees/:id/banner
 * Accepts: multipart/form-data  field name: "banner"
 */
const uploadBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided. Please select a jpg, jpeg, png, or webp file.' });
    }

    const existing = await query('SELECT id FROM employees WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const imageUrl = `/uploads/employees/${req.file.filename}`;

    await query(
      'UPDATE employees SET cover_picture_url = $1, updated_at = NOW() WHERE id = $2',
      [imageUrl, id]
    );

    res.json({
      success: true,
      imageUrl,
      message: 'Banner image uploaded successfully',
    });
  } catch (error) {
    console.error('uploadBanner error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload banner image' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeePassword,
  updateEmployee,
  getEmployeeStats,
  createEmployee,
  getDirectory,
  getEmployeesByDepartment,
  getEmployeeOverview,
  deleteEmployee,
  uploadProfilePicture,
  uploadBanner,
};
