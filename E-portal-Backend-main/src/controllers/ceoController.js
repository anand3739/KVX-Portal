// ============================================================
// src/controllers/ceoController.js
// CEO Executive Controller for Main KVX Portal
// Handles Executive Approvals, Executive Notifications, Strategic Alerts,
// Executive Profile Preferences, Reports Center, and HR Overviews.
// ============================================================

const { query } = require('../config/database');
const notificationService = require('../services/notificationService');

// ============================================================
// 1. APPROVALS (executive_approvals table)
// ============================================================

exports.getApprovals = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM executive_approvals ORDER BY created_at DESC`
    );
    res.json({ success: true, approvals: result.rows });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch approvals' });
  }
};

exports.createApproval = async (req, res) => {
  try {
    const {
      title,
      department,
      requested_by,
      amount,
      amount_label,
      due_date,
      due_tone,
      priority,
      description,
      category,
      icon_name
    } = req.body;

    const result = await query(
      `INSERT INTO executive_approvals
       (title, department, requested_by, amount, amount_label, due_date, due_tone, priority, description, category, icon_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title || 'Strategic Hiring Request',
        department || 'Engineering',
        requested_by || req.user?.email || 'CEO',
        amount || '₹0',
        amount_label || 'Budget Allocated',
        due_date || 'Within 30 days',
        due_tone || 'normal',
        priority || 'Medium',
        description || 'Strategic hiring headcount request',
        category || 'Strategic Hiring',
        icon_name || 'UserPlus'
      ]
    );

    const newApproval = result.rows[0];

    // Notify Admin and HR users
    try {
      const recipientUsers = await query("SELECT id, role FROM users WHERE role IN ('admin', 'hr')");
      if (recipientUsers.rows.length > 0) {
        const notifs = recipientUsers.rows.map(u => ({
          user_id: u.id,
          type: 'hiring_request',
          title: `New Hiring Request: ${title || 'Strategic Hiring'}`,
          message: `CEO requested ${title || 'position'} for ${department || 'department'}. Budget: ${amount || 'TBD'}.`,
          link: u.role === 'admin' ? '/admin/approvals' : '/hr/approvals'
        }));
        await notificationService.createBulkNotifications(notifs);
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch notifications for approval:', notifErr);
    }

    res.status(201).json({ success: true, approval: newApproval });
  } catch (error) {
    console.error('Create approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to create approval' });
  }
};

exports.decideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const rawDecision = req.body.decision || req.body.status || req.body.action || 'Approved';
    
    let decision = 'Approved';
    const lower = String(rawDecision).toLowerCase();
    if (lower.includes('reject')) decision = 'Rejected';
    else if (lower.includes('escalat')) decision = 'Escalated';
    else if (lower.includes('pend')) decision = 'Pending';
    else decision = 'Approved';

    const userId = req.user?.id ? String(req.user.id) : 'CEO';

    const result = await query(
      `UPDATE executive_approvals
       SET status = $1, decided_by = $2, decided_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [decision, userId, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Approval not found' });
    }

    res.json({ success: true, approval: result.rows[0] });
  } catch (error) {
    console.error('Decide approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to update approval' });
  }
};

// ============================================================
// 2. EXECUTIVE NOTIFICATIONS (executive_notifications table)
// Distinct from generic staff notifications table
// ============================================================

exports.getExecutiveNotifications = async (req, res) => {
  try {
    const { alertsOnly } = req.query;
    let sql = `SELECT * FROM executive_notifications WHERE user_id = $1`;
    const params = [req.user.id];

    if (alertsOnly === 'true') {
      sql += ` AND is_strategic_alert = true`;
    }
    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error('Get executive notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

exports.createExecutiveNotification = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      section,
      icon_name,
      action,
      details,
      is_strategic_alert
    } = req.body;

    const result = await query(
      `INSERT INTO executive_notifications
       (user_id, title, description, category, priority, section, icon_name, action, details, is_strategic_alert)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.id,
        title,
        description,
        category,
        priority,
        section,
        icon_name || 'Bell',
        action,
        JSON.stringify(details || {}),
        is_strategic_alert || false
      ]
    );
    res.status(201).json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Create executive notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
};

exports.markExecutiveNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE executive_notifications SET status = 'Read' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Mark executive notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

