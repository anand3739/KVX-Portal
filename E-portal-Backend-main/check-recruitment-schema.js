const dotenv = require('dotenv');
dotenv.config();

const { query } = require('./src/config/database');

async function checkSchema() {
  console.log("=== CHECKING RECRUITMENT TABLES IN POSTGRESQL ===");

  try {
    const tables = ['job_postings', 'job_applications', 'interviews', 'candidates'];
    for (const table of tables) {
      const res = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      if (res.rows.length === 0) {
        console.log(`❌ Table '${table}' DOES NOT EXIST.`);
      } else {
        console.log(`\n✅ Table '${table}' exists with ${res.rows.length} columns:`);
        console.table(res.rows);
      }
    }

    const jobCount = await query("SELECT COUNT(*) FROM job_postings");
    console.log(`Current job_postings count: ${jobCount.rows[0].count}`);

    const appCount = await query("SELECT COUNT(*) FROM job_applications");
    console.log(`Current job_applications count: ${appCount.rows[0].count}`);

  } catch (err) {
    console.error("Schema check error:", err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
