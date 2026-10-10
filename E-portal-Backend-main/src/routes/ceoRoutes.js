// ============================================================
// src/routes/ceoRoutes.js
// CEO Routes - CEO-specific API endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');
const departmentController = require('../controllers/departmentController');
const performanceReviewController = require('../controllers/performanceReviewController');
const payrollController = require('../controllers/payrollController');
const leaveController = require('../controllers/leaveController');
const recruitmentController = require('../controllers/recruitmentController');
const ceoController = require('../controllers/ceoController');

// ============================================================
// PROTECT ALL CEO ROUTES
// ============================================================
// All routes require authentication and CEO role
router.use(authenticate);
router.use(authorize('ceo'));

// ============================================================
// EMPLOYEE ROUTES (reused directly from employeeController)
// ============================================================
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/stats', employeeController.getEmployeeStats);
router.get('/employees/:id', employeeController.getEmployeeById);

// ============================================================
// DEPARTMENT ROUTES (reused directly from departmentController)
// ============================================================
router.get('/departments', departmentController.getDepartments);
router.get('/departments/stats', departmentController.getDepartments);
router.get('/departments/:id', departmentController.getDepartmentById);
router.post('/departments', departmentController.createDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

// ============================================================
// PERFORMANCE REVIEW ROUTES (reused directly from performanceReviewController)
// ============================================================
router.get('/performance-reviews', performanceReviewController.getPerformanceReviews);
router.get('/performance-reviews/stats', performanceReviewController.getPerformanceReviews);
router.get('/performance-reviews/:id', performanceReviewController.getPerformanceReviewById);
router.post('/performance-reviews', performanceReviewController.createPerformanceReview);
router.put('/performance-reviews/:id', performanceReviewController.updatePerformanceReview);
router.delete('/performance-reviews/:id', performanceReviewController.deletePerformanceReview);

// ============================================================
// HR MANAGEMENT OVERVIEWS
// ============================================================
router.get('/hr/payroll-summary', ceoController.getHRPayrollSummary);
router.get('/hr/leave', ceoController.getHRLeaveOverview);
router.get('/hr/recruitment', ceoController.getHRRecruitmentOverview);
router.get('/hr/overview', ceoController.getHROverview);

// ============================================================
// EXECUTIVE APPROVALS
// ============================================================
router.get('/approvals', ceoController.getApprovals);
router.post('/approvals', ceoController.createApproval);
router.put('/approvals/:id/decide', ceoController.decideApproval);

// ============================================================
// EXECUTIVE NOTIFICATIONS
// ============================================================
router.get('/notifications', ceoController.getExecutiveNotifications);
router.post('/notifications', ceoController.createExecutiveNotification);
router.put('/notifications/read-all', ceoController.markAllExecutiveNotificationsRead);
router.put('/notifications/:id/read', ceoController.markExecutiveNotificationRead);

// ============================================================
// STRATEGIC ALERTS
// ============================================================
router.get('/strategic-alerts', ceoController.getStrategicAlerts);
router.put('/strategic-alerts/:id/status', ceoController.updateAlertStatus);

// ============================================================
// CEO PROFILE & SETTINGS (employees.preferences JSONB)
// ============================================================
router.get('/settings/profile', ceoController.getExecutiveProfile);
router.put('/settings/profile', ceoController.saveExecutiveProfile);

// ============================================================
// EXECUTIVE REPORTS CENTER
// ============================================================
router.get('/reports', ceoController.getReportsOverview);
router.post('/reports', ceoController.createReport);
router.post('/reports/:id/activity', ceoController.logReportActivity);
router.post('/reports/scheduled', ceoController.createScheduledReport);
router.put('/reports/scheduled/:id/status', ceoController.updateScheduledReportStatus);
router.post('/reports/scheduled/:id/run-now', ceoController.runNowScheduledReport);

module.exports = router;
