const dotenv = require('dotenv');
dotenv.config();

const { query } = require('./src/config/database');

const defaultLeaveAllocations = {
  annual: 20,
  sick: 10,
  personal: 5,
  casual: 10,
  unpaid: 30,
  maternity: 90,
  paternity: 15,
  bereavement: 7
};

async function seedAndRepair() {
  console.log("=================================================");
  console.log("   SEEDING AND REPAIRING LEAVE BALANCES (ALL EMPLOYEES) ");
  console.log("=================================================");

  const year = new Date().getFullYear();

  // 1. Fetch all employees
  const empsRes = await query("SELECT id, employee_id, email, first_name, last_name, role FROM employees");
  console.log(`Found ${empsRes.rows.length} total employees.`);

  for (const emp of empsRes.rows) {
    console.log(`Seeding leave balances for ${emp.first_name} ${emp.last_name} (${emp.employee_id})...`);
    for (const [type, days] of Object.entries(defaultLeaveAllocations)) {
      await query(
        `INSERT INTO leave_balance (employee_id, leave_type, total_days, used_days, pending_days, remaining_days, year)
         VALUES ($1, $2, $3, 0, 0, $3, $4)
         ON CONFLICT (employee_id, leave_type, year) DO NOTHING`,
        [emp.id, type, days, year]
      );
    }
  }

  // 2. Recalculate used_days, pending_days, and remaining_days based on actual leave_requests
  console.log("\nRecalculating used_days, pending_days, and remaining_days from leave_requests...");
  const balancesRes = await query("SELECT * FROM leave_balance WHERE year = $1", [year]);

  for (const b of balancesRes.rows) {
    const calc = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'approved' THEN total_days ELSE 0 END), 0) AS used,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_days ELSE 0 END), 0) AS pending
      FROM leave_requests
      WHERE employee_id = $1 AND leave_type = $2 AND EXTRACT(YEAR FROM start_date) = $3
    `, [b.employee_id, b.leave_type, year]);

    const used = parseInt(calc.rows[0].used || 0);
    const pending = parseInt(calc.rows[0].pending || 0);
    const remaining = Math.max(0, b.total_days - used - pending);

    await query(`
      UPDATE leave_balance
      SET used_days = $1, pending_days = $2, remaining_days = $3, updated_at = NOW()
      WHERE id = $4
    `, [used, pending, remaining, b.id]);
  }

  console.log("✅ Seeding and balance repair completed successfully!");
  process.exit(0);
}

seedAndRepair();
