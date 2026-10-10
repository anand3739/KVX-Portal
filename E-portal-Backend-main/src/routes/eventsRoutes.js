const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const eventsController = require('../controllers/eventsController');

const router = express.Router();

const eventFields = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional({ nullable: true }).trim(),
  body('type').optional().trim().isLength({ max: 100 }),
  body('start_date').optional().isISO8601(),
  body('end_date').optional({ nullable: true }).isISO8601(),
  body('start_time').optional({ nullable: true }).trim(),
  body('end_time').optional({ nullable: true }).trim(),
  body('location').optional({ nullable: true }).trim().isLength({ max: 255 }),
  body('meeting_link').optional({ nullable: true }).trim(),
  body('organizer_name').optional({ nullable: true }).trim().isLength({ max: 255 }),
  body('audience_type').optional().trim().isLength({ max: 100 }),
  body('target_users').optional().isArray(),
  body('target_departments').optional().isArray(),
  body('status').optional().trim().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
  body('attendees').optional().isArray()
];

// Specific GET routes MUST come before parameterized /:id routes
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 255 }),
  query('type').optional().trim(),
  query('audience').optional().trim(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], eventsController.listEvents);

router.get('/upcoming', authenticate, eventsController.getUpcomingEvents);
router.get('/today', authenticate, eventsController.getTodayEvents);
router.get('/dashboard', authenticate, eventsController.getDashboard);
router.get('/invitations', authenticate, eventsController.getInvitations);

router.post('/invitations/:invitationId/respond', authenticate, [
  param('invitationId').isUUID(),
  body('status').trim().isIn(['accept', 'decline', 'maybe'])
], eventsController.respondToInvitation);

router.post('/:eventId/reminder', authenticate, [
  param('eventId').isUUID(),
  body('reminder').isISO8601()
], eventsController.scheduleReminder);

router.get('/:id', authenticate, param('id').isUUID(), eventsController.getEventById);

router.post('/', authenticate, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('start_date').isISO8601(),
  ...eventFields
], eventsController.createEvent);

router.put('/:id', authenticate, [
  param('id').isUUID(),
  ...eventFields
], eventsController.updateEvent);

router.post('/:id/cancel', authenticate, param('id').isUUID(), eventsController.cancelEvent);

router.delete('/:id', authenticate, param('id').isUUID(), eventsController.deleteEvent);

module.exports = router;
