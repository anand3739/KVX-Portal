'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');
const {
  getRolePermissions,
  updateRolePermissions,
  getRoleUsers,
  assignRoleToUser,
  removeRoleFromUser
} = require('../controllers/permissionController');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');

const roleValidation = [
  body('name').notEmpty().withMessage('Role name is required').trim(),
  body('description').optional().isString()
];

// Role Users
router.get('/:id/users', authenticate, requirePermission('roles.view', 'employees.view'), getRoleUsers);
router.post('/:id/users', authenticate, requirePermission('roles.assign'), assignRoleToUser);
router.delete('/:id/users/:employeeId', authenticate, requirePermission('roles.assign'), removeRoleFromUser);

// Role Permissions Matrix
router.get('/:id/permissions', authenticate, requirePermission('roles.view'), getRolePermissions);
router.put('/:id/permissions', authenticate, requirePermission('roles.edit'), updateRolePermissions);

// CRUD
router.get('/', authenticate, requirePermission('roles.view'), getAllRoles);
router.get('/:id', authenticate, requirePermission('roles.view'), getRoleById);
router.post('/', authenticate, requirePermission('roles.create'), roleValidation, createRole);
router.put('/:id', authenticate, requirePermission('roles.edit'), roleValidation, updateRole);
router.delete('/:id', authenticate, requirePermission('roles.delete'), deleteRole);

module.exports = router;
