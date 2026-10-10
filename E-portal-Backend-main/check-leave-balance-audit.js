const dotenv = require('dotenv');
dotenv.config();

const { query } = require('./src/config/database');

async function audit() {
  console.log("=== AUDITING LEAVE BALANCE SYSTEM IN POSTGRESQL ===");

  try {
    // 1. Get all employees with role 'hr' or 'admin'
    const hrUsers = await query("SELECT id, employee_id, email, first_name, last_name, role FROM employees WHERE role IN ('hr', 'admin')");
    console.log(`Found ${hrUsers.rows.length} HR/Admin users:`);
    console.table(hrUsers.rows);

    const year = new Date().getFullYear();

    for (const hr of hrUsers.rows) {
      console.log(`\n--- Leave balances for ${hr.first_name} ${hr.last_name} (${hr.email}) [Role: ${hr.role}] ---`);
      const balances = await query("SELECT * FROM leave_balance WHERE employee_id = $1 AND year = $2", [hr.id, year]);
      console.table(balances.rows);

      const requests = await query("SELECT id, leave_type, start_date, end_date, total_days, status, created_at FROM leave_requests WHERE employee_id = $1", [hr.id]);
      console.log(`Leave requests count for ${hr.first_name}: ${requests.rows.length}`);
      if (requests.rows.length > 0) {
        console.table(requests.rows);
      }
    }

    // Check all leave_balance records in the DB
    const allBalances = await query("SELECT * FROM leave_balance");
    console.log(`\nTotal leave_balance records in database: ${allBalances.rows.length}`);
    if (allBalances.rows.length > 0) {
      console.table(allBalances.rows);
    }

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    process.exit(0);
  }
}

audit();
