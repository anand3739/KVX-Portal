const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getLeaveBalance,
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
  getEmployeeLeaveSummary
} = require('../controllers/leaveController');

// Test routes
router.get('/test', (req, res) => {
  res.json({ message: 'Leave routes working' });
});

// Employee routes
router.get('/balance', authenticate, getLeaveBalance);
router.get('/my-requests', authenticate, getMyLeaves);
router.post('/apply', authenticate, applyLeave);
router.put('/requests/:id/cancel', authenticate, cancelLeave);
router.get('/employee/:employeeId/summary', authenticate, getEmployeeLeaveSummary);
router.get('/employee/:employeeId', authenticate, getEmployeeLeaveSummary);

// HR/Admin/CEO routes
router.get('/all', authenticate, authorize('admin', 'hr', 'ceo', 'manager'), getAllLeaves);
router.put('/:id/status', authenticate, authorize('admin', 'hr', 'ceo', 'manager'), updateLeaveStatus);

module.exports = router;