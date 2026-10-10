const { query, transaction } = require('../config/database');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper to resolve string / demo user IDs into valid PostgreSQL UUIDs
const resolveUserId = async (userOrId) => {
  if (!userOrId) return null;
  const rawId = typeof userOrId === 'object' ? userOrId.id : userOrId;
  const email = typeof userOrId === 'object' ? userOrId.email : null;

  if (rawId && UUID_REGEX.test(rawId)) {
    return rawId;
  }

  // Lookup in DB by email if provided
  if (email) {
    try {
      const res = await query(`SELECT id FROM employees WHERE email = $1 LIMIT 1`, [email]);
      if (res.rows[0]?.id) return res.rows[0].id;
    } catch (e) {}
  }

  // Lookup demo user mappings
  const demoEmailMap = {
    'demo-admin': 'admin@kravix.com',
    'demo-hr': 'hr@kravix.com',
    'demo-ceo': 'ceo@kravix.com',
    'demo-employee': 'employee@kravix.com'
  };

  const targetEmail = demoEmailMap[rawId];
  if (targetEmail) {
    try {
      const res = await query(`SELECT id FROM employees WHERE email = $1 LIMIT 1`, [targetEmail]);
      if (res.rows[0]?.id) return res.rows[0].id;
    } catch (e) {}
  }

  return rawId;
};

// Helper to format avatar & name for employee
const formatEmployee = (emp) => ({
  id: emp.id,
  first_name: emp.first_name,
  last_name: emp.last_name,
  name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee',
  email: emp.email,
  role: emp.role,
  position: emp.position,
  department_name: emp.department_name,
  profile_picture_url: emp.profile_picture_url,
  status: emp.status || 'active'
});

// ─── 1. GET /api/messages/employees ──────────────────────────────────────────
// Fetch all employees for directory & starting new chats
const getEmployees = async (req, res) => {
  try {
    const result = await query(
      `SELECT e.id, e.first_name, e.last_name, e.email, e.role, e.position,
              e.profile_picture_url, e.status, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE e.status IN ('active', 'probation')
       ORDER BY e.first_name ASC`
    );
    res.json({ employees: result.rows.map(formatEmployee) });
  } catch (error) {
    console.error('Get employees directory error:', error.message);
    res.status(500).json({ message: 'Failed to fetch employee directory' });
  }
};

// ─── 2. GET /api/messages/conversations ──────────────────────────────────────
// Fetch all conversations (direct & group) for current user
const getConversations = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user);

    if (!userId || !UUID_REGEX.test(userId)) {
      return res.json({ conversations: [] });
    }

    // Get user's conversation memberships — use COALESCE to survive missing columns
    const convsResult = await query(
      `SELECT c.id,
              COALESCE(c.type, 'direct') AS type,
              c.name,
              COALESCE(c.image_url, NULL) AS image_url,
              c.created_at,
              COALESCE(c.updated_at, c.created_at) AS updated_at,
              COALESCE(cm.role, 'member') AS my_role,
              COALESCE(cm.is_pinned, false) AS is_pinned,
              COALESCE(cm.is_muted, false) AS is_muted,
              cm.last_read_message
       FROM conversations c
       JOIN conversation_members cm ON cm.conversation_id = c.id
       WHERE cm.employee_id = $1
         AND COALESCE(c.is_active, true) = true
       ORDER BY COALESCE(cm.is_pinned, false) DESC, COALESCE(c.updated_at, c.created_at) DESC`,
      [userId]
    );

    const conversations = [];

    for (const conv of convsResult.rows) {
      try {
        // Get members of this conversation
        const membersRes = await query(
          `SELECT e.id, e.first_name, e.last_name, e.email, e.role, e.position,
                  e.profile_picture_url, e.status, COALESCE(cm.role, 'member') AS member_role
           FROM conversation_members cm
           JOIN employees e ON e.id = cm.employee_id
           WHERE cm.conversation_id = $1`,
          [conv.id]
        );

        const members = membersRes.rows.map(formatEmployee);

        // Last message — safe: attachments may not exist yet on older tables
        let lastMsg = null;
        try {
          const lastMsgRes = await query(
            `SELECT m.id, m.message,
                    COALESCE(m.attachments, '[]'::jsonb) AS attachments,
                    m.created_at, m.sender_id,
                    CONCAT(s.first_name, ' ', s.last_name) AS sender_name
             FROM chat_messages m
             JOIN employees s ON s.id = m.sender_id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at DESC
             LIMIT 1`,
            [conv.id]
          );
          lastMsg = lastMsgRes.rows[0] || null;
        } catch (_) { /* no messages yet */ }

        // Unread count — non-fatal
        let unreadCount = 0;
        try {
          if (conv.last_read_message && UUID_REGEX.test(conv.last_read_message)) {
            const unreadRes = await query(
              `SELECT COUNT(*) FROM chat_messages
               WHERE conversation_id = $1 AND sender_id != $2 AND created_at > COALESCE(
                 (SELECT created_at FROM chat_messages WHERE id = $3), '1970-01-01'::timestamptz
               )`,
              [conv.id, userId, conv.last_read_message]
            );
            unreadCount = parseInt(unreadRes.rows[0]?.count || 0);
          } else {
            const unreadRes = await query(
              `SELECT COUNT(*) FROM chat_messages WHERE conversation_id = $1 AND sender_id != $2`,
              [conv.id, userId]
            );
            unreadCount = parseInt(unreadRes.rows[0]?.count || 0);
          }
        } catch (_) { /* unread count is non-fatal */ }

        let convName = conv.name;
        let convImage = conv.image_url || null;
        let otherMember = null;

        if (conv.type === 'direct') {
          otherMember = members.find(m => m.id !== userId) || members[0] || null;
          if (otherMember) {
            convName = otherMember.name;
            convImage = otherMember.profile_picture_url || null;
          }
        }

        conversations.push({
          id: conv.id,
          type: conv.type || 'direct',
          name: convName || 'Direct Message',
          image_url: convImage,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          my_role: conv.my_role,
          is_pinned: conv.is_pinned,
          is_muted: conv.is_muted,
          last_read_message: conv.last_read_message,
          members,
          otherMember,
          lastMessage: lastMsg ? {
            id: lastMsg.id,
            text: lastMsg.message || (lastMsg.attachments?.length ? 'Sent an attachment' : ''),
            time: lastMsg.created_at,
            sender_name: lastMsg.sender_name,
            sender_id: lastMsg.sender_id
          } : null,
          unreadCount
        });
      } catch (convErr) {
        console.warn(`⚠️ Skipping conversation ${conv.id}:`, convErr.message);
      }
    }

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error.message);
    res.status(500).json({ message: 'Server error while fetching conversations', detail: error.message });
  }
};

