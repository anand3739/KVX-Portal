/**
 * Settings Routes
 * Base path: /api/settings
 *
 * ──────────────────────────────────────────────────────────────
 *  Route                          Auth        Roles
 * ──────────────────────────────────────────────────────────────
 *  GET  /company                  required    any
 *  PUT  /company                  required    admin | hr | ceo
 *  GET  /user-preferences         required    any (own data)
 *  PUT  /user-preferences         required    any (own data)
 *  GET  /system                   required    admin
 *  PUT  /system                   required    admin
 *  GET  /notifications            required    any (own data)
 *  PUT  /notifications            required    any (own data)
 * ──────────────────────────────────────────────────────────────
 *
 * ══════════════════════════════════════════════════════════════
 *  CURL EXAMPLES
 * ══════════════════════════════════════════════════════════════
 *
 * Replace <TOKEN> with a valid JWT from POST /api/auth/login.
 * Replace <BASE_URL> with e.g. http://localhost:5000
 *
 * ── GET company settings ──────────────────────────────────────
 * curl -X GET "<BASE_URL>/api/settings/company" \
 *   -H "Authorization: Bearer <TOKEN>"
 *
 * ── PUT company settings ──────────────────────────────────────
 * curl -X PUT "<BASE_URL>/api/settings/company" \
 *   -H "Authorization: Bearer <TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "company_name": "KRAVIX Enterprises",
 *     "address": "123 Business Park, Bengaluru, India",
 *     "email": "info@kravix.com",
 *     "phone": "+91-9876543210",
 *     "website": "https://kravix.com",
 *     "industry": "Technology",
 *     "timezone": "Asia/Kolkata",
 *     "currency": "INR",
 *     "contact": { "name": "Admin User", "designation": "CTO" }
 *   }'
 *
 * ── GET user preferences ──────────────────────────────────────
 * curl -X GET "<BASE_URL>/api/settings/user-preferences" \
 *   -H "Authorization: Bearer <TOKEN>"
 *
 * ── PUT user preferences ──────────────────────────────────────
 * curl -X PUT "<BASE_URL>/api/settings/user-preferences" \
 *   -H "Authorization: Bearer <TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "theme": "dark",
 *     "language": "en",
 *     "date_format": "DD/MM/YYYY",
 *     "time_format": "24h",
 *     "sidebar_collapsed": false,
 *     "dashboard_widgets": ["attendance", "tasks", "leaves"]
 *   }'
 *
 * ── GET system settings (admin only) ─────────────────────────
 * curl -X GET "<BASE_URL>/api/settings/system" \
 *   -H "Authorization: Bearer <TOKEN>"
 *
 * ── PUT system settings (admin only) ─────────────────────────
 * curl -X PUT "<BASE_URL>/api/settings/system" \
 *   -H "Authorization: Bearer <TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "maintenance_mode": false,
 *     "allow_employee_self_service": true,
 *     "max_login_attempts": 5,
 *     "session_timeout_minutes": 30,
 *     "password_expiry_days": 90,
 *     "two_factor_auth": false,
 *     "audit_log_retention_days": 365
 *   }'
 *
 * ── GET notification settings ─────────────────────────────────
 * curl -X GET "<BASE_URL>/api/settings/notifications" \
 *   -H "Authorization: Bearer <TOKEN>"
 *
 * ── PUT notification settings ─────────────────────────────────
 * curl -X PUT "<BASE_URL>/api/settings/notifications" \
 *   -H "Authorization: Bearer <TOKEN>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": true,
 *     "push": false,
 *     "in_app": true,
 *     "leave_updates": true,
 *     "task_reminders": true,
 *     "payroll_alerts": false,
 *     "system_announcements": true
 *   }'
 * ══════════════════════════════════════════════════════════════
 */

const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// ── Shared helpers ────────────────────────────────────────────
/** Ensures the request body is a non-array plain object */
const objectBody = body().custom((value) => value && typeof value === 'object' && !Array.isArray(value));

// ── Company settings validation ───────────────────────────────
const companyValidation = [
  objectBody,
  body('company_name').optional().trim().notEmpty().withMessage('company_name must not be empty')
    .isLength({ max: 255 }).withMessage('company_name must be at most 255 characters'),
  body('address').optional({ nullable: true }).trim()
    .isLength({ max: 2000 }).withMessage('address must be at most 2000 characters'),
  body('contact').optional({ nullable: true }).isObject().withMessage('contact must be an object'),
  body('email').optional({ nullable: true }).isEmail().withMessage('email must be a valid email address'),
  body('phone').optional({ nullable: true }).trim()
    .isLength({ max: 50 }).withMessage('phone must be at most 50 characters'),
  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('website must be a valid URL'),
  body('industry').optional({ nullable: true }).trim()
    .isLength({ max: 100 }).withMessage('industry must be at most 100 characters'),
  body('timezone').optional().isString()
    .isLength({ max: 100 }).withMessage('timezone must be at most 100 characters'),
  body('currency').optional().isString()
    .isLength({ min: 3, max: 3 }).withMessage('currency must be exactly 3 characters (ISO 4217)'),
];

