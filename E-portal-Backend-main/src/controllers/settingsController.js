/**
 * Settings Controller
 *
 * Handles all /api/settings/* endpoints.
 *
 * Tables used:
 *   company_settings  – singleton row (id = TRUE)
 *   system_settings   – singleton row (id = TRUE)
 *   user_settings     – one row per employee (PK: user_id)
 *
 * Pattern:
 *   - GET  endpoints: SELECT → merge with defaults → 200 JSON
 *   - PUT  endpoints: validate → UPSERT (JSONB merge) → 200 JSON
 *   - 42P01 (table-not-found) is caught gracefully and returns defaults
 *     so the API still responds during a fresh deployment before migrations run.
 */

'use strict';

const { validationResult } = require('express-validator');
const { query } = require('../config/database');

// ── Default values ────────────────────────────────────────────
const DEFAULT_COMPANY_SETTINGS = {
  company_name: 'KRAVIX',
  logo: null,
  address: null,
  email: null,
  phone: null,
  website: null,
  industry: null,
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  contact: null,
};

const DEFAULT_USER_PREFERENCES = {
  theme: 'light',
  language: 'en',
  date_format: 'DD/MM/YYYY',
  time_format: '24h',
  sidebar_collapsed: false,
  dashboard_widgets: ['attendance', 'tasks', 'leaves', 'payroll'],
  notification_frequency: 'daily',
  accent_color: 'indigo',
  compact_layout: false,
  quiet_hours: { start: '22:00', end: '07:00' },
  accessibility: { reducedMotion: false, fontSize: 'medium' },
};

const DEFAULT_SYSTEM_SETTINGS = {
  maintenance_mode: false,
  allow_employee_self_service: true,
  max_login_attempts: 5,
  session_timeout_minutes: 60,
  password_expiry_days: 90,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_number: true,
  password_require_special: true,
  two_factor_auth: false,
  audit_log_retention_days: 365,
  attendance_cutoff: '09:30',
  work_hours: '9',
  overtime_threshold: '8',
  leave_approval: 'manager',
  payroll_schedule: 'monthly',
  auto_approve_leave: false,
  data_retention: '365',
  ip_whitelist_enabled: false,
  ip_whitelist: [],
  backup_config: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupDestination: 'Local Storage',
    retentionPeriod: '90 days',
  },
  integrations: [],
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  push: true,
  in_app: true,
  leave_updates: true,
  task_reminders: true,
  payroll_alerts: true,
  system_announcements: true,
  performance_alerts: true,
};

// ── Helpers ───────────────────────────────────────────────────

/** Returns true if the error was caused by a missing table (42P01). */
const isMissingTableError = (error) => error && error.code === '42P01';

/**
 * Runs express-validator, responds 400 on failure.
 * @returns {boolean} true if validation failed (caller should return early)
 */
const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array(),
  });
  return true;
};

/**
 * Responds 500 and logs the error.
 * @returns {Response}
 */
const serverError = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

/**
 * Responds 400 when the request body has no keys.
 * @returns {boolean} true if body is empty (caller should return early)
 */
const ensureNonEmptyBody = (req, res) => {
  if (Object.keys(req.body || {}).length) return false;
  res.status(400).json({ success: false, message: 'Request body must contain at least one field' });
  return true;
};

/**
 * Strips unknown keys from `body` that are not present in `allowed`.
 * Returns a new object with only the permitted keys.
 */
const pickAllowed = (body, allowed) =>
  Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

// ── Company Settings ──────────────────────────────────────────

/**
 * GET /api/settings/company
 * Auth: required (any role)
 */
