const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
} = require('../controllers/auditLogController');

router.use(authenticate);
router.use(requirePermission('logs.view'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);
router.get('/:id', getAuditLogById);

module.exports = router;
