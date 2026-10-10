// src/middleware/permissionMiddleware.js
// Fixed: role-based permission map ensures correct RBAC regardless of DB category names

const { query } = require('../config/database');

// ─── Role-based permission map ────────────────────────────────────────────────
// These are the canonical permissions each role has, regardless of DB category names
const ROLE_PERMISSION_MAP = {
  admin: null,   // null = all permissions granted (bypass)
  ceo:   null,   // null = all permissions granted (bypass)
  hr: new Set([
    // Core employee management
    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
    // Attendance
    'attendance.view', 'attendance.edit', 'attendance.approve',
    // Leaves
    'leaves.view', 'leaves.approve', 'leaves.reject', 'leaves.create',
    // Payroll
    'payroll.view', 'payroll.edit', 'payroll.create', 'payroll.process',
    // Performance
    'performance.view', 'performance.edit', 'performance.create', 'performance.delete',
    // Training
    'training.view', 'training.edit', 'training.create', 'training.delete',
    // Recruitment
    'recruitment.view', 'recruitment.create', 'recruitment.edit', 'recruitment.delete',
    // Reports
    'reports.view', 'reports.generate',
    // Documents
    'documents.view', 'documents.upload', 'documents.delete',
  ]),
  employee: new Set([
    // Profile
    'profile.view', 'profile.edit',
    // Tasks
    'tasks.view', 'tasks.edit',
    // Leaves - employees CAN submit leave requests
    'leaves.create',
    // Documents
    'documents.view', 'documents.upload',
    // Dashboard
    'dashboard.view',
  ]),
};

// Load permissions for a user based on their role
const loadEmployeePermissions = async (req) => {
  try {
    const user = req.user;
    if (!user || !user.role) return new Set();

    const rolePerms = ROLE_PERMISSION_MAP[user.role?.toLowerCase()];
    if (rolePerms === null) return new Set(['*']); // admin/ceo bypass
    if (rolePerms) return rolePerms;

    // Fallback: query DB
    const result = await query(
      `SELECT code FROM permissions WHERE category = $1`,
      [user.role]
    );
    return new Set(result.rows.map(row => row.code));
  } catch (error) {
    console.error('Error loading permissions:', error.message);
    return new Set();
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const role = req.user.role?.toLowerCase();

    // Admin and CEO bypass all permission checks
    if (role === 'admin' || role === 'ceo') {
      return next();
    }

    // Check role-based permission map first (canonical source of truth)
    const rolePerms = ROLE_PERMISSION_MAP[role];
    if (rolePerms !== undefined) {
      if (rolePerms === null || rolePerms.has(permission) || rolePerms.has('*')) {
        return next();
      }
    }

    // Fallback: check permissions array from auth middleware (DB-loaded)
    if (Array.isArray(req.user.permissions) && req.user.permissions.includes(permission)) {
      return next();
    }

    console.log(`❌ Permission denied: ${req.user.email} (${req.user.role}) missing: ${permission}`);

    return res.status(403).json({
      success: false,
      message: `Access denied. Required permission: ${permission}`,
      code: 'PERMISSION_DENIED',
      required: permission,
      role: req.user.role
    });
  };
};

module.exports = {
  loadEmployeePermissions,
  requirePermission
};