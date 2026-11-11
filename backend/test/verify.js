// Automated Verification Script for RESILIENCE AI Backend API

async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log(`\n======================================================`);
  console.log(`🧪 Starting Comprehensive RESILIENCE AI API Test Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health should return status healthy', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'healthy') {
      throw new Error(`Expected 200 and status 'healthy', got ${res.status}`);
    }
  });

  // 2. Districts Listing
  await test('GET /api/districts should return district list', async () => {
    const res = await fetch(`${BASE_URL}/districts`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Districts array missing or empty');
    }
  });

  // 3. District Details & Preparedness Score
  await test('GET /api/districts/dhemaji should return shelters & scoreDetails', async () => {
    const res = await fetch(`${BASE_URL}/districts/dhemaji`);
    const data = await res.json();
    if (!data.success || !data.data.scoreDetails || typeof data.data.scoreDetails.score !== 'number') {
      throw new Error('Score calculation missing');
    }
    if (!Array.isArray(data.data.sheltersList) || data.data.sheltersList.length === 0) {
      throw new Error('Shelters list empty');
    }
  });

  // 4. Historical Disaster Incidents
  await test('GET /api/incidents should return historical memory records', async () => {
    const res = await fetch(`${BASE_URL}/incidents`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Historical incidents missing');
    }
  });

  // 5. Emergency Shelters
  await test('GET /api/resources/shelters should return relief shelters', async () => {
    const res = await fetch(`${BASE_URL}/resources/shelters`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Shelters missing');
    }
  });

  // 6. Action Plan Generation
  await test('GET /api/action-plans/dhemaji/Flood should return structured directives', async () => {
    const res = await fetch(`${BASE_URL}/action-plans/dhemaji/Flood`);
    const data = await res.json();
    if (!data.success || !data.data.immediateTasks || data.data.immediateTasks.length === 0) {
      throw new Error('Immediate action plan tasks missing');
    }
    if (!data.data.disclaimer) {
      throw new Error('Statutory disclaimer missing from action plan');
    }
  });

  // 7. System Stats
  await test('GET /api/stats should return dashboard summary', async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    const data = await res.json();
    if (!data.success || typeof data.data.totalDistricts !== 'number') {
      throw new Error('System stats invalid');
    }
  });

  // 8. Admin Login with Configured Credentials
  let adminToken = '';
  await test('POST /api/auth/login should authenticate admin and return JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@resilience.gov.in',
        password: 'ResilienceAdmin#2026'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data.token) {
      throw new Error('JWT token not returned for valid admin credentials');
    }
    adminToken = data.data.token;
  });

  // 9. Admin Login with Invalid Password
  await test('POST /api/auth/login should reject invalid credentials (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@resilience.gov.in',
        password: 'WrongPassword#123'
      })
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    }
  });

  // 10. Public Registration Blocked
  await test('POST /api/auth/register should return 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newuser@gmail.com', password: 'password123' })
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    }
  });

  // 11. Verify Active Admin Session
  await test('GET /api/auth/verify should validate session token', async () => {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.data.isValid) {
      throw new Error('Token verification failed');
    }
  });

  console.log(`\n======================================================`);
  console.log(`📊 Test Summary: ${passed} Passed | ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
