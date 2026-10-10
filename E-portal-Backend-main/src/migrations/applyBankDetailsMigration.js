const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/database');

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, 'bank_details_migration.sql'), 'utf8');
  console.log('Running bank details migration...');
  await query(sql);
  console.log('Migration executed successfully!');
  const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employee_bank_details'");
  console.log('Created columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
}

runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
