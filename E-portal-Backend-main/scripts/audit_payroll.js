const { query } = require('../src/config/database');

(async () => {
  try {
    const r = await query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'payroll' ORDER BY ordinal_position");
    console.log('PAYROLL COLUMNS:', JSON.stringify(r.rows, null, 2));

    const s = await query("SELECT * FROM payroll LIMIT 3");
    console.log('SAMPLE PAYROLL ROWS:', JSON.stringify(s.rows, null, 2));

    const e = await query("SELECT id, employee_id, salary, position, department_id FROM employees WHERE status='active' LIMIT 5");
    console.log('SAMPLE EMPLOYEES:', JSON.stringify(e.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();
