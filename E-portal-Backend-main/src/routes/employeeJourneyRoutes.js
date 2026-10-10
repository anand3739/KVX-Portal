const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getOffboardingStatus,
  initiateResignation,
  getMyCompensation,
  getDigitalEmployeePassport
} = require('../controllers/employeeJourneyController');

router.use(authenticate);

// Offboarding
router.get('/offboarding', getOffboardingStatus);
router.post('/offboarding/resignation', initiateResignation);

// Secure Personal Compensation
router.get('/compensation/my', getMyCompensation);

// Digital Employee Passport
router.get('/passport/:id', getDigitalEmployeePassport);

module.exports = router;
