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

async function updatePasswords() {
  try {
    console.log('🔑 Generating password hashes...');
    
    // Define passwords for each role
    const passwords = {
      'admin@kravix.com': 'Admin@123',
      'hr@kravix.com': 'HR@123',
      'ceo@kravix.com': 'CEO@123',
      'employee@kravix.com': 'Emp@123'
    };

    // Generate hashes for each password
    for (const [email, plainPassword] of Object.entries(passwords)) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(plainPassword, salt);
      
      console.log(`\n📧 ${email}`);
      console.log(`🔐 Password: ${plainPassword}`);
      console.log(`🔑 Hash: ${hash}`);
      
      // Update the database
      const result = await pool.query(
        'UPDATE employees SET password_hash = $1 WHERE email = $2 RETURNING id, email',
        [hash, email]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated password for ${email}`);
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }

    // Verify the updates
    console.log('\n📊 Verifying updates...');
    const verify = await pool.query(
      'SELECT email, role, password_hash FROM employees WHERE email IN ($1, $2, $3, $4)',
      ['admin@kravix.com', 'hr@kravix.com', 'ceo@kravix.com', 'employee@kravix.com']
    );
    
    verify.rows.forEach(row => {
      console.log(`\n${row.email} (${row.role}):`);
      console.log(`Hash: ${row.password_hash.substring(0, 30)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updatePasswords();