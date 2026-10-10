'use strict';

const { query } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * GET /api/roles
 * List all roles with employee headcount.
 */
const getAllRoles = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.id,
        r.name,
        r.code,
        r.description,
        r.is_system,
        r.status,
        r.created_at,
        r.updated_at,
        COUNT(er.employee_id)::int AS users_count
      FROM roles r
      LEFT JOIN employee_roles er ON r.id = er.role_id
      GROUP BY r.id
      ORDER BY r.is_system DESC, r.name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getAllRoles error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve roles' });
  }
};

/**
 * GET /api/roles/:id
 * Get single role details with user count and permission list.
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const roleRes = await query(`
      SELECT 
        r.*,
        COUNT(er.employee_id)::int AS users_count
      FROM roles r
      LEFT JOIN employee_roles er ON r.id = er.role_id
      WHERE r.id = $1
      GROUP BY r.id
    `, [id]);

    if (!roleRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const permRes = await query(`
      SELECT p.id, p.code, p.category, p.module, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        ...roleRes.rows[0],
        permissions: permRes.rows
      }
    });
  } catch (error) {
    console.error('getRoleById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve role details' });
  }
};

/**
 * POST /api/roles
 * Create a new custom role.
 */
const createRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description = '' } = req.body;
    const cleanName = name.trim();
    const code = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // Duplicate check
    const dupCheck = await query(
      `SELECT id FROM roles WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) OR code = $2`,
      [cleanName, code]
    );

    if (dupCheck.rows[0]) {
      return res.status(400).json({
        success: false,
        message: `A role with the name '${cleanName}' already exists.`
      });
    }

    const result = await query(
      `INSERT INTO roles (name, code, description, is_system, created_by)
       VALUES ($1, $2, $3, false, $4)
       RETURNING *`,
      [cleanName, code, description, req.user?.id || null]
    );

    const newRole = result.rows[0];

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'CREATE_ROLE', 'roles', newRole.id, JSON.stringify(newRole), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('createRole error:', error);
    res.status(500).json({ success: false, message: 'Failed to create role' });
  }
};

/**
 * PUT /api/roles/:id
 * Update an existing role.
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const currentRole = existing.rows[0];
    const { name = currentRole.name, description = currentRole.description } = req.body;
    const cleanName = String(name).trim();

    // Duplicate check excluding current role ID
    const dupCheck = await query(
      `SELECT id FROM roles WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND id != $2`,
      [cleanName, id]
    );

    if (dupCheck.rows[0]) {
      return res.status(400).json({
        success: false,
        message: `Another role with the name '${cleanName}' already exists.`
      });
    }

    const result = await query(
      `UPDATE roles 
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [cleanName, description, id]
    );

    const updatedRole = result.rows[0];

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user?.id || null, 'UPDATE_ROLE', 'roles', id, JSON.stringify(currentRole), JSON.stringify(updatedRole), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('updateRole error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

/**
 * DELETE /api/roles/:id
 * Delete a role. Protected if system role or assigned to active employees.
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const role = existing.rows[0];

    if (role.is_system) {
      return res.status(400).json({
        success: false,
        message: `System role '${role.name}' cannot be deleted.`
      });
    }

    // Check user assignment
    const userCheck = await query(
      `SELECT COUNT(*)::int AS emp_count FROM employee_roles WHERE role_id = $1`,
      [id]
    );

    const empCount = userCheck.rows[0]?.emp_count || 0;
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role '${role.name}'. It is currently assigned to ${empCount} employee(s).`
      });
    }

    await query('DELETE FROM roles WHERE id = $1', [id]);

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'DELETE_ROLE', 'roles', id, JSON.stringify(role), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: `Role '${role.name}' deleted successfully`
    });
  } catch (error) {
    console.error('deleteRole error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete role' });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
