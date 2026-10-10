const { query } = require('../config/database');
const moment = require('moment');

const generateAttendanceReport = async (startDate, endDate, departmentId = null) => {
  let sql = `
    SELECT 
      e.id,
      e.employee_id,
      e.first_name,
      e.last_name,
      d.name as department,
      e.position,
      COUNT(CASE WHEN a.status IN ('present', 'wfh') THEN 1 END) as days_present,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as days_absent,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as days_late,
      COUNT(CASE WHEN a.status = 'half-day' THEN 1 END) as half_days,
      SUM(a.total_hours) as total_hours,
      SUM(a.overtime_hours) as overtime_hours,
      ROUND(AVG(CASE WHEN a.login_time IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (a.login_time::time - '09:00:00'::time))/60 
        ELSE 0 END), 2) as avg_late_minutes
    FROM employees e
    LEFT JOIN attendance a ON e.id = a.employee_id 
      AND a.date BETWEEN $1 AND $2
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.status IN ('active', 'probation')
  `;

  const params = [startDate, endDate];
  let paramIndex = 3;

  if (departmentId) {
    sql += ` AND e.department_id = $${paramIndex}`;
    params.push(departmentId);
  }

  sql += ` GROUP BY e.id, e.employee_id, e.first_name, e.last_name, d.name, e.position
           ORDER BY e.last_name ASC`;

  const result = await query(sql, params);

  // Calculate summary
  const summary = {
    totalEmployees: result.rows.length,
    totalPresent: result.rows.reduce((sum, r) => sum + parseInt(r.days_present), 0),
    totalAbsent: result.rows.reduce((sum, r) => sum + parseInt(r.days_absent), 0),
    totalLate: result.rows.reduce((sum, r) => sum + parseInt(r.days_late), 0),
    totalHours: result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0),
    totalOvertime: result.rows.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0)
  };

  return {
    data: result.rows,
    summary,
    dateRange: { startDate, endDate }
  };
};

const generatePayrollReport = async (month, year, departmentId = null) => {
  let sql = `
    SELECT 
      e.id,
      e.employee_id,
      e.first_name,
      e.last_name,
      d.name as department,
      e.position,
      COALESCE(p.basic_salary, e.salary/12) as basic_salary,
      COALESCE(p.hra, e.salary * 0.4/12) as hra,
      COALESCE(p.conveyance, 1600) as conveyance,
      COALESCE(p.medical, 1250) as medical,
      COALESCE(p.bonus, 0) as bonus,
      COALESCE(p.gross_salary, e.salary/12 + 2850) as gross_salary,
      COALESCE(p.pf, e.salary * 0.12/12) as pf,
      COALESCE(p.professional_tax, 200) as professional_tax,
      COALESCE(p.tds, e.salary * 0.1/12) as tds,
      COALESCE(p.total_deductions, e.salary * 0.22/12 + 200) as total_deductions,
      COALESCE(p.net_salary, (e.salary/12 + 2850) - (e.salary * 0.22/12 + 200)) as net_salary,
      p.status as payroll_status,
      p.payment_date
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN payroll p ON e.id = p.employee_id AND p.month = $1 AND p.year = $2
    WHERE e.status IN ('active', 'probation')
  `;

  const params = [month, year];
  let paramIndex = 3;

  if (departmentId) {
    sql += ` AND e.department_id = $${paramIndex}`;
    params.push(departmentId);
  }

  sql += ` ORDER BY e.last_name ASC`;

  const result = await query(sql, params);

  // Calculate summary
  const summary = {
    totalEmployees: result.rows.length,
    totalGross: result.rows.reduce((sum, r) => sum + parseFloat(r.gross_salary || 0), 0),
    totalDeductions: result.rows.reduce((sum, r) => sum + parseFloat(r.total_deductions || 0), 0),
    totalNet: result.rows.reduce((sum, r) => sum + parseFloat(r.net_salary || 0), 0),
    processedCount: result.rows.filter(r => r.payroll_status === 'processed').length
  };

  return {
    data: result.rows,
    summary,
    month,
    year
  };
};

const generateDepartmentReport = async () => {
  const result = await query(`
    SELECT 
      d.id,
      d.name,
      d.budget,
      COUNT(e.id) as employee_count,
      COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_employees,
      COUNT(CASE WHEN e.gender = 'male' THEN 1 END) as male_count,
      COUNT(CASE WHEN e.gender = 'female' THEN 1 END) as female_count,
      AVG(e.salary) as avg_salary,
      SUM(e.salary) as total_salary,
      MIN(e.join_date) as oldest_employee_join,
      MAX(e.join_date) as newest_employee_join,
      CONCAT(m.first_name, ' ', m.last_name) as head_name
    FROM departments d
    LEFT JOIN employees e ON e.department_id = d.id AND e.status IN ('active', 'probation')
    LEFT JOIN employees m ON d.head_id = m.id
    GROUP BY d.id, d.name, d.budget, m.first_name, m.last_name
    ORDER BY d.name ASC
  `);

  return result.rows;
};

const generateLeaveReport = async (year) => {
  const result = await query(`
    SELECT 
      e.id,
      e.first_name,
      e.last_name,
      d.name as department,
      COUNT(CASE WHEN lr.leave_type = 'annual' AND lr.status = 'approved' THEN 1 END) as annual_leave_taken,
      COUNT(CASE WHEN lr.leave_type = 'sick' AND lr.status = 'approved' THEN 1 END) as sick_leave_taken,
      COUNT(CASE WHEN lr.leave_type = 'personal' AND lr.status = 'approved' THEN 1 END) as personal_leave_taken,
      SUM(CASE WHEN lr.status = 'approved' THEN lr.total_days ELSE 0 END) as total_days_taken,
      COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as pending_requests
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN leave_requests lr ON e.id = lr.employee_id AND EXTRACT(YEAR FROM lr.start_date) = $1
    WHERE e.status IN ('active', 'probation')
    GROUP BY e.id, e.first_name, e.last_name, d.name
    ORDER BY e.last_name ASC
  `, [year]);

  return result.rows;
};

module.exports = {
  generateAttendanceReport,
  generatePayrollReport,
  generateDepartmentReport,
  generateLeaveReport
};