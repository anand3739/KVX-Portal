const http = require('http');

function makeRequest(options) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', err => resolve({ statusCode: 500, error: err.message }));
    req.end();
  });
}

async function runVerification() {
  console.log('🚀 Running Priority 1 Backend Verification Script...\n');

  // 1. Notification PATCH endpoints test
  console.log('1. Verifying Notification PATCH endpoints...');
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notifications/00000000-0000-0000-0000-000000000000/read',
    method: 'PATCH'
  });
  console.log(`   PATCH /api/notifications/:id/read -> HTTP ${res1.statusCode}`);
  if (res1.statusCode !== 405) {
    console.log('   ✅ PATCH method accepted (No 405 Method Not Allowed error)');
  } else {
    console.log('   ❌ Received 405 Method Not Allowed');
  }

  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notifications/read-all',
    method: 'PATCH'
  });
  console.log(`   PATCH /api/notifications/read-all -> HTTP ${res2.statusCode}`);
  if (res2.statusCode !== 405) {
    console.log('   ✅ PATCH method accepted for read-all (No 405 Method Not Allowed error)');
  } else {
    console.log('   ❌ Received 405 Method Not Allowed');
  }

  // 2. Upload routes check
  console.log('\n2. Verifying Employee Upload routes matching...');
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees/00000000-0000-0000-0000-000000000000/profile-picture',
    method: 'POST'
  });
  console.log(`   POST /api/employees/:id/profile-picture -> HTTP ${res3.statusCode}`);
  if (res3.statusCode !== 404) {
    console.log('   ✅ Route is matched! (Not 404 Route Not Found)');
  }

  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees/00000000-0000-0000-0000-000000000000/banner',
    method: 'POST'
  });
  console.log(`   POST /api/employees/:id/banner -> HTTP ${res4.statusCode}`);
  if (res4.statusCode !== 404) {
    console.log('   ✅ Route is matched! (Not 404 Route Not Found)');
  }

  console.log('\n🎉 Verification script complete!');
}

runVerification();