exports.markAllExecutiveNotificationsRead = async (req, res) => {
  try {
    const result = await query(
      `UPDATE executive_notifications SET status = 'Read' WHERE user_id = $1 AND status != 'Read' RETURNING id`,
      [req.user.id]
    );
    res.json({
      success: true,
      message: 'All executive notifications marked as read',
      updatedCount: result.rowCount
    });
  } catch (error) {
    console.error('Mark all executive notifications read error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};


// ============================================================
// 3. STRATEGIC ALERTS (strategic_alerts table)
// ============================================================

exports.getStrategicAlerts = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM strategic_alerts ORDER BY created_at DESC`);
    res.json({ success: true, alerts: result.rows });
  } catch (error) {
    console.error('Get strategic alerts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch strategic alerts' });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Reviewed'
    if (!['Open', 'Reviewed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Open or Reviewed.' });
    }
    const result = await query(
      `UPDATE strategic_alerts SET status = $1, reviewed_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({ success: true, alert: result.rows[0] });
  } catch (error) {
    console.error('Update alert status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update alert' });
  }
};

// ============================================================
// 4. CEO PROFILE & PREFERENCES
// Reuses employees.preferences JSONB column
// ============================================================

exports.getExecutiveProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, position, city, profile_picture_url, preferences FROM employees WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    const emp = result.rows[0];
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email.split('@')[0];

    // Fetch real login activity history from PostgreSQL activity_logs
    const loginLogs = await query(
      `SELECT created_at, ip_address, user_agent FROM activity_logs WHERE employee_id = $1 AND action = 'LOGIN' ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );

    let lastLoginTime = null;
    let loginHistory = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let activeSessions = [];

    if (loginLogs.rows && loginLogs.rows.length > 0) {
      lastLoginTime = loginLogs.rows[0].created_at;
      const d = new Date(lastLoginTime);
      const isToday = new Date().toDateString() === d.toDateString();
      loginHistory = (isToday ? 'Today at ' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ') + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      activeSessions = loginLogs.rows.map((log, idx) => {
        const ua = log.user_agent || '';
        let dev = 'Web Browser on Desktop';
        if (ua.includes('Windows')) dev = 'Chrome on Windows Desktop';
        else if (ua.includes('Mac')) dev = 'Safari on macOS Desktop';
        else if (ua.includes('iPhone') || ua.includes('iPad')) dev = 'Safari on iOS Device';
        else if (ua.includes('Android')) dev = 'Chrome on Android Device';
        else if (ua.includes('Linux')) dev = 'Browser on Linux';

        const logDate = new Date(log.created_at);
        const isLogToday = new Date().toDateString() === logDate.toDateString();
        const timeStr = idx === 0 ? 'Active Now' : (isLogToday ? 'Today, ' : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ') + logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return {
          id: `sess_${idx + 1}`,
          device: dev,
          location: emp.preferences?.officeLocation || emp.city || 'Hyderabad, India (R&D Center)',
          ip: log.ip_address ? String(log.ip_address).replace('::1', '127.0.0.1 (Localhost)') : '127.0.0.1',
          lastActive: timeStr,
          time: timeStr,
          isCurrent: idx === 0,
          status: idx === 0 ? 'Active' : 'Expired'
        };
      });
    } else {
      activeSessions = [
        {
          id: 'sess_1',
          device: 'Chrome on Windows Desktop',
          location: emp.preferences?.officeLocation || emp.city || 'Hyderabad, India (R&D Center)',
          ip: '127.0.0.1 (Localhost)',
          lastActive: 'Active Now',
          time: 'Active Now',
          isCurrent: true,
          status: 'Active'
        }
      ];
    }

    const data = {
      fullName,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.preferences?.designation || emp.position || 'Chief Executive Officer',
      profileImage: emp.profile_picture_url || null,
      officeLocation: emp.preferences?.officeLocation || emp.city || 'Hyderabad, India (R&D Center)',
      language: emp.preferences?.language || 'English',
      timezone: emp.preferences?.timezone || 'Asia/Kolkata (GMT+5:30)',
      theme: emp.preferences?.theme || 'Light',
      dashboardLayout: emp.preferences?.dashboardLayout || 'Executive View',
      timeFormat: emp.preferences?.timeFormat || '12-hour',
      dateFormat: emp.preferences?.dateFormat || 'MM/DD/YYYY',
      currency: emp.preferences?.currency || 'USD',
      autoSave: emp.preferences?.autoSave || 'Every 5 minutes',
      defaultLandingPage: emp.preferences?.defaultLandingPage || 'Dashboard',
      kpiAnimations: emp.preferences?.kpiAnimations !== false,
      autoRefresh: emp.preferences?.autoRefresh !== false,
      liveAlerts: emp.preferences?.liveAlerts !== false,
      aiInsights: emp.preferences?.aiInsights !== false,
      dashboardSounds: emp.preferences?.dashboardSounds === true,
      boardReminders: emp.preferences?.boardReminders !== false,
      executiveSignature: emp.preferences?.executiveSignature || fullName,
      signatureImage: emp.preferences?.signatureImage || null,
      lastLoginTime,
      loginHistory,
      activeSessions,
      ...(emp.preferences || {})
    };
    res.json({
      success: true,
      data,
      user: {
        id: emp.id,
        email: emp.email,
        first_name: emp.first_name,
        last_name: emp.last_name,
        name: fullName,
        phone: emp.phone,
        role: emp.role,
        position: emp.position,
        profile_picture_url: emp.profile_picture_url,
        preferences: emp.preferences || {}
      }
    });
  } catch (error) {
    console.error('Get executive profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

exports.saveExecutiveProfile = async (req, res) => {
  try {
    const updates = req.body || {};
    let firstName = null;
    let lastName = null;
    if (updates.fullName && typeof updates.fullName === 'string' && updates.fullName.trim() !== '') {
      const parts = updates.fullName.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '';
    }

    const phoneVal = updates.phone !== undefined && String(updates.phone).trim() !== '' ? String(updates.phone).trim() : null;
    const picVal = updates.profileImage !== undefined ? updates.profileImage : (updates.profile_picture_url !== undefined ? updates.profile_picture_url : null);
    const locationVal = updates.officeLocation !== undefined && String(updates.officeLocation).trim() !== '' ? String(updates.officeLocation).trim() : null;
    const designationVal = updates.designation !== undefined && String(updates.designation).trim() !== '' ? String(updates.designation).trim() : null;

    const result = await query(
      `UPDATE employees
       SET preferences = COALESCE(preferences, '{}'::jsonb) || $1::jsonb,
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           phone = COALESCE($4, phone),
           profile_picture_url = COALESCE($5, profile_picture_url),
           city = COALESCE($6, city),
           position = COALESCE($7, position),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, email, first_name, last_name, phone, role, position, city, profile_picture_url, preferences`,
      [
        JSON.stringify(updates),
        firstName,
        lastName,
        phoneVal,
        picVal,
        locationVal,
        designationVal,
        req.user.id
      ]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const updatedUser = result.rows[0];
    const fullName = `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || updatedUser.email.split('@')[0];

    // Fetch real login activity history from PostgreSQL activity_logs
    const loginLogs = await query(
      `SELECT created_at, ip_address, user_agent FROM activity_logs WHERE employee_id = $1 AND action = 'LOGIN' ORDER BY created_at DESC LIMIT 5`,
      [req.user.id]
    );

    let lastLoginTime = null;
    let loginHistory = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let activeSessions = [];

    if (loginLogs.rows && loginLogs.rows.length > 0) {
      lastLoginTime = loginLogs.rows[0].created_at;
      const d = new Date(lastLoginTime);
      const isToday = new Date().toDateString() === d.toDateString();
      loginHistory = (isToday ? 'Today at ' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ') + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      activeSessions = loginLogs.rows.map((log, idx) => {
        const ua = log.user_agent || '';
        let dev = 'Web Browser on Desktop';
        if (ua.includes('Windows')) dev = 'Chrome on Windows Desktop';
        else if (ua.includes('Mac')) dev = 'Safari on macOS Desktop';
        else if (ua.includes('iPhone') || ua.includes('iPad')) dev = 'Safari on iOS Device';
        else if (ua.includes('Android')) dev = 'Chrome on Android Device';
        else if (ua.includes('Linux')) dev = 'Browser on Linux';

        const logDate = new Date(log.created_at);
        const isLogToday = new Date().toDateString() === logDate.toDateString();
        const timeStr = idx === 0 ? 'Active Now' : (isLogToday ? 'Today, ' : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ') + logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return {
          id: `sess_${idx + 1}`,
          device: dev,
          location: updatedUser.preferences?.officeLocation || updatedUser.city || 'Hyderabad, India (R&D Center)',
          ip: log.ip_address ? String(log.ip_address).replace('::1', '127.0.0.1 (Localhost)') : '127.0.0.1',
          lastActive: timeStr,
          time: timeStr,
          isCurrent: idx === 0,
          status: idx === 0 ? 'Active' : 'Expired'
        };
      });
    }

    const data = {
      fullName,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      designation: updatedUser.preferences?.designation || updatedUser.position || 'Chief Executive Officer',
      profileImage: updatedUser.profile_picture_url || null,
      officeLocation: updatedUser.preferences?.officeLocation || updatedUser.city || 'Hyderabad, India (R&D Center)',
      language: updatedUser.preferences?.language || 'English',
      timezone: updatedUser.preferences?.timezone || 'Asia/Kolkata (GMT+5:30)',
      lastLoginTime,
      loginHistory,
      activeSessions,
      ...(updatedUser.preferences || {})
    };
    res.json({
      success: true,
      data,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        name: fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        position: updatedUser.position,
        profile_picture_url: updatedUser.profile_picture_url,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Save executive profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
};

// ============================================================
// 5. HR MANAGEMENT OVERVIEWS
// ============================================================

exports.getHRRecruitmentOverview = async (req, res) => {
  try {
    const postings = await query(`
      SELECT COUNT(*) as total_postings,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as open_postings,
        COALESCE(SUM(openings), 0) as total_openings,
        COALESCE(SUM(filled_positions), 0) as total_filled
      FROM job_postings
    `);
    const applications = await query(`
      SELECT COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'applied' THEN 1 END) as new_applications,
        COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlisted,
        COUNT(CASE WHEN status = 'interviewed' OR status = 'interview' THEN 1 END) as interviewed,
        COUNT(CASE WHEN status = 'offered' OR status = 'offer' THEN 1 END) as offered,
        COUNT(CASE WHEN status = 'hired' THEN 1 END) as hired
      FROM job_applications
    `);
    const applicationList = await query(`
      SELECT ja.id, ja.first_name, ja.last_name, ja.email, ja.status, ja.applied_date,
             COALESCE(jp.title, 'General Position') as position,
             COALESCE(d.name, 'General') as department
      FROM job_applications ja
      LEFT JOIN job_postings jp ON ja.job_id = jp.id
      LEFT JOIN departments d ON jp.department_id = d.id
      ORDER BY ja.created_at DESC
      LIMIT 50
    `);
    const monthlyVelocityQuery = await query(`
      WITH months AS (
        SELECT 
          date_trunc('month', (CURRENT_DATE - (n || ' month')::interval)) AS month_date
        FROM generate_series(0, 11) AS n
      )
      SELECT 
        to_char(m.month_date, 'Mon') AS month,
        to_char(m.month_date, 'YYYY-MM') AS year_month,
        m.month_date,
        COALESCE(COUNT(ja.id), 0)::int AS applications,
        COALESCE(COUNT(CASE WHEN ja.status = 'hired' THEN 1 END), 0)::int AS hires
      FROM months m
      LEFT JOIN job_applications ja 
        ON date_trunc('month', ja.created_at) = m.month_date
      GROUP BY m.month_date
      ORDER BY m.month_date ASC
    `);

    const monthlyVelocity = (monthlyVelocityQuery.rows || []).map(row => ({
      month: row.month,
      year_month: row.year_month,
      applications: parseInt(row.applications, 10) || 0,
      hires: parseInt(row.hires, 10) || 0
    }));

    const approvals = await query(`
      SELECT COUNT(*) as total_approvals,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_approvals
      FROM executive_approvals
    `);

    const timeToHireQuery = await query(`
      SELECT COALESCE(ROUND(AVG(EXTRACT(DAY FROM (updated_at - applied_date)))), 0) as avg_days
      FROM job_applications
      WHERE status IN ('hired', 'joined') AND applied_date IS NOT NULL AND updated_at IS NOT NULL
    `);
    const avgTimeToHireDays = parseInt(timeToHireQuery.rows[0]?.avg_days, 10) || 0;

    const appsData = applications.rows[0] || {};
    const appsCount = parseInt(appsData.total_applications, 10) || 0;
    const shortlistedCount = parseInt(appsData.shortlisted, 10) || 0;
    const interviewedCount = parseInt(appsData.interviewed, 10) || 0;
    const offeredCount = parseInt(appsData.offered, 10) || 0;
    const hiredCount = parseInt(appsData.hired, 10) || 0;

    const pipeline = {
      stages: {
        applications: { count: appsCount, conversion: 100 },
        screening: { count: shortlistedCount, conversion: appsCount > 0 ? Math.round((shortlistedCount / appsCount) * 100) : 0 },
        interview: { count: interviewedCount, conversion: appsCount > 0 ? Math.round((interviewedCount / appsCount) * 100) : 0 },
        finalRound: { count: 0, conversion: 0, unsupported: true },
        offer: { count: offeredCount, conversion: appsCount > 0 ? Math.round((offeredCount / appsCount) * 100) : 0 },
        joined: { count: hiredCount, conversion: appsCount > 0 ? Math.round((hiredCount / appsCount) * 100) : 0 }
      },
      totalCandidates: appsCount,
      conversionRate: appsCount > 0 ? Math.round((hiredCount / appsCount) * 100) : 0,
      avgTimeToHireDays,
      offerAcceptanceRate: offeredCount > 0 ? Math.round((hiredCount / offeredCount) * 100) : 0,
      health: appsCount > 0 ? (hiredCount > 0 ? 'Healthy' : 'Active Pipeline') : 'No Active Pipeline'
    };

    const deptHiringQuery = await query(`
      SELECT 
        d.id,
        d.name,
        d.budget,
        COALESCE(COUNT(CASE WHEN ja.status IN ('hired', 'joined') THEN 1 END), 0)::int as hired,
        COALESCE(COUNT(CASE WHEN jp.status = 'published' THEN 1 END), 0)::int as open_postings,
        COALESCE(SUM(CASE WHEN jp.status = 'published' THEN jp.openings ELSE 0 END), 0)::int as openings
      FROM departments d
      LEFT JOIN job_postings jp ON jp.department_id = d.id
      LEFT JOIN job_applications ja ON ja.job_id = jp.id
      GROUP BY d.id, d.name, d.budget
      ORDER BY d.name ASC
    `);

    const departmentHiring = (deptHiringQuery.rows || []).map(row => {
      const hired = parseInt(row.hired, 10) || 0;
      const open = parseInt(row.open_postings, 10) || 0;
      const total = hired + open;
      const progress = total > 0 ? Math.round((hired / total) * 100) : 0;
      const rawBudget = row.budget !== null && row.budget !== undefined ? parseFloat(row.budget) : null;
      const formattedBudget = rawBudget !== null ? `₹${(rawBudget / 100000).toFixed(1).replace(/\.0$/, '')}L` : null;

      return {
        id: row.id,
        name: row.name,
        hired,
        open,
        total,
        progress,
        budget: formattedBudget,
        budgetUtilization: null,
        velocity: null
      };
    });

    const recentHiresQuery = await query(`
      SELECT 
        e.id,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        COALESCE(d.name, 'General') as department,
        COALESCE(e.position, 'Employee') as designation,
        e.join_date,
        e.status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.join_date IS NOT NULL
      ORDER BY e.join_date DESC
      LIMIT 10
    `);

    const recentHires = (recentHiresQuery.rows || []).map(row => ({
      id: row.id,
      name: row.name,
      department: row.department,
      designation: row.designation,
      joiningDate: row.join_date ? new Date(row.join_date).toISOString().split('T')[0] : null,
      recruiter: 'Not assigned',
      source: 'Not tracked',
      aiScore: 'N/A',
      status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Active',
      avatar: row.name ? row.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'EMP'
    }));

    const upcomingJoiningQuery = await query(`
      SELECT 
        e.id,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        COALESCE(d.name, 'General') as department,
        COALESCE(e.position, 'Employee') as position,
        e.join_date,
        (e.join_date - CURRENT_DATE) as days_remaining
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.join_date > CURRENT_DATE
      ORDER BY e.join_date ASC
      LIMIT 10
    `);

    const upcomingJoining = (upcomingJoiningQuery.rows || []).map(row => ({
      id: row.id,
      name: row.name,
      position: row.position,
      department: row.department,
      joiningDate: row.join_date ? new Date(row.join_date).toISOString().split('T')[0] : null,
      daysRemaining: row.days_remaining !== null ? parseInt(row.days_remaining, 10) : null,
      avatar: row.name ? row.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'EMP'
    }));

    const recruitmentSources = {
      sources: [],
      total: 0,
      unsupported: true,
      message: 'Recruitment sources are not tracked in current database schema'
    };

    res.json({
      success: true,
      data: {
        postings: postings.rows[0] || {},
        applications: appsData,
        approvals: approvals.rows[0] || {},
        applicationList: applicationList.rows || [],
        monthlyVelocity,
        pipeline,
        departmentHiring,
        recentHires,
        upcomingJoining,
        recruitmentSources
      }
    });
  } catch (error) {
    console.error('Get HR recruitment overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recruitment overview' });
  }
};

