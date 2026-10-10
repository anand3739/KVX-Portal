const { query } = require('../config/database');
const { createNotification } = require('../services/notificationService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

/**
 * Mailbox Controller - Isolated module for Gmail-style conversation/thread messaging.
 * Uses PostgreSQL `messages`, `employees`, and `notifications` tables.
 */

// ─── 1. GET /api/mailbox/recipients ──────────────────────────────────────────
const getRecipients = async (req, res) => {
  try {
    const search = req.query.q ? `%${req.query.q.trim()}%` : '%';
    const result = await query(
      `SELECT id, first_name, last_name, email, role, department_id, profile_picture_url
       FROM employees
       WHERE id != $1
         AND status IN ('active', 'probation')
         AND (first_name || ' ' || last_name ILIKE $2 OR email ILIKE $2)
       ORDER BY first_name ASC, last_name ASC
       LIMIT 100`,
      [req.user.id, search]
    );

    res.json({ recipients: result.rows });
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ message: 'Server error while fetching recipients' });
  }
};

// ─── 2. GET /api/mailbox/inbox (Conversation / Thread Grouping) ─────────────
const getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 20, folder = 'inbox', q } = req.query;
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const safePage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20;
    const offset = (safePage - 1) * safeLimit;

    const searchTerm = q && q.trim() ? `%${q.trim()}%` : null;

    let folderFilter = 'cs.in_inbox = true';
    if (folder === 'sent') {
      folderFilter = 'cs.in_sent = true';
    } else if (folder === 'starred') {
      folderFilter = 'cs.in_starred = true';
    } else if (folder === 'archived') {
      folderFilter = 'cs.in_archived = true';
    } else if (folder === 'trash') {
      folderFilter = 'cs.in_trash = true';
    }

    const searchFilter = searchTerm ? 'AND cs.has_search_match = true' : '';

    const sql = `
      WITH RECURSIVE thread_map AS (
        SELECT id, id AS root_id, subject AS root_subject
        FROM messages
        WHERE parent_message_id IS NULL

        UNION ALL

        SELECT m.id, t.root_id, t.root_subject
        FROM messages m
        JOIN thread_map t ON m.parent_message_id = t.id
      ),
      user_messages AS (
        SELECT 
          m.*,
          tm.root_id,
          REGEXP_REPLACE(tm.root_subject, '^(Re:\\s*)+', '', 'i') AS clean_subject
        FROM messages m
        JOIN thread_map tm ON m.id = tm.id
        WHERE (m.sender_id = $1 OR m.recipient_id = $1)
      ),
      conversation_stats AS (
        SELECT 
          root_id,
          COUNT(*) AS total_messages,
          MAX(created_at) AS latest_created_at,
          COUNT(CASE WHEN recipient_id = $1 AND read = false AND is_deleted = false AND is_archived = false THEN 1 END) AS unread_count,
          BOOL_OR(recipient_id = $1 AND is_deleted = false AND is_archived = false) AS in_inbox,
          BOOL_OR(sender_id = $1 AND is_deleted = false AND is_archived = false) AS in_sent,
          BOOL_OR(is_starred = true AND is_deleted = false) AS in_starred,
          BOOL_OR(is_archived = true AND is_deleted = false) AS in_archived,
          BOOL_OR(is_deleted = true) AS in_trash,
          ${searchTerm ? `BOOL_OR(subject ILIKE $4 OR content ILIKE $4)` : 'true'} AS has_search_match
        FROM user_messages
        GROUP BY root_id
      )
      SELECT DISTINCT ON (cs.root_id)
        cs.root_id AS thread_id,
        cs.root_id AS id,
        um.id AS latest_message_id,
        cs.total_messages::int AS message_count,
        cs.unread_count::int AS unread_count,
        (cs.unread_count = 0) AS read,
        cs.in_starred AS is_starred,
        cs.in_archived AS is_archived,
        cs.in_trash AS is_deleted,
        COALESCE(NULLIF(um.clean_subject, ''), '(No Subject)') AS subject,
        um.content,
        um.created_at,
        um.sender_id,
        CONCAT(s.first_name, ' ', s.last_name) AS sender_name,
        s.email AS sender_email,
        s.profile_picture_url AS sender_avatar,
        um.recipient_id,
        CONCAT(r.first_name, ' ', r.last_name) AS recipient_name,
        r.email AS recipient_email,
        r.profile_picture_url AS recipient_avatar,
        um.attachments
      FROM conversation_stats cs
      JOIN user_messages um ON um.root_id = cs.root_id AND um.created_at = cs.latest_created_at
      JOIN employees s ON um.sender_id = s.id
      JOIN employees r ON um.recipient_id = r.id
      WHERE ${folderFilter} ${searchFilter}
      ORDER BY cs.root_id, um.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const queryArgs = searchTerm ? [req.user.id, safeLimit, offset, searchTerm] : [req.user.id, safeLimit, offset];
    const result = await query(sql, queryArgs);

    const countSql = `
      WITH RECURSIVE thread_map AS (
        SELECT id, id AS root_id, subject AS root_subject
        FROM messages
        WHERE parent_message_id IS NULL
        UNION ALL
        SELECT m.id, t.root_id, t.root_subject
        FROM messages m
        JOIN thread_map t ON m.parent_message_id = t.id
      ),
      user_messages AS (
        SELECT m.*, tm.root_id
        FROM messages m
        JOIN thread_map tm ON m.id = tm.id
        WHERE (m.sender_id = $1 OR m.recipient_id = $1)
      ),
      conversation_stats AS (
        SELECT 
          root_id,
          MAX(created_at) AS latest_created_at,
          BOOL_OR(recipient_id = $1 AND is_deleted = false AND is_archived = false) AS in_inbox,
          BOOL_OR(sender_id = $1 AND is_deleted = false AND is_archived = false) AS in_sent,
          BOOL_OR(is_starred = true AND is_deleted = false) AS in_starred,
          BOOL_OR(is_archived = true AND is_deleted = false) AS in_archived,
          BOOL_OR(is_deleted = true) AS in_trash,
          ${searchTerm ? `BOOL_OR(subject ILIKE $2 OR content ILIKE $2)` : 'true'} AS has_search_match
        FROM user_messages
        GROUP BY root_id
      )
      SELECT COUNT(*) FROM conversation_stats cs
      WHERE ${folderFilter} ${searchFilter};
    `;

    const countArgs = searchTerm ? [req.user.id, searchTerm] : [req.user.id];
    const countResult = await query(countSql, countArgs);
    const total = parseInt(countResult.rows[0]?.count || 0, 10);

    res.json({
      messages: result.rows,
      conversations: result.rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 1
      }
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ message: 'Server error while fetching conversation inbox' });
  }
};

// ─── 3. GET /api/mailbox/sent ────────────────────────────────────────────────
const getSent = async (req, res) => {
  req.query.folder = 'sent';
  return getInbox(req, res);
};

// ─── 4. GET /api/mailbox/starred ─────────────────────────────────────────────
const getStarred = async (req, res) => {
  req.query.folder = 'starred';
  return getInbox(req, res);
};

// ─── 5. GET /api/mailbox/archived ────────────────────────────────────────────
const getArchived = async (req, res) => {
  req.query.folder = 'archived';
  return getInbox(req, res);
};

// ─── 6. GET /api/mailbox/trash ───────────────────────────────────────────────
const getTrash = async (req, res) => {
  req.query.folder = 'trash';
  return getInbox(req, res);
};

// ─── 7. GET /api/mailbox/unread-count ────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const result = await query(
      `SELECT COUNT(*) FROM messages 
       WHERE recipient_id = $1 AND read = false AND is_archived = false AND is_deleted = false`,
      [req.user.id]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count, 10) || 0 });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
};

// ─── 8. GET /api/mailbox/:id (Full Conversation Thread) ──────────────────────
const getMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find root_id for the given message id
    const rootRes = await query(
      `WITH RECURSIVE thread_find AS (
        SELECT id, parent_message_id
        FROM messages
        WHERE id = $1
        UNION ALL
        SELECT m.id, m.parent_message_id
        FROM messages m
        JOIN thread_find tf ON m.id = tf.parent_message_id
      )
      SELECT id FROM thread_find WHERE parent_message_id IS NULL LIMIT 1`,
      [id]
    );

    const rootId = rootRes.rows[0]?.id || id;

    // Step 2: Fetch all messages belonging to this conversation root
    const threadRes = await query(
      `WITH RECURSIVE thread_tree AS (
        SELECT id
        FROM messages
        WHERE id = $1
        UNION ALL
        SELECT m.id
        FROM messages m
        JOIN thread_tree tt ON m.parent_message_id = tt.id
      )
      SELECT m.*,
             CONCAT(s.first_name, ' ', s.last_name) AS sender_name,
             s.email AS sender_email,
             s.profile_picture_url AS sender_avatar,
             CONCAT(r.first_name, ' ', r.last_name) AS recipient_name,
             r.email AS recipient_email,
             r.profile_picture_url AS recipient_avatar
      FROM thread_tree tt
      JOIN messages m ON tt.id = m.id
      JOIN employees s ON m.sender_id = s.id
      JOIN employees r ON m.recipient_id = r.id
      WHERE (m.sender_id = $2 OR m.recipient_id = $2)
      ORDER BY m.created_at ASC`,
      [rootId, req.user.id]
    );

    if (threadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }

    // Step 3: Mark unread messages in thread as read for req.user.id
    const unreadIds = threadRes.rows
      .filter(m => !m.read && m.recipient_id === req.user.id)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await query(
        `UPDATE messages SET read = true, read_at = NOW() WHERE id = ANY($1::uuid[])`,
        [unreadIds]
      );
    }

    const messages = threadRes.rows.map(m => ({
      ...m,
      read: unreadIds.includes(m.id) ? true : m.read
    }));

    const latestMessage = messages[messages.length - 1];

    res.json({
      data: latestMessage,
      message: latestMessage,
      messages: messages,
      thread: messages
    });
  } catch (error) {
    console.error('Get message detail error:', error);
    res.status(500).json({ message: 'Server error while fetching conversation details' });
  }
};

// ─── 9. POST /api/mailbox (Send New Message) ──────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient_id, subject, content, parent_message_id, attachments } = req.body;
    const recipientId = recipient_id;
    const normalizedSubject = subject?.toString().trim();
    const normalizedContent = content?.toString().trim();

    if (!recipientId) {
      return res.status(400).json({ message: 'recipient_id is required' });
    }

    if (!normalizedSubject || !normalizedContent) {
      return res.status(400).json({ message: 'subject and content are required' });
    }

    if (Array.isArray(attachments) && attachments.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 attachments allowed per message' });
    }

    const formattedAtts = Array.isArray(attachments)
      ? attachments.slice(0, 10).map(att => typeof att === 'string' ? att : JSON.stringify(att))
      : [];

    const recipient = await query(
      'SELECT id, email, first_name, last_name FROM employees WHERE id::text = $1',
      [recipientId]
    );

    if (!recipient.rows[0]) {
      return res.status(404).json({ message: 'Recipient employee not found' });
    }

    const result = await query(
      `INSERT INTO messages (
        sender_id, recipient_id, subject, content, parent_message_id, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [req.user.id, recipientId, normalizedSubject, normalizedContent, parent_message_id || null, formattedAtts]
    );

    try {
      await createNotification({
        user_id: recipientId,
        type: 'info',
        title: 'New Message',
        message: `You have a new message from ${req.user.first_name || ''} ${req.user.last_name || ''}`.trim(),
        link: '/mailbox'
      });
    } catch (notifErr) {
      console.warn('Non-fatal notification error on sendMessage:', notifErr.message);
    }

    const messageWithDetails = await query(
      `SELECT m.*, 
              CONCAT(s.first_name, ' ', s.last_name) as sender_name,
              s.email as sender_email,
              s.profile_picture_url as sender_avatar,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email,
              r.profile_picture_url as recipient_avatar
       FROM messages m
       JOIN employees s ON m.sender_id = s.id
       JOIN employees r ON m.recipient_id = r.id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    // Delete draft after successful message creation if draft_id was provided
    if (req.body.draft_id) {
      try {
        await query(`DELETE FROM mailbox_drafts WHERE id = $1 AND user_id = $2`, [req.body.draft_id, req.user.id]);
      } catch (draftDelErr) {
        console.warn('Non-fatal draft deletion error after sending:', draftDelErr.message);
      }
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithDetails.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// ─── 10. POST /api/mailbox/:id/reply (Reply to Thread) ───────────────────────
const replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    const normalizedContent = content?.toString().trim();

    if (!normalizedContent) {
      return res.status(400).json({ message: 'content is required' });
    }

    if (Array.isArray(attachments) && attachments.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 attachments allowed per reply' });
    }

    const formattedAtts = Array.isArray(attachments)
      ? attachments.slice(0, 10).map(att => typeof att === 'string' ? att : JSON.stringify(att))
      : [];

    const parentResult = await query(
      'SELECT sender_id, recipient_id, subject FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)',
      [id, req.user.id]
    );

    if (!parentResult.rows[0]) {
      return res.status(404).json({ message: 'Original message not found or access denied' });
    }

    const parent = parentResult.rows[0];
    const recipientId = parent.sender_id === req.user.id ? parent.recipient_id : parent.sender_id;
    const subject = parent.subject?.startsWith('Re:') ? parent.subject : `Re: ${parent.subject || ''}`;

    const result = await query(
      `INSERT INTO messages (
        sender_id, recipient_id, subject, content, parent_message_id, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [req.user.id, recipientId, subject, normalizedContent, id, formattedAtts]
    );

    try {
      await createNotification({
        user_id: recipientId,
        type: 'info',
        title: 'New Message Reply',
        message: `You have a reply from ${req.user.first_name || ''} ${req.user.last_name || ''}`.trim(),
        link: '/mailbox'
      });
    } catch (notifErr) {
      console.warn('Non-fatal notification error on replyMessage:', notifErr.message);
    }

    const replyWithDetails = await query(
      `SELECT m.*, 
              CONCAT(s.first_name, ' ', s.last_name) as sender_name,
              s.email as sender_email,
              s.profile_picture_url as sender_avatar,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email,
              r.profile_picture_url as recipient_avatar
       FROM messages m
       JOIN employees s ON m.sender_id = s.id
       JOIN employees r ON m.recipient_id = r.id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ message: 'Reply sent successfully', data: replyWithDetails.rows[0] });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ message: 'Server error while replying' });
  }
};

// ─── 11. PUT /api/mailbox/:id/star (Toggle Starred Status) ───────────────────
const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE messages 
       SET is_starred = NOT is_starred
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
       RETURNING is_starred`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    res.json({
      message: `Message ${result.rows[0].is_starred ? 'starred' : 'unstarred'}`,
      starred: result.rows[0].is_starred
    });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ message: 'Server error while toggling star' });
  }
};

