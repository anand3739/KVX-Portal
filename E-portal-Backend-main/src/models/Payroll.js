const { query } = require('../config/database');

class Payroll {
  static async create(payrollData) {
    const { rows } = await query(
      `INSERT INTO payroll (
        employee_id, month, year, basic_salary, hra, conveyance, medical,
        special, bonus, overtime, other_earnings, gross_salary,
        pf, esi, professional_tax, tds, loan, advance, other_deductions, total_deductions,
        status, processed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        payrollData.employee_id,
        payrollData.month,
        payrollData.year,
        payrollData.basic_salary,
        payrollData.hra,
        payrollData.conveyance,
        payrollData.medical,
        payrollData.special,
        payrollData.bonus,
        payrollData.overtime,
        payrollData.other_earnings,
        payrollData.gross_salary,
        payrollData.pf,
        payrollData.esi,
        payrollData.professional_tax,
        payrollData.tds,
        payrollData.loan,
        payrollData.advance,
        payrollData.other_deductions,
        payrollData.total_deductions,
        payrollData.status || 'pending',
        payrollData.processed_by
      ]
    );
    return rows[0];
  }

  static async findByEmployee(employeeId, year = null) {
    let sql = `
      SELECT * FROM payroll 
      WHERE employee_id = $1
    `;
    const values = [employeeId];

    if (year) {
      sql += ` AND year = $2`;
      values.push(year);
    }

    sql += ` ORDER BY year DESC, month DESC`;

    const { rows } = await query(sql, values);
    return rows;
  }

  static async findByMonth(month, year, departmentId = null) {
    let sql = `
      SELECT p.*,
             e.first_name, e.last_name, e.employee_id,
             d.name as department_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.month = $1 AND p.year = $2
    `;
    const values = [month, year];

    if (departmentId) {
      sql += ` AND e.department_id = $3`;
      values.push(departmentId);
    }

    sql += ` ORDER BY e.last_name ASC`;

    const { rows } = await query(sql, values);
    return rows;
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
      UPDATE payroll 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await query(query_str, values);
    return rows[0];
  }

  static async getSummary(month, year) {
    const { rows } = await query(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(gross_salary) as total_gross,
        SUM(total_deductions) as total_deductions,
        SUM(net_salary) as total_net,
        COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed_count
      FROM payroll
      WHERE month = $1 AND year = $2
    `, [month, year]);
    return rows[0];
  }
}

module.exports = Payroll;