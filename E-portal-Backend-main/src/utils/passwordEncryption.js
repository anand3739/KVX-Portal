const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
let columnReady = false;

const getEncryptionKey = () => {
  const secret = process.env.PASSWORD_ENCRYPTION_KEY || process.env.JWT_SECRET || 'kvx-portal-password-key';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

const encryptPassword = (password) => {
  if (!password) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(password), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
};

const decryptPassword = (payload) => {
  if (!payload) return null;
  const [ivText, authTagText, encryptedText] = String(payload).split(':');
  if (!ivText || !authTagText || !encryptedText) return null;

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagText, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64')),
    decipher.final()
  ]).toString('utf8');
};

const ensurePasswordEncryptedColumn = async (queryFn) => {
  if (columnReady) return;
  await queryFn('ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_encrypted TEXT');
  columnReady = true;
};

module.exports = {
  encryptPassword,
  decryptPassword,
  ensurePasswordEncryptedColumn
};
