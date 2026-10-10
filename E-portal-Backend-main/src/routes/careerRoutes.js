const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getEmployeeScorecard,
  getSkillsProfile,
  addOrUpdateSkill,
  getCareerGrowthPath,
  getTalentMarketplace
} = require('../controllers/careerController');

router.use(authenticate);

router.get('/scorecard', getEmployeeScorecard);
router.get('/skills', getSkillsProfile);
router.post('/skills', addOrUpdateSkill);
router.get('/growth-path', getCareerGrowthPath);
router.get('/marketplace', getTalentMarketplace);

module.exports = router;
