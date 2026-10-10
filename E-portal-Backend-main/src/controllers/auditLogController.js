const { query } = require('../config/database');

const UNIFIED_LOGS_CTE = `
WITH unified_logs AS (
  SELECT 
    al.id::text AS id,
    al.employee_id AS user_id,
    e.email AS user_email,
    e.role AS user_role,
    COALESCE(NULLIF(TRIM(COALESCE(e.first_name, '') || ' ' || COALESCE(e.last_name, '')), ''), e.email, 'System') AS employee_name,
    e.position,
    d.name AS department_name,
    al.action,
    al.entity_type AS resource,
    al.entity_id::text AS resource_id,
    jsonb_build_object(
      'entity_type', al.entity_type,
      'entity_id', al.entity_id,
      'old_data', al.old_data,
      'new_data', al.new_data
    ) AS details,
    al.ip_address::text AS ip_address,
    al.user_agent,
    'success' AS status,
    al.created_at
  FROM activity_logs al
  LEFT JOIN employees e ON al.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id

  UNION ALL

  SELECT
    aud.id::text AS id,
    aud.user_id,
    COALESCE(aud.user_email, e.email) AS user_email,
    COALESCE(aud.user_role, e.role) AS user_role,
    COALESCE(NULLIF(TRIM(COALESCE(e.first_name, '') || ' ' || COALESCE(e.last_name, '')), ''), aud.user_email, aud.user_role, 'System') AS employee_name,
    e.position,
    d.name AS department_name,
    aud.action,
    aud.resource,
    aud.resource_id::text AS resource_id,
    COALESCE(aud.details, '{}'::jsonb) AS details,
    aud.ip_address::text AS ip_address,
    aud.user_agent,
    COALESCE(aud.status, 'success') AS status,
    aud.created_at
  FROM audit_logs aud
  LEFT JOIN employees e ON aud.user_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
)
`;

// GET /api/audit-logs
// Query params: user_id, action, resource, status, date_from, date_to, search, page, limit
const getAuditLogs = async (req, res) => {
  try {
    const {
      user_id,
      action,
      resource,
      status,
      date_from,
      date_to,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (user_id) {
      conditions.push(`ul.user_id = $${idx++}`);
      values.push(user_id);
    }
    if (action) {
      conditions.push(`ul.action ILIKE $${idx++}`);
      values.push(`%${action}%`);
    }
    if (resource) {
      conditions.push(`ul.resource ILIKE $${idx++}`);
      values.push(`%${resource}%`);
    }
    if (status && status !== 'all') {
      conditions.push(`ul.status = $${idx++}`);
      values.push(status);
    }
    if (date_from) {
      conditions.push(`ul.created_at >= $${idx++}`);
      values.push(date_from);
    }
    if (date_to) {
      conditions.push(`ul.created_at <= $${idx++}`);
      values.push(date_to);
    }
    if (search) {
      conditions.push(`(ul.action ILIKE $${idx} OR ul.user_email ILIKE $${idx} OR ul.resource ILIKE $${idx} OR ul.employee_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(
      `${UNIFIED_LOGS_CTE} SELECT COUNT(*) FROM unified_logs ul ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit));
    values.push(offset);

    const result = await query(
      `${UNIFIED_LOGS_CTE}
       SELECT ul.*
       FROM unified_logs ul
       ${where}
       ORDER BY ul.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({
      logs: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1,
      },
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};

// GET /api/audit-logs/stats
const getAuditStats = async (req, res) => {
  try {
    const result = await query(`
      ${UNIFIED_LOGS_CTE}
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'success') AS success_count,
        COUNT(*) FILTER (WHERE status = 'failure' OR status = 'error') AS failure_count,
        COUNT(*) FILTER (WHERE status = 'warning') AS warning_count,
        COUNT(DISTINCT user_id) AS unique_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7d
      FROM unified_logs
    `);

    // Top actions
    const topActions = await query(`
      ${UNIFIED_LOGS_CTE}
      SELECT action, COUNT(*) AS count
      FROM unified_logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);

    // Recent activity by resource
    const byResource = await query(`
      ${UNIFIED_LOGS_CTE}
      SELECT resource, COUNT(*) AS count
      FROM unified_logs
      WHERE resource IS NOT NULL
      GROUP BY resource
      ORDER BY count DESC
      LIMIT 8
    `);

    res.json({
      summary: result.rows[0],
      topActions: topActions.rows,
      byResource: byResource.rows,
    });
  } catch (err) {
    console.error('getAuditStats error:', err);
    res.status(500).json({ message: 'Failed to fetch audit stats', error: err.message });
  }
};

// GET /api/audit-logs/:id
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `${UNIFIED_LOGS_CTE}
       SELECT ul.*
       FROM unified_logs ul
       WHERE ul.id = $1`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getAuditLogById error:', err);
    res.status(500).json({ message: 'Failed to fetch audit log', error: err.message });
  }
};

module.exports = { getAuditLogs, getAuditStats, getAuditLogById };

