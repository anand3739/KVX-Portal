'use strict';

const { query } = require('../config/database');

/**
 * Validates a password string against current system_settings in PostgreSQL.
 */
const validatePasswordPolicy = async (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  let policy = {
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_number: true,
    password_require_special: true,
  };

  try {
    const sysRes = await query('SELECT settings FROM system_settings WHERE id = true');
    const settings = sysRes.rows[0]?.settings || {};
    policy = {
      password_min_length: parseInt(settings.password_min_length || 8, 10),
      password_require_uppercase: settings.password_require_uppercase !== false,
      password_require_lowercase: settings.password_require_lowercase !== false,
      password_require_number: settings.password_require_number !== false,
      password_require_special: settings.password_require_special !== false,
    };
  } catch (err) {
    console.warn('Password policy load warning:', err.message);
  }

  if (password.length < policy.password_min_length) {
    return {
      valid: false,
      message: `Password does not meet security requirements: Must be at least ${policy.password_min_length} characters long.`
    };
  }

  if (policy.password_require_uppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password does not meet security requirements: Must contain at least one uppercase letter (A-Z).'
    };
  }

  if (policy.password_require_lowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password does not meet security requirements: Must contain at least one lowercase letter (a-z).'
    };
  }

  if (policy.password_require_number && !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password does not meet security requirements: Must contain at least one numeric digit (0-9).'
    };
  }

  if (policy.password_require_special && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password does not meet security requirements: Must contain at least one special character (!@#$%^&*).'
    };
  }

  return { valid: true };
};

module.exports = { validatePasswordPolicy };
