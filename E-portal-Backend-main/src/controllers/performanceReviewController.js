const { query } = require('../config/database');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getPerformanceReviews = async (req, res) => {
  try {
    let sql = `
      SELECT pr.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.position as employee_position,
             d.name as department_name,
             CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (req.user.role === 'employee') {
      sql += ` AND (pr.employee_id = $${paramIdx} OR pr.reviewer_id = $${paramIdx})`;
      params.push(req.user.id);
      paramIdx++;
    } else if (req.query.employee_id && uuidRegex.test(req.query.employee_id)) {
      sql += ` AND pr.employee_id = $${paramIdx}`;
      params.push(req.query.employee_id);
      paramIdx++;
    }

    if (req.query.status && req.query.status !== 'all') {
      sql += ` AND pr.status = $${paramIdx}`;
      params.push(req.query.status);
      paramIdx++;
    }

    if (req.query.review_type && req.query.review_type !== 'all') {
      sql += ` AND pr.review_type = $${paramIdx}`;
      params.push(req.query.review_type);
      paramIdx++;
    }

    sql += ` ORDER BY pr.review_date DESC, pr.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      reviews: result.rows,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get performance reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPerformanceReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT pr.*,
              CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              e.position as employee_position,
              d.name as department_name,
              CONCAT(r.first_name, ' ', r.last_name) as reviewer_name
       FROM performance_reviews pr
       LEFT JOIN employees e ON pr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN employees r ON pr.reviewer_id = r.id
       WHERE pr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json({
      success: true,
      review: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get performance review by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createPerformanceReview = async (req, res) => {
  try {
    const {
      employee_id,
      review_type,
      review_date,
      review_period_start,
      review_period_end,
      technical_skills,
      communication,
      teamwork,
      leadership,
      productivity,
      initiative,
      strengths,
      improvements,
      goals,
      comments,
      status
    } = req.body;

    if (!employee_id || !uuidRegex.test(employee_id)) {
      return res.status(400).json({ message: 'Valid employee ID is required' });
    }

    const t = parseInt(technical_skills) || 3;
    const c = parseInt(communication) || 3;
    const tw = parseInt(teamwork) || 3;
    const l = parseInt(leadership) || 3;
    const p = parseInt(productivity) || 3;
    const i = parseInt(initiative) || 3;

    const overall_rating = parseFloat(((t + c + tw + l + p + i) / 6).toFixed(2));
    const safeReviewerId = req.user && uuidRegex.test(req.user.id) ? req.user.id : employee_id;

    const result = await query(
      `INSERT INTO performance_reviews (
        employee_id, reviewer_id, review_type, review_date, review_period_start, review_period_end,
        technical_skills, communication, teamwork, leadership, productivity, initiative,
        overall_rating, strengths, improvements, goals, comments, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        employee_id,
        safeReviewerId,
        review_type || 'quarterly',
        review_date || new Date(),
        review_period_start || null,
        review_period_end || null,
        t, c, tw, l, p, i,
        overall_rating,
        strengths || '',
        improvements || '',
        goals || '',
        comments || '',
        status || 'submitted'
      ]
    );

    res.status(201).json({
      success: true,
      review: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create performance review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      review_type,
      technical_skills,
      communication,
      teamwork,
      leadership,
      productivity,
      initiative,
      strengths,
      improvements,
      goals,
      comments,
      status
    } = req.body;

    const currentResult = await query('SELECT * FROM performance_reviews WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    const curr = currentResult.rows[0];
    const t = technical_skills !== undefined ? parseInt(technical_skills) : curr.technical_skills;
    const c = communication !== undefined ? parseInt(communication) : curr.communication;
    const tw = teamwork !== undefined ? parseInt(teamwork) : curr.teamwork;
    const l = leadership !== undefined ? parseInt(leadership) : curr.leadership;
    const p = productivity !== undefined ? parseInt(productivity) : curr.productivity;
    const i = initiative !== undefined ? parseInt(initiative) : curr.initiative;

    const overall_rating = parseFloat(((t + c + tw + l + p + i) / 6).toFixed(2));

    const result = await query(
      `UPDATE performance_reviews
       SET review_type = COALESCE($1, review_type),
           technical_skills = $2,
           communication = $3,
           teamwork = $4,
           leadership = $5,
           productivity = $6,
           initiative = $7,
           overall_rating = $8,
           strengths = COALESCE($9, strengths),
           improvements = COALESCE($10, improvements),
           goals = COALESCE($11, goals),
           comments = COALESCE($12, comments),
           status = COALESCE($13, status),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        review_type || null,
        t, c, tw, l, p, i,
        overall_rating,
        strengths || null,
        improvements || null,
        goals || null,
        comments || null,
        status || null,
        id
      ]
    );

    res.json({
      success: true,
      review: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update performance review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deletePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM performance_reviews WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json({
      success: true,
      message: 'Performance review deleted successfully'
    });
  } catch (error) {
    console.error('Delete performance review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview
};
