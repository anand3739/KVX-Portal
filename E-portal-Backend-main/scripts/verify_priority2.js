const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runVerification() {
  console.log('==================================================================');
  console.log('PRIORITY 2 END-TO-END VERIFICATION: DEPARTMENTS & SETTINGS');
  console.log('==================================================================\n');

  try {
    // Step 1: Login as Admin
    console.log('1. Logging in as admin@kravix.com...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@kravix.com',
        password: 'Admin@123',
      }),
    });

    const token = loginRes.token || loginRes.data?.token;
    if (!token) {
      throw new Error('Login failed: Token not returned');
    }
    console.log('   ✓ Admin login successful. Token acquired.\n');

    const authHeaders = { Authorization: `Bearer ${token}` };

    // ═════════════════════════════════════════════════════════════════
    // MODULE 1: DEPARTMENTS API VERIFICATION
    // ═════════════════════════════════════════════════════════════════
    console.log('--- MODULE 1: ADMIN → DEPARTMENTS ---');

    // 1.1 GET /api/departments
    console.log('1.1 Testing GET /api/departments...');
    const getDeptsRes = await request('/departments', { headers: authHeaders });
    console.log(`   ✓ Success: Count: ${getDeptsRes.data?.length || 0}`);

    // 1.2 POST /api/departments (Create)
    console.log('1.2 Testing POST /api/departments (Create Department)...');
    const newDeptPayload = {
      name: `Test Dept ${Date.now()}`,
      description: 'Department created during Priority 2 automated verification',
      budget: 750000.00
    };
    const createDeptRes = await request('/departments', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newDeptPayload),
    });
    const createdDept = createDeptRes.data;
    console.log(`   ✓ Created Department ID: ${createdDept.id}, Name: "${createdDept.name}"`);

    // 1.3 GET /api/departments/:id (Read)
    console.log(`1.3 Testing GET /api/departments/${createdDept.id} (Read Single)...`);
    const getSingleDeptRes = await request(`/departments/${createdDept.id}`, { headers: authHeaders });
    console.log(`   ✓ Retrieved Department: "${getSingleDeptRes.data.name}"`);

    // 1.4 PUT /api/departments/:id (Update)
    console.log(`1.4 Testing PUT /api/departments/${createdDept.id} (Update Department)...`);
    const updateDeptRes = await request(`/departments/${createdDept.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: `${createdDept.name} (Updated)`,
        budget: 850000.00
      }),
    });
    console.log(`   ✓ Updated Department Name: "${updateDeptRes.data.name}", Budget: ${updateDeptRes.data.budget}`);

    // 1.5 DELETE /api/departments/:id (Delete)
    console.log(`1.5 Testing DELETE /api/departments/${createdDept.id} (Delete Department)...`);
    const deleteDeptRes = await request(`/departments/${createdDept.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`   ✓ Deleted Department ID: ${deleteDeptRes.data.id}`);

    console.log('✓ All Admin Departments operations verified end-to-end successfully!\n');

    // ═════════════════════════════════════════════════════════════════
    // MODULE 2: SETTINGS API VERIFICATION
    // ═════════════════════════════════════════════════════════════════
    console.log('--- MODULE 2: ADMIN → SETTINGS ---');

    // 2.1 GET & PUT Company Settings
    console.log('2.1 Testing GET & PUT /api/settings/company...');
    const getCompRes = await request('/settings/company', { headers: authHeaders });
    console.log('   ✓ Company Settings GET initial name:', getCompRes.data.company_name);

    const updateCompRes = await request('/settings/company', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        company_name: 'KRAVIX TECH ENTERPRISE',
        email: 'admin@kravix.com',
        timezone: 'Asia/Kolkata',
        currency: 'INR'
      }),
    });
    console.log('   ✓ Company Settings PUT updated name:', updateCompRes.data.company_name);

    // 2.2 GET & PUT User Preferences
    console.log('2.2 Testing GET & PUT /api/settings/user-preferences...');
    const getPrefRes = await request('/settings/user-preferences', { headers: authHeaders });
    console.log('   ✓ User Preferences GET theme:', getPrefRes.data.theme);

    const updatePrefRes = await request('/settings/user-preferences', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        theme: 'dark',
        language: 'en',
        date_format: 'DD/MM/YYYY',
        accent_color: 'indigo'
      }),
    });
    console.log('   ✓ User Preferences PUT updated theme:', updatePrefRes.data.theme);

    // 2.3 GET & PUT System Settings
    console.log('2.3 Testing GET & PUT /api/settings/system...');
    const getSysRes = await request('/settings/system', { headers: authHeaders });
    console.log('   ✓ System Settings GET session timeout:', getSysRes.data.session_timeout_minutes);

    const updateSysRes = await request('/settings/system', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        two_factor_auth: false,
        session_timeout_minutes: 60,
        max_login_attempts: 5
      }),
    });
    console.log('   ✓ System Settings PUT updated session timeout:', updateSysRes.data.session_timeout_minutes);

    // 2.4 GET & PUT Notification Settings
    console.log('2.4 Testing GET & PUT /api/settings/notifications...');
    const getNotifRes = await request('/settings/notifications', { headers: authHeaders });
    console.log('   ✓ Notification Settings GET email:', getNotifRes.data.email);

    const updateNotifRes = await request('/settings/notifications', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        email: true,
        push: true,
        leave_updates: true
      }),
    });
    console.log('   ✓ Notification Settings PUT updated email:', updateNotifRes.data.email);

    // 2.5 Verification of Persistence
    console.log('2.5 Verifying Persistence (Re-querying settings endpoints)...');
    const verifyComp = await request('/settings/company', { headers: authHeaders });
    const verifyPref = await request('/settings/user-preferences', { headers: authHeaders });
    if (verifyComp.data.company_name !== 'KRAVIX TECH ENTERPRISE' || verifyPref.data.theme !== 'dark') {
      throw new Error('Persistence verification failed! Settings were not saved in database.');
    }
    console.log('   ✓ Settings persistence verified in backend database!\n');

    console.log('==================================================================');
    console.log('SUMMARY: ALL PRIORITY 2 TESTS PASSED PERFECTLY!');
    console.log('==================================================================');
  } catch (err) {
    console.error('\n❌ VERIFICATION ERROR:', err.data || err.message);
    process.exit(1);
  }
}

runVerification();
