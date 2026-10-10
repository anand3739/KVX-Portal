const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const { createBulkNotifications } = require('../services/notificationService');

const MANAGER_ROLES = ['admin', 'hr', 'ceo'];

const sendValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const errorResponse = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ success: false, message: error.message || 'Server error' });
};

const canManage = (event, user) => {
  if (!user) return false;
  return MANAGER_ROLES.includes(user.role) || event.created_by === user.id;
};

const eventSelect = `
  SELECT e.*,
         COALESCE(e.organizer_name, CONCAT(creator.first_name, ' ', creator.last_name)) AS created_by_name,
         COALESCE(e.organizer_name, CONCAT(creator.first_name, ' ', creator.last_name)) AS organizer,
         COALESCE(json_agg(json_build_object(
           'id', i.id,
           'user_id', i.user_id,
           'status', i.status,
           'responded_at', i.responded_at,
           'first_name', attendee.first_name,
           'last_name', attendee.last_name,
           'email', attendee.email
         )) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS attendees
  FROM events e
  LEFT JOIN employees creator ON creator.id = e.created_by
  LEFT JOIN event_invitations i ON i.event_id = e.id
  LEFT JOIN employees attendee ON attendee.id = i.user_id`;

const findEvent = async (id) => {
  const result = await query(
    `${eventSelect} WHERE e.id = $1 GROUP BY e.id, creator.first_name, creator.last_name`,
    [id]
  );
  return result.rows[0];
};

const emitEventUpdate = (req, action, event) => {
  const io = req.app.get('io');
  if (io) io.emit('events:update', { action, event });
};

const buildAccessClause = (user, paramOffset = 1) => {
  return {
    clause: `(
      e.created_by = $${paramOffset}
      OR $${paramOffset + 1} = ANY(ARRAY['admin', 'hr', 'ceo'])
      OR e.audience_type IS NULL
      OR LOWER(e.audience_type) IN ('everyone', 'all')
      OR (LOWER(e.audience_type) = 'admin' AND $${paramOffset + 1} = 'admin')
      OR (LOWER(e.audience_type) = 'hr' AND $${paramOffset + 1} IN ('hr', 'admin', 'ceo'))
      OR (LOWER(e.audience_type) IN ('employee', 'employees') AND $${paramOffset + 1} IN ('employee', 'hr', 'admin', 'ceo'))
      OR (LOWER(e.audience_type) = 'specific_users' AND e.target_users @> jsonb_build_array($${paramOffset}::text))
      OR (LOWER(e.audience_type) = 'specific_departments' AND $${paramOffset + 2}::text IS NOT NULL AND e.target_departments @> jsonb_build_array($${paramOffset + 2}::text))
      OR EXISTS (
        SELECT 1 FROM event_invitations inv WHERE inv.event_id = e.id AND inv.user_id = $${paramOffset}
      )
    )`,
    params: [user.id, user.role, user.department_id || null]
  };
};

const listEvents = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const access = buildAccessClause(req.user, 1);
    const params = [...access.params];
    let where = access.clause;

    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      where += ` AND (e.title ILIKE $${params.length} OR e.description ILIKE $${params.length} OR e.location ILIKE $${params.length})`;
    }

    if (req.query.type && req.query.type !== 'all') {
      params.push(req.query.type);
      where += ` AND LOWER(e.type) = LOWER($${params.length})`;
    }

    if (req.query.audience && req.query.audience !== 'all') {
      params.push(req.query.audience);
      where += ` AND LOWER(e.audience_type) = LOWER($${params.length})`;
    }

    if (req.query.start_date) {
      params.push(req.query.start_date);
      where += ` AND e.start_date >= $${params.length}`;
    }

    if (req.query.end_date) {
      params.push(req.query.end_date);
      where += ` AND e.start_date <= $${params.length}`;
    }

    let limitOffsetSql = '';
    if (req.query.limit) {
      const limit = Number(req.query.limit);
      params.push(limit);
      limitOffsetSql += ` LIMIT $${params.length}`;
      if (req.query.page) {
        const offset = (Number(req.query.page) - 1) * limit;
        params.push(offset);
        limitOffsetSql += ` OFFSET $${params.length}`;
      }
    }

    const sql = `
      ${eventSelect}
      WHERE ${where}
      GROUP BY e.id, creator.first_name, creator.last_name
      ORDER BY e.start_date ASC
      ${limitOffsetSql}
    `;

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return errorResponse(res, error, 'List events error');
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const access = buildAccessClause(req.user, 1);
    const params = [...access.params, limit];

    const sql = `
      ${eventSelect}
      WHERE ${access.clause} AND (e.status IS NULL OR e.status != 'cancelled') AND e.start_date >= (NOW() - INTERVAL '6 hours')
      GROUP BY e.id, creator.first_name, creator.last_name
      ORDER BY e.start_date ASC
      LIMIT $${params.length}
    `;

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return errorResponse(res, error, 'Get upcoming events error');
  }
};

