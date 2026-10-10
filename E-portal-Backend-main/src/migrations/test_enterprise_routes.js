const http = require('http');
const { pool, query } = require('../config/database');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

async function testEnterpriseSuite() {
  console.log('🧪 Starting Enterprise API & RBAC Security Verification...');

  try {
    const empRes = await query(`SELECT id, email, role FROM employees WHERE role = 'employee' AND status = 'active' LIMIT 1`);
    const hrRes = await query(`SELECT id, email, role FROM employees WHERE role IN ('hr', 'admin') AND status = 'active' LIMIT 1`);

    if (empRes.rows.length === 0 || hrRes.rows.length === 0) {
      console.error('❌ Could not find employee and hr/admin users in database.');
      process.exit(1);
    }

    const employee = empRes.rows[0];
    const hr = hrRes.rows[0];

    const empToken = jwt.sign({ id: employee.id, email: employee.email, role: employee.role }, getJwtSecret(), { expiresIn: '1h' });
    const hrToken = jwt.sign({ id: hr.id, email: hr.email, role: hr.role }, getJwtSecret(), { expiresIn: '1h' });

    console.log(`👤 Testing as Employee: ${employee.email} (${employee.id})`);
    console.log(`👤 Testing as HR/Admin: ${hr.email} (${hr.id})`);

    const { app } = require('../../server');
    const testServer = http.createServer(app);

    await new Promise((resolve) => {
      testServer.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const port = testServer.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`📡 Ephemeral Test Server listening on ${baseUrl}`);

    // Helper for fetch
    const api = async (endpoint, options = {}) => {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      let body;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      return { status: res.status, body };
    };

    // Test 1: Employee Action Center
    const actionRes = await api('/api/employee-services/action-center', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log(`✓ Action Center response status: ${actionRes.status} (Items: ${actionRes.body?.items?.length})`);
    if (actionRes.status !== 200) throw new Error('Action center failed');

    // Test 2: Monthly Scorecard
    const scoreRes = await api('/api/career/scorecard', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log(`✓ Scorecard response status: ${scoreRes.status} (Productivity: ${scoreRes.body?.current?.productivity_score})`);
    if (scoreRes.status !== 200) throw new Error('Scorecard failed');

    // Test 3: AI Work Assistant Policy Q&A with Citation
    const aiRes = await api('/api/knowledge/assistant/ask', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: JSON.stringify({ prompt: 'What is the overtime policy?' })
    });
    console.log(`✓ AI Assistant status: ${aiRes.status}`);
    console.log(`  Source cited: "${aiRes.body?.source}"`);
    console.log(`  Answer snippet: "${aiRes.body?.answer?.substring(0, 80)}..."`);
    if (aiRes.status !== 200 || !aiRes.body?.source) throw new Error('AI Assistant policy retrieval failed');

    // Test 4: RBAC ISOLATION TEST 1 - Employee accessing HR Employee Relations Cases MUST be 403 Forbidden
    const unauthCasesRes = await api('/api/hr-workforce/cases', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log(`✓ RBAC Check: Employee accessing /api/hr-workforce/cases returned status: ${unauthCasesRes.status} (Expected: 403)`);
    if (unauthCasesRes.status !== 403) throw new Error('RBAC Violation: Employee was not blocked from HR cases!');

    // Test 5: HR accessing HR Cases MUST be 200 OK
    const hrCasesRes = await api('/api/hr-workforce/cases', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    console.log(`✓ RBAC Check: HR accessing /api/hr-workforce/cases returned status: ${hrCasesRes.status} (Expected: 200)`);
    if (hrCasesRes.status !== 200) throw new Error('HR failed to access HR cases');

    // Test 6: RBAC ISOLATION TEST 2 - Employee accessing another employee's compensation MUST be 403 Forbidden
    const unauthCompRes = await api(`/api/journey/compensation/my?employeeId=${hr.id}`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log(`✓ RBAC Check: Employee accessing another employee's compensation returned status: ${unauthCompRes.status} (Expected: 403)`);
    if (unauthCompRes.status !== 403) throw new Error('RBAC Violation: Employee was not blocked from accessing another user compensation!');

    // Test 7: Employee accessing own compensation MUST be 200 OK
    const myCompRes = await api('/api/journey/compensation/my', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log(`✓ Compensation Check: Employee accessing own compensation returned status: ${myCompRes.status} (Annual CTC: ₹${myCompRes.body?.annual_ctc})`);
    if (myCompRes.status !== 200) throw new Error('Employee failed to access own compensation');

    // Test 8: Attendance Correction Submission & Approval Flow
    const corrSubmitRes = await api('/api/work-management/attendance-corrections', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: JSON.stringify({
        attendance_date: '2026-09-01',
        requested_check_in: '2026-09-01T09:30:00.000Z',
        requested_check_out: '2026-09-01T18:30:00.000Z',
        reason: 'Badge scanner latency at entrance lobby'
      })
    });
    console.log(`✓ Attendance Correction Submission status: ${corrSubmitRes.status} (ID: ${corrSubmitRes.body?.correction?.id})`);
    if (corrSubmitRes.status !== 201) throw new Error('Correction submission failed');

    const correctionId = corrSubmitRes.body.correction.id;
    const corrApproveRes = await api(`/api/work-management/attendance-corrections/${correctionId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${hrToken}` },
      body: JSON.stringify({ status: 'approved', review_notes: 'Verified entrance logs.' })
    });
    console.log(`✓ Attendance Correction Approval status: ${corrApproveRes.status}`);
    if (corrApproveRes.status !== 200) throw new Error('Correction approval failed');

    testServer.close();
    console.log('\n🎉 ALL ENTERPRISE API & RBAC SECURITY TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Enterprise suite test failed:', err);
    process.exit(1);
  }
}

testEnterpriseSuite();
