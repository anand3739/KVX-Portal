const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAwards,
  submitWellbeingCheckin,
  getWellbeingHistory,
  getSurveys,
  getInnovationIdeas,
  submitInnovationIdea,
  upvoteIdea
} = require('../controllers/rewardsController');

router.use(authenticate);

// Awards
router.get('/awards', getAwards);

// Wellbeing
router.post('/wellbeing/checkin', submitWellbeingCheckin);
router.get('/wellbeing/history', getWellbeingHistory);

// Surveys
router.get('/surveys', getSurveys);

// Ideas & Innovation
router.get('/ideas', getInnovationIdeas);
router.post('/ideas', submitInnovationIdea);
router.post('/ideas/:id/upvote', upvoteIdea);

module.exports = router;
