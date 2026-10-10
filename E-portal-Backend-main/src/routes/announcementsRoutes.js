const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  togglePin,
  getStats,
} = require('../controllers/announcementsController');

// All routes require authentication
router.use(authenticate);

// Stats (admin/hr only)
router.get('/stats', authorize('admin', 'hr'), getStats);

// List & detail — employees see published only (enforced in controller)
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin/HR: create, update, delete
router.post('/', authorize('admin', 'hr'), createAnnouncement);
router.put('/:id', authorize('admin', 'hr'), updateAnnouncement);
router.delete('/:id', authorize('admin', 'hr'), deleteAnnouncement);

// Publish / pin actions
router.patch('/:id/publish', authorize('admin', 'hr'), publishAnnouncement);
router.patch('/:id/pin', authorize('admin', 'hr'), togglePin);

module.exports = router;