const getCompanySettings = async (req, res) => {
  try {
    const result = await query('SELECT settings FROM company_settings WHERE id = true');
    const stored = result.rows[0]?.settings || {};
    return res.json({
      success: true,
      message: 'Company settings retrieved successfully',
      data: { ...DEFAULT_COMPANY_SETTINGS, ...stored },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.json({
        success: true,
        message: 'Company settings retrieved successfully',
        data: DEFAULT_COMPANY_SETTINGS,
      });
    }
    return serverError(res, error, 'getCompanySettings');
  }
};

/**
 * PUT /api/settings/company
 * Auth: required | Roles: admin, hr, ceo
 * Body: { company_name?, address?, contact?, email?, phone?, website?, industry?, timezone?, currency? }
 */
const ALLOWED_COMPANY_KEYS = [
  'company_name', 'address', 'contact', 'email', 'phone',
  'website', 'industry', 'timezone', 'currency', 'logo',
];

const updateCompanySettings = async (req, res) => {
  try {
    if (validationFailed(req, res) || ensureNonEmptyBody(req, res)) return;

    const payload = pickAllowed(req.body, ALLOWED_COMPANY_KEYS);

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        message: `No valid fields provided. Allowed: ${ALLOWED_COMPANY_KEYS.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO company_settings (id, settings)
         VALUES (true, $1::jsonb)
         ON CONFLICT (id)
         DO UPDATE SET
           settings   = company_settings.settings || EXCLUDED.settings,
           updated_at = NOW()
         RETURNING settings`,
      [JSON.stringify(payload)],
    );

    return res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: { ...DEFAULT_COMPANY_SETTINGS, ...result.rows[0].settings },
    });
  } catch (error) {
    return serverError(res, error, 'updateCompanySettings');
  }
};

// ── User Preferences ──────────────────────────────────────────

/**
 * GET /api/settings/user-preferences
 * Auth: required (any role) — returns preferences for req.user
 */
const getUserPreferences = async (req, res) => {
  try {
    // Demo users have no persistent record; return defaults immediately
    if (req.user.auth_source === 'demo') {
      return res.json({
        success: true,
        message: 'User preferences retrieved successfully',
        data: DEFAULT_USER_PREFERENCES,
      });
    }

    const result = await query(
      'SELECT preferences FROM user_settings WHERE user_id = $1',
      [req.user.id],
    );

    return res.json({
      success: true,
      message: 'User preferences retrieved successfully',
      data: { ...DEFAULT_USER_PREFERENCES, ...(result.rows[0]?.preferences || {}) },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.json({
        success: true,
        message: 'User preferences retrieved successfully',
        data: DEFAULT_USER_PREFERENCES,
      });
    }
    return serverError(res, error, 'getUserPreferences');
  }
};

/**
 * PUT /api/settings/user-preferences
 * Auth: required (any role) — updates preferences for req.user
 * Body: { theme?, language?, date_format?, time_format?, sidebar_collapsed?, dashboard_widgets? }
 */
const ALLOWED_PREFERENCE_KEYS = [
  'theme', 'language', 'date_format', 'time_format',
  'sidebar_collapsed', 'dashboard_widgets',
  'notification_frequency', 'accent_color', 'compact_layout', 'quiet_hours', 'accessibility',
];

const updateUserPreferences = async (req, res) => {
  try {
    if (req.user.auth_source === 'demo') {
      return res.status(403).json({
        success: false,
        message: 'Preferences cannot be saved for demo accounts',
      });
    }

    if (validationFailed(req, res) || ensureNonEmptyBody(req, res)) return;

    const payload = pickAllowed(req.body, ALLOWED_PREFERENCE_KEYS);

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        message: `No valid fields provided. Allowed: ${ALLOWED_PREFERENCE_KEYS.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO user_settings (user_id, preferences)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id)
         DO UPDATE SET
           preferences = user_settings.preferences || EXCLUDED.preferences,
           updated_at  = NOW()
         RETURNING preferences`,
      [req.user.id, JSON.stringify(payload)],
    );

    return res.json({
      success: true,
      message: 'User preferences updated successfully',
      data: { ...DEFAULT_USER_PREFERENCES, ...result.rows[0].preferences },
    });
  } catch (error) {
    return serverError(res, error, 'updateUserPreferences');
  }
};

// ── System Settings ───────────────────────────────────────────