exports.getHRLeaveOverview = async (req, res) => {
  try {
    const summary = await query(`
      SELECT COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM leave_requests
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    res.json({ success: true, data: { summary: summary.rows[0] || {} } });
  } catch (error) {
    console.error('Get HR leave overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave overview' });
  }
};

exports.getHRPayrollSummary = async (req, res) => {
  try {
    const now = new Date();
    const queryObj = req.query || {};
    const month = parseInt(queryObj.month, 10) || now.getMonth() + 1;
    const year = parseInt(queryObj.year, 10) || now.getFullYear();

    const summary = await query(`
      SELECT COUNT(*) as processed_count,
        COALESCE(SUM(gross_salary), 0) as total_gross,
        COALESCE(SUM(net_salary), 0) as total_net,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid
      FROM payroll WHERE month = $1 AND year = $2
    `, [month, year]);

    res.json({ success: true, data: { month, year, summary: summary.rows[0] || {} } });
  } catch (error) {
    console.error('Get HR payroll summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll summary' });
  }
};

// ============================================================
// 6. REPORTS (Executive Reports Center)
// Tables: reports, scheduled_reports, report_activities
// ============================================================

async function getCurrentUserDisplayName(req) {
  try {
    const result = await query(
      `SELECT first_name, last_name FROM employees WHERE id = $1`,
      [req.user.id]
    );
    const row = result.rows[0];
    if (!row) return 'CEO';
    return `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'CEO';
  } catch (err) {
    return 'CEO';
  }
}

exports.getReportsOverview = async (req, res) => {
  try {
    const reportsResult = await query(`
      SELECT r.*, e.first_name, e.last_name
      FROM reports r
      LEFT JOIN employees e ON r.owner_id = e.id
      ORDER BY r.generated_at DESC
    `);
    const scheduledResult = await query(`
      SELECT s.*, e.first_name, e.last_name
      FROM scheduled_reports s
      LEFT JOIN employees e ON s.owner_id = e.id
      ORDER BY s.next_run ASC
    `);
    const activitiesResult = await query(`
      SELECT * FROM report_activities ORDER BY created_at DESC LIMIT 15
    `);

    const reports = reportsResult.rows;
    const totalReports = reports.length;
    const scheduledCount = scheduledResult.rows.filter((r) => r.status === 'active').length;
    const pendingCount = reports.filter((r) => r.status === 'Pending' || r.status === 'In Review').length;
    const sharedCount = reports.reduce((sum, r) => sum + (r.shared_count || 0), 0);

    const categoryCounts = {};
    reports.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    res.json({
      success: true,
      reports,
      scheduledReports: scheduledResult.rows,
      activities: activitiesResult.rows,
      kpis: { totalReports, scheduledCount, pendingCount, sharedCount },
      categoryCounts,
    });
  } catch (error) {
    console.error('Get reports overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports overview' });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { name, category, status, summary, highlights, analysis, insights } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'name and category are required' });
    }

    const result = await query(
      `INSERT INTO reports (name, category, status, owner_id, summary, highlights, analysis, insights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        category,
        status || 'Completed',
        req.user.id,
        summary || '',
        JSON.stringify(highlights || []),
        analysis || '',
        insights || ''
      ]
    );

    const displayName = await getCurrentUserDisplayName(req);
    await query(
      `INSERT INTO report_activities (type, user_name, action, status, report_id) VALUES ($1, $2, $3, 'completed', $4)`,
      ['document', displayName, `Generated ${name} report`, result.rows[0].id]
    );

    res.status(201).json({ success: true, report: result.rows[0] });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
};

exports.logReportActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, action } = req.body;

    const reportResult = await query(`SELECT * FROM reports WHERE id = $1`, [id]);
    if (!reportResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (type === 'download') {
      await query(`UPDATE reports SET download_count = download_count + 1 WHERE id = $1`, [id]);
    } else if (type === 'mail') {
      await query(`UPDATE reports SET shared_count = shared_count + 1 WHERE id = $1`, [id]);
    }

    const displayName = await getCurrentUserDisplayName(req);
    const activityResult = await query(
      `INSERT INTO report_activities (type, user_name, action, status, report_id)
       VALUES ($1, $2, $3, 'completed', $4) RETURNING *`,
      [type, displayName, action || `${type === 'download' ? 'Downloaded' : 'Shared'} report`, id]
    );

    res.status(201).json({ success: true, activity: activityResult.rows[0] });
  } catch (error) {
    console.error('Log report activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to log activity' });
  }
};

exports.createScheduledReport = async (req, res) => {
  try {
    const { title, cadence, frequency, next_run } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const result = await query(
      `INSERT INTO scheduled_reports (title, cadence, frequency, next_run, owner_id, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [title, cadence || '', frequency || 'Monthly', next_run || null, req.user.id]
    );

    res.status(201).json({ success: true, scheduledReport: result.rows[0] });
  } catch (error) {
    console.error('Create scheduled report error:', error);
    res.status(500).json({ success: false, message: 'Failed to create scheduled report' });
  }
};

