'use strict';

const { query, transaction } = require('../config/database');

/**
 * Checks for checked-in employees with active attendance intervals who have had no activity for >= inactivityThresholdMinutes (default 20 mins)
 */
const checkInactiveWorkSessions = async (inactivityThresholdMinutes = 20) => {
  try {
    const thresholdMins = parseInt(inactivityThresholdMinutes, 10) || 20;
    const intervalStr = `${thresholdMins} minutes`;

    // Query checked-in employees with open 'active' attendance intervals where last activity >= 20 mins ago
    const sql = `
      SELECT 
        a.id AS attendance_id,
        a.employee_id,
        ai.id AS interval_id,
        ai.start_time AS interval_start,
        COALESCE(MAX(s.last_seen_at), ai.start_time) AS last_seen_at
      FROM attendance a
      JOIN attendance_intervals ai ON a.id = ai.attendance_id
      LEFT JOIN auth_sessions s ON a.employee_id = s.employee_id AND s.revoked_at IS NULL
      WHERE a.is_checked_in = true
        AND ai.type = 'active'
        AND ai.end_time IS NULL
      GROUP BY a.id, a.employee_id, ai.id, ai.start_time
      HAVING COALESCE(MAX(s.last_seen_at), ai.start_time) <= NOW() - $1::interval
    `;

    const result = await query(sql, [intervalStr]);
    const inactiveRecords = result.rows;

    for (const row of inactiveRecords) {
      const { attendance_id, employee_id, interval_id, last_seen_at } = row;

      await transaction(async (client) => {
        // 1. Close current ACTIVE interval at last_seen_at
        await client.query(
          `UPDATE attendance_intervals
           SET end_time = $1,
               duration_minutes = GREATEST(0, ROUND(EXTRACT(EPOCH FROM ($1 - start_time)) / 60.0)),
               updated_at = NOW()
           WHERE id = $2 AND end_time IS NULL`,
          [last_seen_at, interval_id]
        );

        // 2. Create INACTIVE interval starting at last_seen_at
        await client.query(
          `INSERT INTO attendance_intervals (attendance_id, employee_id, start_time, type)
           VALUES ($1, $2, $3, 'inactive')`,
          [attendance_id, employee_id, last_seen_at]
        );
      });

      // DO NOT revoke auth_session. DO NOT change login/logout authentication state.
      console.log(`[InactivityMonitor] Transitioned attendance ${attendance_id} for employee ${employee_id} to INACTIVE at last_seen_at: ${last_seen_at}`);
    }

    return inactiveRecords.length;
  } catch (error) {
    console.error('[InactivityMonitor] Error checking inactive attendance sessions:', error);
    return 0;
  }
};

let monitorTimer = null;
const startInactivityMonitor = (intervalMs = 60000, inactivityThresholdMinutes = 20) => {
  if (monitorTimer) return;
  checkInactiveWorkSessions(inactivityThresholdMinutes);
  monitorTimer = setInterval(() => {
    checkInactiveWorkSessions(inactivityThresholdMinutes);
  }, intervalMs);
  console.log(`[InactivityMonitor] Started periodic background check (Interval: ${intervalMs}ms, Threshold: ${inactivityThresholdMinutes}m)`);
};

const stopInactivityMonitor = () => {
  if (monitorTimer) {
    clearInterval(monitorTimer);
    monitorTimer = null;
  }
};

module.exports = {
  checkInactiveWorkSessions,
  startInactivityMonitor,
  stopInactivityMonitor
};
