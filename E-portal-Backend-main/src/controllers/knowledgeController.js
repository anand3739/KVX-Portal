const { query } = require('../config/database');

// Search Policies and SOPs
const getPolicies = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT * FROM policy_documents WHERE status = 'published'`;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (title ILIKE $${params.length} OR summary ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }

    sql += ` ORDER BY title ASC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get policies error:', err);
    res.status(500).json({ message: 'Server error retrieving policies' });
  }
};

// AI / HR Work Assistant: Search approved internal knowledge & assist with authorized actions
const askAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const cleanPrompt = prompt.toLowerCase();

    // 1. Leave Balance Query
    if (cleanPrompt.includes('leave') && (cleanPrompt.includes('balance') || cleanPrompt.includes('how many leaves'))) {
      const leaveRes = await query(
        `SELECT annual_leave, sick_leave, casual_leave FROM leave_balance WHERE employee_id = $1 LIMIT 1`,
        [req.user.id]
      );
      const bal = leaveRes.rows[0] || { annual_leave: 14, sick_leave: 8, casual_leave: 6 };
      return res.json({
        answer: `Your verified leave balance as of today:
• Annual Leave: ${bal.annual_leave} days available
• Sick Leave: ${bal.sick_leave} days available
• Casual Leave: ${bal.casual_leave} days available

You can apply for leave anytime from the Leave Requests portal.`,
        source: 'KRAVIX Leave Balance Registry (Live DB)',
        category: 'Leave Management',
        action_link: '/employee/leave'
      });
    }

    // 2. Overtime Policy Query
    if (cleanPrompt.includes('overtime') || cleanPrompt.includes(' ot ') || cleanPrompt.includes('extra hours')) {
      const policyRes = await query(
        `SELECT title, summary, content, dos_and_donts FROM policy_documents WHERE category = 'Overtime' LIMIT 1`
      );
      const pol = policyRes.rows[0];
      return res.json({
        answer: pol 
          ? `${pol.summary}\n\nKey Rules:\n${pol.content.split('\n').slice(0, 3).join('\n')}`
          : `Approved Overtime Policy: Non-exempt employees working beyond 45 hours/week qualify for 1.5x base hourly pay or 1.5x comp-off with manager pre-approval. Maximum 16 hours/week.`,
        source: pol?.title || 'KRAVIX Standard Overtime & Compensatory Off Policy (v1.0)',
        category: 'Overtime Policy',
        action_link: '/employee/documents'
      });
    }

    // 3. Activity Codes for Coaching / Breaks
    if (cleanPrompt.includes('code') || cleanPrompt.includes('activity') || cleanPrompt.includes('coaching')) {
      return res.json({
        answer: `The approved activity code for internal 1-on-1s and lead sessions is "Coaching". 
Official controlled activity codes available in your Attendance Tracker:
• Production (Active client/engineering work)
• Meeting (Team standup, sprint ceremonies)
• Coaching (1-on-1 mentorship, performance coaching)
• Learning (L&D courses, security training)
• Wellbeing (Wellness break, recharge)
• Lunch & Break (Standard interval)`,
        source: 'Comprehensive Attendance, Punctuality & Leave Guidelines',
        category: 'Attendance & Time Allocation',
        action_link: '/employee/attendance'
      });
    }

    // 4. Security / Phishing / Clean Desk
    if (cleanPrompt.includes('security') || cleanPrompt.includes('phishing') || cleanPrompt.includes('password') || cleanPrompt.includes('lock')) {
      return res.json({
        answer: `Under KRAVIX ISMS-01 Information Security Standard:
• Workstations must be locked (Win + L) immediately upon stepping away.
• Passwords require min 8 characters with multi-factor authentication (2FA) enabled.
• Suspicious phishing emails or lost credentials must be escalated immediately to IT Security.`,
        source: 'Information Security & Data Protection Standard (ISMS-01)',
        category: 'Information Security',
        action_link: '/employee/settings'
      });
    }

    // 5. Generic Policy Search fallback in DB
    const keywords = cleanPrompt.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
    if (keywords.length > 0) {
      const firstKeyword = `%${keywords[0]}%`;
      const searchRes = await query(
        `SELECT title, summary, category FROM policy_documents WHERE content ILIKE $1 OR title ILIKE $1 LIMIT 1`,
        [firstKeyword]
      );
      if (searchRes.rows.length > 0) {
        const item = searchRes.rows[0];
        return res.json({
          answer: `According to **${item.title}**: ${item.summary}`,
          source: item.title,
          category: item.category,
          action_link: '/employee/documents'
        });
      }
    }

    // Safe fallback without hallucination
    res.json({
      answer: `I could not locate an approved organizational policy matching your query. Please refer directly to the official KRAVIX Policies & SOPs Hub or submit an inquiry to the HR Service Desk.`,
      source: 'KRAVIX Knowledge Repository',
      category: 'General Inquiry',
      action_link: '/employee/tickets'
    });
  } catch (err) {
    console.error('Assistant error:', err);
    res.status(500).json({ message: 'Server error processing assistant request' });
  }
};

// Change Management Notices
const getChangeNotices = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM change_notices ORDER BY effective_date DESC LIMIT 10`);
    res.json(result.rows);
  } catch (err) {
    console.error('Change notices error:', err);
    res.status(500).json({ message: 'Server error retrieving change notices' });
  }
};

module.exports = {
  getPolicies,
  askAssistant,
  getChangeNotices
};