/**
 * GET /api/settings/system
 * Auth: required | Roles: admin
 */
const getSystemSettings = async (req, res) => {
  try {
    const result = await query('SELECT settings FROM system_settings WHERE id = true');
    const stored = result.rows[0]?.settings || {};
    return res.json({
      success: true,
      message: 'System settings retrieved successfully',
      data: { ...DEFAULT_SYSTEM_SETTINGS, ...stored },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.json({
        success: true,
        message: 'System settings retrieved successfully',
        data: DEFAULT_SYSTEM_SETTINGS,
      });
    }
    return serverError(res, error, 'getSystemSettings');
  }
};

/**
 * PUT /api/settings/system
 * Auth: required | Roles: admin
 * Body: { maintenance_mode?, allow_employee_self_service?, max_login_attempts?,
 *         session_timeout_minutes?, password_expiry_days?, two_factor_auth?,
 *         audit_log_retention_days? }
 */
const ALLOWED_SYSTEM_KEYS = [
  'maintenance_mode', 'allow_employee_self_service', 'max_login_attempts',
  'session_timeout_minutes', 'password_expiry_days', 'password_min_length',
  'password_require_uppercase', 'password_require_lowercase', 'password_require_number',
  'password_require_special', 'two_factor_auth',
  'audit_log_retention_days', 'attendance_cutoff', 'work_hours',
  'overtime_threshold', 'leave_approval', 'payroll_schedule',
  'auto_approve_leave', 'data_retention', 'ip_whitelist_enabled', 'ip_whitelist',
  'backup_config', 'integrations',
];

const updateSystemSettings = async (req, res) => {
  try {
    if (validationFailed(req, res) || ensureNonEmptyBody(req, res)) return;

    const payload = pickAllowed(req.body, ALLOWED_SYSTEM_KEYS);

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        message: `No valid fields provided. Allowed: ${ALLOWED_SYSTEM_KEYS.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO system_settings (id, settings)
         VALUES (true, $1::jsonb)
         ON CONFLICT (id)
         DO UPDATE SET
           settings   = system_settings.settings || EXCLUDED.settings,
           updated_at = NOW()
         RETURNING settings`,
      [JSON.stringify(payload)],
    );

    return res.json({
      success: true,
      message: 'System settings updated successfully',
      data: { ...DEFAULT_SYSTEM_SETTINGS, ...result.rows[0].settings },
    });
  } catch (error) {
    return serverError(res, error, 'updateSystemSettings');
  }
};

// ── Notification Settings ─────────────────────────────────────

/**
 * GET /api/settings/notifications
 * Auth: required (any role) — returns notification settings for req.user
 */
const getNotificationSettings = async (req, res) => {
  try {
    if (req.user.auth_source === 'demo') {
      return res.json({
        success: true,
        message: 'Notification settings retrieved successfully',
        data: DEFAULT_NOTIFICATION_SETTINGS,
      });
    }

    const result = await query(
      'SELECT notification_settings FROM user_settings WHERE user_id = $1',
      [req.user.id],
    );

    return res.json({
      success: true,
      message: 'Notification settings retrieved successfully',
      data: { ...DEFAULT_NOTIFICATION_SETTINGS, ...(result.rows[0]?.notification_settings || {}) },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return res.json({
        success: true,
        message: 'Notification settings retrieved successfully',
        data: DEFAULT_NOTIFICATION_SETTINGS,
      });
    }
    return serverError(res, error, 'getNotificationSettings');
  }
};

/**
 * PUT /api/settings/notifications
 * Auth: required (any role) — updates notification settings for req.user
 * Body: { email?, push?, in_app?, leave_updates?, task_reminders?,
 *         payroll_alerts?, system_announcements?, performance_alerts? }
 */
const ALLOWED_NOTIFICATION_KEYS = [
  'email', 'push', 'in_app', 'leave_updates',
  'task_reminders', 'payroll_alerts', 'system_announcements', 'performance_alerts',
];

const updateNotificationSettings = async (req, res) => {
  try {
    if (req.user.auth_source === 'demo') {
      return res.status(403).json({
        success: false,
        message: 'Notification settings cannot be saved for demo accounts',
      });
    }

    if (validationFailed(req, res) || ensureNonEmptyBody(req, res)) return;

    const payload = pickAllowed(req.body, ALLOWED_NOTIFICATION_KEYS);

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        message: `No valid fields provided. Allowed: ${ALLOWED_NOTIFICATION_KEYS.join(', ')}`,
      });
    }

    const result = await query(
      `INSERT INTO user_settings (user_id, notification_settings)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id)
         DO UPDATE SET
           notification_settings = user_settings.notification_settings || EXCLUDED.notification_settings,
           updated_at            = NOW()
         RETURNING notification_settings`,
      [req.user.id, JSON.stringify(payload)],
    );

    return res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: { ...DEFAULT_NOTIFICATION_SETTINGS, ...result.rows[0].notification_settings },
    });
  } catch (error) {
    return serverError(res, error, 'updateNotificationSettings');
  }
};

