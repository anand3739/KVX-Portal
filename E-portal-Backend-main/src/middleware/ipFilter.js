/**
 * IP Whitelist Enforcement Middleware
 * Proxy-aware for Cloudflare/Render
 */

'use strict';

const { query } = require('../config/database');

const isLocalhost = (ip) => {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('127.') ||
    ip === 'localhost'
  );
};

const ipMatchesPattern = (clientIp, allowedPattern) => {
  if (!clientIp || !allowedPattern) return false;
  const cleanClient = clientIp.replace(/^::ffff:/, '').trim();
  const cleanPattern = allowedPattern.replace(/^::ffff:/, '').trim();

  if (cleanClient === cleanPattern) return true;

  if (cleanPattern.includes('*')) {
    const regexStr = '^' + cleanPattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
    return new RegExp(regexStr).test(cleanClient);
  }

  return false;
};

const ipFilterMiddleware = async (req, res, next) => {
  try {
    // ⭐ Get real IP behind Cloudflare/Render
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.ip || 
                     req.socket?.remoteAddress;

    // Store IP for audit logging
    req.clientIp = clientIp;

    // Always allow localhost / development access
    if (process.env.NODE_ENV === 'development' || isLocalhost(clientIp)) {
      return next();
    }

    // Query system_settings for IP whitelist configuration
    const result = await query('SELECT settings FROM system_settings WHERE id = true');
    const settings = result.rows[0]?.settings || {};

    const isEnabled = !!settings.ip_whitelist_enabled;
    const whitelist = Array.isArray(settings.ip_whitelist) ? settings.ip_whitelist : [];

    if (!isEnabled || whitelist.length === 0) {
      return next();
    }

    const isAllowed = whitelist.some(rule => {
      const allowedIp = typeof rule === 'string' ? rule : rule?.ip;
      return ipMatchesPattern(clientIp, allowedIp);
    });

    if (!isAllowed) {
      console.warn(`[IP Filter] Access denied for IP: ${clientIp}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. IP address ${clientIp} is not whitelisted.`
      });
    }

    next();
  } catch (error) {
    console.error('[IP Filter] Middleware error:', error.message);
    next(); // Fail open for availability
  }
};

module.exports = { ipFilterMiddleware };