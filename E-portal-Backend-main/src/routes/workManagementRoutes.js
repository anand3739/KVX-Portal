const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  requestAttendanceCorrection,
  getMyAttendanceCorrections,
  getPendingAttendanceCorrections,
  reviewAttendanceCorrection,
  getOrgChart,
  getManagerOverview
} = require('../controllers/workManagementController');

router.use(authenticate);

// Attendance Corrections
router.post('/attendance-corrections', requestAttendanceCorrection);
router.get('/attendance-corrections/my', getMyAttendanceCorrections);
router.get('/attendance-corrections/pending', getPendingAttendanceCorrections);
router.put('/attendance-corrections/:id/review', reviewAttendanceCorrection);

// Org Chart
router.get('/org-chart', getOrgChart);

// Manager Overview
router.get('/manager-overview', getManagerOverview);

module.exports = router;
