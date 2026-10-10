const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const {
  uploadDocument,
  getMyDocuments,
  getEmployeeDocuments,
  getDocumentById,
  downloadDocument,
  verifyDocument,
  deleteDocument,
  uploadProfilePhoto,
  toggleStarDocument
} = require('../controllers/documentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Document routes working' });
});

// Upload a generic document
router.post('/upload', authenticate, upload.single('file'), uploadDocument);

// Upload profile photo / banner
router.post('/upload-profile-photo', authenticate, upload.single('file'), uploadProfilePhoto);

// Get my documents
router.get('/my-documents', authenticate, getMyDocuments);

// Get documents of an employee (Self or Admin/HR)
router.get('/employee/:employeeId', authenticate, getEmployeeDocuments);

// Download document file
router.get('/:id/download', authenticate, downloadDocument);

// Toggle star status
router.patch('/:id/star', authenticate, toggleStarDocument);

// Verification endpoint (HR/Admin)
router.put('/:id/verify', authenticate, verifyDocument);

// Delete document (Self or Admin/HR)
router.delete('/:id', authenticate, deleteDocument);

// Get single document metadata (keep this AFTER parameterized routes to avoid matching /my-documents as :id)
router.get('/:id', authenticate, getDocumentById);

module.exports = router;
