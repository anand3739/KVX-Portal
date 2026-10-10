const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getPolicies,
  askAssistant,
  getChangeNotices
} = require('../controllers/knowledgeController');

router.use(authenticate);

router.get('/policies', getPolicies);
router.post('/assistant/ask', askAssistant);
router.get('/changes', getChangeNotices);

module.exports = router;
