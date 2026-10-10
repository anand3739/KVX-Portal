'use strict';

const { query } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * GET /api/designations
 * Retrieves all designations with department details and dynamic headcount.
 */
const getAllDesignations = async (req, res) => {
  try {
    const { search, department_id, status } = req.query;

    let sql = `
      SELECT 
        des.id,
        des.title,
        des.department_id,
        d.name AS department_name,
        des.level,
        des.min_salary,
        des.max_salary,
        des.icon,
        des.status,
        des.created_at,
        des.updated_at,
        COUNT(e.id)::int AS headcount
      FROM designations des
      LEFT JOIN departments d ON des.department_id = d.id
      LEFT JOIN employees e ON LOWER(TRIM(e.position)) = LOWER(TRIM(des.title))
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (search) {
      sql += ` AND (des.title ILIKE $${paramIdx} OR d.name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (department_id) {
      sql += ` AND des.department_id = $${paramIdx}`;
      params.push(department_id);
      paramIdx++;
    }

    if (status) {
      sql += ` AND des.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    sql += ` GROUP BY des.id, des.title, des.department_id, des.level, des.min_salary, des.max_salary, des.icon, des.status, des.created_at, des.updated_at, d.name ORDER BY des.created_at DESC`;

    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getAllDesignations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve designations' });
  }
};

/**
 * GET /api/designations/stats
 * Computes aggregate statistics for designations.
 */
const getDesignationStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT
        COUNT(DISTINCT des.id)::int AS total_designations,
        COUNT(DISTINCT des.department_id)::int AS total_departments,
        COALESCE(AVG((des.min_salary + des.max_salary) / 2.0), 0)::int AS avg_salary,
        (
          SELECT COUNT(e.id)::int 
          FROM employees e 
          WHERE EXISTS (
            SELECT 1 FROM designations des2 
            WHERE LOWER(TRIM(e.position)) = LOWER(TRIM(des2.title))
          )
        ) AS total_headcount
      FROM designations des
    `);

    const row = statsResult.rows[0] || {};
    res.json({
      success: true,
      data: {
        total_designations: parseInt(row.total_designations || 0, 10),
        total_headcount: parseInt(row.total_headcount || 0, 10),
        total_departments: parseInt(row.total_departments || 0, 10),
        avg_salary: parseInt(row.avg_salary || 0, 10)
      }
    });
  } catch (error) {
    console.error('getDesignationStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve designation statistics' });
  }
};

/**
 * POST /api/designations
 * Creates a new designation.
 */
const createDesignation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      department_id,
      level = 'Mid-Level',
      min_salary = 0,
      max_salary = 0,
      icon = '💼',
      status = 'active'
    } = req.body;

    const cleanTitle = title.trim();
    const minSal = parseFloat(min_salary) || 0;
    const maxSal = parseFloat(max_salary) || 0;

    if (minSal < 0 || maxSal < 0 || (maxSal > 0 && minSal > maxSal)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary range. Minimum salary cannot be negative or greater than maximum salary.'
      });
    }

    // Check department existence if provided
    let validDeptId = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (department_id && uuidRegex.test(department_id)) {
      const deptCheck = await query('SELECT id FROM departments WHERE id = $1', [department_id]);
      if (!deptCheck.rows[0]) {
        return res.status(400).json({ success: false, message: 'Selected department does not exist' });
      }
      validDeptId = department_id;
    }

    // Check duplicate constraint
    const duplicateCheck = await query(
      `SELECT id FROM designations 
       WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) 
         AND (department_id = $2 OR ($2 IS NULL AND department_id IS NULL))`,
      [cleanTitle, validDeptId]
    );

    if (duplicateCheck.rows[0]) {
      return res.status(400).json({
        success: false,
        message: `A designation with title '${cleanTitle}' already exists in this department.`
      });
    }

    const result = await query(
      `INSERT INTO designations (title, department_id, level, min_salary, max_salary, icon, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [cleanTitle, validDeptId, level, minSal, maxSal, icon, status, req.user?.id || null]
    );

    const newDesignation = result.rows[0];

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'CREATE_DESIGNATION', 'designations', newDesignation.id, JSON.stringify(newDesignation), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Designation created successfully',
      data: newDesignation
    });
  } catch (error) {
    console.error('createDesignation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create designation' });
  }
};

/**
 * PUT /api/designations/:id
 * Updates an existing designation.
 */
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existingRes = await query('SELECT * FROM designations WHERE id = $1', [id]);
    if (!existingRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }

    const current = existingRes.rows[0];
    const {
      title = current.title,
      department_id = current.department_id,
      level = current.level,
      min_salary = current.min_salary,
      max_salary = current.max_salary,
      icon = current.icon,
      status = current.status
    } = req.body;

    const cleanTitle = String(title).trim();
    const minSal = parseFloat(min_salary) || 0;
    const maxSal = parseFloat(max_salary) || 0;

    if (minSal < 0 || maxSal < 0 || (maxSal > 0 && minSal > maxSal)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary range. Minimum salary cannot be negative or greater than maximum salary.'
      });
    }

    let validDeptId = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (department_id && uuidRegex.test(department_id)) {
      const deptCheck = await query('SELECT id FROM departments WHERE id = $1', [department_id]);
      if (!deptCheck.rows[0]) {
        return res.status(400).json({ success: false, message: 'Selected department does not exist' });
      }
      validDeptId = department_id;
    }

    // Duplicate check excluding current ID
    const duplicateCheck = await query(
      `SELECT id FROM designations 
       WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) 
         AND (department_id = $2 OR ($2 IS NULL AND department_id IS NULL))
         AND id != $3`,
      [cleanTitle, validDeptId, id]
    );

    if (duplicateCheck.rows[0]) {
      return res.status(400).json({
        success: false,
        message: `Another designation with title '${cleanTitle}' already exists in this department.`
      });
    }

    const result = await query(
      `UPDATE designations 
       SET title = $1, department_id = $2, level = $3, min_salary = $4, max_salary = $5, icon = $6, status = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [cleanTitle, validDeptId, level, minSal, maxSal, icon, status, id]
    );

    const updatedDesignation = result.rows[0];

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user?.id || null, 'UPDATE_DESIGNATION', 'designations', id, JSON.stringify(current), JSON.stringify(updatedDesignation), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Designation updated successfully',
      data: updatedDesignation
    });
  } catch (error) {
    console.error('updateDesignation error:', error);
    res.status(500).json({ success: false, message: 'Failed to update designation' });
  }
};

/**
 * DELETE /api/designations/:id
 * Deletes a designation. Protected if assigned to active employees.
 */
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRes = await query('SELECT * FROM designations WHERE id = $1', [id]);
    if (!existingRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }

    const des = existingRes.rows[0];

    // Check if active employees match this designation title
    const empCheck = await query(
      `SELECT COUNT(*)::int AS emp_count 
       FROM employees 
       WHERE LOWER(TRIM(position)) = LOWER(TRIM($1))`,
      [des.title]
    );

    const activeCount = empCheck.rows[0]?.emp_count || 0;
    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete designation '${des.title}'. There are ${activeCount} active employee(s) assigned to this position.`
      });
    }

    await query('DELETE FROM designations WHERE id = $1', [id]);

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'DELETE_DESIGNATION', 'designations', id, JSON.stringify(des), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: `Designation '${des.title}' deleted successfully`
    });
  } catch (error) {
    console.error('deleteDesignation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete designation' });
  }
};

module.exports = {
  getAllDesignations,
  getDesignationStats,
  createDesignation,
  updateDesignation,
  deleteDesignation
};
