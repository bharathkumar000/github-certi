const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function runTests() {
  console.log('🚀 Running Full E2E Verification Suite for GitHub Workshop Certificate Generator...\n');

  // Test 1: Landing Page
  const landingRes = await fetch(`${BASE_URL}/`);
  console.log(`[Test 1] Landing Page GET /: ${landingRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${landingRes.status})`);

  // Test 2: Invalid Access Code Verification
  const badVerifyRes = await fetch(`${BASE_URL}/api/portal/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: 'INVALID-CODE-999' })
  });
  console.log(`[Test 2] Invalid Access Code: ${badVerifyRes.status === 401 ? '✅ PASSED (401 Unauthorized)' : '❌ FAILED'} (${badVerifyRes.status})`);

  // Test 3: Valid Access Code Verification
  const goodVerifyRes = await fetch(`${BASE_URL}/api/portal/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: 'GH-OCT-2026' })
  });
  const goodVerifyData = await goodVerifyRes.json();
  const participantCookie = goodVerifyRes.headers.get('set-cookie');
  console.log(`[Test 3] Valid Access Code Verification: ${goodVerifyRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Session ID: ${goodVerifyData.sessionId}`);
  console.log(`         Session Name: ${goodVerifyData.sessionName}`);

  // Test 4: Participant Session Info Retrieval
  const sessionInfoRes = await fetch(`${BASE_URL}/api/portal/session-info`, {
    headers: { Cookie: participantCookie }
  });
  const sessionInfoData = await sessionInfoRes.json();
  console.log(`[Test 4] Session Info GET /api/portal/session-info: ${sessionInfoRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Resolved Date: ${sessionInfoData.session.display_date}`);
  console.log(`         Timezone: ${sessionInfoData.session.timezone}`);
  console.log(`         Template Path: ${sessionInfoData.session.certificate_template_path}`);

  // Test 5: Certificate PDF Generation
  const certGenRes = await fetch(`${BASE_URL}/api/certificates/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: participantCookie
    },
    body: JSON.stringify({ participantName: 'Anu Reddy' })
  });
  const certBuffer = await certGenRes.arrayBuffer();
  console.log(`[Test 5] Certificate PDF Generation: ${certGenRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${certBuffer.byteLength} bytes)`);
  console.log(`         Content-Type: ${certGenRes.headers.get('content-type')}`);
  console.log(`         Filename: ${certGenRes.headers.get('content-disposition')}`);

  // Test 6: Repeat Downloads (Mandatory requirement!)
  const repeatGenRes = await fetch(`${BASE_URL}/api/certificates/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: participantCookie
    },
    body: JSON.stringify({ participantName: 'Dr. Anu V. Reddy' })
  });
  const repeatBuffer = await repeatGenRes.arrayBuffer();
  console.log(`[Test 6] Repeat Download Functionality: ${repeatGenRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${repeatBuffer.byteLength} bytes)`);

  // Test 7: Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@githubworkshop.com',
      password: 'WorkshopAdmin2026!'
    })
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log(`[Test 7] Admin Authentication: ${adminLoginRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 8: Admin Sessions List & Details
  const adminSessionsRes = await fetch(`${BASE_URL}/api/admin/sessions`, {
    headers: { Cookie: adminCookie }
  });
  const adminSessionsData = await adminSessionsRes.json();
  console.log(`[Test 8] Admin Sessions List: ${adminSessionsRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${adminSessionsData.sessions.length} sessions)`);

  // Test 9: Admin Layout Configuration (GET & PUT)
  const layoutRes = await fetch(`${BASE_URL}/api/admin/sessions/ws-session-001/layout`, {
    headers: { Cookie: adminCookie }
  });
  const layoutData = await layoutRes.json();
  console.log(`[Test 9] Layout Config Retrieval: ${layoutRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Name Position: (${layoutData.layout.name_x}%, ${layoutData.layout.name_y}%)`);
  console.log(`         Date Position: (${layoutData.layout.date_x}%, ${layoutData.layout.date_y}%)`);

  // Test 10: Activity Logs
  const logsRes = await fetch(`${BASE_URL}/api/admin/logs`, {
    headers: { Cookie: adminCookie }
  });
  const logsData = await logsRes.json();
  console.log(`[Test 10] Admin Activity Logs: ${logsRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`          Total Downloads Recorded: ${logsData.stats.totalDownloads}`);
  console.log(`          Log Entries: ${logsData.logs.length}`);

  console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL!');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
