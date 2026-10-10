'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllDesignations,
  getDesignationStats,
  createDesignation,
  updateDesignation,
  deleteDesignation
} = require('../controllers/designationController');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');

const designationValidation = [
  body('title').notEmpty().withMessage('Designation title is required').trim(),
  body('department_id').optional({ nullable: true }),
  body('level').optional().isString(),
  body('min_salary').optional().isNumeric(),
  body('max_salary').optional().isNumeric(),
  body('icon').optional().isString(),
  body('status').optional().isIn(['active', 'inactive'])
];

// Specific path routes MUST precede parametric routes
router.get('/stats', authenticate, getDesignationStats);

// Collection routes
router.get('/', authenticate, getAllDesignations);
router.post('/', authenticate, requirePermission('designations.create'), designationValidation, createDesignation);

// Parametric entity routes
router.put('/:id', authenticate, requirePermission('designations.edit'), designationValidation, updateDesignation);
router.delete('/:id', authenticate, requirePermission('designations.delete'), deleteDesignation);

module.exports = router;
