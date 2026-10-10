const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const bankDetails = require('../controllers/bankDetailsController');

// All routes require authentication
router.use(authenticate);

// Employee self-service
router.get('/my', bankDetails.getMyBankDetails);
router.put('/my', bankDetails.updateMyBankDetails);
router.get('/me', bankDetails.getMyBankDetails);
router.put('/me', bankDetails.updateMyBankDetails);

// HR / Admin / Payroll access
router.get('/employee/:employeeId', bankDetails.getEmployeeBankDetails);
router.put('/employee/:employeeId/verify', authorize('admin', 'hr'), bankDetails.verifyBankDetails);

module.exports = router;