// ─── 12. PUT /api/mailbox/:id/archive (Archive Message) ──────────────────────
const archiveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE messages 
       SET is_archived = true
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
       RETURNING id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    res.json({ message: 'Message archived successfully' });
  } catch (error) {
    console.error('Archive message error:', error);
    res.status(500).json({ message: 'Server error while archiving message' });
  }
};

// ─── 13. DELETE /api/mailbox/:id (Soft-Delete Message) ──────────────────────
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE messages
       SET is_deleted = true
       WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
       RETURNING id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};

// ─── 14. PUT /api/mailbox/bulk (Bulk Operations on Conversations) ───────────
const bulkAction = async (req, res) => {
  try {
    const { messageIds, action } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'No conversations selected for bulk action' });
    }

    if (!['archive', 'delete', 'star', 'unstar', 'read', 'unread'].includes(action)) {
      return res.status(400).json({ message: 'Invalid bulk action' });
    }

    let result;
    if (action === 'read' || action === 'unread') {
      const isRead = action === 'read';
      result = await query(
        `WITH RECURSIVE thread_tree AS (
          SELECT id
          FROM messages
          WHERE id = ANY($1::uuid[])
          UNION ALL
          SELECT m.id
          FROM messages m
          JOIN thread_tree tt ON m.parent_message_id = tt.id
        )
        UPDATE messages
        SET read = $2,
            read_at = CASE WHEN $2 = true THEN NOW() ELSE NULL END
        WHERE id IN (SELECT id FROM thread_tree)
          AND recipient_id = $3
        RETURNING id`,
        [messageIds, isRead, req.user.id]
      );
    } else {
      let setClause = '';
      if (action === 'archive') setClause = 'is_archived = true';
      else if (action === 'delete') setClause = 'is_deleted = true';
      else if (action === 'star') setClause = 'is_starred = true';
      else if (action === 'unstar') setClause = 'is_starred = false';

      result = await query(
        `WITH RECURSIVE thread_tree AS (
          SELECT id
          FROM messages
          WHERE id = ANY($1::uuid[])
          UNION ALL
          SELECT m.id
          FROM messages m
          JOIN thread_tree tt ON m.parent_message_id = tt.id
        )
        UPDATE messages
        SET ${setClause}
        WHERE id IN (SELECT id FROM thread_tree)
          AND (sender_id = $2 OR recipient_id = $2)
        RETURNING id`,
        [messageIds, req.user.id]
      );
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      action,
      updatedCount: result.rowCount
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ message: 'Server error while performing bulk action' });
  }
};

