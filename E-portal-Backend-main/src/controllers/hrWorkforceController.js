const { query } = require('../config/database');

// Employee Referrals
const getReferrals = async (req, res) => {
  try {
    const isHrOrAdmin = ['admin', 'ceo', 'hr'].includes(req.user.role);
    let result;

    if (isHrOrAdmin) {
      result = await query(`
        SELECT r.*, e.first_name as referrer_first_name, e.last_name as referrer_last_name, e.email as referrer_email
        FROM employee_referrals r
        JOIN employees e ON r.referrer_id = e.id
        ORDER BY r.created_at DESC
      `);
    } else {
      result = await query(`
        SELECT * FROM employee_referrals
        WHERE referrer_id = $1
        ORDER BY created_at DESC
      `, [req.user.id]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Referrals error:', err);
    res.status(500).json({ message: 'Server error retrieving referrals' });
  }
};

const submitReferral = async (req, res) => {
  try {
    const { candidate_name, candidate_email, candidate_phone, job_title, resume_url, notes } = req.body;
    if (!candidate_name || !candidate_email || !job_title) {
      return res.status(400).json({ message: 'Candidate name, email, and job title are required.' });
    }

    const result = await query(`
      INSERT INTO employee_referrals (referrer_id, candidate_name, candidate_email, candidate_phone, job_title, resume_url, notes, status, referral_bonus_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Received', 'Pending')
      RETURNING *
    `, [req.user.id, candidate_name, candidate_email, candidate_phone || '', job_title, resume_url || '', notes || '']);

    res.status(201).json({ success: true, message: 'Candidate referral submitted successfully.', referral: result.rows[0] });
  } catch (err) {
    console.error('Submit referral error:', err);
    res.status(500).json({ message: 'Server error submitting referral' });
  }
};

// Employee Relations & Confidential HR Cases (STRICT RBAC: HR & Admin Only!)
const getEmployeeRelationsCases = async (req, res) => {
  try {
    // Strict RBAC Enforcement: Unauthorized users CANNOT access
    if (!['hr', 'admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access to Employee Relations case files is restricted to authorized HR personnel.' });
    }

    const result = await query(`
      SELECT c.*, 
             comp.first_name as complainant_first_name, comp.last_name as complainant_last_name,
             resp.first_name as respondent_first_name, resp.last_name as respondent_last_name
      FROM employee_relations_cases c
      LEFT JOIN employees comp ON c.complainant_id = comp.id
      LEFT JOIN employees resp ON c.respondent_id = resp.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('ER cases error:', err);
    res.status(500).json({ message: 'Server error retrieving case files' });
  }
};

const createEmployeeRelationsCase = async (req, res) => {
  try {
    if (!['hr', 'admin', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access to Employee Relations case creation is restricted to authorized HR personnel.' });
    }

    const { title, type, description, complainant_id, respondent_id, severity } = req.body;
    if (!title || !type || !description) {
      return res.status(400).json({ message: 'Title, type, and description are required.' });
    }

    const caseNumber = `CASE-${Date.now().toString().slice(-6)}`;

    const result = await query(`
      INSERT INTO employee_relations_cases (case_number, title, type, description, complainant_id, respondent_id, severity, assigned_hr_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
      RETURNING *
    `, [caseNumber, title, type, description, complainant_id || null, respondent_id || null, severity || 'medium', req.user.id]);

    res.status(201).json({ success: true, case: result.rows[0] });
  } catch (err) {
    console.error('Create ER case error:', err);
    res.status(500).json({ message: 'Server error creating case file' });
  }
};

module.exports = {
  getReferrals,
  submitReferral,
  getEmployeeRelationsCases,
  createEmployeeRelationsCase
};
