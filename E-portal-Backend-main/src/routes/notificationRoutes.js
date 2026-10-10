const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} = require('../services/notificationService');

// GET /api/notifications - fetch user's notifications with optional limit
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await getNotifications(req.user.id, limit);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/notifications - create a new notification (admin/HR only can be enforced via additional middleware if needed)
router.post('/', authenticate, async (req, res) => {
  try {
    const { user_id, type, title, message, link } = req.body;
    const notif = await createNotification({ user_id, type, title, message, link });
    res.status(201).json(notif);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH & PUT /api/notifications/:id/read - mark a specific notification as read
const handleMarkAsRead = async (req, res) => {
  try {
    const updated = await markAsRead(req.params.id, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
router.patch('/:id/read', authenticate, handleMarkAsRead);
router.put('/:id/read', authenticate, handleMarkAsRead);

// PATCH & PUT /api/notifications/read-all & /mark-all-read - mark all notifications as read for the user
const handleMarkAllAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
router.patch('/read-all', authenticate, handleMarkAllAsRead);
router.put('/read-all', authenticate, handleMarkAllAsRead);
router.patch('/mark-all-read', authenticate, handleMarkAllAsRead);
router.put('/mark-all-read', authenticate, handleMarkAllAsRead);

// GET /api/notifications/unread-count - get count of unread notifications for the user
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/notifications/:id - delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await deleteNotification(req.params.id, req.user.id);
    res.json({ message: 'Notification deleted', notification: deleted });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;