// ─── 15. PUT /api/mailbox/:id/read (Mark Conversation as Read / Unread) ──────
const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const isRead = read === true || read === 'true';

    const result = await query(
      `WITH RECURSIVE parent_chain AS (
        SELECT id, parent_message_id
        FROM messages
        WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)

        UNION ALL

        SELECT m.id, m.parent_message_id
        FROM messages m
        JOIN parent_chain pc ON m.id = pc.parent_message_id
      ),
      thread_root AS (
        SELECT id AS root_id FROM parent_chain WHERE parent_message_id IS NULL
      ),
      thread_tree AS (
        SELECT id FROM messages WHERE id IN (SELECT root_id FROM thread_root)
        UNION ALL
        SELECT m.id FROM messages m JOIN thread_tree tt ON m.parent_message_id = tt.id
      )
      UPDATE messages
      SET read = $3,
          read_at = CASE WHEN $3 = true THEN NOW() ELSE NULL END
      WHERE id IN (SELECT id FROM thread_tree)
        AND recipient_id = $2
      RETURNING id`,
      [id, req.user.id, isRead]
    );

    res.json({
      success: true,
      read: isRead,
      updatedCount: result.rowCount
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error while updating read status' });
  }
};

// Helper to parse attachments text[] into clean JSON objects
const parseDraftAttachments = (attArray) => {
  if (!Array.isArray(attArray)) return [];
  return attArray.map(item => {
    if (typeof item === 'object' && item !== null) return item;
    try {
      return JSON.parse(item);
    } catch (_) {
      return { name: item, url: item };
    }
  });
};

