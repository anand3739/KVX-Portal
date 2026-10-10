const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const envPath = path.resolve(__dirname, '..', '.env');
process.env.DB_HOST = '';
process.env.DB_PORT = '';
process.env.DB_NAME = '';
process.env.DB_USER = '';
process.env.DB_PASSWORD = '';
process.env.DATABASE_URL = '';

const { getDatabaseConfig } = require('../src/config/database');

test('getDatabaseConfig falls back to values from .env when shell vars are blank', () => {
  const config = getDatabaseConfig();

  assert.equal(config.host, 'aws-1-ap-south-1.pooler.supabase.com');
  assert.equal(config.port, 6543);
  assert.equal(config.database, 'postgres');
  assert.equal(config.user, 'postgres.uxtkygveeczlczkjnxkb');
  assert.equal(config.password, 'KravixDB2026');
  assert.equal(config.connectionString, 'postgresql://postgres.uxtkygveeczlczkjnxkb:KravixDB2026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres');
  assert.equal(config.ssl, true);
  assert.ok(config.envPath === envPath);
});
