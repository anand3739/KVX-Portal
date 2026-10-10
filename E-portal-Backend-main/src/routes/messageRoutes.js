const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getEmployees,
  getConversations,
  createDirectConversation,
  createGroupConversation,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  togglePin,
  toggleMute,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  uploadFile,
  getContacts,
  getConversation,
  getInbox,
  getUnreadCount
} = require('../controllers/messageController');

// All message routes require authentication
router.use(authenticate);

// Directory & Conversations
router.get('/employees', getEmployees);
router.get('/conversations', getConversations);
router.post('/conversations/direct', createDirectConversation);
router.post('/conversations/group', createGroupConversation);
router.put('/conversations/:id', updateGroup);
router.post('/conversations/:id/members', addGroupMember);
router.delete('/conversations/:id/members/:employeeId', removeGroupMember);
router.put('/conversations/:id/pin', togglePin);
router.put('/conversations/:id/mute', toggleMute);

// Messages inside a conversation
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

// Individual Message Actions
router.put('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/messages/:id/react', toggleReaction);

// Media Upload
router.post('/upload', upload.single('file'), uploadFile);

// Legacy routes for backwards compatibility
router.get('/contacts', getContacts);
router.get('/conversation/:contactId', getConversation);
router.post('/', sendMessage);
router.get('/inbox', getInbox);
router.get('/unread', getUnreadCount);

module.exports = router;