const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getPayrollSummary,
  generatePayroll,
  getMyPayslips,
  processPayment,
  getPayrollById,
  downloadPayslip,
  sendPayslipEmailEndpoint,
  getEmployeePayroll
} = require('../controllers/payrollController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Payroll routes working' });
});

const bankDetails = require('../controllers/bankDetailsController');

// Payroll endpoints
router.get('/', authenticate, authorize('admin', 'hr', 'ceo'), getPayrollSummary);
router.get('/summary', authenticate, authorize('admin', 'hr', 'ceo'), getPayrollSummary);
router.post('/generate', authenticate, authorize('admin', 'hr', 'ceo'), generatePayroll);
router.get('/my-payslips', authenticate, getMyPayslips);
router.get('/employees/:employeeId/bank-details', authenticate, authorize('admin', 'hr', 'ceo'), bankDetails.getEmployeeBankDetails);
router.put('/employees/:employeeId/bank-details/verify', authenticate, authorize('admin', 'hr', 'ceo'), bankDetails.verifyBankDetails);
router.get('/employee/:employeeId/bank-details', authenticate, authorize('admin', 'hr', 'ceo'), bankDetails.getEmployeeBankDetails);
router.put('/employee/:employeeId/bank-details/verify', authenticate, authorize('admin', 'hr', 'ceo'), bankDetails.verifyBankDetails);
router.get('/employee/:employeeId', authenticate, getEmployeePayroll);
router.get('/:id', authenticate, getPayrollById);
router.get('/:id/download', authenticate, downloadPayslip);
router.post('/:id/send-email', authenticate, authorize('admin', 'hr', 'ceo'), sendPayslipEmailEndpoint);
router.put('/:id/pay', authenticate, authorize('admin', 'hr', 'ceo'), processPayment);

module.exports = router;