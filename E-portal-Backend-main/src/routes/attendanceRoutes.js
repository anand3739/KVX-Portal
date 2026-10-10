const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  clockIn,
  clockOut,
  getTodayAttendance,
  getMonthlyAttendance,
  getAttendanceReport,
  getAttendanceStats,
  getWeeklyAttendance,
  updateAttendance
} = require('../controllers/attendanceController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Attendance routes working'
  });
});

// Protected test route
router.get('/protected', authenticate, (req, res) => {
  res.json({
    message: 'Attendance protected route working',
    user: req.user
  });
});

// Clock in/out
router.post('/clock-in', authenticate, clockIn);
router.post('/clock-out', authenticate, clockOut);

// Summary & Employee aliases
router.get('/summary', authenticate, getAttendanceReport);
router.get('/my-attendance', authenticate, getTodayAttendance);

// Today's, weekly, and monthly attendance
router.get('/today', authenticate, getTodayAttendance);
router.get('/weekly', authenticate, getWeeklyAttendance);
router.get('/weekly/:date', authenticate, getWeeklyAttendance);
router.get('/stats', authenticate, getAttendanceStats);
router.get('/monthly/:year/:month', authenticate, getMonthlyAttendance);
// Employee portal compatibility route.
router.get(
  '/employee/:employeeId/:year/:month',
  authenticate,
  getMonthlyAttendance
);
router.get('/my/:year/:month', authenticate, getMonthlyAttendance);
router.get('/report', authenticate, getAttendanceReport);
router.put('/:id', authenticate, authorize('admin', 'hr'), updateAttendance);

module.exports = router;