const { Pool } = require('pg');
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const runMigrations = async () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🚀 Running database migrations...');

    // Read main migration file
    const migrationSQL = await fs.readFile(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );

    // Execute main migrations
    await pool.query(migrationSQL);

    // Read chat-specific migration file
    const chatMigrationSQL = await fs.readFile(
      path.join(__dirname, '..', 'database', 'chat_tables.sql'),
      'utf8'
    );

    // Execute chat migrations
    await pool.query(chatMigrationSQL);
    console.log('✅ Migrations completed successfully');

    // Create upload directories
    await fs.ensureDir('uploads/documents');
    await fs.ensureDir('uploads/profiles');
    await fs.ensureDir('uploads/payslips');
    console.log('📁 Upload directories created');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();