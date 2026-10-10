const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  getPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview
} = require('../controllers/performanceReviewController');

router.get('/', authenticate, getPerformanceReviews);
router.get('/:id', authenticate, getPerformanceReviewById);
router.post('/', authenticate, authorize('admin', 'hr', 'ceo', 'manager'), createPerformanceReview);
router.put('/:id', authenticate, authorize('admin', 'hr', 'ceo', 'manager'), updatePerformanceReview);
router.delete('/:id', authenticate, authorize('admin', 'hr', 'ceo'), deletePerformanceReview);

module.exports = router;
