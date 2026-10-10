const { query } = require('../config/database');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getJobPostings = async (req, res) => {
  try {
    const result = await query(`
      SELECT jp.*,
             d.name as department_name,
             COUNT(ja.id)::int as application_count
      FROM job_postings jp
      LEFT JOIN departments d ON jp.department_id = d.id
      LEFT JOIN job_applications ja ON ja.job_id = jp.id
      GROUP BY jp.id, d.name
      ORDER BY jp.created_at DESC
    `);
    res.json({
      success: true,
      jobs: result.rows,
      data: result.rows
    });
  } catch (error) {
    console.error('Get job postings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getJobPostingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT jp.*, d.name as department_name
       FROM job_postings jp
       LEFT JOIN departments d ON jp.department_id = d.id
       WHERE jp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({
      success: true,
      job: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get job posting by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createJobPosting = async (req, res) => {
  try {
    const { title, department_id, location, employment_type, description, salary_min, salary_max, openings, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Job title is required' });
    }

    const safeDeptId = department_id && uuidRegex.test(department_id) ? department_id : null;
    const safeCreatedBy = req.user && uuidRegex.test(req.user.id) ? req.user.id : null;

    const result = await query(
      `INSERT INTO job_postings (title, department_id, location, employment_type, description, salary_min, salary_max, openings, status, created_by, published_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
       RETURNING *`,
      [
        title,
        safeDeptId,
        location || 'Remote',
        employment_type || 'Full-time',
        description || '',
        salary_min || null,
        salary_max || null,
        openings || 1,
        status || 'published',
        safeCreatedBy
      ]
    );

    res.status(201).json({
      success: true,
      job: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create job posting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department_id, location, employment_type, description, salary_min, salary_max, openings, status } = req.body;

    const safeDeptId = department_id && uuidRegex.test(department_id) ? department_id : null;

    const result = await query(
      `UPDATE job_postings
       SET title = COALESCE($1, title),
           department_id = COALESCE($2, department_id),
           location = COALESCE($3, location),
           employment_type = COALESCE($4, employment_type),
           description = COALESCE($5, description),
           salary_min = COALESCE($6, salary_min),
           salary_max = COALESCE($7, salary_max),
           openings = COALESCE($8, openings),
           status = COALESCE($9, status),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title || null,
        safeDeptId,
        location || null,
        employment_type || null,
        description || null,
        salary_min || null,
        salary_max || null,
        openings || null,
        status || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({
      success: true,
      job: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update job posting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleJobPostingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const newStatus = status || 'closed';
    const result = await query(
      `UPDATE job_postings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({
      success: true,
      message: `Job posting status updated to ${newStatus}`,
      job: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM job_postings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job posting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { first_name, last_name, email, phone, resume_url, cover_letter, experience_years, current_company } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const result = await query(
      `INSERT INTO job_applications (job_id, first_name, last_name, email, phone, resume_url, cover_letter, experience_years, current_company, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'applied')
       RETURNING *`,
      [jobId, first_name, last_name, email, phone || null, resume_url || null, cover_letter || null, experience_years || null, current_company || null]
    );

    res.status(201).json({
      success: true,
      application: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getJobApplicationsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await query(
      `SELECT ja.*, jp.title as job_title
       FROM job_applications ja
       JOIN job_postings jp ON ja.job_id = jp.id
       WHERE ja.job_id = $1
       ORDER BY ja.created_at DESC`,
      [jobId]
    );

    res.json({
      success: true,
      applications: result.rows,
      data: result.rows
    });
  } catch (error) {
    console.error('Get job applications by job id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApplications = async (req, res) => {
  try {
    const result = await query(`
      SELECT ja.*,
             jp.title as job_title,
             jp.location as job_location
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_id = jp.id
      ORDER BY ja.created_at DESC
    `);

    res.json({
      success: true,
      applications: result.rows,
      data: result.rows
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT ja.*, jp.title as job_title, jp.location as job_location
       FROM job_applications ja
       JOIN job_postings jp ON ja.job_id = jp.id
       WHERE ja.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      success: true,
      application: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get application by id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rating, feedback } = req.body;

    const result = await query(
      `UPDATE job_applications
       SET status = COALESCE($1, status),
           rating = COALESCE($2, rating),
           feedback = COALESCE($3, feedback),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status || null, rating || null, feedback || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      success: true,
      application: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* --- Interview Management Controllers --- */
const getInterviews = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*,
             ja.first_name, ja.last_name, ja.email as candidate_email, ja.phone as candidate_phone,
             jp.title as job_title
      FROM interviews i
      LEFT JOIN job_applications ja ON i.application_id = ja.id
      LEFT JOIN job_postings jp ON i.job_id = jp.id
      ORDER BY i.interview_date ASC
    `);

    res.json({
      success: true,
      interviews: result.rows,
      data: result.rows
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, interview_date, time, type, interviewer_name, meeting_link, feedback } = req.body;
    const appId = req.params.id || applicationId;

    if (!appId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    // Fetch application details
    const appRes = await query('SELECT ja.*, jp.title as job_title FROM job_applications ja JOIN job_postings jp ON ja.job_id = jp.id WHERE ja.id = $1', [appId]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = appRes.rows[0];
    const candidateName = `${app.first_name} ${app.last_name}`;
    const dateVal = interview_date || new Date();

    // Insert into interviews table
    const result = await query(
      `INSERT INTO interviews (application_id, job_id, candidate_name, candidate_email, job_title, interview_date, interview_time, interview_type, interviewer_name, meeting_link, status, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', $11)
       RETURNING *`,
      [
        app.id,
        app.job_id,
        candidateName,
        app.email,
        app.job_title,
        dateVal,
        time || '10:00 AM',
        type || 'Technical',
        interviewer_name || 'HR Manager',
        meeting_link || null,
        feedback || null
      ]
    );

    // Update job application status to 'interviewed'
    await query(
      `UPDATE job_applications SET status = 'interviewed', interview_date = $1, updated_at = NOW() WHERE id = $2`,
      [dateVal, app.id]
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_date, time, type, interviewer_name, status, feedback } = req.body;

    const result = await query(
      `UPDATE interviews
       SET interview_date = COALESCE($1, interview_date),
           interview_time = COALESCE($2, interview_time),
           interview_type = COALESCE($3, interview_type),
           interviewer_name = COALESCE($4, interviewer_name),
           status = COALESCE($5, status),
           feedback = COALESCE($6, feedback),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [interview_date || null, time || null, type || null, interviewer_name || null, status || null, feedback || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      interview: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM interviews WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRecruitmentStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM job_postings) as total_jobs,
        (SELECT COUNT(*) FROM job_postings WHERE status IN ('published', 'active')) as active_jobs,
        (SELECT COUNT(*) FROM job_applications) as total_applications,
        (SELECT COUNT(*) FROM job_applications WHERE status = 'hired') as hired_count,
        (SELECT COUNT(*) FROM job_applications WHERE status = 'rejected') as rejected_count,
        (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled') as interviews_scheduled
    `);

    const stats = statsResult.rows[0];

    const parsedStats = {
      total_jobs: parseInt(stats.total_jobs) || 0,
      active_jobs: parseInt(stats.active_jobs) || 0,
      total_applications: parseInt(stats.total_applications) || 0,
      hired_count: parseInt(stats.hired_count) || 0,
      rejected_count: parseInt(stats.rejected_count) || 0,
      interviews_scheduled: parseInt(stats.interviews_scheduled) || 0,
      totalJobs: parseInt(stats.total_jobs) || 0,
      activeJobs: parseInt(stats.active_jobs) || 0,
      totalApplications: parseInt(stats.total_applications) || 0,
      hiredCount: parseInt(stats.hired_count) || 0,
      rejectedCount: parseInt(stats.rejected_count) || 0,
      interviewsScheduled: parseInt(stats.interviews_scheduled) || 0
    };

    res.json({
      success: true,
      stats: parsedStats,
      data: parsedStats
    });
  } catch (error) {
    console.error('Get recruitment stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  toggleJobPostingStatus,
  deleteJobPosting,
  submitApplication,
  getJobApplicationsByJobId,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getInterviews,
  scheduleInterview,
  updateInterview,
  deleteInterview,
  getRecruitmentStats
};
