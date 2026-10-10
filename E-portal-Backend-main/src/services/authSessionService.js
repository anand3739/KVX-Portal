'use strict';

const crypto = require('crypto');
const { query } = require('../config/database');

let tableReady;
const ensureTable = () => {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        user_agent TEXT,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ
      )
    `).then(() => query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_employee_active ON auth_sessions (employee_id, expires_at) WHERE revoked_at IS NULL'));
  }
  return tableReady;
};

const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const createSession = async (employeeId, req, sessionTimeoutMinutes = 60) => {
  await ensureTable();
  const id = crypto.randomUUID();
  const timeoutMins = parseInt(sessionTimeoutMinutes, 10) || 60;
  const intervalStr = `${timeoutMins} minutes`;
  await query(
    `INSERT INTO auth_sessions (id, employee_id, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + $5::interval)`,
    [id, employeeId, req.headers['user-agent'] || 'Unknown device', req.ip || 'Unknown IP', intervalStr],
  );
  return id;
};

const isActiveSession = async (id, employeeId) => {
  if (!id || !isUuid(id)) {
    if (!employeeId || !isUuid(employeeId)) return false;
    const empCheck = await query('SELECT id FROM employees WHERE id = $1', [employeeId]);
    return Boolean(empCheck.rows[0]);
  }
  await ensureTable();
  const result = await query(
    `UPDATE auth_sessions SET last_seen_at = NOW()
     WHERE id = $1 AND employee_id = $2 AND revoked_at IS NULL AND expires_at > NOW()
     RETURNING id`,
    [id, employeeId],
  );
  return Boolean(result.rows[0]);
};

const listAllSessions = async (currentSessionId, isAdmin = false, employeeId = null) => {
  await ensureTable();
  let sql = `
    SELECT 
      s.id,
      s.employee_id,
      s.user_agent,
      s.ip_address,
      s.created_at,
      s.last_seen_at,
      s.expires_at,
      s.revoked_at,
      (s.id = $1::uuid) AS current,
      e.first_name,
      e.last_name,
      e.email,
      e.role
    FROM auth_sessions s
    JOIN employees e ON s.employee_id = e.id
    WHERE s.revoked_at IS NULL AND s.expires_at > NOW()
  `;
  const params = [currentSessionId || null];

  if (!isAdmin && employeeId) {
    sql += ` AND s.employee_id = $2`;
    params.push(employeeId);
  }

  sql += ` ORDER BY s.last_seen_at DESC`;

  const result = await query(sql, params);
  return result.rows.map(row => ({
    id: row.id,
    employee_id: row.employee_id,
    user_name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    role: row.role,
    user_agent: row.user_agent,
    ip_address: row.ip_address,
    created_at: row.created_at,
    last_seen_at: row.last_seen_at,
    expires_at: row.expires_at,
    current: row.current,
    status: row.expires_at > new Date() ? 'active' : 'expired'
  }));
};

const revokeSessionAdmin = async (sessionId, employeeId = null, isAdmin = false) => {
  await ensureTable();
  let sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`;
  const params = [sessionId];

  if (!isAdmin && employeeId) {
    sql += ` AND employee_id = $2`;
    params.push(employeeId);
  }

  sql += ` RETURNING id`;
  const result = await query(sql, params);
  return Boolean(result.rows[0]);
};

const revokeOtherSessions = async (currentSessionId, employeeId = null, isAdmin = false) => {
  await ensureTable();
  let sql = `UPDATE auth_sessions SET revoked_at = NOW() WHERE revoked_at IS NULL AND expires_at > NOW()`;
  const params = [];

  if (currentSessionId) {
    sql += ` AND id != $1::uuid`;
    params.push(currentSessionId);
  }

  if (!isAdmin && employeeId) {
    const paramIdx = params.length + 1;
    sql += ` AND employee_id = $${paramIdx}`;
    params.push(employeeId);
  }

  sql += ` RETURNING id`;
  const result = await query(sql, params);
  return result.rows.length;
};

module.exports = {
  createSession,
  isActiveSession,
  listSessions: listAllSessions,
  listAllSessions,
  revokeSession: revokeSessionAdmin,
  revokeSessionAdmin,
  revokeOtherSessions
};
