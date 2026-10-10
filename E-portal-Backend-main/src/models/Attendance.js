const { query } = require('../config/database');
const moment = require('moment');

class Attendance {
  static async create(attendanceData) {
    const { rows } = await query(
      `INSERT INTO attendance (
        employee_id, date, login_time, status, ip_address, device_info, location, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        attendanceData.employee_id,
        attendanceData.date,
        attendanceData.login_time,
        attendanceData.status,
        attendanceData.ip_address,
        attendanceData.device_info,
        attendanceData.location,
        attendanceData.notes
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
      UPDATE attendance 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await query(query_str, values);
    return rows[0];
  }

  static async findByEmployeeAndDate(employeeId, date) {
    const { rows } = await query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, date]
    );
    return rows[0];
  }

  static async findMonthly(employeeId, year, month) {
    const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    const { rows } = await query(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 
       AND date BETWEEN $2 AND $3
       ORDER BY date DESC`,
      [employeeId, startDate, endDate]
    );
    return rows;
  }

  static async getReport(startDate, endDate, departmentId = null) {
    let sql = `
      SELECT 
        a.*,
        e.first_name,
        e.last_name,
        e.employee_id,
        d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.date BETWEEN $1 AND $2
    `;
    const values = [startDate, endDate];

    if (departmentId) {
      sql += ` AND e.department_id = $3`;
      values.push(departmentId);
    }

    sql += ` ORDER BY a.date DESC, e.last_name ASC`;

    const { rows } = await query(sql, values);
    return rows;
  }

  static async getTodaySummary(date) {
    const { rows } = await query(`
      SELECT 
        COUNT(CASE WHEN status IN ('present', 'wfh') THEN 1 END) as present,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as on_leave
      FROM attendance
      WHERE date = $1
    `, [date]);
    return rows[0];
  }

  static async getEmployeeSummary(employeeId, startDate, endDate) {
    const { rows } = await query(`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status IN ('present', 'wfh') THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'leave' THEN 1 END) as on_leave,
        SUM(total_hours) as total_hours,
        SUM(overtime_hours) as overtime_hours
      FROM attendance
      WHERE employee_id = $1
      AND date BETWEEN $2 AND $3
    `, [employeeId, startDate, endDate]);
    return rows[0];
  }
}

module.exports = Attendance;