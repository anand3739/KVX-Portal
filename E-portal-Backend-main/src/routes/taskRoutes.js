const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  deleteComment,
  addWorkNote,
  uploadAttachment,
  getTaskStats,
  getTasksByStatus
} = require('../controllers/taskController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Task routes working' });
});

// Task list & statistics endpoints
router.get('/', authenticate, getAllTasks);
router.get('/my-tasks', authenticate, getMyTasks);
router.get('/all', authenticate, getAllTasks);
router.get('/stats', authenticate, getTaskStats);
router.get('/status/:status', authenticate, getTasksByStatus);

// Individual task CRUD & actions
router.get('/:id', authenticate, getTaskById);
router.post('/create', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.delete('/:id', authenticate, deleteTask);

// Task comments, work notes, and attachments
router.post('/:taskId/comments', authenticate, addComment);
router.delete('/:taskId/comments/:commentId', authenticate, deleteComment);
router.post('/:taskId/work-notes', authenticate, addWorkNote);
router.post('/:taskId/attachments', authenticate, upload.single('file'), uploadAttachment);

module.exports = router;