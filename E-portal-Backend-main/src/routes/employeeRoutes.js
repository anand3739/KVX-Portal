const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission, isSelfOrHigher } = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImage');
const employee = require('../controllers/employeeController');

const bankDetails = require('../controllers/bankDetailsController');

router.use(authenticate);
router.get('/me/bank-details', bankDetails.getMyBankDetails);
router.put('/me/bank-details', bankDetails.updateMyBankDetails);
router.get('/:id/bank-details', isSelfOrHigher, bankDetails.getEmployeeBankDetails);
router.get('/', requirePermission('employees.view'), employee.getAllEmployees);
router.post('/', requirePermission('employees.create'), employee.createEmployee);
router.get('/stats', requirePermission('employees.view'), employee.getEmployeeStats);
router.get('/directory', employee.getDirectory);
router.get('/department/:departmentId', requirePermission('employees.view'), employee.getEmployeesByDepartment);
router.get('/:id/password', authorize('admin'), employee.getEmployeePassword);
router.get('/:id/overview', isSelfOrHigher, employee.getEmployeeOverview);
router.get('/:id', isSelfOrHigher, employee.getEmployeeById);
router.put('/:id', isSelfOrHigher, employee.updateEmployee);
router.delete('/:id', requirePermission('employees.delete'), employee.deleteEmployee);

// Image upload routes — multer runs before the controller handler

router.post(
  '/:id/profile-picture',
  isSelfOrHigher,
  uploadImage.single('profilePicture'),
  employee.uploadProfilePicture
);
router.post(
  '/:id/banner',
  isSelfOrHigher,
  uploadImage.single('banner'),
  employee.uploadBanner
);

module.exports = router;
