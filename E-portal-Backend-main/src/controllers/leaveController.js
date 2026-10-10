const { query } = require('../config/database');
const { createNotification } = require('../services/notificationService');

const defaultLeaveAllocations = {
  annual: 20,
  sick: 10,
  personal: 5,
  casual: 10,
  unpaid: 30,
  maternity: 90,
  paternity: 15,
  bereavement: 7
};

async function ensureLeaveBalances(employeeId, year) {
  for (const [type, days] of Object.entries(defaultLeaveAllocations)) {
    await query(
      `INSERT INTO leave_balance (employee_id, leave_type, total_days, used_days, pending_days, remaining_days, year)
       VALUES ($1, $2, $3, 0, 0, $3, $4)
       ON CONFLICT (employee_id, leave_type, year) DO NOTHING`,
      [employeeId, type, days, year]
    );
  }
}

const getLeaveBalance = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    await ensureLeaveBalances(req.user.id, year);

    const result = await query(
      'SELECT * FROM leave_balance WHERE employee_id = $1 AND year = $2 ORDER BY leave_type',
      [req.user.id, year]
    );

    // Format response to match the frontend expectations
    const balance = {};
    result.rows.forEach(row => {
      balance[row.leave_type] = {
        total: row.total_days,
        used: row.used_days,
        pending: row.pending_days,
        remaining: row.remaining_days
      };
    });

    res.json({
      success: true,
      balance
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const result = await query(
      `SELECT lr.*, 
              CONCAT(m.first_name, ' ', m.last_name) AS approved_by_name
       FROM leave_requests lr
       LEFT JOIN employees m ON m.id = lr.approved_by
       WHERE lr.employee_id = $1 
       ORDER BY lr.created_at DESC`,
      [req.user.id]
    );
    res.json({
      success: true,
      requests: result.rows
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    
    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedType = leave_type.toLowerCase().trim();
    const start = new Date(start_date);
    const end = new Date(end_date);
    const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (total_days <= 0) {
      return res.status(400).json({ message: 'End date must be on or after start date' });
    }

    const year = start.getFullYear();
    await ensureLeaveBalances(req.user.id, year);

    // Check balance
    let balanceRes = await query(
      'SELECT * FROM leave_balance WHERE employee_id = $1 AND leave_type = $2 AND year = $3',
      [req.user.id, normalizedType, year]
    );

    let balance = balanceRes.rows[0];
    if (!balance) {
      const defaultDays = defaultLeaveAllocations[normalizedType] || 10;
      await query(
        `INSERT INTO leave_balance (employee_id, leave_type, total_days, used_days, pending_days, remaining_days, year)
         VALUES ($1, $2, $3, 0, 0, $3, $4)
         ON CONFLICT (employee_id, leave_type, year) DO NOTHING`,
        [req.user.id, normalizedType, defaultDays, year]
      );
      balanceRes = await query(
        'SELECT * FROM leave_balance WHERE employee_id = $1 AND leave_type = $2 AND year = $3',
        [req.user.id, normalizedType, year]
      );
      balance = balanceRes.rows[0];
    }

    if (balance.remaining_days < total_days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${normalizedType} leave balance. Available: ${balance.remaining_days} day(s), Requested: ${total_days} day(s).`,
        remainingBalance: balance.remaining_days,
        requestedDays: total_days,
        leaveType: normalizedType
      });
    }

    // Insert request
    const requestResult = await query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [req.user.id, normalizedType, start_date, end_date, total_days, reason || '']
    );

    // Deduct remaining days and add to pending days safely
    await query(
      `UPDATE leave_balance 
       SET pending_days = pending_days + $1,
           remaining_days = GREATEST(0, total_days - used_days - (pending_days + $1)),
           updated_at = NOW()
       WHERE id = $2`,
      [total_days, balance.id]
    );

    res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      request: requestResult.rows[0]
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT lr.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_id,
             d.name as department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      sql += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY lr.created_at DESC`;

    const result = await query(sql, params);
    
    res.json({
      success: true,
      leaves: result.rows
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments, reason, rejection_reason } = req.body;
    const rejectReason = rejection_reason || reason || comments || '';

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get leave request
    const requestRes = await query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    const request = requestRes.rows[0];

    if (!request) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is already processed' });
    }

    // Update status
    await query(
      `UPDATE leave_requests 
       SET status = $1, approved_by = $2, approved_at = NOW(), comments = $3, updated_at = NOW()
       WHERE id = $4`,
      [status, req.user.id, rejectReason, id]
    );

    // Update leave balance
    const year = new Date(request.start_date).getFullYear();

    if (status === 'approved') {
      // Approve: Move from pending to used, calculate remaining_days consistently
      await query(
        `UPDATE leave_balance 
         SET pending_days = GREATEST(0, pending_days - $1),
             used_days = used_days + $1,
             remaining_days = GREATEST(0, total_days - (used_days + $1) - GREATEST(0, pending_days - $1)),
             updated_at = NOW()
         WHERE employee_id = $2 AND leave_type = $3 AND year = $4`,
        [request.total_days, request.employee_id, request.leave_type, year]
      );
    } else {
      // Reject: Return from pending to remaining consistently
      await query(
        `UPDATE leave_balance 
         SET pending_days = GREATEST(0, pending_days - $1),
             remaining_days = GREATEST(0, total_days - used_days - GREATEST(0, pending_days - $1)),
             updated_at = NOW()
         WHERE employee_id = $2 AND leave_type = $3 AND year = $4`,
        [request.total_days, request.employee_id, request.leave_type, year]
      );
    }

    // Create notification for employee
    try {
      const formattedStartDate = new Date(request.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const formattedEndDate = new Date(request.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const notifData = await createNotification({
        user_id: request.employee_id,
        type: 'leave',
        title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your request for ${request.leave_type} leave from ${formattedStartDate} to ${formattedEndDate} has been ${status}.`,
        link: '/employee/leave'
      });

      // Emit socket notification to employee room
      const io = req.app.get('io');
      if (io && request.employee_id) {
        io.to(`user_${request.employee_id}`).emit('notification', notifData);
        io.to(`user_${request.employee_id}`).emit('notification_received', notifData);
      }
    } catch (notifError) {
      console.error('Failed to create leave notification:', notifError);
    }

    res.json({
      success: true,
      message: `Leave request ${status} successfully`
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelLeave = async (req, res) => {
  try {
    const result = await query('SELECT * FROM leave_requests WHERE id=$1 AND employee_id=$2', [req.params.id, req.user.id]);
    const leave = result.rows[0];
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'pending') return res.status(409).json({ success: false, message: 'Only pending leave requests can be cancelled' });
    await query("UPDATE leave_requests SET status='cancelled', updated_at=NOW() WHERE id=$1", [leave.id]);
    await query(
      `UPDATE leave_balance 
       SET pending_days = GREATEST(0, pending_days - $1),
           remaining_days = GREATEST(0, total_days - used_days - GREATEST(0, pending_days - $1)),
           updated_at = NOW()
       WHERE employee_id = $2 AND leave_type = $3 AND year = $4`,
      [leave.total_days, leave.employee_id, leave.leave_type, new Date(leave.start_date).getFullYear()]
    );
    res.json({ success: true, data: { id: leave.id, status: 'cancelled' }, message: 'Leave request cancelled successfully' });
  } catch (error) { console.error('Cancel leave error:', error); res.status(500).json({ success: false, message: 'Unable to cancel leave request' }); }
};
const getEmployeeLeaveSummary = async (req, res) => {
  try {
    const id=req.params.employeeId;
    if (req.user.role === 'employee' && req.user.id !== id) return res.status(403).json({ success:false, message:'Access denied' });
    const [balance, requests] = await Promise.all([query('SELECT leave_type,total_days,used_days,pending_days,remaining_days,year FROM leave_balance WHERE employee_id=$1 AND year=$2 ORDER BY leave_type',[id,new Date().getFullYear()]),query('SELECT id,leave_type,start_date,end_date,total_days,status,reason,created_at FROM leave_requests WHERE employee_id=$1 ORDER BY created_at DESC',[id])]);
    res.json({ success:true, data:{ balance:balance.rows, requests:requests.rows } });
  } catch(error) { console.error('Employee leave summary error:',error); res.status(500).json({success:false,message:'Unable to retrieve leave summary'}); }
};

module.exports = {
  getLeaveBalance,
  getMyLeaves,
  applyLeave,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
  getEmployeeLeaveSummary
};
