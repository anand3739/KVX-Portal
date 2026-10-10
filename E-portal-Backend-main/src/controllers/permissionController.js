'use strict';

const { query } = require('../config/database');

/**
 * GET /api/permissions
 * List master permissions catalog.
 */
const getAllPermissions = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, category, module, action, code, description, created_at
      FROM permissions
      ORDER BY category ASC, module ASC, action ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getAllPermissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve permissions' });
  }
};

/**
 * GET /api/roles/:id/permissions
 * Get all permission IDs/codes granted to a specific role.
 */
const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT p.id, p.category, p.module, p.action, p.code, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.category ASC, p.module ASC, p.action ASC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getRolePermissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve role permissions' });
  }
};

/**
 * PUT /api/roles/:id/permissions
 * Update permissions matrix for a role.
 */
const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids = [], permission_codes = [] } = req.body;

    const roleCheck = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (!roleCheck.rows[0]) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const role = roleCheck.rows[0];

    // Resolve IDs if codes were provided
    let targetIds = [...permission_ids];
    if (permission_codes.length > 0) {
      const codeRes = await query(
        `SELECT id FROM permissions WHERE code = ANY($1)`,
        [permission_codes]
      );
      targetIds = codeRes.rows.map(r => r.id);
    }

    // Delete existing permissions for role
    await query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Bulk insert new permissions
    if (targetIds.length > 0) {
      for (const pId of targetIds) {
        await query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, pId]
        );
      }
    }

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'UPDATE_ROLE_PERMISSIONS', 'roles', id, JSON.stringify({ permission_count: targetIds.length }), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: `Permissions updated successfully for role '${role.name}'`,
      data: {
        role_id: id,
        permission_count: targetIds.length
      }
    });
  } catch (error) {
    console.error('updateRolePermissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role permissions' });
  }
};

/**
 * GET /api/roles/:id/users
 * List users assigned to a role.
 */
const getRoleUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        e.id, 
        e.employee_id, 
        e.first_name, 
        e.last_name, 
        e.email, 
        e.role AS system_role, 
        e.department_id, 
        d.name AS department_name
      FROM employees e
      JOIN employee_roles er ON e.id = er.employee_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE er.role_id = $1
      ORDER BY e.first_name ASC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('getRoleUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users for role' });
  }
};

/**
 * POST /api/roles/:id/users
 * Assign a user to a role.
 */
const assignRoleToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required' });
    }

    const roleCheck = await query('SELECT name FROM roles WHERE id = $1', [id]);
    if (!roleCheck.rows[0]) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const empCheck = await query('SELECT first_name, last_name FROM employees WHERE id = $1', [employee_id]);
    if (!empCheck.rows[0]) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await query(
      `INSERT INTO employee_roles (employee_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [employee_id, id]
    );

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'ASSIGN_ROLE', 'employee_roles', employee_id, JSON.stringify({ role_id: id }), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: `Role '${roleCheck.rows[0].name}' assigned to employee successfully`
    });
  } catch (error) {
    console.error('assignRoleToUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign role to employee' });
  }
};

/**
 * DELETE /api/roles/:id/users/:employeeId
 * Remove a user from a role.
 */
const removeRoleFromUser = async (req, res) => {
  try {
    const { id, employeeId } = req.params;

    await query(
      `DELETE FROM employee_roles WHERE role_id = $1 AND employee_id = $2`,
      [id, employeeId]
    );

    // Activity log
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user?.id || null, 'REMOVE_ROLE', 'employee_roles', employeeId, JSON.stringify({ role_id: id }), req.ip]
      );
    } catch (logErr) {
      console.warn('Activity log failure:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Role removed from employee successfully'
    });
  } catch (error) {
    console.error('removeRoleFromUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove role from employee' });
  }
};

module.exports = {
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
  getRoleUsers,
  assignRoleToUser,
  removeRoleFromUser
};
