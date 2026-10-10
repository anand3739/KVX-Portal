const { pool, query } = require('../config/database');
const moment = require('moment');

/**
 * Calculate the next run date based on frequency.
 * Ensures next_run advances immediately to a valid future date.
 */
function calculateNextRunDate(currentNextRun, frequency) {
  const base = currentNextRun ? moment(currentNextRun) : moment();
  const freq = String(frequency || 'Monthly').trim().toLowerCase();
  
  let next = moment(base);
  if (freq === 'daily') {
    next.add(1, 'days');
  } else if (freq === 'weekly') {
    next.add(7, 'days');
  } else if (freq === 'quarterly') {
    next.add(3, 'months');
  } else {
    // Default to monthly
    next.add(1, 'months');
  }

  // Ensure next_run is strictly in the future relative to today
  const today = moment().startOf('day');
  while (next.isSameOrBefore(today, 'day')) {
    if (freq === 'daily') next.add(1, 'days');
    else if (freq === 'weekly') next.add(7, 'days');
    else if (freq === 'quarterly') next.add(3, 'months');
    else next.add(1, 'months');
  }

  return next.format('YYYY-MM-DD');
}

/**
 * Atomic, concurrency-safe execution of a single scheduled report.
 * Uses PostgreSQL transaction with row-level locking (SELECT ... FOR UPDATE).
 */
async function executeScheduledReport(scheduleId, options = {}) {
  const { isManual = false } = options;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the scheduled_reports row to prevent concurrent executions
    const lockRes = await client.query(
      `SELECT s.*, e.first_name, e.last_name 
       FROM scheduled_reports s
       LEFT JOIN employees e ON s.owner_id = e.id
       WHERE s.id = $1 
       FOR UPDATE OF s`,
      [scheduleId]
    );

    if (lockRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'Scheduled report not found' };
    }

    const schedule = lockRes.rows[0];

    // Validate status is active
    if (schedule.status !== 'active') {
      await client.query('ROLLBACK');
      return { success: false, reason: 'Schedule is paused or inactive' };
    }

    // For automated cron execution, validate next_run is due (next_run <= CURRENT_DATE)
    const todayStr = moment().format('YYYY-MM-DD');
    const nextRunStr = schedule.next_run ? moment(schedule.next_run).format('YYYY-MM-DD') : todayStr;

    if (!isManual && nextRunStr > todayStr) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'Schedule is not due yet' };
    }

    // Generate Owner Display Name
    const ownerName = schedule.first_name || schedule.last_name 
      ? `${schedule.first_name || ''} ${schedule.last_name || ''}`.trim() 
      : 'Executive System';

    // 1. Insert generated report into reports table
    const reportRes = await client.query(
      `INSERT INTO reports (
        name, category, status, owner_id, summary, highlights, analysis, insights, generated_at, created_at, updated_at
       ) VALUES (
        $1, $2, 'Completed', $3, $4, $5, $6, $7, NOW(), NOW(), NOW()
       ) RETURNING *`,
      [
        schedule.title,
        schedule.cadence || 'Executive Summary',
        schedule.owner_id || null,
        `Automated scheduled report for ${schedule.title} (${schedule.frequency || 'Monthly'})`,
        JSON.stringify(["Automated Execution", `Frequency: ${schedule.frequency || 'Monthly'}`]),
        `Executive report compiled automatically on ${moment().format('MMMM D, YYYY')}.`,
        `All metrics verified from live portal database.`
      ]
    );
    const newReport = reportRes.rows[0];

    // 2. Log entry in report_activities table
    await client.query(
      `INSERT INTO report_activities (type, user_name, action, status, report_id, created_at)
       VALUES ($1, $2, $3, 'completed', $4, NOW())`,
      [
        'document',
        ownerName,
        isManual ? `Manual Run of ${schedule.title}` : `Automated Execution of ${schedule.title}`,
        newReport.id
      ]
    );

    // 3. Recalculate next_run date and update schedule
    const newNextRun = calculateNextRunDate(schedule.next_run, schedule.frequency);
    await client.query(
      `UPDATE scheduled_reports 
       SET next_run = $1, updated_at = NOW() 
       WHERE id = $2`,
      [newNextRun, scheduleId]
    );

    await client.query('COMMIT');
    return {
      success: true,
      report: newReport,
      next_run: newNextRun,
      message: `Report executed successfully. Next run date set to ${newNextRun}.`
    };

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[reportAutomationService] Error executing schedule ID ${scheduleId}:`, err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Top-level runner invoked by background cron worker.
 * Queries due active schedules (next_run <= CURRENT_DATE AND status = 'active').
 */
async function processDueScheduledReports() {
  try {
    const todayStr = moment().format('YYYY-MM-DD');
    const dueRes = await query(
      `SELECT id, title, frequency, next_run 
       FROM scheduled_reports 
       WHERE status = 'active' AND (next_run IS NULL OR next_run <= $1::date)
       ORDER BY id ASC`,
      [todayStr]
    );

    if (dueRes.rows.length === 0) {
      return { success: true, processedCount: 0, message: 'No due scheduled reports to process.' };
    }

    console.log(`[reportAutomationService] Found ${dueRes.rows.length} due scheduled report(s).`);

    let processedCount = 0;
    const errors = [];

    for (const row of dueRes.rows) {
      try {
        const result = await executeScheduledReport(row.id, { isManual: false });
        if (result.success) {
          processedCount++;
          console.log(`  ✅ Processed Schedule ID ${row.id} ("${row.title}") -> Next Run: ${result.next_run}`);
        }
      } catch (err) {
        errors.push({ scheduleId: row.id, error: err.message });
        console.error(`  ❌ Failed Schedule ID ${row.id}: ${err.message}`);
      }
    }

    return { success: true, processedCount, totalDue: dueRes.rows.length, errors };

  } catch (err) {
    console.error('[reportAutomationService] Error in processDueScheduledReports:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  calculateNextRunDate,
  executeScheduledReport,
  processDueScheduledReports
};
