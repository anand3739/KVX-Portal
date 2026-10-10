const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getMyAssets,
  getAllAssets,
  assignAsset,
  getFacilityRequests,
  createFacilityRequest,
  getVolunteeringEvents,
  registerForVolunteering
} = require('../controllers/assetsFacilitiesController');

router.use(authenticate);

// Assets
router.get('/assets/my', getMyAssets);
router.get('/assets', getAllAssets);
router.post('/assets/assign', assignAsset);

// Facilities
router.get('/facilities/tickets', getFacilityRequests);
router.post('/facilities/tickets', createFacilityRequest);

// CSR & Volunteering
router.get('/csr/events', getVolunteeringEvents);
router.post('/csr/events/:eventId/signup', registerForVolunteering);

module.exports = router;
