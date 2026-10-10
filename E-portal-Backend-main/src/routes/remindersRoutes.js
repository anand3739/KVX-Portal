const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/remindersController');

router.get('/', authenticate, getReminders);
router.post('/', authenticate, createReminder);
router.put('/:id', authenticate, updateReminder);
router.delete('/:id', authenticate, deleteReminder);

module.exports = router;
