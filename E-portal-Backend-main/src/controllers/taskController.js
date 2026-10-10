const { query } = require('../config/database');
const { createNotification } = require('../services/notificationService');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createTask = async (req, res) => {
  try {
    const { title, description, assigned_to, department_id, priority, status, start_date, due_date, estimated_hours } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const safeAssignedTo = assigned_to && uuidRegex.test(assigned_to) ? assigned_to : null;
    const safeAssignedBy = req.user && uuidRegex.test(req.user.id) ? req.user.id : null;
    const safeDepartmentId = department_id && uuidRegex.test(department_id) ? department_id : null;

    const result = await query(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, department_id, priority, status, start_date, due_date, estimated_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title,
        description || '',
        safeAssignedTo,
        safeAssignedBy,
        safeDepartmentId,
        priority || 'medium',
        status || 'pending',
        start_date || null,
        due_date || null,
        estimated_hours || null
      ]
    );

    const newTask = result.rows[0];

    // Notification to assigned employee
    if (safeAssignedTo) {
      try {
        await createNotification({
          user_id: safeAssignedTo,
          type: 'task',
          title: 'New Task Assigned',
          message: `You have been assigned task: "${title}"`,
          link: '/employee/tasks'
        });
      } catch (notifErr) {
        console.warn('Task creation notification warning:', notifErr.message);
      }
    }

    // Log activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user?.id || safeAssignedBy,
          'CREATE_TASK',
          'task',
          newTask.id,
          null,
          JSON.stringify({ title, assigned_to: safeAssignedTo, priority: priority || 'medium' })
        ]
      );
    } catch (logErr) {
      console.warn('Task creation activity log warning:', logErr.message);
    }

    res.status(201).json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let sql = `
      SELECT t.*,
             CONCAT(e.first_name, ' ', e.last_name) as assignee_name,
             CONCAT(ab.first_name, ' ', ab.last_name) as assigner_name,
             d.name as department_name
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.id
      LEFT JOIN employees ab ON t.assigned_by = ab.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (req.query.status && req.query.status !== 'all') {
      sql += ` AND t.status = $${paramIdx}`;
      params.push(req.query.status);
      paramIdx++;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      sql += ` AND t.priority = $${paramIdx}`;
      params.push(req.query.priority);
      paramIdx++;
    }

    const targetAssignee = req.query.assigned_to || req.query.assignedTo;
    if (targetAssignee && uuidRegex.test(targetAssignee)) {
      sql += ` AND t.assigned_to = $${paramIdx}`;
      params.push(targetAssignee);
      paramIdx++;
    }

    if (req.query.search) {
      sql += ` AND (t.title ILIKE $${paramIdx} OR t.description ILIKE $${paramIdx})`;
      params.push(`%${req.query.search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY t.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      tasks: result.rows,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !uuidRegex.test(userId)) {
      return res.status(400).json({ message: 'Valid user authentication required' });
    }

    let sql = `
      SELECT t.*,
             CONCAT(e.first_name, ' ', e.last_name) as assignee_name,
             CONCAT(ab.first_name, ' ', ab.last_name) as assigner_name,
             d.name as department_name
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.id
      LEFT JOIN employees ab ON t.assigned_by = ab.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE (t.assigned_to = $1 OR t.assigned_by = $1)
    `;
    const params = [userId];
    let paramIdx = 2;

    if (req.query.status && req.query.status !== 'all') {
      sql += ` AND t.status = $${paramIdx}`;
      params.push(req.query.status);
      paramIdx++;
    }

    if (req.query.priority && req.query.priority !== 'all') {
      sql += ` AND t.priority = $${paramIdx}`;
      params.push(req.query.priority);
      paramIdx++;
    }

    if (req.query.search) {
      sql += ` AND (t.title ILIKE $${paramIdx} OR t.description ILIKE $${paramIdx})`;
      params.push(`%${req.query.search}%`);
      paramIdx++;
    }

    sql += ` ORDER BY t.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      tasks: result.rows,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const taskResult = await query(
      `SELECT t.*,
              CONCAT(e.first_name, ' ', e.last_name) as assignee_name,
              CONCAT(ab.first_name, ' ', ab.last_name) as assigner_name,
              d.name as department_name
       FROM tasks t
       LEFT JOIN employees e ON t.assigned_to = e.id
       LEFT JOIN employees ab ON t.assigned_by = ab.id
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.id = $1`,
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Fetch task comments
    const commentsResult = await query(
      `SELECT c.*, CONCAT(e.first_name, ' ', e.last_name) as user_name, e.profile_picture_url
       FROM task_comments c
       LEFT JOIN employees e ON c.user_id = e.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Fetch task attachments
    const attachmentsResult = await query(
      `SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) as uploader_name
       FROM task_attachments a
       LEFT JOIN employees e ON a.uploaded_by = e.id
       WHERE a.task_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    // Fetch activity trail for task
    const activityResult = await query(
      `SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) as actor_name
       FROM activity_logs a
       LEFT JOIN employees e ON a.employee_id = e.id
       WHERE a.entity_type = 'task' AND a.entity_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    task.comments_list = commentsResult.rows;
    task.attachments_list = attachmentsResult.rows;
    task.activity_trail = activityResult.rows;

    res.json({
      success: true,
      task,
      data: task
    });
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, progress, due_date, assigned_to } = req.body;

    const oldTaskResult = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (oldTaskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const oldTask = oldTaskResult.rows[0];

    // RBAC Security Guard: Employee role can only update assigned or created tasks
    if (req.user?.role === 'employee' && oldTask.assigned_to !== req.user.id && oldTask.assigned_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update tasks assigned to you.' });
    }

    const safeAssignedTo = assigned_to && uuidRegex.test(assigned_to) ? assigned_to : null;

    const result = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           status = COALESCE($4, status),
           progress = COALESCE($5, progress),
           due_date = COALESCE($6, due_date),
           assigned_to = COALESCE($7, assigned_to),
           completed_date = CASE WHEN $4 = 'completed' THEN NOW() ELSE completed_date END,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title || null,
        description || null,
        priority || null,
        status || null,
        progress !== undefined ? progress : null,
        due_date || null,
        safeAssignedTo,
        id
      ]
    );

    const updatedTask = result.rows[0];

    // Send notification if assignee changed
    if (safeAssignedTo && safeAssignedTo !== oldTask.assigned_to) {
      try {
        await createNotification({
          user_id: safeAssignedTo,
          type: 'task',
          title: 'Task Assigned To You',
          message: `You have been assigned task: "${updatedTask.title}"`,
          link: '/employee/tasks'
        });
      } catch (notifErr) {
        console.warn('Update task assignment notification warning:', notifErr.message);
      }
    }

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.id,
          'UPDATE_TASK',
          'task',
          id,
          JSON.stringify({ title: oldTask.title, status: oldTask.status, priority: oldTask.priority, assigned_to: oldTask.assigned_to }),
          JSON.stringify({ title: updatedTask.title, status: updatedTask.status, priority: updatedTask.priority, assigned_to: updatedTask.assigned_to })
        ]
      );
    } catch (logErr) {
      console.warn('Update task activity log warning:', logErr.message);
    }

    res.json({
      success: true,
      task: updatedTask,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const oldTaskResult = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    if (oldTaskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const oldTask = oldTaskResult.rows[0];

    // RBAC Security Guard: Employee role can only update assigned or created tasks
    if (req.user?.role === 'employee' && oldTask.assigned_to !== req.user.id && oldTask.assigned_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update tasks assigned to you.' });
    }

    const progress = status === 'completed' ? 100 : (status === 'in-progress' ? 50 : 0);

    const result = await query(
      `UPDATE tasks 
       SET status = $1::varchar,
           progress = $2,
           completed_date = CASE WHEN $1::varchar = 'completed' THEN NOW() ELSE completed_date END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, progress, id]
    );

    const updatedTask = result.rows[0];

    // Determine notification recipient (Notify Admin/Creator if updated by Employee, or Employee if updated by Admin)
    const recipientId = req.user.id === oldTask.assigned_to ? oldTask.assigned_by : oldTask.assigned_to;
    if (recipientId && recipientId !== req.user.id) {
      try {
        const actorName = `${req.user.first_name || 'User'} ${req.user.last_name || ''}`.trim();
        await createNotification({
          user_id: recipientId,
          type: 'task',
          title: status === 'completed' ? 'Task Completed' : 'Task Status Updated',
          message: `${actorName} updated task "${updatedTask.title}" status to ${status}`,
          link: req.user.role === 'employee' ? '/admin/tasks' : '/employee/tasks'
        });
      } catch (notifErr) {
        console.warn('Status update notification warning:', notifErr.message);
      }
    }

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.id,
          'UPDATE_TASK_STATUS',
          'task',
          id,
          JSON.stringify({ status: oldTask.status }),
          JSON.stringify({ status: status })
        ]
      );
    } catch (logErr) {
      console.warn('Status update activity log warning:', logErr.message);
    }

    res.json({
      success: true,
      task: updatedTask,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const taskResult = await query(`SELECT * FROM tasks WHERE id = $1`, [taskId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const task = taskResult.rows[0];

    const result = await query(
      `INSERT INTO task_comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, req.user.id, content]
    );

    const comment = result.rows[0];

    // Send notification to other party
    const recipientId = req.user.id === task.assigned_to ? task.assigned_by : task.assigned_to;
    if (recipientId && recipientId !== req.user.id) {
      try {
        const actorName = `${req.user.first_name || 'User'} ${req.user.last_name || ''}`.trim();
        await createNotification({
          user_id: recipientId,
          type: 'task',
          title: 'New Task Comment',
          message: `${actorName} commented on task "${task.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          link: req.user.role === 'employee' ? '/admin/tasks' : '/employee/tasks'
        });
      } catch (notifErr) {
        console.warn('Comment notification warning:', notifErr.message);
      }
    }

    // Log Activity
    try {
      await query(
        `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, old_data, new_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.id,
          'ADD_TASK_COMMENT',
          'task',
          taskId,
          null,
          JSON.stringify({ title: task.title, comment_snippet: content.substring(0, 50) })
        ]
      );
    } catch (logErr) {
      console.warn('Comment activity log warning:', logErr.message);
    }

    res.status(201).json({
      success: true,
      comment,
      data: comment
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const result = await query(
      'DELETE FROM task_comments WHERE id = $1 AND task_id = $2 RETURNING id',
      [commentId, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    console.error('Delete task comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addWorkNote = async (req, res) => {
  req.body.is_work_note = true;
  return addComment(req, res);
};

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const result = await query(
      `INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_url, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [taskId, req.user.id, req.file.originalname, fileUrl, req.file.size, req.file.mimetype]
    );

    res.status(201).json({
      success: true,
      attachment: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Upload task attachment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const isEmployee = req.user.role === 'employee';
    let userWhere = '';
    const params = [];
    if (isEmployee) {
      userWhere = ' WHERE (assigned_to = $1 OR assigned_by = $1)';
      params.push(req.user.id);
    }

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue
       FROM tasks${userWhere}`,
      params
    );

    const stats = statsResult.rows[0] || { total: 0, pending: 0, in_progress: 0, completed: 0, overdue: 0 };

    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        in_progress: parseInt(stats.in_progress) || 0,
        completed: parseInt(stats.completed) || 0,
        overdue: parseInt(stats.overdue) || 0
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTasksByStatus = async (req, res) => {
  req.query.status = req.params.status;
  if (req.user.role === 'employee') {
    return getMyTasks(req, res);
  }
  return getAllTasks(req, res);
};

module.exports = {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  deleteComment,
  addWorkNote,
  uploadAttachment,
  getTaskStats,
  getTasksByStatus
};