const getTodayEvents = async (req, res) => {
  try {
    const access = buildAccessClause(req.user, 1);

    const sql = `
      ${eventSelect}
      WHERE ${access.clause}
        AND (e.status IS NULL OR e.status != 'cancelled')
        AND e.start_date >= CURRENT_DATE AND e.start_date < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY e.id, creator.first_name, creator.last_name
      ORDER BY e.start_date ASC
    `;

    const result = await query(sql, access.params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return errorResponse(res, error, 'Get today events error');
  }
};

const getDashboard = async (req, res) => {
  try {
    const access = buildAccessClause(req.user, 1);
    const upcomingParams = [...access.params, 5];

    const sql = `
      ${eventSelect}
      WHERE ${access.clause} AND (e.status IS NULL OR e.status != 'cancelled') AND e.start_date >= (NOW() - INTERVAL '6 hours')
      GROUP BY e.id, creator.first_name, creator.last_name
      ORDER BY e.start_date ASC
      LIMIT $${upcomingParams.length}
    `;

    const upcomingResult = await query(sql, upcomingParams);
    const todayEvents = await getTodayEventsInternal(req.user);

    return res.json({
      success: true,
      data: {
        upcomingEvents: upcomingResult.rows,
        todayEvents,
        announcements: [],
        birthdays: [],
        holidays: []
      }
    });
  } catch (error) {
    return errorResponse(res, error, 'Get events dashboard error');
  }
};

const getTodayEventsInternal = async (user) => {
  const access = buildAccessClause(user, 1);
  const sql = `
    ${eventSelect}
    WHERE ${access.clause}
      AND (e.status IS NULL OR e.status != 'cancelled')
      AND e.start_date >= CURRENT_DATE AND e.start_date < CURRENT_DATE + INTERVAL '1 day'
    GROUP BY e.id, creator.first_name, creator.last_name
    ORDER BY e.start_date ASC
  `;
  const result = await query(sql, access.params);
  return result.rows;
};

const getEventById = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const event = await findEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const invited = Array.isArray(event.attendees) && event.attendees.some((attendee) => attendee.user_id === req.user.id);
    if (!canManage(event, req.user) && !invited) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    return res.json({ success: true, data: event });
  } catch (error) {
    return errorResponse(res, error, 'Get event error');
  }
};

const createEvent = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const {
      title,
      description = null,
      type = 'meeting',
      start_date,
      end_date = null,
      start_time = null,
      end_time = null,
      location = null,
      meeting_link = null,
      organizer_name = null,
      organizer_id = null,
      audience_type = 'everyone',
      target_users = [],
      target_departments = [],
      status = 'upcoming',
      attendees = []
    } = req.body;

    if (end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'end_date must be after start_date' });
    }

    const sql = `
      INSERT INTO events (
        title, description, type, start_date, end_date, start_time, end_time,
        location, meeting_link, organizer_name, organizer_id, audience_type,
        target_users, target_departments, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15, $16)
      RETURNING id
    `;

    const values = [
      title,
      description,
      type,
      start_date,
      end_date,
      start_time,
      end_time,
      location,
      meeting_link,
      organizer_name,
      organizer_id || req.user.id,
      audience_type,
      JSON.stringify(target_users),
      JSON.stringify(target_departments),
      status,
      req.user.id
    ];

    const created = await query(sql, values);
    const eventId = created.rows[0].id;

    if (Array.isArray(attendees) && attendees.length > 0) {
      const uniqueAttendees = [...new Set(attendees)].filter((id) => id !== req.user.id);
      for (const userId of uniqueAttendees) {
        await query(
          `INSERT INTO event_invitations (event_id, user_id) VALUES ($1, $2) ON CONFLICT (event_id, user_id) DO NOTHING`,
          [eventId, userId]
        );
      }
    }

    const event = await findEvent(eventId);
    emitEventUpdate(req, 'create', event);

    const io = req.app.get('io');
    try {
      let targetUserIds = [];
      if (Array.isArray(attendees) && attendees.length > 0) {
        targetUserIds = attendees;
      } else if (audience_type === 'everyone' || !audience_type) {
        const empRes = await query(`SELECT id FROM employees WHERE id != $1 AND status IN ('active', 'probation')`, [req.user.id]);
        targetUserIds = empRes.rows.map((r) => r.id);
      }

      if (targetUserIds.length > 0) {
        await createBulkNotifications(
          targetUserIds.map((userId) => ({
            user_id: userId,
            type: 'info',
            title: 'New Event Scheduled',
            message: `New event scheduled: "${event.title}" on ${new Date(event.start_date).toLocaleDateString()}`,
            link: '/events'
          })),
          io
        );
      }
    } catch (notifErr) {
      console.error('Event creation notification warning:', notifErr.message);
    }

    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    return errorResponse(res, error, 'Create event error');
  }
};

