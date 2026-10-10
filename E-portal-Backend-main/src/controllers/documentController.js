const { query, transaction } = require('../config/database');
const { uploadFile, deleteFile } = require('../services/fileService');
const { createNotification } = require('../services/notificationService');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs-extra');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { category, is_confidential = false } = req.body;
    const employeeId = req.body.employee_id || req.user.id;

    // Check if employee exists
    const employee = await query('SELECT id FROM employees WHERE id = $1', [employeeId]);
    if (!employee.rows[0]) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Upload file to storage
    const fileData = await uploadFile(req.file, `documents/${employeeId}`);

    // Create document record
    const extName = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const docType = extName || req.file.mimetype.split('/')[1] || 'file';
    const cleanCategory = (category || 'general').toLowerCase();

    const result = await query(
      `INSERT INTO documents (
        employee_id, document_name, document_type, category, file_url,
        file_size, mime_type, is_confidential, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        employeeId,
        req.file.originalname,
        docType,
        cleanCategory,
        fileData.url,
        req.file.size,
        req.file.mimetype,
        is_confidential === 'true' || is_confidential === true,
        'pending',
        req.user.id
      ]
    );

    // Notify HR if document needs verification
    if (cleanCategory !== 'payslip') {
      const hrUsers = await query(
        'SELECT id FROM employees WHERE role = $1',
        ['hr']
      );

      for (const hr of hrUsers.rows) {
        await createNotification({
          user_id: hr.id,
          type: 'info',
          title: 'Document Pending Verification',
          message: `New document uploaded by ${req.user.first_name || 'User'} ${req.user.last_name || ''}`,
          link: `/hr/documents/${result.rows[0].id}`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM documents 
       WHERE employee_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Group by category
    const grouped = {
      'id-proof': [],
      'address-proof': [],
      'education': [],
      'certification': [],
      'contract': [],
      'payslip': [],
      'onboarding': [],
      'other': []
    };

    result.rows.forEach(doc => {
      if (grouped[doc.category]) {
        grouped[doc.category].push(doc);
      } else {
        grouped.other.push(doc);
      }
    });

    res.json({
      documents: result.rows,
      grouped
    });
  } catch (error) {
    console.error('Get my documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user has access
    if (req.user.role === 'employee' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let sql = `
      SELECT d.*, 
             CONCAT(e.first_name, ' ', e.last_name) as uploaded_by_name,
             CONCAT(v.first_name, ' ', v.last_name) as verified_by_name
      FROM documents d
      LEFT JOIN employees e ON d.created_by = e.id
      LEFT JOIN employees v ON d.verified_by = v.id
      WHERE d.employee_id = $1
    `;

    // Confidential documents only for HR/Admin
    if (req.user.role === 'employee') {
      sql += ` AND d.is_confidential = false`;
    }

    sql += ` ORDER BY d.created_at DESC`;

    const result = await query(sql, [employeeId]);

    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Get employee documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get document info
    const document = await query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!document.rows[0]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update document
    const result = await query(
      `UPDATE documents 
       SET status = $1, comments = $2, verified_by = $3, verified_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, comments, req.user.id, id]
    );

    // Notify employee
    await createNotification({
      user_id: document.rows[0].employee_id,
      type: status === 'verified' ? 'success' : 'warning',
      title: `Document ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      message: `Your document "${document.rows[0].document_name}" has been ${status}`,
      link: '/employee/documents'
    });

    res.json({
      message: `Document ${status} successfully`,
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info
    const document = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (!document.rows[0]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permission
    if (req.user.role === 'employee' && document.rows[0].employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete from storage
    if (document.rows[0].file_url) {
      await deleteFile(document.rows[0].file_url);
    }

    // Delete record
    await query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { category } = req.body; // 'profile' or 'banner'
    const employeeId = req.user.id;

    // Upload file
    const fileData = await uploadFile(req.file, `profiles/${employeeId}`);

    // Update employee table
    let queryStr;
    if (category === 'banner') {
      queryStr = 'UPDATE employees SET cover_picture_url = $1, updated_at = NOW() WHERE id = $2 RETURNING cover_picture_url';
    } else {
      queryStr = 'UPDATE employees SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_picture_url';
    }

    const result = await query(queryStr, [fileData.url, employeeId]);

    res.status(200).json({
      message: 'Photo uploaded successfully',
      url: fileData.url,
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      success: true,
      document: result.rows[0],
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get document by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const doc = result.rows[0];
    const relativePath = doc.file_url ? doc.file_url.replace(/^\//, '') : '';
    const filePath = path.join(__dirname, '../..', relativePath);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.document_name}"`);
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ message: 'File not found on server filesystem' });
    }
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleStarDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find document
    const docCheck = await query('SELECT * FROM documents WHERE id = $1', [id]);
    if (!docCheck.rows[0]) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const doc = docCheck.rows[0];

    // Check permission: employee can star their own document or admin/hr
    if (req.user.role === 'employee' && doc.employee_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const newStarred = !doc.is_starred;
    const updateRes = await query(
      `UPDATE documents SET is_starred = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStarred, id]
    );

    res.json({
      success: true,
      message: newStarred ? 'Document starred' : 'Document unstarred',
      document: updateRes.rows[0],
      data: updateRes.rows[0]
    });
  } catch (error) {
    console.error('Toggle star document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getEmployeeDocuments,
  getDocumentById,
  downloadDocument,
  verifyDocument,
  deleteDocument,
  uploadProfilePhoto,
  toggleStarDocument
};