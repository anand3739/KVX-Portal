const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAttendanceReport,
  getPayrollReport,
  getDepartmentReport,
  getPerformanceReport,
  getLeaveReport,
  getRecruitmentReport,
  getTurnoverReport,
  getDashboardStats,
  getUserActivityAnalytics,
  getSystemHealthAnalytics
} = require('../controllers/reportController');

router.get('/test', (req, res) => {
  res.json({ message: 'Report routes working' });
});

router.get('/dashboard-stats', authenticate, getDashboardStats);
router.get('/user-activity',    authenticate, getUserActivityAnalytics);
router.get('/system-health',    authenticate, getSystemHealthAnalytics);
router.get('/attendance',     authenticate, getAttendanceReport);
router.get('/payroll',        authenticate, getPayrollReport);
router.get('/departments',    authenticate, getDepartmentReport);
router.get('/performance',    authenticate, getPerformanceReport);
router.get('/leave',          authenticate, getLeaveReport);
router.get('/recruitment',    authenticate, getRecruitmentReport);
router.get('/turnover',       authenticate, getTurnoverReport);

module.exports = router;