// ─── 16. GET /api/mailbox/drafts (Get User Drafts) ─────────────────────────
const getDrafts = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.*,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email,
              r.profile_picture_url as recipient_avatar
       FROM mailbox_drafts d
       LEFT JOIN employees r ON d.recipient_id = r.id
       WHERE d.user_id = $1
       ORDER BY d.updated_at DESC`,
      [req.user.id]
    );

    const formattedDrafts = result.rows.map(d => ({
      ...d,
      attachments: parseDraftAttachments(d.attachments)
    }));

    res.json({ drafts: formattedDrafts });
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ message: 'Server error while fetching drafts' });
  }
};

// ─── 17. GET /api/mailbox/drafts/:id (Get Single Draft) ─────────────────────
const getDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT d.*,
              CONCAT(r.first_name, ' ', r.last_name) as recipient_name,
              r.email as recipient_email,
              r.profile_picture_url as recipient_avatar
       FROM mailbox_drafts d
       LEFT JOIN employees r ON d.recipient_id = r.id
       WHERE d.id = $1 AND d.user_id = $2`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    const draft = {
      ...result.rows[0],
      attachments: parseDraftAttachments(result.rows[0].attachments)
    };

    res.json({ draft });
  } catch (error) {
    console.error('Get single draft error:', error);
    res.status(500).json({ message: 'Server error while fetching draft' });
  }
};