// ── Additional Utility Endpoints ──────────────────────────────────────────

const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file provided' });
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    const result = await query(
      `INSERT INTO company_settings (id, settings)
       VALUES (true, jsonb_build_object('logo', $1::text))
       ON CONFLICT (id)
       DO UPDATE SET
         settings = company_settings.settings || jsonb_build_object('logo', $1::text),
         updated_at = NOW()
       RETURNING settings`,
      [logoUrl]
    );

    return res.json({
      success: true,
      message: 'Company logo uploaded successfully',
      logoUrl,
      data: { ...DEFAULT_COMPANY_SETTINGS, ...result.rows[0].settings }
    });
  } catch (error) {
    return serverError(res, error, 'uploadCompanyLogo');
  }
};

const resetUserPreferences = async (req, res) => {
  try {
    if (req.user.auth_source === 'demo') {
      return res.json({
        success: true,
        message: 'User preferences reset to default',
        data: DEFAULT_USER_PREFERENCES
      });
    }

    await query(
      `UPDATE user_settings SET preferences = $1::jsonb, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify(DEFAULT_USER_PREFERENCES), req.user.id]
    );

    return res.json({
      success: true,
      message: 'User preferences reset successfully',
      data: DEFAULT_USER_PREFERENCES
    });
  } catch (error) {
    return serverError(res, error, 'resetUserPreferences');
  }
};

const getAvailableThemes = async (req, res) => {
  return res.json({
    success: true,
    themes: [
      { id: 'light', name: 'Light Modern', primary: '#4f46e5' },
      { id: 'dark', name: 'Dark Cyber', primary: '#6366f1' },
      { id: 'system', name: 'System Default', primary: '#3b82f6' },
      { id: 'emerald', name: 'Emerald Forest', primary: '#10b981' },
      { id: 'sunset', name: 'Sunset Glow', primary: '#f59e0b' }
    ]
  });
};

const applyTheme = async (req, res) => {
  const { theme } = req.body;
  if (!theme) {
    return res.status(400).json({ success: false, message: 'Theme name is required' });
  }
  req.body = { theme };
  return updateUserPreferences(req, res);
};

const validateCompanySettings = async (req, res) => {
  const { company_name, email, phone } = req.body;
  const errors = [];
  if (!company_name) errors.push('Company name is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format');
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, valid: false, errors });
  }
  return res.json({ success: true, valid: true, message: 'Settings are valid' });
};

// ── Exports ───────────────────────────────────────────────────
module.exports = {
  getCompanySettings,
  updateCompanySettings,
  getUserPreferences,
  updateUserPreferences,
  getSystemSettings,
  updateSystemSettings,
  getNotificationSettings,
  updateNotificationSettings,
  uploadCompanyLogo,
  resetUserPreferences,
  getAvailableThemes,
  applyTheme,
  validateCompanySettings
};

