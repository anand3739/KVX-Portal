const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getReferrals,
  submitReferral,
  getEmployeeRelationsCases,
  createEmployeeRelationsCase
} = require('../controllers/hrWorkforceController');

router.use(authenticate);

// Referrals
router.get('/referrals', getReferrals);
router.post('/referrals', submitReferral);

// Employee Relations Cases (Strictly HR/Admin)
router.get('/cases', getEmployeeRelationsCases);
router.post('/cases', createEmployeeRelationsCase);

module.exports = router;
