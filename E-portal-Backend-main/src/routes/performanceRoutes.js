const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');

router.get('/employee/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (employeeId !== req.user.id && !['admin', 'hr', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const result = await query(
      `SELECT pr.*, CONCAT(reviewer.first_name, ' ', reviewer.last_name) AS reviewer_name
       FROM performance_reviews pr
       LEFT JOIN employees reviewer ON reviewer.id = pr.reviewer_id
       WHERE pr.employee_id = $1
       ORDER BY pr.review_date DESC, pr.created_at DESC`,
      [employeeId]
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;