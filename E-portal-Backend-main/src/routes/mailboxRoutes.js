const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const mailboxController = require('../controllers/mailboxController');

const sendMessageValidation = [
  body('recipient_id').notEmpty().withMessage('recipient_id is required'),
  body('subject').notEmpty().withMessage('subject is required'),
  body('content').notEmpty().withMessage('content is required')
];

const replyMessageValidation = [
  body('content').notEmpty().withMessage('content is required')
];

// All Mailbox routes use existing project authenticate middleware
router.get('/recipients', authenticate, mailboxController.getRecipients);
router.get('/inbox', authenticate, mailboxController.getInbox);
router.get('/sent', authenticate, mailboxController.getSent);
router.get('/starred', authenticate, mailboxController.getStarred);
router.get('/archived', authenticate, mailboxController.getArchived);
router.get('/unread-count', authenticate, mailboxController.getUnreadCount);
router.get('/trash', authenticate, mailboxController.getTrash);

const mailboxUpload = require('../middleware/mailboxUpload');

// Drafts endpoints MUST be placed before parameterized /:id routes
router.get('/drafts', authenticate, mailboxController.getDrafts);
router.get('/drafts/:id', authenticate, mailboxController.getDraft);
router.post('/drafts', authenticate, mailboxController.createDraft);
router.put('/drafts/:id', authenticate, mailboxController.updateDraft);
router.delete('/drafts/:id', authenticate, mailboxController.deleteDraft);

// Attachment Upload & Delete Endpoints
router.post('/attachments/upload', authenticate, (req, res, next) => {
  mailboxUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, mailboxController.uploadAttachment);

router.delete('/attachments', authenticate, mailboxController.deleteAttachment);

// Bulk operations MUST be placed before parameterized /:id routes
router.put('/bulk', authenticate, mailboxController.bulkAction);

router.get('/:id', authenticate, mailboxController.getMessage);

router.post('/', authenticate, sendMessageValidation, mailboxController.sendMessage);
router.post('/:id/reply', authenticate, replyMessageValidation, mailboxController.replyMessage);

router.put('/:id/star', authenticate, mailboxController.toggleStar);
router.put('/:id/archive', authenticate, mailboxController.archiveMessage);
router.put('/:id/read', authenticate, mailboxController.markRead);
router.delete('/:id', authenticate, mailboxController.deleteMessage);

module.exports = router;