exports.updateScheduledReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or paused.' });
    }

    const result = await query(
      `UPDATE scheduled_reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Scheduled report not found' });
    }

    res.json({ success: true, scheduledReport: result.rows[0] });
  } catch (error) {
    console.error('Update scheduled report status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update scheduled report' });
  }
};

exports.runNowScheduledReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportAutomationService = require('../services/reportAutomationService');
    const result = await reportAutomationService.executeScheduledReport(id, { isManual: true });
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.reason || 'Failed to execute scheduled report' });
    }
    return res.json(result);
  } catch (error) {
    console.error('Run now scheduled report error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to run scheduled report' });
  }
};

exports.getHROverview = async (req, res) => {
  try {
    // 1. Employee statistics
    const empStatsQuery = await query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active,
        COUNT(CASE WHEN status IN ('inactive', 'resigned', 'terminated') THEN 1 END)::int as inactive,
        COUNT(CASE WHEN join_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::int as new_hires_month,
        COUNT(CASE WHEN join_date = CURRENT_DATE THEN 1 END)::int as joined_today
      FROM employees
    `);
    const empStats = empStatsQuery.rows[0] || { total: 0, active: 0, inactive: 0, new_hires_month: 0, joined_today: 0 };
    const totalEmp = parseInt(empStats.total, 10) || 0;
    const inactiveEmp = parseInt(empStats.inactive, 10) || 0;
    const attritionRate = totalEmp > 0 ? Number(((inactiveEmp / totalEmp) * 100).toFixed(1)) : 0;
    const retentionRate = totalEmp > 0 ? Number((100 - attritionRate).toFixed(1)) : 100;
    const newHires = parseInt(empStats.new_hires_month, 10) || 0;

    // 2. High Performers
    const highPerformersQuery = await query(`
      SELECT COUNT(*)::int as count FROM performance_reviews WHERE overall_rating >= 4.0
    `);
    const highPerformersCount = parseInt(highPerformersQuery.rows[0]?.count, 10) || 0;

    // 3. Approvals
    const pendingApprovalsQuery = await query(`
      SELECT COUNT(*)::int as pending_count FROM executive_approvals WHERE status = 'Pending'
    `);
    const pendingApprovalsCount = parseInt(pendingApprovalsQuery.rows[0]?.pending_count, 10) || 0;

    const executiveRequestsQuery = await query(`
      SELECT id, title, department, requested_by as "requestedBy", amount, priority, status, category, created_at as "createdAt"
      FROM executive_approvals
      ORDER BY (CASE WHEN status = 'Pending' THEN 0 ELSE 1 END), created_at DESC
      LIMIT 10
    `);

    // 4. Departments
    const deptQuery = await query(`
      SELECT 
        d.id,
        d.name,
        d.budget,
        COUNT(e.id)::int as employees,
        COALESCE(COUNT(CASE WHEN jp.status = 'published' THEN 1 END), 0)::int as open_positions
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status != 'terminated'
      LEFT JOIN job_postings jp ON jp.department_id = d.id AND jp.status = 'published'
      GROUP BY d.id, d.name, d.budget
      ORDER BY d.name ASC
    `);

    const colorPalette = ['emerald', 'blue', 'purple', 'amber', 'rose', 'teal'];
    const departments = (deptQuery.rows || []).map((row, idx) => {
      const empCount = parseInt(row.employees, 10) || 0;
      const openPos = parseInt(row.open_positions, 10) || 0;
      const color = colorPalette[idx % colorPalette.length];
      const hiringStatus = openPos >= 5 ? 'Active' : openPos > 0 ? 'Slow' : 'Stable';
      return {
        id: row.id,
        name: row.name,
        employees: empCount,
        retention: 100,
        color: color,
        openPositions: openPos,
        promotions: 0,
        hiringStatus: hiringStatus
      };
    });

    // 5. HR Team members
    const hrTeamQuery = await query(`
      SELECT 
        e.id, 
        CONCAT(e.first_name, ' ', e.last_name) as name, 
        e.email, 
        e.phone, 
        e.role, 
        COALESCE(e.position, CASE WHEN e.role = 'admin' THEN 'HR Administrator' ELSE 'HR Specialist' END) as designation, 
        COALESCE(d.name, 'People & Culture') as department,
        COALESCE(e.status, 'Active') as status,
        e.join_date,
        e.profile_picture_url,
        e.preferences
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.role IN ('hr', 'admin') 
         OR d.name ILIKE '%Human Resources%' 
         OR d.name ILIKE '%People%'
         OR e.position ILIKE '%HR%'
         OR e.position ILIKE '%Recruit%'
         OR e.position ILIKE '%Talent%'
      ORDER BY (CASE WHEN e.role = 'admin' OR e.position ILIKE '%CHRO%' OR e.position ILIKE '%Director%' THEN 0 ELSE 1 END), e.created_at ASC
    `);

    const hrLeadershipTeam = (hrTeamQuery.rows || []).map((row, idx) => {
      const initials = (row.name || 'HR')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'HR';

      return {
        id: row.id,
        name: row.name || 'HR Professional',
        designation: row.designation || (row.role === 'admin' ? 'HR Administrator' : 'HR Specialist'),
        employeeId: `EMP-${row.id.slice(0, 4).toUpperCase()}`,
        experience: '1+ years',
        department: row.department || 'People & Culture',
        email: row.email,
        phone: row.phone || '+1 (555) 000-0000',
        location: row.preferences?.officeLocation || 'Main Office',
        status: row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1)) : 'Active',
        joinDate: row.join_date ? new Date(row.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        reportsTo: 'CEO',
        education: 'Professional Degree',
        certifications: [],
        skills: ['HR Management', 'Operations'],
        teamSize: 0,
        projects: [],
        performanceRating: 'N/A',
        recentActivities: [],
        avatar: initials,
      };
    });

    // 6. Recent HR Activities
    const activitiesQuery = await query(`
      SELECT 
        al.id::text as id,
        al.action,
        COALESCE(al.entity_type, 'activity') as entity_type,
        al.created_at,
        COALESCE(e.first_name || ' ' || e.last_name, 'System') as user_name
      FROM activity_logs al
      LEFT JOIN employees e ON al.employee_id = e.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    const recentActivities = (activitiesQuery.rows || []).map((row) => {
      const actionLower = (row.action || '').toLowerCase();
      const type = actionLower.includes('promot') ? 'promotion'
        : actionLower.includes('approv') ? 'approval'
        : actionLower.includes('resign') ? 'resignation'
        : actionLower.includes('interview') ? 'interview'
        : actionLower.includes('policy') ? 'policy'
        : 'default';

      const iconName = type === 'promotion' ? 'Award'
        : type === 'approval' ? 'CheckCheck'
        : type === 'resignation' ? 'UserMinus'
        : type === 'interview' ? 'UserPlus'
        : type === 'policy' ? 'FileText'
        : 'Activity';

      const diffMinutes = Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60000);
      const timeStr = diffMinutes < 60 ? `${Math.max(1, diffMinutes)} min ago`
        : diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)} hours ago`
        : `${Math.floor(diffMinutes / 1440)} days ago`;

      return {
        id: row.id,
        action: row.action || 'Activity Recorded',
        detail: `${row.user_name} performed ${row.action}`,
        time: timeStr,
        iconName: iconName,
        type: type
      };
    });

    // 7. Workforce split
    const remoteQuery = await query(`
      SELECT 
        COUNT(CASE WHEN preferences->>'work_mode' = 'remote' THEN 1 END)::int as remote_count,
        COUNT(*)::int as total
      FROM employees
    `);
    const rTotal = remoteQuery.rows[0]?.total || totalEmp;
    const rRemote = remoteQuery.rows[0]?.remote_count || 0;
    const remotePct = rTotal > 0 ? Math.round((rRemote / rTotal) * 100) : 0;
    const officePct = rTotal > 0 ? 100 - remotePct : 100;

    // 8. Dynamic Insights
    const insights = [
      {
        title: "Hiring Pipeline",
        description: `${newHires} new hire(s) recorded in the last 30 days.`,
        status: newHires > 0 ? "Active" : "Normal",
        tone: "emerald",
        iconName: "Target",
        route: "/ceo/hr/hiring-intelligence"
      },
      {
        title: "Attrition Monitor",
        description: `Current turnover rate is ${attritionRate}%.`,
        status: attritionRate > 10 ? "Alert" : "Stable",
        tone: attritionRate > 10 ? "rose" : "blue",
        iconName: "TrendingDown",
        route: "/ceo/hr/attrition-analytics"
      },
      {
        title: "Executive Approvals",
        description: `${pendingApprovalsCount} pending approval request(s) awaiting executive review.`,
        status: pendingApprovalsCount > 0 ? "Pending" : "Cleared",
        tone: pendingApprovalsCount > 0 ? "amber" : "emerald",
        iconName: "UserPlus",
        route: "/ceo/approvals"
      },
      {
        title: "Workforce Strength",
        description: `${totalEmp} total registered workforce members.`,
        status: totalEmp > 0 ? "Active" : "None",
        tone: "blue",
        iconName: "Heart",
        route: "/ceo/employees"
      },
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          totalEmployees: totalEmp,
          newHires: newHires,
          attritionRate: attritionRate,
          retentionRate: retentionRate,
          highPerformers: highPerformersCount,
          pendingApprovals: pendingApprovalsCount,
          employeeSatisfaction: 0,
          workforceCapacity: Math.min(100, Math.round((totalEmp / 100) * 100)),
          hiringTarget: 0,
          retentionHealth: retentionRate,
        },
        todaySummary: {
          employeesJoined: parseInt(empStats.joined_today, 10) || 0,
          promotionsCompleted: 0,
          resignationsReceived: 0,
          pendingApprovals: pendingApprovalsCount,
          hrHealthStatus: totalEmp > 0 ? (attritionRate < 10 ? "Optimal" : "Attention") : "Active",
        },
        insights,
        departments,
        workforce: {
          remotePercentage: remotePct,
          officePercentage: officePct
        },
        executiveRequests: executiveRequestsQuery.rows || [],
        hrLeadershipTeam,
        recentActivities,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get HR overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HR overview' });
  }
};

