const { query } = require('../config/database');
const { logAudit } = require('../utils/auditLogger');

// Helper: get requestor info
const getAuthorInfo = (req) => {
  const user = req.user || {};
  return {
    authorId: user.id || user.userId || null,
    authorName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown',
    userEmail: user.email || null,
    userRole: user.role || null,
    ip: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.get('user-agent') || null,
  };
};

// GET /api/announcements
// Query params: status, priority, category, audience, pinned, search, page, limit
const getAnnouncements = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      audience,
      pinned,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    // Role-based filtering: non-admins/non-hr can only see published announcements
    const userRole = req.user?.role;
    if (!['admin', 'hr'].includes(userRole)) {
      conditions.push(`a.status = 'published'`);
    } else if (status) {
      conditions.push(`a.status = $${idx++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`a.priority = $${idx++}`);
      values.push(priority);
    }
    if (category) {
      conditions.push(`a.category ILIKE $${idx++}`);
      values.push(`%${category}%`);
    }
    if (audience) {
      conditions.push(`a.audience ILIKE $${idx++}`);
      values.push(`%${audience}%`);
    }
    if (pinned !== undefined) {
      conditions.push(`a.pinned = $${idx++}`);
      values.push(pinned === 'true');
    }
    if (search) {
      conditions.push(`(a.title ILIKE $${idx} OR a.content ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(
      `SELECT COUNT(*) FROM announcements a ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit));
    values.push(offset);

    const result = await query(
      `SELECT a.*,
              e.first_name || ' ' || e.last_name AS author_full_name,
              e.role AS author_role
       FROM announcements a
       LEFT JOIN employees e ON a.author_id = e.id
       ${where}
       ORDER BY a.pinned DESC, a.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({
      announcements: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAnnouncements error:', err);
    res.status(500).json({ message: 'Failed to fetch announcements', error: err.message });
  }
};

// GET /api/announcements/:id
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*,
              e.first_name || ' ' || e.last_name AS author_full_name,
              e.role AS author_role
       FROM announcements a
       LEFT JOIN employees e ON a.author_id = e.id
       WHERE a.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    // Increment views
    await query(`UPDATE announcements SET views = views + 1 WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getAnnouncementById error:', err);
    res.status(500).json({ message: 'Failed to fetch announcement', error: err.message });
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category = 'General',
      priority = 'medium',
      audience = 'All Employees',
      status = 'draft',
      pinned = false,
      scheduled_at,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const { authorId, authorName, userEmail, userRole, ip, userAgent } = getAuthorInfo(req);

    const published_at = status === 'published' ? new Date().toISOString() : null;

    const result = await query(
      `INSERT INTO announcements
         (title, content, category, priority, audience, status, pinned, author_id, author_name, scheduled_at, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [title, content, category, priority, audience, status, pinned, authorId, authorName, scheduled_at || null, published_at]
    );

    await logAudit({
      userId: authorId,
      userEmail,
      userRole,
      action: 'CREATE_ANNOUNCEMENT',
      resource: 'announcements',
      resourceId: result.rows[0].id,
      details: { title },
      ip,
      userAgent,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createAnnouncement error:', err);
    res.status(500).json({ message: 'Failed to create announcement', error: err.message });
  }
};

// PUT /api/announcements/:id
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      priority,
      audience,
      status,
      pinned,
      scheduled_at,
    } = req.body;

    const existing = await query('SELECT * FROM announcements WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    const ann = existing.rows[0];

    // Determine published_at
    let published_at = ann.published_at;
    if (status === 'published' && ann.status !== 'published') {
      published_at = new Date().toISOString();
    }

    const result = await query(
      `UPDATE announcements SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          category = COALESCE($3, category),
          priority = COALESCE($4, priority),
          audience = COALESCE($5, audience),
          status = COALESCE($6, status),
          pinned = COALESCE($7, pinned),
          scheduled_at = COALESCE($8, scheduled_at),
          published_at = $9,
          updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [title, content, category, priority, audience, status, pinned, scheduled_at, published_at, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateAnnouncement error:', err);
    res.status(500).json({ message: 'Failed to update announcement', error: err.message });
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, userEmail, userRole, ip, userAgent } = getAuthorInfo(req);

    const existing = await query('SELECT * FROM announcements WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await query('DELETE FROM announcements WHERE id = $1', [id]);

    await logAudit({
      userId: authorId,
      userEmail,
      userRole,
      action: 'DELETE_ANNOUNCEMENT',
      resource: 'announcements',
      resourceId: id,
      details: { title: existing.rows[0].title },
      ip,
      userAgent,
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    res.status(500).json({ message: 'Failed to delete announcement', error: err.message });
  }
};

// PATCH /api/announcements/:id/publish
const publishAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE announcements SET status = 'published', published_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('publishAnnouncement error:', err);
    res.status(500).json({ message: 'Failed to publish announcement', error: err.message });
  }
};

// PATCH /api/announcements/:id/pin
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE announcements SET pinned = NOT pinned, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('togglePin error:', err);
    res.status(500).json({ message: 'Failed to toggle pin', error: err.message });
  }
};

// GET /api/announcements/stats
const getStats = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'published') AS published,
        COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
        COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled,
        COUNT(*) FILTER (WHERE pinned = true) AS pinned,
        COUNT(*) AS total,
        COALESCE(SUM(views), 0) AS total_views
      FROM announcements
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  togglePin,
  getStats,
};
