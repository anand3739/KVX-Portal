const { query } = require('../config/database');

// Awards & Wall of Fame
const getAwards = async (req, res) => {
  try {
    const myAwards = await query(`
      SELECT id, award_title, category, badge_icon, period, citation, awarded_at
      FROM employee_awards
      WHERE employee_id = $1
      ORDER BY awarded_at DESC
    `, [req.user.id]);

    const wallOfFame = await query(`
      SELECT a.id, a.award_title, a.category, a.badge_icon, a.period, a.citation, a.awarded_at,
             e.first_name, e.last_name, e.email, e.position, d.name as department_name
      FROM employee_awards a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.is_public = true
      ORDER BY a.awarded_at DESC
      LIMIT 20
    `);

    res.json({
      myAwards: myAwards.rows,
      wallOfFame: wallOfFame.rows
    });
  } catch (err) {
    console.error('Awards error:', err);
    res.status(500).json({ message: 'Server error retrieving awards' });
  }
};

// Wellbeing Check-in Submit & History
const submitWellbeingCheckin = async (req, res) => {
  try {
    const { energy_rating, workload_rating, support_rating, comments, is_anonymous } = req.body;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const result = await query(`
      INSERT INTO wellbeing_checkins (employee_id, month, year, energy_rating, workload_rating, support_rating, comments, is_anonymous)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (employee_id, month, year) DO UPDATE
      SET energy_rating = $4, workload_rating = $5, support_rating = $6, comments = $7, is_anonymous = $8, created_at = NOW()
      RETURNING *
    `, [req.user.id, month, year, energy_rating, workload_rating, support_rating, comments, is_anonymous || false]);

    res.json({ success: true, message: 'Wellbeing check-in saved confidentially.', checkin: result.rows[0] });
  } catch (err) {
    console.error('Wellbeing checkin error:', err);
    res.status(500).json({ message: 'Server error saving wellbeing check-in' });
  }
};

const getWellbeingHistory = async (req, res) => {
  try {
    const result = await query(`
      SELECT month, year, energy_rating, workload_rating, support_rating, comments, created_at
      FROM wellbeing_checkins
      WHERE employee_id = $1
      ORDER BY year DESC, month DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Wellbeing history error:', err);
    res.status(500).json({ message: 'Server error retrieving wellbeing history' });
  }
};

// Surveys & Polls
const getSurveys = async (req, res) => {
  try {
    const surveys = await query(`
      SELECT s.*, 
        CASE WHEN sr.id IS NOT NULL THEN true ELSE false END as has_responded
      FROM surveys s
      LEFT JOIN survey_responses sr ON s.id = sr.survey_id AND sr.employee_id = $1
      WHERE s.status = 'active'
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    let list = surveys.rows;
    if (list.length === 0) {
      list = [
        {
          id: 'survey-q3-pulse',
          title: 'Q3 Enterprise Work Culture & Tooling Pulse',
          description: 'Help leadership improve daily developer tools, meeting frequency, and wellness programs.',
          type: 'survey',
          has_responded: false,
          questions: [
            { id: 'q1', text: 'How satisfied are you with work-life balance this sprint?', type: 'scale_5' },
            { id: 'q2', text: 'Are daily tools and portal integrations meeting your speed needs?', type: 'choice', options: ['Completely', 'Mostly', 'Needs Improvement'] }
          ]
        },
        {
          id: 'poll-friday-connect',
          title: 'Upcoming Monthly Connect: Choose Key Focus Area',
          description: 'Vote for the topic you want leadership to deep-dive into this Friday.',
          type: 'quick_poll',
          has_responded: false,
          questions: [
            { id: 'poll1', text: 'Select Focus Topic', type: 'choice', options: ['AI Engineering Roadmap', 'Career Growth & Appraisals', 'Remote Work Flexibility'] }
          ]
        }
      ];
    }

    res.json(list);
  } catch (err) {
    console.error('Surveys error:', err);
    res.status(500).json({ message: 'Server error retrieving surveys' });
  }
};

// Innovation Ideas: List, Submit, Upvote
const getInnovationIdeas = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, 
             e.first_name, e.last_name, e.position
      FROM innovation_ideas i
      LEFT JOIN employees e ON i.submitter_id = e.id
      ORDER BY i.upvotes DESC, i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ideas error:', err);
    res.status(500).json({ message: 'Server error retrieving innovation ideas' });
  }
};

const submitInnovationIdea = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const submitterName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email;
    const departmentName = req.user.department_name || 'General';

    const result = await query(`
      INSERT INTO innovation_ideas (title, description, category, submitter_id, submitter_name, department, status, upvotes)
      VALUES ($1, $2, $3, $4, $5, $6, 'Submitted', 1)
      RETURNING *
    `, [title, description, category, req.user.id, submitterName, departmentName]);

    res.status(201).json({ success: true, idea: result.rows[0] });
  } catch (err) {
    console.error('Submit idea error:', err);
    res.status(500).json({ message: 'Server error submitting idea' });
  }
};

const upvoteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      UPDATE innovation_ideas
      SET upvotes = upvotes + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json({ success: true, idea: result.rows[0] });
  } catch (err) {
    console.error('Upvote idea error:', err);
    res.status(500).json({ message: 'Server error upvoting idea' });
  }
};

module.exports = {
  getAwards,
  submitWellbeingCheckin,
  getWellbeingHistory,
  getSurveys,
  getInnovationIdeas,
  submitInnovationIdea,
  upvoteIdea
};
