const { validationResult } = require('express-validator');
const { query } = require('../config/database');

const isMissingTableError = (error) => error && (
  error.code === '42P01' ||
  error.code === 'ECONNREFUSED' ||
  error.code === '57P01' ||
  error.code === '28P01' ||
  (error.message && error.message.toLowerCase().includes('connect')) ||
  (error.message && error.message.toLowerCase().includes('password authentication'))
);

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const serverError = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: 'Server error' });
};

const emitNotificationUpdate = (req, action, data = {}) => {
  const io = req.app.get('io');
  if (io) io.to(`user_${req.user.id}`).emit('notification:updated', { action, ...data });
};

const getUnreadCountValue = async (userId) => {
  const result = await query('SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = false', [userId]);
  return result.rows[0].count;
};

const getMyNotifications = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;
    if (req.user.auth_source === 'demo') {
      return res.json({ success: true, message: 'Notifications retrieved', data: [], unreadCount: 0 });
    }
    const limit = Number(req.query.limit || 50);
    const [notifications, unreadCount] = await Promise.all([
      query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [req.user.id, limit]),
      getUnreadCountValue(req.user.id)
    ]);
    return res.json({ success: true, message: 'Notifications retrieved', data: notifications.rows, unreadCount });
  } catch (error) {
    if (isMissingTableError(error)) return res.json({ success: true, message: 'Notifications retrieved', data: [], unreadCount: 0 });
    return serverError(res, error, 'Get notifications error');
  }
};

const getUnreadCount = async (req, res) => {
  try {
    if (req.user.auth_source === 'demo') return res.json({ success: true, message: 'Unread count retrieved', count: 0 });
    const count = await getUnreadCountValue(req.user.id);
    return res.json({ success: true, message: 'Unread count retrieved', count });
  } catch (error) {
    if (isMissingTableError(error)) return res.json({ success: true, message: 'Unread count retrieved', count: 0 });
    return serverError(res, error, 'Get unread notification count error');
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;
    const result = await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    const notification = result.rows[0];
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    const count = await getUnreadCountValue(req.user.id);
    emitNotificationUpdate(req, 'read', { notification, count });
    return res.json({ success: true, message: 'Notification marked as read', data: notification, count });
  } catch (error) { return serverError(res, error, 'Mark notification as read error'); }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await query('UPDATE notifications SET read = true WHERE user_id = $1 AND read = false RETURNING id', [req.user.id]);
    const updatedCount = result.rowCount;
    emitNotificationUpdate(req, 'read-all', { updatedCount, count: 0 });
    return res.json({ success: true, message: 'Notifications marked as read', updatedCount });
  } catch (error) { return serverError(res, error, 'Mark all notifications as read error'); }
};

const deleteNotification = async (req, res) => {
  try {
    if (validationFailed(req, res)) return;
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Notification not found' });
    const count = await getUnreadCountValue(req.user.id);
    emitNotificationUpdate(req, 'delete', { id: req.params.id, count });
    return res.json({ success: true, message: 'Notification deleted', id: req.params.id, count });
  } catch (error) { return serverError(res, error, 'Delete notification error'); }
};

module.exports = { getMyNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification };
