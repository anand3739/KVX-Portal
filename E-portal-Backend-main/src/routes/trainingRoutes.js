const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollTraining,
  updateProgress
} = require('../controllers/trainingController');

router.get('/', authenticate, getTrainings);
router.get('/:id', authenticate, getTrainingById);
router.post('/', authenticate, authorize('admin', 'hr', 'ceo'), createTraining);
router.put('/:id', authenticate, authorize('admin', 'hr', 'ceo'), updateTraining);
router.delete('/:id', authenticate, authorize('admin', 'hr', 'ceo'), deleteTraining);
router.post('/:id/enroll', authenticate, enrollTraining);
router.put('/:id/progress', authenticate, updateProgress);

module.exports = router;
