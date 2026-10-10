const { query } = require('../config/database');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * logAudit — write an entry into the audit/activity logging tables.
 * Silently swallows DB errors so audit failures never break the main request.
 */
const logAudit = async ({
  userId = null,
  userEmail = null,
  userRole = null,
  action,
  resource = null,
  resourceId = null,
  details = {},
  ip = null,
  userAgent = null,
  status = 'success',
}) => {
  try {
    const validUserId = userId && uuidRegex.test(String(userId)) ? userId : null;
    const validResourceId = resourceId && uuidRegex.test(String(resourceId)) ? resourceId : null;

    // 1. Write to activity_logs table
    await query(
      `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        validUserId,
        action,
        resource,
        validResourceId,
        JSON.stringify(details),
        ip,
        userAgent
      ]
    );

    // 2. Also write to audit_logs table for compatibility
    await query(
      `INSERT INTO audit_logs
         (user_id, user_email, user_role, action, resource, resource_id, details, ip_address, user_agent, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        validUserId,
        userEmail,
        userRole,
        action,
        resource,
        resourceId ? String(resourceId) : null,
        JSON.stringify(details),
        ip,
        userAgent,
        status,
      ]
    );
  } catch (err) {
    // Never throw — audit failures must not break app flow
    console.warn('⚠️ audit log write failed:', err.message);
  }
};

module.exports = { logAudit };

