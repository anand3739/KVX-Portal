@"
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT email, role FROM employees');
    console.log('📊 Users in database:');
    result.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
"@ | Out-File -FilePath scripts/check-users.js -Encoding UTF8