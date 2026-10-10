const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTwoFactorStatus,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  getActiveSessions,
  terminateSession,
  getSecurityAwareness
} = require('../controllers/securityController');

router.use(authenticate);

// 2FA Endpoints
router.get('/2fa/status', getTwoFactorStatus);
router.post('/2fa/setup', setupTwoFactor);
router.post('/2fa/verify', verifyAndEnableTwoFactor);
router.post('/2fa/disable', disableTwoFactor);

// Sessions Endpoints
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', terminateSession);

// Security Awareness & Quizzes
router.get('/awareness', getSecurityAwareness);

module.exports = router;
