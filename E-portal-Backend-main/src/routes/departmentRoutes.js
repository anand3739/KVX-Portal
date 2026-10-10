const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');

router.get('/test', (req, res) => res.json({ message: 'Department routes working' }));
router.get('/', authenticate, getDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.post('/', authenticate, requirePermission('departments.create'), createDepartment);
router.put('/:id', authenticate, requirePermission('departments.edit'), updateDepartment);
router.delete('/:id', authenticate, requirePermission('departments.delete'), deleteDepartment);

module.exports = router;