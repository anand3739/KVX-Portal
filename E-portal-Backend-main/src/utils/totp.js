'use strict';

const crypto = require('crypto');

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32Encode = (buffer) => {
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  let output = '';
  for (let index = 0; index + 5 <= bits.length; index += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5), 2)];
  }
  return output;
};

const base32Decode = (value) => {
  const normalized = String(value || '').replace(/[^A-Z2-7]/gi, '').toUpperCase();
  let bits = '';
  for (const character of normalized) bits += BASE32_ALPHABET.indexOf(character).toString(2).padStart(5, '0');
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
};

const generateSecret = () => base32Encode(crypto.randomBytes(20));

const generateCode = (secret, timestamp = Date.now()) => {
  const counter = Math.floor(timestamp / 30000);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const numeric = ((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(numeric % 1000000).padStart(6, '0');
};

const verifyCode = (secret, code) => {
  const candidate = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(candidate)) return false;
  return [-30000, 0, 30000].some((offset) => crypto.timingSafeEqual(
    Buffer.from(generateCode(secret, Date.now() + offset)),
    Buffer.from(candidate),
  ));
};

const encryptionKey = () => crypto.createHash('sha256').update(process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET || '').digest();
const encrypt = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`;
};
const decrypt = (value) => {
  const [ivText, tagText, encryptedText] = String(value || '').split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]).toString('utf8');
};

const generateRecoveryCodes = () => Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex').toUpperCase().match(/.{1,4}/g).join('-'));
const hashRecoveryCode = (code) => crypto.createHash('sha256').update(String(code).replace(/-/g, '').toUpperCase()).digest('hex');

module.exports = { generateSecret, generateCode, verifyCode, encrypt, decrypt, generateRecoveryCodes, hashRecoveryCode };
