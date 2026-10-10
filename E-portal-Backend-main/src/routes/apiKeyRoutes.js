const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getApiKeys,
  createApiKey,
  regenerateApiKey,
  revokeApiKey,
  deleteApiKey,
  getApiKeyStats
} = require('../controllers/apiKeyController');

router.use(authenticate);

// Put specific path routes BEFORE generic param routes
router.get('/stats', requirePermission('api_keys.view'), getApiKeyStats);
router.get('/', requirePermission('api_keys.view'), getApiKeys);
router.post('/', requirePermission('api_keys.create'), createApiKey);
router.post('/:id/regenerate', requirePermission('api_keys.create'), regenerateApiKey);
router.put('/:id/revoke', requirePermission('api_keys.delete'), revokeApiKey);
router.delete('/:id', requirePermission('api_keys.delete'), deleteApiKey);

module.exports = router;
