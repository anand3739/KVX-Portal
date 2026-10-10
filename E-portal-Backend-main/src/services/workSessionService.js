'use strict';

const crypto = require('crypto');
const { query } = require('../config/database');

let tableReady;
const ensureTable = () => {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        auth_session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        duration_hours DECIMAL(6,2),
        end_reason VARCHAR(50) DEFAULT 'logout' CHECK (end_reason IN ('logout', 'inactivity', 'session_expired')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `).then(() => query('CREATE INDEX IF NOT EXISTS idx_work_sessions_emp_status ON work_sessions (employee_id, status)'));
  }
  return tableReady;
};

/**
 * Starts a new work session on login or resumes existing active session for the same auth_session_id
 */
const startWorkSession = async (employeeId, authSessionId = null) => {
  await ensureTable();

  // Check if an active work session already exists for this auth_session_id
  if (authSessionId) {
    const existing = await query(
      `SELECT * FROM work_sessions WHERE auth_session_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
      [authSessionId]
    );
    if (existing.rows[0]) {
      return existing.rows[0];
    }
  }

  // Also check if there's any active work session for this employee started within the last 30 seconds
  // to prevent accidental duplicates
  const recent = await query(
    `SELECT * FROM work_sessions 
     WHERE employee_id = $1 AND status = 'active' AND started_at > NOW() - INTERVAL '30 seconds'
     ORDER BY started_at DESC LIMIT 1`,
    [employeeId]
  );
  if (recent.rows[0]) {
    if (authSessionId && !recent.rows[0].auth_session_id) {
      await query(`UPDATE work_sessions SET auth_session_id = $1 WHERE id = $2`, [authSessionId, recent.rows[0].id]);
      recent.rows[0].auth_session_id = authSessionId;
    }
    return recent.rows[0];
  }


  const id = crypto.randomUUID();
  const result = await query(
    `INSERT INTO work_sessions (id, employee_id, auth_session_id, started_at, status)
     VALUES ($1, $2, $3, NOW(), 'active')
     RETURNING *`,
    [id, employeeId, authSessionId]
  );

  return result.rows[0];
};

/**
 * Ends active work session for employee (on logout or timeout)
 */
const endWorkSession = async (employeeId, authSessionId = null, endReason = 'logout') => {
  await ensureTable();

  let sql = `
    SELECT * FROM work_sessions 
    WHERE employee_id = $1 AND status = 'active'
  `;
  const params = [employeeId];

  if (authSessionId) {
    sql += ` AND (auth_session_id = $2 OR auth_session_id IS NULL)`;
    params.push(authSessionId);
  }

  sql += ` ORDER BY started_at DESC LIMIT 1`;

  let activeRes = await query(sql, params);
  if (!activeRes.rows[0]) {
    activeRes = await query(
      `SELECT * FROM work_sessions WHERE employee_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
      [employeeId]
    );
  }

  const activeSession = activeRes.rows[0];

  if (!activeSession) {
    return null;
  }

  // Calculate duration in hours
  const updateRes = await query(
    `UPDATE work_sessions 
     SET 
       ended_at = NOW(),
       duration_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 3600.0, 2),
       end_reason = $1,
       status = 'completed',
       updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [endReason, activeSession.id]
  );

  return updateRes.rows[0];
};


/**
 * Gets active work session for employee
 */
const getActiveWorkSession = async (employeeId) => {
  await ensureTable();
  const res = await query(
    `SELECT * FROM work_sessions WHERE employee_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
    [employeeId]
  );
  return res.rows[0] || null;
};

module.exports = {
  startWorkSession,
  endWorkSession,
  getActiveWorkSession
};
