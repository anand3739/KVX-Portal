const { query, transaction } = require('../config/database');
const moment = require('moment');
const { validationResult } = require('express-validator');

// Business timezone offset for KRAVIX Enterprise (Asia/Kolkata IST +05:30)
const COMPANY_TZ_OFFSET = '+05:30';

const clockIn = async (req, res) => {
  try {
    // Identity comes strictly from verified JWT token. Ignore client body employee_id/timestamps.
    const employeeId = req.user.id;
    const now = moment().utcOffset(COMPANY_TZ_OFFSET);
    const today = now.format('YYYY-MM-DD');
    const serverNowDate = now.toDate();

    // Strict Company Working Window Validation (09:00:00 AM through 05:00:00 PM IST)
    const companyStart = now.clone().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
    const companyEnd = now.clone().set({ hour: 17, minute: 0, second: 0, millisecond: 0 });

    if (now.isBefore(companyStart) || now.isAfter(companyEnd)) {
      return res.status(400).json({
        message: 'Check-in is only permitted between 09:00 AM and 05:00 PM IST.'
      });
    }

    // Determine status based on expected start time (after 09:15 AM IST is late)
    let status = 'present';
    const lateThreshold = now.clone().set({ hour: 9, minute: 15, second: 0, millisecond: 0 });

    if (now.isAfter(lateThreshold)) {
      status = 'late';
    }

    const ipAddress = req.ip || req.connection.remoteAddress;

    // Wrap check-in database operations in atomic transaction
    const resultRecord = await transaction(async (client) => {
      // 1. Check if already clocked in today
      const existing = await client.query(
        'SELECT id, login_time, is_checked_in FROM attendance WHERE employee_id = $1 AND date::date = $2::date',
        [employeeId, today]
      );

      if (existing.rows[0] && (existing.rows[0].is_checked_in || existing.rows[0].login_time)) {
        const err = new Error('Already clocked in today');
        err.statusCode = 400;
        throw err;
      }

      let record;
      if (existing.rows[0]) {
        // Record exists but wasn't clocked in
        const updateRes = await client.query(
          `UPDATE attendance 
           SET login_time = $1, is_checked_in = true, status = $2, ip_address = $3, device_info = $4, location = $5, updated_at = NOW()
           WHERE id = $6
           RETURNING *`,
          [
            serverNowDate,
            status,
            ipAddress,
            req.headers['user-agent'],
            req.body.location || 'Office',
            existing.rows[0].id
          ]
        );
        record = updateRes.rows[0];
      } else {
        // New attendance record for today
        const insertRes = await client.query(
          `INSERT INTO attendance 
           (employee_id, date, login_time, is_checked_in, status, ip_address, device_info, location)
           VALUES ($1, $2, $3, true, $4, $5, $6, $7)
           RETURNING *`,
          [
            employeeId,
            today,
            serverNowDate,
            status,
            ipAddress,
            req.headers['user-agent'],
            req.body.location || 'Office'
          ]
        );
        record = insertRes.rows[0];
      }

      // 2. Create initial active attendance interval in attendance_intervals table
      await client.query(
        `INSERT INTO attendance_intervals (attendance_id, employee_id, start_time, type)
         VALUES ($1, $2, $3, 'active')`,
        [record.id, employeeId, serverNowDate]
      );

      return record;
    });

    res.json({
      message: 'Clocked in successfully',
      attendance: resultRecord
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const clockOut = async (req, res) => {
  try {
    // Identity comes strictly from verified JWT token. Ignore client body timestamps/user_id.
    const employeeId = req.user.id;
    const now = moment().utcOffset(COMPANY_TZ_OFFSET);
    const today = now.format('YYYY-MM-DD');

    // Strict Company Working Window Validation (Check-out before 09:00 AM IST is rejected)
    const companyStart = now.clone().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
    const companyEnd = now.clone().set({ hour: 17, minute: 0, second: 0, millisecond: 0 });

    if (now.isBefore(companyStart)) {
      return res.status(400).json({
        message: 'Check-out is only permitted after 09:00 AM IST.'
      });
    }

    // Clamp check-out timestamp to companyEnd (05:00 PM IST) if checked out after 05:00 PM IST
    const clampedLogoutMoment = now.isAfter(companyEnd) ? companyEnd : now;
    const clampedLogoutDate = clampedLogoutMoment.toDate();

    // Wrap check-out database operations in atomic transaction
    const resultRecord = await transaction(async (client) => {
      // 1. Get today's attendance record
      const attendanceRes = await client.query(
        'SELECT * FROM attendance WHERE employee_id = $1 AND date::date = $2::date FOR UPDATE',
        [employeeId, today]
      );

      const attendance = attendanceRes.rows[0];

      if (!attendance) {
        const err = new Error('No clock-in found for today');
        err.statusCode = 400;
        throw err;
      }

      if (!attendance.is_checked_in && attendance.logout_time) {
        const err = new Error('Already clocked out today');
        err.statusCode = 400;
        throw err;
      }

      // 2. Close any open attendance interval using clamped check-out time
      await client.query(
        `UPDATE attendance_intervals 
         SET end_time = $1, 
             duration_minutes = ROUND(EXTRACT(EPOCH FROM ($1 - start_time)) / 60.0),
             updated_at = NOW()
         WHERE attendance_id = $2 AND end_time IS NULL`,
        [clampedLogoutDate, attendance.id]
      );

      // 3. Calculate Bounded Working Hours (09:00 AM -> 17:00 PM Asia/Kolkata company window)
      const checkInMoment = moment(attendance.login_time).utcOffset(COMPANY_TZ_OFFSET);
      const checkOutMoment = clampedLogoutMoment.clone();

      // Explicit company working bounds in Asia/Kolkata business timezone
      const compStart = checkInMoment.clone().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
      const compEnd = checkInMoment.clone().set({ hour: 17, minute: 0, second: 0, millisecond: 0 });

      const effectiveStart = checkInMoment.isBefore(compStart) ? compStart : checkInMoment;
      const effectiveEnd = checkOutMoment.isAfter(compEnd) ? compEnd : checkOutMoment;

      let grossMinutes = 0;
      if (effectiveEnd.isAfter(effectiveStart)) {
        grossMinutes = effectiveEnd.diff(effectiveStart, 'minutes', true);
      }

      // 4. Sum qualifying inactive intervals within effective window
      const inactiveIntervalsRes = await client.query(
        `SELECT start_time, end_time FROM attendance_intervals 
         WHERE attendance_id = $1 AND type = 'inactive'`,
        [attendance.id]
      );

      let qualifyingInactiveMinutes = 0;
      (inactiveIntervalsRes.rows || []).forEach(interval => {
        const iStart = moment(interval.start_time).utcOffset(COMPANY_TZ_OFFSET);
        const iEnd = interval.end_time ? moment(interval.end_time).utcOffset(COMPANY_TZ_OFFSET) : clampedLogoutMoment;

        const overlapStart = iStart.isBefore(effectiveStart) ? effectiveStart : iStart;
        const overlapEnd = iEnd.isAfter(effectiveEnd) ? effectiveEnd : iEnd;

        if (overlapEnd.isAfter(overlapStart)) {
          qualifyingInactiveMinutes += overlapEnd.diff(overlapStart, 'minutes', true);
        }
      });

      const netMinutes = Math.max(0, grossMinutes - qualifyingInactiveMinutes);
      const netHours = Math.min(8.00, Number((netMinutes / 60.0).toFixed(2)));

      // Legacy wall-clock total hours and overtime for backward compatibility (capped at company window)
      const rawTotalHours = Math.min(8.00, Number(checkOutMoment.diff(checkInMoment, 'hours', true).toFixed(2)));
      const overtimeHours = 0.00;

      // 5. Update attendance row with final computed metrics
      const updateRes = await client.query(
        `UPDATE attendance 
         SET logout_time = $1,
             effective_start = $2,
             effective_end = $3,
             inactive_minutes = $4,
             net_hours = $5,
             total_hours = $6,
             overtime_hours = $7,
             is_checked_in = false,
             updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          clampedLogoutDate,
          effectiveStart.toDate(),
          effectiveEnd.toDate(),
          Math.round(qualifyingInactiveMinutes),
          netHours,
          rawTotalHours.toFixed(2),
          overtimeHours.toFixed(2),
          attendance.id
        ]
      );

      return updateRes.rows[0];
    });

    res.json({
      message: 'Clocked out successfully',
      attendance: resultRecord
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');

    const result = await query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date::date = $2::date',
      [req.user.id, today]
    );

    res.json({ attendance: result.rows[0] || null });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecordCreditedHours = (record) => {
  if (!record) return 0;
  const net = parseFloat(record.net_hours || 0);
  const total = parseFloat(record.total_hours || 0);

  if (net > 0) return net;
  if (record.effective_start !== undefined && record.effective_start !== null) {
    return net;
  }
  return total;
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.params;
    const employeeId = req.params.employeeId || req.user.id;

    // Role-based access control
    if (employeeId !== req.user.id && !['admin', 'hr', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const formattedMonth = String(month).padStart(2, '0');
    const startDate = moment(`${year}-${formattedMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    const endDate = moment(startDate, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');

    const result = await query(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 
       AND date::date BETWEEN $2::date AND $3::date
       ORDER BY date DESC`,
      [employeeId, startDate, endDate]
    );

    // Calculate summary - matches frontend's computeAttendanceStats
    const summary = {
      total: result.rows.length,
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      wfh: 0,
      onLeave: 0,
      totalHours: 0,
      overtimeHours: 0
    };

    result.rows.forEach(record => {
      const status = (record.status || '').toString().trim().toLowerCase().replace(/\s+/g, '-');

      switch (status) {
        case 'present':
          summary.present++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
        case 'wfh':
          summary.wfh++;
          break;
        case 'on-leave':
        case 'leave':
          summary.onLeave++;
          break;
        default:
          summary.absent++;
      }

      summary.totalHours += getRecordCreditedHours(record);
      summary.overtimeHours += parseFloat(record.overtime_hours || 0);
    });

    res.json({
      attendance: result.rows,
      summary
    });
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceReport = async (req, res) => {
  console.log('VERSION CHECK: v2 - normalization active');
  console.log('🔥🔥🔥 getAttendanceReport HIT — query:', req.query);

  try {
    const targetDate = req.query.startDate || req.query.date || moment().format('YYYY-MM-DD');
    const endDate = req.query.endDate || targetDate;
    const departmentId = req.query.departmentId;

    let sql = `
      SELECT 
        e.id as employee_id,
        e.employee_id as emp_code,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.first_name,
        e.last_name,
        e.position,
        e.department_id,
        d.name as department_name,
        a.id as id,
        a.date,
        a.login_time,
        a.logout_time,
        a.effective_start,
        a.effective_end,
        a.inactive_minutes,
        a.net_hours,
        a.is_checked_in,
        a.total_hours,
        a.overtime_hours,
        a.late_minutes,
        a.notes,
        lr.id as leave_request_id,
        lr.leave_type,
        CASE
          WHEN a.status IS NOT NULL THEN a.status
          WHEN lr.id IS NOT NULL THEN 'on-leave'
          ELSE 'absent'
        END as status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND (a.date::date BETWEEN $1::date AND $2::date)
      LEFT JOIN leave_requests lr ON e.id = lr.employee_id 
           AND lr.status = 'approved' 
           AND ($1::date BETWEEN lr.start_date::date AND lr.end_date::date 
               OR $2::date BETWEEN lr.start_date::date AND lr.end_date::date)
      WHERE e.status IN ('active', 'probation')
    `;

    const params = [targetDate, endDate];
    let paramIndex = 3;

    if (departmentId && departmentId !== 'all') {
      sql += ` AND e.department_id = $${paramIndex}`;
      params.push(departmentId);
    }

    sql += ` ORDER BY e.first_name ASC`;

    const result = await query(sql, params);

    // Calculate aggregated stats
    const totalEmployees = result.rows.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let onLeave = 0;
    let overtime = 0;

    const departmentSummary = {};

    result.rows.forEach(record => {
      const dept = record.department_name || 'Unassigned';
      if (!departmentSummary[dept]) {
        departmentSummary[dept] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          rate: 0
        };
      }
      departmentSummary[dept].total++;

      // Normalize: trim whitespace, lowercase, and collapse spaces to hyphens
      const st = (record.status || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      if (['present', 'late', 'wfh', 'half-day'].includes(st)) {
        present++;
        departmentSummary[dept].present++;
      } else if (st === 'on-leave' || st === 'leave') {
        onLeave++;
        departmentSummary[dept].onLeave++;
      } else {
        absent++;
        departmentSummary[dept].absent++;
      }

      if (st === 'late') {
        late++;
        departmentSummary[dept].late++;
      }

      if (parseFloat(record.overtime_hours || 0) > 0 || parseFloat(record.net_hours ?? record.total_hours ?? 0) > 8) {
        overtime++;
      }
    });

    // Compute department rates
    Object.keys(departmentSummary).forEach(dept => {
      const d = departmentSummary[dept];
      d.rate = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
    });

    const activeTotal = present + absent;
    const attendanceRate = activeTotal > 0
      ? Math.round((present / activeTotal) * 100)
      : (totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0);

    const stats = {
      totalEmployees,
      present,
      absent,
      late,
      onLeave,
      overtime,
      attendanceRate
    };

    console.log('📊 STATS COMPUTED:', JSON.stringify(stats));

    res.json({
      success: true,
      attendance: result.rows,
      data: result.rows,
      stats,
      departmentSummary
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAttendanceStats = async (req, res) => {
  // This is an alias for getAttendanceReport to maintain backward compatibility
  return getAttendanceReport(req, res);
};

const getWeeklyAttendance = async (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.params.employeeId || req.user.id;

    // Role-based access check if querying another employee
    if (employeeId !== req.user.id && !['admin', 'hr', 'ceo'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const targetDate = req.query.date ? moment(req.query.date) : moment();
    // ISO week: Monday start, Sunday end
    const weekStart = targetDate.clone().startOf('isoWeek').format('YYYY-MM-DD');
    const weekEnd = targetDate.clone().endOf('isoWeek').format('YYYY-MM-DD');

    // 1. Fetch attendance records for the week
    const attendanceRes = await query(
      `SELECT * FROM attendance 
       WHERE employee_id = $1 
       AND date::date BETWEEN $2::date AND $3::date
       ORDER BY date ASC`,
      [employeeId, weekStart, weekEnd]
    );

    // 2. Fetch approved leave requests overlapping this week
    const leaveRes = await query(
      `SELECT * FROM leave_requests
       WHERE employee_id = $1
       AND status = 'approved'
       AND (start_date::date <= $3::date AND end_date::date >= $2::date)`,
      [employeeId, weekStart, weekEnd]
    );

    const attendanceRecords = attendanceRes.rows || [];
    const leaveRecords = leaveRes.rows || [];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyBreakdown = [];

    let actualWorkedHours = 0;
    let weekdayWorkedHours = 0;
    let weekendWorkedHours = 0;
    let approvedLeaveDays = 0;

    const startDateMoment = moment(weekStart, 'YYYY-MM-DD');

    for (let i = 0; i < 7; i++) {
      const currentDayMoment = startDateMoment.clone().add(i, 'days');
      const dateStr = currentDayMoment.format('YYYY-MM-DD');
      const dayName = daysOfWeek[i];
      const isWeekend = (i === 5 || i === 6); // Sat or Sun
      const isFuture = currentDayMoment.isAfter(moment(), 'day');

      // Find attendance record for date
      const attRecord = attendanceRecords.find(r => moment(r.date).format('YYYY-MM-DD') === dateStr);

      // Find approved leave record for date
      const leaveRecord = leaveRecords.find(l => {
        const lStart = moment(l.start_date).format('YYYY-MM-DD');
        const lEnd = moment(l.end_date).format('YYYY-MM-DD');
        return dateStr >= lStart && dateStr <= lEnd;
      });

      let status = 'absent';
      let checkIn = null;
      let checkOut = null;
      let workedHours = 0;
      let dayRequiredHours = isWeekend ? 0 : 8;

      if (attRecord) {
        status = attRecord.status || 'present';
        checkIn = attRecord.login_time;
        checkOut = attRecord.logout_time;
        workedHours = getRecordCreditedHours(attRecord);
      } else if (leaveRecord) {
        status = 'on-leave';
        workedHours = 0;
        if (!isWeekend) {
          dayRequiredHours = 0;
          approvedLeaveDays++;
        }
      } else if (isWeekend) {
        status = 'weekend';
        workedHours = 0;
        dayRequiredHours = 0;
      } else if (isFuture) {
        status = 'future';
        workedHours = 0;
        dayRequiredHours = 8;
      } else {
        status = 'absent';
        workedHours = 0;
        dayRequiredHours = 8;
      }

      actualWorkedHours += workedHours;

      if (isWeekend) {
        weekendWorkedHours += workedHours;
      } else {
        weekdayWorkedHours += workedHours;
      }

      dailyBreakdown.push({
        date: dateStr,
        day: dayName,
        check_in: checkIn,
        check_out: checkOut,
        status: status,
        worked_hours: Number(workedHours.toFixed(2)),
        required_hours: dayRequiredHours,
        is_weekend: isWeekend,
        leave_type: leaveRecord ? leaveRecord.leave_type : null
      });
    }

    // Required hours = (number of Monday-Friday working days that are NOT approved leave) * 8
    const requiredHours = (5 - approvedLeaveDays) * 8;
    const remainingHours = Math.max(0, parseFloat((requiredHours - actualWorkedHours).toFixed(2)));
    const isComplete = actualWorkedHours >= requiredHours;

    res.json({
      success: true,
      week_start: weekStart,
      week_end: weekEnd,
      required_hours: requiredHours,
      actual_worked_hours: Number(actualWorkedHours.toFixed(2)),
      weekday_worked_hours: Number(weekdayWorkedHours.toFixed(2)),
      weekend_worked_hours: Number(weekendWorkedHours.toFixed(2)),
      remaining_hours: remainingHours,
      approved_leave_days: approvedLeaveDays,
      is_complete: isComplete,
      completion_status: isComplete ? 'COMPLETE' : 'IN PROGRESS',
      daily_breakdown: dailyBreakdown
    });
  } catch (error) {
    console.error('Get weekly attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only HR/Admin can update attendance
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await query(
      `UPDATE attendance 
       SET status = COALESCE($1, status),
           login_time = COALESCE($2, login_time),
           logout_time = COALESCE($3, logout_time),
           total_hours = COALESCE($4, total_hours),
           notes = COALESCE($5, notes),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        updates.status,
        updates.login_time,
        updates.logout_time,
        updates.total_hours,
        updates.notes,
        id
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance updated successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayAttendance,
  getMonthlyAttendance,
  getAttendanceReport,
  getAttendanceStats,
  getWeeklyAttendance,
  updateAttendance
};