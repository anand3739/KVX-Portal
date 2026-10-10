const { query } = require('../config/database');

class Message {
  static async create(messageData) {
    const { rows } = await query(
      `INSERT INTO messages (
        sender_id, recipient_id, subject, content, parent_message_id, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        messageData.sender_id,
        messageData.recipient_id,
        messageData.subject,
        messageData.content,
        messageData.parent_message_id,
        messageData.attachments || []
      ]
    );
    return rows[0];
  }

  static async findInbox(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { rows } = await query(
      `SELECT m.*,
              CONCAT(s.first_name, ' ', s.last_name) as sender_name,
              s.email as sender_email,
              s.profile_picture_url as sender_avatar
       FROM messages m
       JOIN employees s ON m.sender_id = s.id
       WHERE m.recipient_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async findSent(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { rows } = await query(
      `SELECT m.*,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email
       FROM messages m
       JOIN employees r ON m.recipient_id = r.id
       WHERE m.sender_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await query(
      `SELECT m.*,
              CONCAT(s.first_name, ' ', s.last_name) as sender_name,
              s.email as sender_email,
              s.profile_picture_url as sender_avatar,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email
       FROM messages m
       JOIN employees s ON m.sender_id = s.id
       JOIN employees r ON m.recipient_id = r.id
       WHERE m.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async markAsRead(id, userId) {
    await query(
      `UPDATE messages 
       SET read = true, read_at = NOW() 
       WHERE id = $1 AND recipient_id = $2`,
      [id, userId]
    );
  }

  static async toggleStar(id, userId) {
    const { rows } = await query(
      `UPDATE messages 
       SET is_starred = NOT is_starred 
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
       RETURNING is_starred`,
      [id, userId]
    );
    return rows[0]?.is_starred;
  }

  static async archive(id, userId) {
    await query(
      `UPDATE messages 
       SET is_archived = true 
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)`,
      [id, userId]
    );
  }

  static async delete(id, userId) {
    await query(
      `DELETE FROM messages 
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)`,
      [id, userId]
    );
  }

  static async getUnreadCount(userId) {
    const { rows } = await query(
      'SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND read = false',
      [userId]
    );
    return parseInt(rows[0].count);
  }
}

module.exports = Message;