// ─── 18. POST /api/mailbox/drafts (Create Draft) ───────────────────────────
const createDraft = async (req, res) => {
  try {
    const { recipient_id, subject, content, attachments } = req.body;
    const recipientId = recipient_id || null;
    const draftSubject = subject || '';
    const draftContent = content || '';

    if (Array.isArray(attachments) && attachments.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 attachments allowed per draft' });
    }

    const formattedAtts = Array.isArray(attachments)
      ? attachments.slice(0, 10).map(att => typeof att === 'string' ? att : JSON.stringify(att))
      : [];

    const result = await query(
      `INSERT INTO mailbox_drafts (user_id, recipient_id, subject, content, attachments)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, recipientId, draftSubject, draftContent, formattedAtts]
    );

    const draft = {
      ...result.rows[0],
      attachments: parseDraftAttachments(result.rows[0].attachments)
    };

    res.status(201).json({
      success: true,
      draft
    });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Server error while creating draft' });
  }
};

// ─── 19. PUT /api/mailbox/drafts/:id (Update Draft) ─────────────────────────
const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipient_id, subject, content, attachments } = req.body;
    const recipientId = recipient_id || null;
    const draftSubject = subject || '';
    const draftContent = content || '';

    if (Array.isArray(attachments) && attachments.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 attachments allowed per draft' });
    }

    const formattedAtts = Array.isArray(attachments)
      ? attachments.slice(0, 10).map(att => typeof att === 'string' ? att : JSON.stringify(att))
      : [];

    const result = await query(
      `UPDATE mailbox_drafts
       SET recipient_id = $1,
           subject = $2,
           content = $3,
           attachments = $4,
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [recipientId, draftSubject, draftContent, formattedAtts, id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Draft not found or access denied' });
    }

    const draft = {
      ...result.rows[0],
      attachments: parseDraftAttachments(result.rows[0].attachments)
    };

    res.json({
      success: true,
      draft
    });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Server error while updating draft' });
  }
};

// ─── 20. DELETE /api/mailbox/drafts/:id (Delete Draft) ─────────────────────
const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM mailbox_drafts
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Draft not found or access denied' });
    }

    res.json({ success: true, message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ message: 'Server error while deleting draft' });
  }
};

