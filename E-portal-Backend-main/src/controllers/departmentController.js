/**
 * Department Controller
 *
 * Handles all /api/departments/* endpoints.
 *
 * Tables used:
 *   departments  – department records
 *   employees    – employee counts and head info
 */

'use strict';

const { validationResult } = require('express-validator');
const { query } = require('../config/database');

// ── Helpers ───────────────────────────────────────────────────
const isMissingTableError = (e) => e && e.code === '42P01';

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const serverError = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

// ═════════════════════════════════════════════════════════════
//  GET /api/departments  — list all departments with employee count
// ═════════════════════════════════════════════════════════════
const getDepartments = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*,
              COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) <> 'intern' THEN 1 END)::int AS employee_count,
              COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) = 'intern' THEN 1 END)::int AS intern_count,
              CONCAT(h.first_name,' ',h.last_name) AS head_name
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.status IN ('active','probation')
       LEFT JOIN employees h ON h.id = d.head_id
       GROUP BY d.id, h.first_name, h.last_name
       ORDER BY d.name`
    );
    return res.json({ success: true, message: 'Departments retrieved', data: result.rows });
  } catch (error) {
    if (isMissingTableError(error)) return res.json({ success: true, message: 'Departments retrieved', data: [] });
    return serverError(res, error, 'getDepartments');
  }
};

// ═════════════════════════════════════════════════════════════
//  GET /api/departments/:id  — single department
// ═════════════════════════════════════════════════════════════
const getDepartmentById = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*,
              COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) <> 'intern' THEN 1 END)::int AS employee_count,
              COUNT(CASE WHEN LOWER(COALESCE(e.employment_type, '')) = 'intern' THEN 1 END)::int AS intern_count,
              CONCAT(h.first_name,' ',h.last_name) AS head_name
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.status IN ('active','probation')
       LEFT JOIN employees h ON h.id = d.head_id
       WHERE d.id = $1
       GROUP BY d.id, h.first_name, h.last_name`,
      [req.params.id]
    );
    const dept = result.rows[0];
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    return res.json({ success: true, message: 'Department retrieved', data: dept });
  } catch (error) {
    return serverError(res, error, 'getDepartmentById');
  }
};

// ═════════════════════════════════════════════════════════════
//  POST /api/departments  — create department (admin/hr only)
// ═════════════════════════════════════════════════════════════
const createDepartment = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;
    const { name, description = null, head_id = null, budget = null } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const existing = await query(
      'SELECT id FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))',
      [name.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Department with this name already exists' });
    }

    const result = await query(
      'INSERT INTO departments (name, description, head_id, budget) VALUES ($1,$2,$3,$4) RETURNING *',
      [name.trim(), description, head_id, budget]
    );
    return res.status(201).json({ success: true, message: 'Department created', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Department name already exists' });
    return serverError(res, error, 'createDepartment');
  }
};

// ═════════════════════════════════════════════════════════════
//  PUT /api/departments/:id  — update department (admin/hr only)
// ═════════════════════════════════════════════════════════════
const ALLOWED_DEPT_FIELDS = ['name', 'description', 'head_id', 'budget'];

const updateDepartment = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;

    if (req.body.name && req.body.name.trim()) {
      const existing = await query(
        'SELECT id FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND id <> $2',
        [req.body.name.trim(), req.params.id]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Department with this name already exists' });
      }
    }

    const fields = ALLOWED_DEPT_FIELDS.filter((f) => req.body[f] !== undefined);
    if (!fields.length) return res.status(400).json({ success: false, message: 'No valid fields to update' });

    const values = fields.map((f) => req.body[f]);
    const setters = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(req.params.id);

    const result = await query(
      `UPDATE departments SET ${setters}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Department not found' });
    return res.json({ success: true, message: 'Department updated', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Department name already exists' });
    return serverError(res, error, 'updateDepartment');
  }
};

// ═════════════════════════════════════════════════════════════
//  DELETE /api/departments/:id  — delete department (admin only)
// ═════════════════════════════════════════════════════════════
const deleteDepartment = async (req, res) => {
  try {
    // Safety check: do not delete if employees are assigned
    const emp = await query(
      "SELECT id FROM employees WHERE department_id = $1 AND status IN ('active','probation') LIMIT 1",
      [req.params.id]
    );
    if (emp.rows.length) {
      return res.status(409).json({ success: false, message: 'Cannot delete a department that has active employees' });
    }

    const result = await query('DELETE FROM departments WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Department not found' });
    return res.json({ success: true, message: 'Department deleted', data: result.rows[0] });
  } catch (error) {
    return serverError(res, error, 'deleteDepartment');
  }
};

module.exports = { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