// ─── 3. POST /api/messages/conversations/direct ─────────────────────────────
const createDirectConversation = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user);
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    const targetRecipientId = await resolveUserId(recipientId);

    if (!userId || !targetRecipientId) {
      return res.status(400).json({ message: 'Invalid user or recipient ID' });
    }

    // Check if direct conversation already exists
    const existing = await query(
      `SELECT c.id
       FROM conversations c
       JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.employee_id = $1
       JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.employee_id = $2
       WHERE COALESCE(c.type, 'direct') = 'direct'
         AND COALESCE(c.is_active, true) = true
       LIMIT 1`,
      [userId, targetRecipientId]
    );

    if (existing.rows[0]) {
      return res.json({ conversationId: existing.rows[0].id });
    }

    // Create new direct conversation (only insert columns that definitely exist)
    const newConv = await query(
      `INSERT INTO conversations (type) VALUES ('direct') RETURNING id`,
      []
    );
    const convId = newConv.rows[0].id;

    // Set optional columns safely
    try { await query(`UPDATE conversations SET is_active = true WHERE id = $1`, [convId]); } catch (_) {}
    try { await query(`UPDATE conversations SET created_by = $1 WHERE id = $2`, [userId, convId]); } catch (_) {}
    try { await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [convId]); } catch (_) {}

    // Add members
    await query(
      `INSERT INTO conversation_members (conversation_id, employee_id, role)
       VALUES ($1, $2, 'admin'), ($1, $3, 'member')`,
      [convId, userId, targetRecipientId]
    );

    res.status(201).json({ conversationId: convId });
  } catch (error) {
    console.error('Create direct conversation error:', error.message);
    res.status(500).json({ message: 'Failed to create direct conversation' });
  }
};

