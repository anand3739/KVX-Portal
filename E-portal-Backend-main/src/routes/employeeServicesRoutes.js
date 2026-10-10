const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getActionCenterItems,
  completeActionItem,
  getPoliciesWithAcknowledgement,
  acknowledgePolicy
} = require('../controllers/employeeServicesController');

router.use(authenticate);

router.get('/action-center', getActionCenterItems);
router.post('/action-center/:id/complete', completeActionItem);

router.get('/policies', getPoliciesWithAcknowledgement);
router.post('/policies/:policyId/acknowledge', acknowledgePolicy);

module.exports = router;
