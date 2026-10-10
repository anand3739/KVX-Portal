const { query } = require('../config/database');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getTrainings = async (req, res) => {
  try {
    const result = await query(`
      SELECT tc.*,
             COUNT(te.id)::int as enrolled_count
      FROM training_courses tc
      LEFT JOIN training_enrollments te ON te.course_id = tc.id
      GROUP BY tc.id
      ORDER BY tc.created_at DESC
    `);

    res.json({
      success: true,
      trainings: result.rows,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get trainings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseResult = await query('SELECT * FROM training_courses WHERE id = $1', [id]);

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Training course not found' });
    }

    const enrollmentsResult = await query(`
      SELECT te.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.email
      FROM training_enrollments te
      JOIN employees e ON te.employee_id = e.id
      WHERE te.course_id = $1
    `, [id]);

    const course = courseResult.rows[0];
    course.enrollments = enrollmentsResult.rows;

    res.json({
      success: true,
      training: course,
      data: course
    });
  } catch (error) {
    console.error('Get training by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createTraining = async (req, res) => {
  try {
    const { title, description, category, instructor, duration_hours, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }

    const result = await query(
      `INSERT INTO training_courses (title, description, category, instructor, duration_hours, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || '',
        category || 'General',
        instructor || 'Internal HR',
        duration_hours || 0,
        status || 'active'
      ]
    );

    res.status(201).json({
      success: true,
      training: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, instructor, duration_hours, status } = req.body;

    const result = await query(
      `UPDATE training_courses
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           instructor = COALESCE($4, instructor),
           duration_hours = COALESCE($5, duration_hours),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title || null,
        description || null,
        category || null,
        instructor || null,
        duration_hours || null,
        status || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Training course not found' });
    }

    res.json({
      success: true,
      training: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update training error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM training_courses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Training course not found' });
    }

    res.json({
      success: true,
      message: 'Training course deleted successfully'
    });
  } catch (error) {
    console.error('Delete training error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const enrollTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.body.employee_id || req.user.id;

    if (!uuidRegex.test(employeeId)) {
      return res.status(400).json({ message: 'Valid employee ID is required' });
    }

    const result = await query(
      `INSERT INTO training_enrollments (course_id, employee_id, status)
       VALUES ($1, $2, 'enrolled')
       ON CONFLICT (course_id, employee_id)
       DO UPDATE SET status = 'enrolled'
       RETURNING *`,
      [id, employeeId]
    );

    res.status(201).json({
      success: true,
      enrollment: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Enroll training error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.body.employee_id || req.user.id;
    const progress = Math.min(100, Math.max(0, parseInt(req.body.progress) || 0));
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'enrolled';

    const result = await query(
      `INSERT INTO training_enrollments (course_id, employee_id, progress, status, completion_date)
       VALUES ($1, $2, $3, $4, CASE WHEN $3 >= 100 THEN NOW() ELSE NULL END)
       ON CONFLICT (course_id, employee_id)
       DO UPDATE SET 
         progress = EXCLUDED.progress,
         status = EXCLUDED.status,
         completion_date = CASE WHEN EXCLUDED.progress >= 100 THEN NOW() ELSE training_enrollments.completion_date END,
         updated_at = NOW()
       RETURNING *`,
      [id, employeeId, progress, status]
    );

    res.json({
      success: true,
      enrollment: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollTraining,
  updateProgress
};
