'use strict';

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { generateSecret, verifyCode, encrypt, decrypt, generateRecoveryCodes, hashRecoveryCode } = require('../utils/totp');
const { createSession } = require('../services/authSessionService');

const getSecurity = async (userId) => {
  const result = await query('SELECT preferences FROM user_settings WHERE user_id = $1', [userId]);
  return result.rows[0]?.preferences?.two_factor || {};
};

const saveSecurity = async (userId, security) => query(
  `INSERT INTO user_settings (user_id, preferences) VALUES ($1, $2::jsonb)
   ON CONFLICT (user_id) DO UPDATE SET preferences = user_settings.preferences || EXCLUDED.preferences, updated_at = NOW()`,
  [userId, JSON.stringify({ two_factor: security })],
);

const publicStatus = (security) => ({ enabled: security.enabled === true, recovery_codes_remaining: Array.isArray(security.recovery_code_hashes) ? security.recovery_code_hashes.length : 0 });

const getTwoFactorStatus = async (req, res) => {
  try { return res.json({ success: true, data: publicStatus(await getSecurity(req.user.id)) }); }
  catch (error) { console.error('getTwoFactorStatus:', error); return res.status(500).json({ message: 'Unable to retrieve two-factor settings' }); }
};

const beginTwoFactorSetup = async (req, res) => {
  try {
    const secret = generateSecret();
    const current = await getSecurity(req.user.id);
    await saveSecurity(req.user.id, { ...current, pending_secret: encrypt(secret), pending_created_at: new Date().toISOString() });
    const issuer = encodeURIComponent('KRAVIX Portal');
    const account = encodeURIComponent(req.user.email);
    return res.json({ success: true, data: { manual_key: secret, otpauth_url: `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30` } });
  } catch (error) { console.error('beginTwoFactorSetup:', error); return res.status(500).json({ message: 'Unable to start two-factor setup' }); }
};

const confirmTwoFactorSetup = async (req, res) => {
  try {
    const current = await getSecurity(req.user.id);
    if (!current.pending_secret) return res.status(400).json({ message: 'Start two-factor setup before verifying a code' });
    const secret = decrypt(current.pending_secret);
    if (!verifyCode(secret, req.body.code)) return res.status(400).json({ message: 'The verification code is invalid or expired' });
    const recoveryCodes = generateRecoveryCodes();
    await saveSecurity(req.user.id, { enabled: true, secret: encrypt(secret), recovery_code_hashes: recoveryCodes.map(hashRecoveryCode), enabled_at: new Date().toISOString() });
    return res.json({ success: true, message: 'Two-factor authentication enabled', data: { ...publicStatus({ enabled: true, recovery_code_hashes: recoveryCodes.map(hashRecoveryCode) }), recovery_codes: recoveryCodes } });
  } catch (error) { console.error('confirmTwoFactorSetup:', error); return res.status(500).json({ message: 'Unable to confirm two-factor setup' }); }
};

const disableTwoFactor = async (req, res) => {
  try {
    const current = await getSecurity(req.user.id);
    if (!current.enabled) return res.json({ success: true, data: publicStatus(current) });
    if (!verifyCode(decrypt(current.secret), req.body.code)) return res.status(400).json({ message: 'The verification code is invalid or expired' });
    await saveSecurity(req.user.id, { enabled: false, disabled_at: new Date().toISOString() });
    return res.json({ success: true, message: 'Two-factor authentication disabled', data: { enabled: false, recovery_codes_remaining: 0 } });
  } catch (error) { console.error('disableTwoFactor:', error); return res.status(500).json({ message: 'Unable to disable two-factor authentication' }); }
};

const verifyLoginTwoFactor = async (req, res) => {
  try {
    const pending = jwt.verify(req.body.challenge_token, process.env.JWT_SECRET);
    if (pending.purpose !== 'two_factor_login') return res.status(401).json({ message: 'Invalid verification challenge' });
    const security = await getSecurity(pending.id);
    if (!security.enabled) return res.status(401).json({ message: 'The verification code is invalid or expired' });
    const recoveryHash = hashRecoveryCode(req.body.code);
    const isAuthenticatorCode = verifyCode(decrypt(security.secret), req.body.code);
    const usesRecoveryCode = Array.isArray(security.recovery_code_hashes) && security.recovery_code_hashes.includes(recoveryHash);
    if (!isAuthenticatorCode && !usesRecoveryCode) return res.status(401).json({ message: 'The verification code is invalid or expired' });
    if (usesRecoveryCode) {
      await saveSecurity(pending.id, {
        ...security,
        recovery_code_hashes: security.recovery_code_hashes.filter((hash) => hash !== recoveryHash),
      });
    }
    const result = await query(`SELECT e.*, d.name AS department_name, d.id AS department_id FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = $1`, [pending.id]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Account is unavailable' });
    const sessionId = await createSession(user.id, req);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, employee_id: user.employee_id, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ message: 'Login successful', token, user: { id: user.id, employee_id: user.employee_id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name, department: user.department_name, department_id: user.department_id, position: user.position, profile_picture: user.profile_picture_url, status: user.status } });
  } catch (error) { return res.status(401).json({ message: 'Your two-factor verification session has expired. Sign in again.' }); }
};

module.exports = { getTwoFactorStatus, beginTwoFactorSetup, confirmTwoFactorSetup, disableTwoFactor, verifyLoginTwoFactor, getSecurity };