const updateEvent = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const existing = await findEvent(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!canManage(existing, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied. Only managers or the event creator can modify events.' });
    }

    const allowedFields = [
      'title', 'description', 'type', 'start_date', 'end_date', 'start_time', 'end_time',
      'location', 'meeting_link', 'organizer_name', 'organizer_id', 'audience_type',
      'target_users', 'target_departments', 'status'
    ];

    const updatedStart = req.body.start_date || existing.start_date;
    const updatedEnd = req.body.end_date !== undefined ? req.body.end_date : existing.end_date;
    if (updatedEnd && new Date(updatedEnd) < new Date(updatedStart)) {
      return res.status(400).json({ success: false, message: 'end_date must be after start_date' });
    }

    const fields = [];
    const values = [];
    let index = 1;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let val = req.body[field];
        if (field === 'target_users' || field === 'target_departments') {
          val = JSON.stringify(val);
          fields.push(`${field} = $${index}::jsonb`);
        } else {
          fields.push(`${field} = $${index}`);
        }
        values.push(val);
        index++;
      }
    });

    if (fields.length > 0) {
      fields.push(`updated_at = NOW()`);
      values.push(req.params.id);
      const sql = `UPDATE events SET ${fields.join(', ')} WHERE id = $${index}`;
      await query(sql, values);
    }

    if (req.body.attendees !== undefined && Array.isArray(req.body.attendees)) {
      await query(`DELETE FROM event_invitations WHERE event_id = $1`, [req.params.id]);
      const uniqueAttendees = [...new Set(req.body.attendees)];
      for (const userId of uniqueAttendees) {
        await query(
          `INSERT INTO event_invitations (event_id, user_id) VALUES ($1, $2) ON CONFLICT (event_id, user_id) DO NOTHING`,
          [req.params.id, userId]
        );
      }
    }

    const event = await findEvent(req.params.id);
    emitEventUpdate(req, 'update', event);
    return res.json({ success: true, data: event });
  } catch (error) {
    return errorResponse(res, error, 'Update event error');
  }
};

const cancelEvent = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const existing = await findEvent(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!canManage(existing, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied. Only managers or the event creator can cancel events.' });
    }

    await query(`UPDATE events SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [req.params.id]);
    const event = await findEvent(req.params.id);
    emitEventUpdate(req, 'cancel', event);
    return res.json({ success: true, data: event });
  } catch (error) {
    return errorResponse(res, error, 'Cancel event error');
  }
};

const deleteEvent = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const existing = await findEvent(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!canManage(existing, req.user)) {
      return res.status(403).json({ success: false, message: 'Access denied. Only managers or the event creator can delete events.' });
    }

    await query(`DELETE FROM events WHERE id = $1`, [req.params.id]);
    emitEventUpdate(req, 'delete', existing);
    return res.json({ success: true, data: existing });
  } catch (error) {
    return errorResponse(res, error, 'Delete event error');
  }
};

const getInvitations = async (req, res) => {
  try {
    const result = await query(
      `SELECT i.*, e.title, e.description, e.start_date, e.end_date, e.location, e.meeting_link,
              CONCAT(creator.first_name, ' ', creator.last_name) AS created_by_name
       FROM event_invitations i
       JOIN events e ON e.id = i.event_id
       LEFT JOIN employees creator ON creator.id = e.created_by
       WHERE i.user_id = $1 ORDER BY e.start_date ASC`,
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return errorResponse(res, error, 'Get invitations error');
  }
};

const respondToInvitation = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const result = await query(
      `UPDATE event_invitations SET status = $1, responded_at = NOW()
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [req.body.status, req.params.invitationId, req.user.id]
    );
    const invitation = result.rows[0];
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });
    const event = await findEvent(invitation.event_id);
    const io = req.app.get('io');
    if (io) {
      const payload = { action: 'response', invitation, event };
      io.to(`user_${req.user.id}`).emit('events:invitation', payload);
      if (event && event.created_by) {
        io.to(`user_${event.created_by}`).emit('events:invitation', payload);
      }
    }
    return res.json({ success: true, data: invitation });
  } catch (error) {
    return errorResponse(res, error, 'Respond to invitation error');
  }
};

const scheduleReminder = async (req, res) => {
  try {
    if (sendValidationError(req, res)) return;
    const event = await findEvent(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const result = await query(
      `INSERT INTO reminders (user_id, title, description, due_date, event_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, `Reminder: ${event.title}`, event.description, req.body.reminder, event.start_date]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return errorResponse(res, error, 'Schedule reminder error');
  }
};

module.exports = {
  listEvents,
  getUpcomingEvents,
  getTodayEvents,
  getDashboard,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
  getInvitations,
  respondToInvitation,
  scheduleReminder
};
