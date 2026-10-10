const fs = require('fs');
const path = require('path');
const { query, pool } = require('../config/database');

const run = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'employee_module.sql'), 'utf8');
  for (const statement of sql.split(';').map((value) => value.trim()).filter(Boolean)) {
    await query(statement);
  }
  console.log('Employee module migration applied successfully.');
};

run()
  .catch((error) => {
    console.error('Employee module migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
