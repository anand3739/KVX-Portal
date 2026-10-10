const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  login, 
  createEmployee, 
  logout, 
  changePassword, 
  forgotPassword, 
  resetPassword,
  getCurrentUser,
  updateProfile,
  heartbeat
} = require('../controllers/authController');

const { 
  getTwoFactorStatus, 
  beginTwoFactorSetup, 
  confirmTwoFactorSetup, 
  disableTwoFactor, 
  verifyLoginTwoFactor 
} = require('../controllers/twoFactorController');
const { listAllSessions, revokeSessionAdmin, revokeOtherSessions } = require('../services/authSessionService');
const { authenticate, authorize } = require('../middleware/auth');

// ===== TEST ROUTES =====
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// ===== DATABASE TEST ROUTE =====
router.get('/db-test', async (req, res) => {
  try {
    const { query } = require('../config/database');
    const result = await query('SELECT NOW() as time');
    res.json({ 
      success: true, 
      message: 'Database connected',
      time: result.rows[0].time 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ===== VALIDATION RULES =====
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const createEmployeeValidation = [
  body('email').isEmail().normalizeEmail(),
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('role').optional().isIn(['admin', 'hr', 'ceo', 'employee']),
  body('department_id').optional({ nullable: true }).custom(value => true),
  body('position').optional(),
  body('join_date').optional().isDate(),
  body('salary').optional().isNumeric(),
  body('phone').optional().isString(),
  body('employment_type').optional().isString()
];

const changePasswordValidation = [
  body('current_password').notEmpty(),
  body('new_password').notEmpty()
];

// ===== PRODUCTION ROUTES =====
router.post('/login', loginValidation, login);
router.post('/create-employee', authenticate, authorize('admin'), createEmployeeValidation, createEmployee);
router.post('/logout', authenticate, logout);
router.post('/heartbeat', authenticate, heartbeat);

router.post('/change-password', authenticate, changePasswordValidation, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);

// ===== TWO-FACTOR AUTHENTICATION ROUTES =====
router.get('/two-factor', authenticate, getTwoFactorStatus);
router.post('/two-factor/setup', authenticate, beginTwoFactorSetup);
router.post('/two-factor/confirm', authenticate, confirmTwoFactorSetup);
router.post('/two-factor/disable', authenticate, disableTwoFactor);
router.post('/two-factor/verify-login', verifyLoginTwoFactor);

// ===== ACTIVE SESSIONS ROUTES =====
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const sessions = await listAllSessions(req.user.sid, isAdmin, req.user.id);
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ message: 'Unable to load active sessions' });
  }
});

router.delete('/sessions/:id', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const ok = await revokeSessionAdmin(req.params.id, req.user.id, isAdmin);
    res.json({ success: ok, message: ok ? 'Session revoked successfully' : 'Session not found or already revoked' });
  } catch (err) {
    console.error('Revoke session error:', err);
    res.status(500).json({ message: 'Unable to revoke session' });
  }
});

router.delete('/sessions', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const count = await revokeOtherSessions(req.user.sid, req.user.id, isAdmin);
    res.json({ success: true, message: `${count} other session(s) terminated successfully`, count });
  } catch (err) {
    console.error('Terminate other sessions error:', err);
    res.status(500).json({ message: 'Unable to terminate other sessions' });
  }
});

module.exports = router;