const { query } = require('../config/database');
let io;

const setIo = (socketServer) => {
  io = socketServer;
};

const createNotification = async ({ user_id, type, title, message, link = null }) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, type, title, message, link]
    );

    // Emit real-time notification
    io?.to(`user_${user_id}`).emit('notification', result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const values = [];
    const queryStrings = [];

    notifications.forEach((notif, index) => {
      const start = index * 5 + 1;
      queryStrings.push(`($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4})`);
      values.push(
        notif.user_id,
        notif.type || 'info',
        notif.title,
        notif.message,
        notif.link || null
      );
    });

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ${queryStrings.join(', ')}
       RETURNING *`,
      values
    );

    // Emit to each user
    result.rows.forEach(notif => {
      io?.to(`user_${notif.user_id}`).emit('notification', notif);
    });

    return result.rows;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  const result = await query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
    [notificationId, userId]
  );
  return result.rows[0];
};

const markAllAsRead = async (userId) => {
  await query(
    'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
    [userId]
  );
};

const getNotifications = async (userId, limit = 50) => {
  const result = await query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

const getUnreadCount = async (userId) => {
  const result = await query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

const deleteNotification = async (notificationId, userId) => {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
    [notificationId, userId]
  );
  return result.rows[0];
};

module.exports = {
  createNotification,
  setIo,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  getNotifications,
  getUnreadCount,
  deleteNotification
};