const { query } = require('../config/database');

class Document {
  static async create(documentData) {
    const { rows } = await query(
      `INSERT INTO documents (
        employee_id, document_name, document_type, category, file_url,
        file_size, mime_type, is_confidential, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        documentData.employee_id,
        documentData.document_name,
        documentData.document_type,
        documentData.category,
        documentData.file_url,
        documentData.file_size,
        documentData.mime_type,
        documentData.is_confidential || false,
        documentData.created_by
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
      UPDATE documents 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;

    const { rows } = await query(query_str, values);
    return rows[0];
  }

  static async findByEmployee(employeeId, includeConfidential = false) {
    let sql = `
      SELECT d.*,
             CONCAT(e.first_name, ' ', e.last_name) as uploaded_by_name,
             CONCAT(v.first_name, ' ', v.last_name) as verified_by_name
      FROM documents d
      LEFT JOIN employees e ON d.created_by = e.id
      LEFT JOIN employees v ON d.verified_by = v.id
      WHERE d.employee_id = $1
    `;

    if (!includeConfidential) {
      sql += ` AND d.is_confidential = false`;
    }

    sql += ` ORDER BY d.created_at DESC`;

    const { rows } = await query(sql, [employeeId]);
    return rows;
  }

  static async findById(id) {
    const { rows } = await query(
      `SELECT d.*,
              CONCAT(e.first_name, ' ', e.last_name) as uploaded_by_name
       FROM documents d
       LEFT JOIN employees e ON d.created_by = e.id
       WHERE d.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  }

  static async getPendingCount() {
    const { rows } = await query(
      'SELECT COUNT(*) FROM documents WHERE status = $1',
      ['pending']
    );
    return parseInt(rows[0].count);
  }
}

module.exports = Document;