// ─── 21. POST /api/mailbox/attachments/upload (Upload Mailbox Attachment) ─
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      id: Date.now() + Math.random(),
      name: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      type: req.file.mimetype
    };

    res.json({
      success: true,
      attachment
    });
  } catch (error) {
    console.error('Mailbox upload attachment error:', error);
    res.status(500).json({ message: 'Server error while uploading attachment' });
  }
};

// ─── 22. DELETE /api/mailbox/attachments (Delete Un-sent Attachment) ────────
const deleteAttachment = async (req, res) => {
  try {
    const rawTarget = req.body.filename || req.body.url || req.query.filename || req.query.url || '';
    if (!rawTarget) {
      return res.status(400).json({ message: 'filename or url parameter is required' });
    }

    if (rawTarget.includes('..') || rawTarget.includes('\\')) {
      return res.status(400).json({ message: 'Invalid file name or path traversal attempt detected' });
    }

    const baseName = path.basename(rawTarget);
    if (!baseName || baseName.includes('..')) {
      return res.status(400).json({ message: 'Invalid attachment filename' });
    }

    // Security check: Verify file is not committed to a sent/received message
    const committedCheck = await query(
      `SELECT 1 FROM messages WHERE EXISTS (SELECT 1 FROM unnest(attachments) a WHERE a LIKE '%' || $1 || '%') LIMIT 1`,
      [baseName]
    );

    if (committedCheck.rows.length > 0) {
      return res.status(403).json({ message: 'Cannot delete attachment committed to a sent message' });
    }

    const filePath = path.join(__dirname, '../../uploads', baseName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Server error while deleting attachment' });
  }
};

module.exports = {
  getRecipients,
  getInbox,
  getSent,
  getStarred,
  getArchived,
  getTrash,
  getUnreadCount,
  getMessage,
  sendMessage,
  replyMessage,
  toggleStar,
  archiveMessage,
  deleteMessage,
  bulkAction,
  markRead,
  getDrafts,
  getDraft,
  createDraft,
  updateDraft,
  deleteDraft,
  uploadAttachment,
  deleteAttachment
};
