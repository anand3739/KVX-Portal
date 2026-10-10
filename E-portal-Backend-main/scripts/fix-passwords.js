const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixPasswords() {
  try {
    console.log('🔧 Fixing passwords...\n');

    const users = [
      { email: 'admin@kravix.com', password: 'Admin@123' },
      { email: 'hr@kravix.com', password: 'HR@123' },
      { email: 'ceo@kravix.com', password: 'CEO@123' },
      { email: 'employee@kravix.com', password: 'Emp@123' }
    ];

    for (const user of users) {
      console.log(`📧 Checking: ${user.email}`);
      
      // Generate new hash
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(user.password, salt);
      
      // Update database
      const result = await pool.query(
        'UPDATE employees SET password_hash = $1 WHERE email = $2 RETURNING email',
        [newHash, user.email]
      );
      
      if (result.rows.length > 0) {
        console.log(`   ✅ Password updated for ${user.email}`);
        
        // Verify the new hash works
        const verifyValid = await bcrypt.compare(user.password, newHash);
        console.log(`   ✅ Password verification: ${verifyValid ? 'OK' : 'FAILED'}`);
      } else {
        console.log(`   ❌ User not found: ${user.email}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixPasswords();