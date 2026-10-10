const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getBackups,
  runBackup,
  downloadBackup,
  deleteBackup
} = require('../controllers/backupController');

// All backup operations require authentication and admin/ceo role authorization
router.use(authenticate);
router.use(authorize('admin', 'ceo'));

router.get('/', getBackups);
router.post('/run', runBackup);
router.get('/:id/download', downloadBackup);
router.delete('/:id', deleteBackup);

module.exports = router;
