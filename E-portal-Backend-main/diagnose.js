const { query } = require('./src/config/database');

async function main() {
  // departments columns
  const deptCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='departments' ORDER BY ordinal_position");
  console.log('Departments columns:', deptCols.rows.map(c => c.column_name));
  const depts = await query('SELECT id, name FROM departments LIMIT 5');
  console.log('Departments sample:', depts.rows);

  // leave_requests
  const lr = await query('SELECT status, COUNT(*) FROM leave_requests GROUP BY status');
  console.log('Leave requests:', lr.rows);

  // training_courses
  const tc = await query('SELECT COUNT(*) FROM training_courses');
  console.log('Training courses count:', tc.rows[0].count);

  // training_courses columns
  const tcCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='training_courses' ORDER BY ordinal_position");
  console.log('Training_courses columns:', tcCols.rows.map(c => c.column_name));

  // attendance columns  
  const attCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='attendance' ORDER BY ordinal_position");
  console.log('Attendance columns:', attCols.rows.map(c => c.column_name));

  // performance_reviews columns
  const prCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='performance_reviews' ORDER BY ordinal_position");
  console.log('Performance_reviews columns:', prCols.rows.map(c => c.column_name));

  // documents columns
  const docCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='documents' ORDER BY ordinal_position");
  console.log('Documents columns:', docCols.rows.map(c => c.column_name));

  // tasks columns
  const taskCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='tasks' ORDER BY ordinal_position");
  console.log('Tasks columns:', taskCols.rows.map(c => c.column_name));

  // role_permissions table
  const rpCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='role_permissions' ORDER BY ordinal_position");
  console.log('Role_permissions columns:', rpCols.rows.map(c => c.column_name));
  const rpSample = await query('SELECT * FROM role_permissions LIMIT 5');
  console.log('Role_permissions sample:', rpSample.rows);

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
