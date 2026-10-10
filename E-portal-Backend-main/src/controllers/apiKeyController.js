/**
 * API Key Controller
 * Base Path: /api/api-keys
 *
 * Tables used:
 *   api_keys       - API key metadata and SHA-256 hashes
 *   employees      - Creator reference
 *   activity_logs  - Audit logging for key operations
 */

'use strict';

const crypto = require('crypto');
const { query } = require('../config/database');

/** Helper to hash raw API key with SHA-256 */
const hashApiKey = (rawKey) => {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

/** Log operations to activity_logs */
const logActivity = async (req, action, entityId, newData) => {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userId = req.user?.id && uuidRegex.test(req.user.id) ? req.user.id : null;
    await query(
      `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, new_data, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, 'api_keys', entityId, JSON.stringify(newData), req.ip]
    );
  } catch (err) {
    console.warn('API Key activity log warning:', err.message);
  }
};

// ═════════════════════════════════════════════════════════════
//  GET /api/api-keys  - List all API keys
// ═════════════════════════════════════════════════════════════
const getApiKeys = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         k.id,
         k.name,
         k.key_prefix,
         k.permissions,
         k.rate_limit_per_min,
         k.status,
         k.created_at,
         k.updated_at,
         k.last_used_at,
         k.expires_at,
         CONCAT(e.first_name, ' ', e.last_name) AS creator_name
       FROM api_keys k
       LEFT JOIN employees e ON k.created_by = e.id
       ORDER BY k.created_at DESC`
    );

    return res.json({
      success: true,
      message: 'API keys retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving API keys' });
  }
};

// ═════════════════════════════════════════════════════════════
//  POST /api/api-keys  - Generate a new API key
// ═════════════════════════════════════════════════════════════
const createApiKey = async (req, res) => {
  try {
    const { name, permissions = ['read'], rate_limit_per_min = 60, expiry_days = 365 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'API key name is required' });
    }

    // Format permissions as array if passed as object or array
    let permsArray = ['read'];
    if (Array.isArray(permissions)) {
      permsArray = permissions;
    } else if (typeof permissions === 'object' && permissions !== null) {
      permsArray = Object.keys(permissions).filter(p => permissions[p]);
    }

    // Generate cryptographically secure random API key
    const randomBytesStr = crypto.randomBytes(24).toString('hex');
    const rawKey = `kvx_live_${randomBytesStr}`;
    const keyPrefix = `${rawKey.substring(0, 14)}...`;
    const keyHash = hashApiKey(rawKey);

    const expiryDaysInt = parseInt(expiry_days, 10) || 365;
    const expiresAt = new Date(Date.now() + expiryDaysInt * 24 * 60 * 60 * 1000);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const createdBy = req.user?.id && uuidRegex.test(req.user.id) ? req.user.id : null;

    const result = await query(
      `INSERT INTO api_keys (
         name, key_prefix, key_hash, permissions, rate_limit_per_min, status, created_by, expires_at
       ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
       RETURNING id, name, key_prefix, permissions, rate_limit_per_min, status, created_at, expires_at`,
      [name.trim(), keyPrefix, keyHash, JSON.stringify(permsArray), parseInt(rate_limit_per_min, 10) || 60, 'active', createdBy, expiresAt]
    );

    const createdRecord = result.rows[0];
    await logActivity(req, 'CREATE_API_KEY', createdRecord.id, { name: createdRecord.name, permissions: permsArray });

    return res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: createdRecord,
      raw_key: rawKey // Returned ONCE upon creation
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating API key' });
  }
};

// ═════════════════════════════════════════════════════════════
//  POST /api/api-keys/:id/regenerate  - Regenerate an API key
// ═════════════════════════════════════════════════════════════
const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRes = await query('SELECT id, name FROM api_keys WHERE id = $1', [id]);
    if (!existingRes.rows[0]) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const randomBytesStr = crypto.randomBytes(24).toString('hex');
    const rawKey = `kvx_live_${randomBytesStr}`;
    const keyPrefix = `${rawKey.substring(0, 14)}...`;
    const keyHash = hashApiKey(rawKey);
    const newExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const result = await query(
      `UPDATE api_keys
       SET key_prefix = $1, key_hash = $2, status = 'active', expires_at = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, key_prefix, permissions, rate_limit_per_min, status, created_at, expires_at, updated_at`,
      [keyPrefix, keyHash, newExpiresAt, id]
    );

    const updatedRecord = result.rows[0];
    await logActivity(req, 'REGENERATE_API_KEY', id, { name: updatedRecord.name });

    return res.json({
      success: true,
      message: 'API key regenerated successfully',
      data: updatedRecord,
      raw_key: rawKey // Returned ONCE upon regeneration
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    return res.status(500).json({ success: false, message: 'Server error regenerating API key' });
  }
};

// ═════════════════════════════════════════════════════════════
//  PUT /api/api-keys/:id/revoke  - Revoke an API key
// ═════════════════════════════════════════════════════════════
const revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE api_keys
       SET status = 'revoked', updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, key_prefix, status, updated_at`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    const revokedRecord = result.rows[0];
    await logActivity(req, 'REVOKE_API_KEY', id, { name: revokedRecord.name });

    return res.json({
      success: true,
      message: 'API key revoked successfully',
      data: revokedRecord
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return res.status(500).json({ success: false, message: 'Server error revoking API key' });
  }
};

// ═════════════════════════════════════════════════════════════
//  DELETE /api/api-keys/:id  - Delete an API key
// ═════════════════════════════════════════════════════════════
const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT name FROM api_keys WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }

    await query('DELETE FROM api_keys WHERE id = $1', [id]);
    await logActivity(req, 'DELETE_API_KEY', id, { name: existing.rows[0].name });

    return res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting API key' });
  }
};

// ═════════════════════════════════════════════════════════════
//  GET /api/api-keys/stats  - Get API key statistics
// ═════════════════════════════════════════════════════════════
const getApiKeyStats = async (req, res) => {
  try {
    const statsRes = await query(`
      SELECT 
        COUNT(*)::int AS total_keys,
        COUNT(CASE WHEN status = 'active' AND (expires_at IS NULL OR expires_at > NOW()) THEN 1 END)::int AS active_keys,
        COUNT(CASE WHEN status = 'revoked' THEN 1 END)::int AS revoked_keys,
        COUNT(CASE WHEN expires_at <= NOW() THEN 1 END)::int AS expired_keys,
        MAX(created_at) AS last_generated,
        MAX(last_used_at) AS last_used
      FROM api_keys
    `);

    const stats = statsRes.rows[0] || {
      total_keys: 0,
      active_keys: 0,
      revoked_keys: 0,
      expired_keys: 0,
      last_generated: null,
      last_used: null
    };

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get API key stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving API key stats' });
  }
};

module.exports = {
  getApiKeys,
  createApiKey,
  regenerateApiKey,
  revokeApiKey,
  deleteApiKey,
  getApiKeyStats
};
