const { query } = require('../config/database');

// Map DB row → frontend shape
const toFrontend = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  // EventReminders uses eventTime; fallback to due_date for backwards-compat
  eventTime: row.event_time ? row.event_time : row.due_date,
  remindOffset: row.remind_offset_minutes ?? 5,
  notifyEmail: row.notify_email ?? true,
  notifyWhatsApp: row.notify_whatsapp ?? false,
  email: row.email || '',
  whatsapp: row.whatsapp || '',
  triggered: row.triggered ?? false,
  // Simple reminder compat
  due_date: row.due_date,
  priority: row.priority || 'medium',
  completed: row.completed ?? false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getReminders = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM reminders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const reminders = result.rows.map(toFrontend);
    res.json({
      success: true,
      reminders,
      data: reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      eventTime,
      remindOffset,
      notifyEmail,
      notifyWhatsApp,
      email,
      whatsapp,
      triggered,
      // Simple reminder compat
      due_date,
      priority,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // event_time takes precedence; fall back to due_date for simple reminders
    const resolvedEventTime = eventTime || due_date || new Date().toISOString();

    const result = await query(
      `INSERT INTO reminders (
         user_id, title, description,
         due_date, event_time,
         remind_offset_minutes, notify_email, notify_whatsapp,
         email, whatsapp, triggered, priority
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.user.id,
        title,
        description || '',
        resolvedEventTime,
        resolvedEventTime,
        remindOffset !== undefined ? parseInt(remindOffset, 10) : 5,
        notifyEmail !== undefined ? Boolean(notifyEmail) : true,
        notifyWhatsApp !== undefined ? Boolean(notifyWhatsApp) : false,
        email || '',
        whatsapp || '',
        triggered !== undefined ? Boolean(triggered) : false,
        priority || 'medium',
      ]
    );

    const reminder = toFrontend(result.rows[0]);
    res.status(201).json({ success: true, reminder, data: reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      eventTime,
      remindOffset,
      notifyEmail,
      notifyWhatsApp,
      email,
      whatsapp,
      triggered,
      // Simple reminder compat
      due_date,
      priority,
      completed,
    } = req.body;

    const resolvedEventTime = eventTime || due_date || null;

    const result = await query(
      `UPDATE reminders
       SET title                  = COALESCE($1, title),
           description            = COALESCE($2, description),
           due_date               = COALESCE($3, due_date),
           event_time             = COALESCE($4, event_time),
           remind_offset_minutes  = COALESCE($5, remind_offset_minutes),
           notify_email           = COALESCE($6, notify_email),
           notify_whatsapp        = COALESCE($7, notify_whatsapp),
           email                  = COALESCE($8, email),
           whatsapp               = COALESCE($9, whatsapp),
           triggered              = COALESCE($10, triggered),
           triggered_at           = CASE WHEN $10 = true AND triggered = false THEN NOW() ELSE triggered_at END,
           priority               = COALESCE($11, priority),
           completed              = COALESCE($12, completed),
           completed_at           = CASE WHEN $12 = true AND completed = false THEN NOW() ELSE completed_at END,
           updated_at             = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : null,
        resolvedEventTime,
        resolvedEventTime,
        remindOffset !== undefined ? parseInt(remindOffset, 10) : null,
        notifyEmail !== undefined ? Boolean(notifyEmail) : null,
        notifyWhatsApp !== undefined ? Boolean(notifyWhatsApp) : null,
        email !== undefined ? email : null,
        whatsapp !== undefined ? whatsapp : null,
        triggered !== undefined ? Boolean(triggered) : null,
        priority || null,
        completed !== undefined ? Boolean(completed) : null,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const reminder = toFrontend(result.rows[0]);
    res.json({ success: true, reminder, data: reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};
