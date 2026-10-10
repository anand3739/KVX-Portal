const { query } = require('../config/database');

// Monthly Employee Scorecard
const getEmployeeScorecard = async (req, res) => {
  try {
    const targetUserId = req.query.employeeId || req.user.id;

    // RBAC: Non-managers can only view their own scorecard
    if (targetUserId !== req.user.id && !['admin', 'ceo', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied to this employee scorecard.' });
    }

    const result = await query(`
      SELECT month, year, productivity_score, quality_score, attendance_rate, overall_rating,
             improvement_areas, strengths, manager_feedback
      FROM employee_scorecards
      WHERE employee_id = $1
      ORDER BY year DESC, month DESC
    `, [targetUserId]);

    const history = result.rows;
    const current = history[0] || {
      month: 8,
      year: 2026,
      productivity_score: 94.5,
      quality_score: 96.0,
      attendance_rate: 98.2,
      overall_rating: 'Exceeds Expectations',
      improvement_areas: ['Expand CI/CD pipeline automation', 'Cross-functional mentoring'],
      strengths: ['Rapid incident triage', 'Clean scalable code', 'Consistently hits SLA'],
      manager_feedback: 'Outstanding technical contributions and team mentorship.'
    };

    res.json({
      current,
      history
    });
  } catch (err) {
    console.error('Scorecard error:', err);
    res.status(500).json({ message: 'Server error retrieving scorecard' });
  }
};

// Skills Profile
const getSkillsProfile = async (req, res) => {
  try {
    const targetUserId = req.query.employeeId || req.user.id;
    const skillsRes = await query(`
      SELECT id, skill_name, proficiency_level, years_experience, verified
      FROM employee_skills
      WHERE employee_id = $1
      ORDER BY skill_name ASC
    `, [targetUserId]);

    const catalogRes = await query(`SELECT id, name, category, description FROM skill_catalog ORDER BY name ASC`);

    res.json({
      skills: skillsRes.rows,
      catalog: catalogRes.rows
    });
  } catch (err) {
    console.error('Skills error:', err);
    res.status(500).json({ message: 'Server error retrieving skills' });
  }
};

// Add or Update Skill
const addOrUpdateSkill = async (req, res) => {
  try {
    const { skill_name, proficiency_level, years_experience } = req.body;
    if (!skill_name) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    const result = await query(`
      INSERT INTO employee_skills (employee_id, skill_name, proficiency_level, years_experience)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (employee_id, skill_name) DO UPDATE
      SET proficiency_level = $3, years_experience = $4, updated_at = NOW()
      RETURNING *
    `, [req.user.id, skill_name, proficiency_level || 'Intermediate', parseFloat(years_experience) || 1.0]);

    res.json({ success: true, skill: result.rows[0] });
  } catch (err) {
    console.error('Add skill error:', err);
    res.status(500).json({ message: 'Server error saving skill' });
  }
};

// Career Growth & Pathway Intelligence
const getCareerGrowthPath = async (req, res) => {
  try {
    const currentRole = req.user.position || 'Software Engineer';
    const targetRole = currentRole.includes('Senior') ? 'Technical Lead / Engineering Manager' : 'Senior Software Engineer';

    const growthData = {
      currentRole,
      targetRole,
      readinessScore: 82,
      requiredCompetencies: [
        { name: 'System Design & High-Throughput Architecture', current: 'Intermediate', required: 'Advanced', gap: true },
        { name: 'Technical Mentorship & Code Reviews', current: 'Advanced', required: 'Advanced', gap: false },
        { name: 'Stakeholder & Cross-Functional Alignment', current: 'Intermediate', required: 'Advanced', gap: true },
        { name: 'Cloud Infrastructure & Kubernetes', current: 'Beginner', required: 'Intermediate', gap: true }
      ],
      recommendedLearning: [
        { title: 'Enterprise Distributed Systems Design', duration: '6 hrs', type: 'Architecture' },
        { title: 'Leadership & High-Impact 1-on-1 Coaching', duration: '4 hrs', type: 'Leadership' },
        { title: 'Kubernetes in Production Masterclass', duration: '8 hrs', type: 'DevOps' }
      ],
      openInternalProjects: [
        { title: 'Microservices Resiliency Framework', department: 'Engineering', commitment: '5 hrs/week', lead: 'CTO Office' },
        { title: 'Client Onboarding Security Hardening', department: 'Security', commitment: '4 hrs/week', lead: 'SecOps Lead' }
      ]
    };

    res.json(growthData);
  } catch (err) {
    console.error('Career growth error:', err);
    res.status(500).json({ message: 'Server error fetching career growth' });
  }
};

// Internal Talent Marketplace
const getTalentMarketplace = async (req, res) => {
  try {
    const jobs = await query(`
      SELECT id, title, department_id, location, type, experience_level, salary_min, salary_max, description, requirements, status
      FROM job_postings
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json(jobs.rows);
  } catch (err) {
    console.error('Marketplace error:', err);
    res.status(500).json({ message: 'Server error fetching talent marketplace' });
  }
};

module.exports = {
  getEmployeeScorecard,
  getSkillsProfile,
  addOrUpdateSkill,
  getCareerGrowthPath,
  getTalentMarketplace
};