// ── User-preferences validation ───────────────────────────────
const userPreferencesValidation = [
  objectBody,
  body('theme').optional().isIn(['light', 'dark', 'system'])
    .withMessage('theme must be one of: light, dark, system'),
  body('language').optional().isString()
    .isLength({ min: 2, max: 10 }).withMessage('language must be a valid locale code'),
  body('date_format').optional().isString()
    .isLength({ max: 20 }).withMessage('date_format must be at most 20 characters'),
  body('time_format').optional().isIn(['12h', '24h'])
    .withMessage('time_format must be one of: 12h, 24h'),
  body('sidebar_collapsed').optional().isBoolean()
    .withMessage('sidebar_collapsed must be a boolean'),
  body('dashboard_widgets').optional().isArray()
    .withMessage('dashboard_widgets must be an array'),
  body('notification_frequency').optional().isIn(['instant', 'daily', 'weekly'])
    .withMessage('notification_frequency must be instant, daily, or weekly'),
  body('accent_color').optional().isString().isLength({ max: 20 }),
  body('compact_layout').optional().isBoolean(),
  body('quiet_hours').optional().isObject(),
  body('accessibility').optional().isObject(),
];

// ── System settings validation ────────────────────────────────
const systemSettingsValidation = [
  objectBody,
  body('maintenance_mode').optional().isBoolean()
    .withMessage('maintenance_mode must be a boolean'),
  body('allow_employee_self_service').optional().isBoolean()
    .withMessage('allow_employee_self_service must be a boolean'),
  body('max_login_attempts').optional().isInt({ min: 1, max: 20 })
    .withMessage('max_login_attempts must be an integer between 1 and 20'),
  body('session_timeout_minutes').optional().isNumeric()
    .withMessage('session_timeout_minutes must be a valid number or numeric string'),
  body('password_expiry_days').optional().isNumeric()
    .withMessage('password_expiry_days must be a valid number or numeric string'),
  body('two_factor_auth').optional().isBoolean()
    .withMessage('two_factor_auth must be a boolean'),
  body('audit_log_retention_days').optional().isNumeric()
    .withMessage('audit_log_retention_days must be a valid number or numeric string'),
  body('attendance_cutoff').optional().isString(),
  body('work_hours').optional(),
  body('overtime_threshold').optional(),
  body('leave_approval').optional().isString(),
  body('payroll_schedule').optional().isString(),
  body('auto_approve_leave').optional().isBoolean(),
  body('data_retention').optional(),
];

// ── Notification settings validation ─────────────────────────
const notificationValidation = [
  objectBody,
  body('email').optional().isBoolean().withMessage('email must be a boolean'),
  body('push').optional().isBoolean().withMessage('push must be a boolean'),
  body('in_app').optional().isBoolean().withMessage('in_app must be a boolean'),
  body('leave_updates').optional().isBoolean().withMessage('leave_updates must be a boolean'),
  body('task_reminders').optional().isBoolean().withMessage('task_reminders must be a boolean'),
  body('payroll_alerts').optional().isBoolean().withMessage('payroll_alerts must be a boolean'),
  body('system_announcements').optional().isBoolean()
    .withMessage('system_announcements must be a boolean'),
  body('performance_alerts').optional().isBoolean(),
];

// ── Routes ────────────────────────────────────────────────────

// Company settings — readable by any authenticated user
router.get('/company', settingsController.getCompanySettings);

// Company settings — writable with settings.edit or security.edit permission
router.put(
  '/company',
  authenticate,
  requirePermission('settings.edit', 'security.edit'),
  companyValidation,
  settingsController.updateCompanySettings,
);

// User preferences — own data for every authenticated user
router.get('/user-preferences', authenticate, settingsController.getUserPreferences);
router.put(
  '/user-preferences',
  authenticate,
  userPreferencesValidation,
  settingsController.updateUserPreferences,
);

// System settings — settings.view, settings.edit, security.view, security.edit
router.get('/system', authenticate, requirePermission('settings.view', 'security.view'), settingsController.getSystemSettings);
router.put(
  '/system',
  authenticate,
  requirePermission('settings.edit', 'security.edit'),
  systemSettingsValidation,
  settingsController.updateSystemSettings,
);

const upload = require('../middleware/upload');

// Notification settings — own data for every authenticated user
router.get('/notifications', authenticate, settingsController.getNotificationSettings);
router.put(
  '/notifications',
  authenticate,
  notificationValidation,
  settingsController.updateNotificationSettings,
);

// Utility endpoints called by settingsService.js
router.post('/company/logo', authenticate, requirePermission('settings.edit', 'security.edit'), upload.single('logo'), settingsController.uploadCompanyLogo);
router.post('/company/validate', authenticate, settingsController.validateCompanySettings);
router.post('/user-preferences/reset', authenticate, settingsController.resetUserPreferences);
router.get('/themes', authenticate, settingsController.getAvailableThemes);
router.post('/user-preferences/theme', authenticate, settingsController.applyTheme);

module.exports = router;
