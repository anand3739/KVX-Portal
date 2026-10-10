const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Employee {
  static async findByEmail(email) {
    const result = await query(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.email = $1`,
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT e.*, d.name as department_name,
              CONCAT(m.first_name, ' ', m.last_name) as manager_name
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN employees m ON e.reports_to = m.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(employeeData) {
    const { rows } = await query(
      `INSERT INTO employees (
        employee_id, email, password_hash, role, first_name, last_name,
        phone, date_of_birth, gender, address, city, state, country, postal_code,
        department_id, position, employment_type, join_date, probation_end_date,
        salary, reports_to, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        employeeData.employee_id,
        employeeData.email,
        employeeData.password_hash,
        employeeData.role,
        employeeData.first_name,
        employeeData.last_name,
        employeeData.phone,
        employeeData.date_of_birth,
        employeeData.gender,
        employeeData.address,
        employeeData.city,
        employeeData.state,
        employeeData.country,
        employeeData.postal_code,
        employeeData.department_id,
        employeeData.position,
        employeeData.employment_type,
        employeeData.join_date,
        employeeData.probation_end_date,
        employeeData.salary,
        employeeData.reports_to,
        employeeData.created_by
      ]
    );
    return rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    });

    values.push(id);
    const query_str = `
      UPDATE employees 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await query(query_str, values);
    return rows[0];
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT e.*, d.name as department_name,
             CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees m ON e.reports_to = m.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (filters.department_id) {
      sql += ` AND e.department_id = $${index}`;
      values.push(filters.department_id);
      index++;
    }

    if (filters.role) {
      sql += ` AND e.role = $${index}`;
      values.push(filters.role);
      index++;
    }

    if (filters.status) {
      sql += ` AND e.status = $${index}`;
      values.push(filters.status);
      index++;
    }

    sql += ` ORDER BY e.created_at DESC`;

    const { rows } = await query(sql, values);
    return rows;
  }

  static async getStats() {
    const { rows } = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'probation' THEN 1 END) as probation,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'hr' THEN 1 END) as hr,
        COUNT(CASE WHEN role = 'ceo' THEN 1 END) as ceo,
        COUNT(CASE WHEN role = 'employee' THEN 1 END) as employees,
        AVG(salary) as avg_salary,
        SUM(salary) as total_salary
      FROM employees
    `);
    return rows[0];
  }

  static async getDepartmentStats() {
    const { rows } = await query(`
      SELECT 
        d.id,
        d.name,
        COUNT(e.id) as employee_count,
        AVG(e.salary) as avg_salary
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
      GROUP BY d.id, d.name
      ORDER BY employee_count DESC
    `);
    return rows;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE employees SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );
  }

  static async verifyPassword(employee, password) {
    return bcrypt.compare(password, employee.password_hash);
  }
}

module.exports = Employee;