// ─── 4. POST /api/messages/conversations/group ──────────────────────────────
const createGroupConversation = async (req, res) => {
  try {
    const userId = await resolveUserId(req.user);
    const { name, memberIds = [], image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const resolvedMemberIds = await Promise.all((memberIds || []).map(id => resolveUserId(id)));

    // Create group conversation
    const newConv = await query(
      `INSERT INTO conversations (type, name, image_url, created_by, is_active)
       VALUES ('group', $1, $2, $3, true)
       RETURNING id, name, type, image_url, created_at`,
      [name.trim(), image_url || null, userId]
    );

    const convId = newConv.rows[0].id;

    // Add creator as admin
    await query(
      `INSERT INTO conversation_members (conversation_id, employee_id, role) VALUES ($1, $2, 'admin')`,
      [convId, userId]
    );

    // Add other unique members
    const uniqueMemberIds = [...new Set(resolvedMemberIds)].filter(id => id && id !== userId);
    for (const memId of uniqueMemberIds) {
      await query(
        `INSERT INTO conversation_members (conversation_id, employee_id, role)
         VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
        [convId, memId]
      );
    }

    res.status(201).json({
      message: 'Group chat created successfully',
      conversation: {
        id: convId,
        name: name.trim(),
        type: 'group',
        image_url: image_url || null
      }
    });
  } catch (error) {
    console.error('Create group error:', error.message);
    res.status(500).json({ message: 'Failed to create group conversation' });
  }
};

// ─── 5. PUT /api/messages/conversations/:id (Update Group) ──────────────────
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;

    await query(
      `UPDATE conversations SET name = COALESCE($1, name), image_url = COALESCE($2, image_url), updated_at = NOW()
       WHERE id = $3 AND type = 'group'`,
      [name, image_url, id]
    );

    res.json({ message: 'Group details updated successfully' });
  } catch (error) {
    console.error('Update group error:', error.message);
    res.status(500).json({ message: 'Failed to update group' });
  }
};

// ─── 6. POST /api/messages/conversations/:id/members (Add Member) ───────────
const addGroupMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    const resolvedId = await resolveUserId(employeeId);

    if (!resolvedId) return res.status(400).json({ message: 'employeeId is required' });

    await query(
      `INSERT INTO conversation_members (conversation_id, employee_id, role)
       VALUES ($1, $2, 'member') ON CONFLICT (conversation_id, employee_id) DO NOTHING`,
      [id, resolvedId]
    );

    res.json({ message: 'Member added to group' });
  } catch (error) {
    console.error('Add group member error:', error.message);
    res.status(500).json({ message: 'Failed to add member to group' });
  }
};

// ─── 7. DELETE /api/messages/conversations/:id/members/:employeeId ──────────
const removeGroupMember = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    const resolvedId = await resolveUserId(employeeId);

    await query(
      `DELETE FROM conversation_members WHERE conversation_id = $1 AND employee_id = $2`,
      [id, resolvedId]
    );

    res.json({ message: 'Member removed from group' });
  } catch (error) {
    console.error('Remove group member error:', error.message);
    res.status(500).json({ message: 'Failed to remove member from group' });
  }
};

// ─── 8. PUT /api/messages/conversations/:id/pin & /mute ─────────────────────
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);

    const current = await query(
      `SELECT is_pinned FROM conversation_members WHERE conversation_id = $1 AND employee_id = $2`,
      [id, userId]
    );

    const isPinned = !(current.rows[0]?.is_pinned);
    await query(
      `UPDATE conversation_members SET is_pinned = $1 WHERE conversation_id = $2 AND employee_id = $3`,
      [isPinned, id, userId]
    );

    res.json({ is_pinned: isPinned });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle pin state' });
  }
};

const toggleMute = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);

    const current = await query(
      `SELECT is_muted FROM conversation_members WHERE conversation_id = $1 AND employee_id = $2`,
      [id, userId]
    );

    const isMuted = !(current.rows[0]?.is_muted);
    await query(
      `UPDATE conversation_members SET is_muted = $1 WHERE conversation_id = $2 AND employee_id = $3`,
      [isMuted, id, userId]
    );

    res.json({ is_muted: isMuted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle mute state' });
  }
};

// ─── 9. GET /api/messages/conversations/:id/messages ────────────────────────
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);

    if (!id || !UUID_REGEX.test(id)) {
      return res.json({ messages: [] });
    }

    const messagesRes = await query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.message AS content,
              m.attachments, m.parent_message_id, m.reactions, m.is_edited, m.is_deleted,
              m.created_at,
              CONCAT(s.first_name, ' ', s.last_name) AS sender_name,
              s.profile_picture_url AS sender_avatar,
              p.message AS parent_content,
              CONCAT(ps.first_name, ' ', ps.last_name) AS parent_sender_name
       FROM chat_messages m
       JOIN employees s ON s.id = m.sender_id
       LEFT JOIN chat_messages p ON p.id = m.parent_message_id
       LEFT JOIN employees ps ON ps.id = p.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    const messages = messagesRes.rows.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      sender_avatar: msg.sender_avatar,
      content: msg.content,
      attachments: msg.attachments || [],
      parent_message_id: msg.parent_message_id,
      parent_message: msg.parent_message_id ? {
        id: msg.parent_message_id,
        content: msg.parent_content,
        sender_name: msg.parent_sender_name
      } : null,
      reactions: msg.reactions || {},
      is_edited: msg.is_edited,
      is_deleted: msg.is_deleted,
      created_at: msg.created_at,
      mine: msg.sender_id === userId
    }));

    // Non-fatal update last_read_message
    if (messages.length > 0 && userId && UUID_REGEX.test(userId)) {
      const lastMsgId = messages[messages.length - 1].id;
      try {
        await query(
          `UPDATE conversation_members SET last_read_message = $1
           WHERE conversation_id = $2 AND employee_id = $3`,
          [lastMsgId, id, userId]
        );
      } catch (readErr) {
        console.warn('Non-fatal update last_read_message failed:', readErr.message);
      }
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error.message, error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// ─── 10. POST /api/messages/conversations/:id/messages (Send Message) ───────
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);
    const { content, attachments = [], parent_message_id = null } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachments required' });
    }

    const result = await query(
      `INSERT INTO chat_messages (conversation_id, sender_id, message, attachments, parent_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, userId, content || '', JSON.stringify(attachments), parent_message_id]
    );

    const newMsg = result.rows[0];

    // Update conversation timestamp (non-fatal if column doesn't exist yet)
    try { await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [id]); } catch (_) {}

    // Fetch parent message info if reply
    let parentMessage = null;
    if (parent_message_id) {
      const parentRes = await query(
        `SELECT m.id, m.message AS content, CONCAT(s.first_name, ' ', s.last_name) AS sender_name
         FROM chat_messages m JOIN employees s ON s.id = m.sender_id WHERE m.id = $1`,
        [parent_message_id]
      );
      if (parentRes.rows[0]) parentMessage = parentRes.rows[0];
    }

    const payload = {
      id: newMsg.id,
      conversation_id: id,
      sender_id: userId,
      sender_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'User',
      sender_avatar: req.user.profile_picture_url || null,
      content: newMsg.message,
      attachments: newMsg.attachments || [],
      parent_message_id,
      parent_message: parentMessage,
      reactions: {},
      is_edited: false,
      is_deleted: false,
      created_at: newMsg.created_at
    };

    // Socket broadcasting if io is attached
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${id}`).emit('new_message', payload);
      io.emit('conversation_updated', { conversation_id: id });
    }

    res.status(201).json({ message: 'Message sent', data: payload });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// ─── 11. PUT /api/messages/messages/:id (Edit Message) ──────────────────────
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);
    const { content } = req.body;

    const result = await query(
      `UPDATE chat_messages
       SET message = $1, is_edited = true, updated_at = NOW()
       WHERE id = $2 AND sender_id = $3
       RETURNING *`,
      [content, id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    const updated = result.rows[0];
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${updated.conversation_id}`).emit('message_edited', {
        id: updated.id,
        conversation_id: updated.conversation_id,
        content: updated.message
      });
    }

    res.json({ message: 'Message edited', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

// ─── 12. DELETE /api/messages/messages/:id (Delete Message) ─────────────────
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);

    const result = await query(
      `UPDATE chat_messages
       SET message = 'This message was deleted', attachments = '[]'::jsonb, is_deleted = true, updated_at = NOW()
       WHERE id = $1 AND sender_id = $2
       RETURNING conversation_id`,
      [id, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    const convId = result.rows[0].conversation_id;
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${convId}`).emit('message_deleted', { id, conversation_id: convId });
    }

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// ─── 13. POST /api/messages/messages/:id/react (Emoji Reaction) ─────────────
const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await resolveUserId(req.user);
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });

    const msgRes = await query(`SELECT conversation_id, reactions FROM chat_messages WHERE id = $1`, [id]);
    if (!msgRes.rows[0]) return res.status(404).json({ message: 'Message not found' });

    const reactions = msgRes.rows[0].reactions || {};
    const userList = reactions[emoji] || [];

    if (userList.includes(userId)) {
      reactions[emoji] = userList.filter(uid => uid !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...userList, userId];
    }

    await query(
      `UPDATE chat_messages SET reactions = $1 WHERE id = $2`,
      [JSON.stringify(reactions), id]
    );

    const convId = msgRes.rows[0].conversation_id;
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${convId}`).emit('message_reaction', {
        id,
        conversation_id: convId,
        reactions
      });
    }

    res.json({ reactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle reaction' });
  }
};

// ─── 14. POST /api/messages/upload (File Upload) ────────────────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file: {
        id: Date.now() + Math.random(),
        name: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload file error:', error.message);
    res.status(500).json({ message: 'Server error while uploading file' });
  }
};

// Legacy stubs for backwards compatibility
const getContacts = getConversations;
const getConversation = getMessages;
const getInbox = async (req, res) => res.json({ messages: [], pagination: { page: 1, limit: 20 } });
const getUnreadCount = async (req, res) => res.json({ unreadCount: 0 });
const getMessage = async (req, res) => res.json({ message: null });
const toggleStar = async (req, res) => res.json({ message: 'Starred' });
const archiveMessage = async (req, res) => res.json({ message: 'Archived' });

module.exports = {
  getEmployees,
  getConversations,
  createDirectConversation,
  createGroupConversation,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  togglePin,
  toggleMute,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  uploadFile,
  getContacts,
  getConversation,
  getInbox,
  getUnreadCount,
  getMessage,
  toggleStar,
  archiveMessage
};