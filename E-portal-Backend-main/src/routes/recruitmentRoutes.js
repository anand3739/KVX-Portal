const express = require('express');
const router = express.Router();
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
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
} = require('../controllers/recruitmentController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Recruitment routes working' });
});

// Statistics
router.get('/stats', authenticate, getRecruitmentStats);

// Job postings endpoints
router.get('/jobs', authenticate, getJobPostings);
router.get('/postings', authenticate, getJobPostings);
router.post('/jobs', authenticate, requirePermission('recruitment.create'), createJobPosting);
router.get('/jobs/:id', authenticate, getJobPostingById);
router.put('/jobs/:id', authenticate, requirePermission('recruitment.edit'), updateJobPosting);
router.patch('/jobs/:id/status', authenticate, requirePermission('recruitment.edit'), toggleJobPostingStatus);
router.delete('/jobs/:id', authenticate, requirePermission('recruitment.delete'), deleteJobPosting);

// Job application submissions
router.post('/jobs/:jobId/apply', submitApplication);
router.get('/jobs/:jobId/applications', authenticate, getJobApplicationsByJobId);

// Applications management endpoints
router.get('/applications', authenticate, getApplications);
router.get('/applications/:id', authenticate, getApplicationById);
router.put('/applications/:id/status', authenticate, requirePermission('recruitment.edit'), updateApplicationStatus);

// Interview management endpoints
router.get('/interviews', authenticate, getInterviews);
router.post('/interviews', authenticate, requirePermission('recruitment.create'), scheduleInterview);
router.post('/applications/:id/interview', authenticate, requirePermission('recruitment.create'), scheduleInterview);
router.put('/interviews/:id', authenticate, requirePermission('recruitment.edit'), updateInterview);
router.delete('/interviews/:id', authenticate, requirePermission('recruitment.delete'), deleteInterview);

module.exports = router;