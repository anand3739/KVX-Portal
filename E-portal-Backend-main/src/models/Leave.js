const { query } = require('../config/database');

class Leave {
  static async create(leaveData) {
    const { rows } = await query(
      `INSERT INTO leave_requests (
        employee_id, leave_type, start_date, end_date, total_days, reason, documents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        leaveData.employee_id,
        leaveData.leave_type,
        leaveData.start_date,
        leaveData.end_date,
        leaveData.total_days,
        leaveData.reason,
        leaveData.documents || []
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
      UPDATE leave_requests 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await query(query_str, values);
    return rows[0];
  }

  static async findByEmployee(employeeId, status = null) {
    let sql = `
      SELECT l.*, 
             CONCAT(e.first_name, ' ', e.last_name) as approved_by_name
      FROM leave_requests l
      LEFT JOIN employees e ON l.approved_by = e.id
      WHERE l.employee_id = $1
    `;
    const values = [employeeId];

    if (status) {
      sql += ` AND l.status = $2`;
      values.push(status);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const { rows } = await query(sql, values);
    return rows;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT l.*,
             CONCAT(emp.first_name, ' ', emp.last_name) as employee_name,
             emp.employee_id,
             d.name as department_name,
             CONCAT(apr.first_name, ' ', apr.last_name) as approved_by_name
      FROM leave_requests l
      JOIN employees emp ON l.employee_id = emp.id
      LEFT JOIN departments d ON emp.department_id = d.id
      LEFT JOIN employees apr ON l.approved_by = apr.id
      WHERE 1=1
    `;
    const values = [];
    let index = 1;

    if (filters.status) {
      sql += ` AND l.status = $${index}`;
      values.push(filters.status);
      index++;
    }

    if (filters.employee_id) {
      sql += ` AND l.employee_id = $${index}`;
      values.push(filters.employee_id);
      index++;
    }

    if (filters.start_date) {
      sql += ` AND l.start_date >= $${index}`;
      values.push(filters.start_date);
      index++;
    }

    if (filters.end_date) {
      sql += ` AND l.end_date <= $${index}`;
      values.push(filters.end_date);
      index++;
    }

    sql += ` ORDER BY l.created_at DESC`;

    const { rows } = await query(sql, values);
    return rows;
  }

  static async getPendingCount() {
    const { rows } = await query(
      'SELECT COUNT(*) FROM leave_requests WHERE status = $1',
      ['pending']
    );
    return parseInt(rows[0].count);
  }
}

module.exports = Leave;