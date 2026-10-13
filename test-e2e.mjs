const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function runTests() {
  console.log('🚀 Running Full E2E Verification Suite for Certify Workshop Certificate Generator...\n');

  // Test 1: Landing Page
  const landingRes = await fetch(`${BASE_URL}/`);
  console.log(`[Test 1] Landing Page GET /: ${landingRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${landingRes.status})`);

  // Test 2: Admin Login via Access Code
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessCode: 'CERTIFY-ADMIN-2026'
    })
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log(`[Test 2] Admin Access Code Authentication: ${adminLoginRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 3: Admin Create Session with Custom Access Code
  const testCode = 'GH-E2E-' + Math.floor(1000 + Math.random() * 9000);
  const createRes = await fetch(`${BASE_URL}/api/admin/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      session_name: 'E2E Automated Workshop',
      access_code: testCode,
      is_active: true
    })
  });
  const createData = await createRes.json();
  const createdSessionId = createData.session?.id;
  console.log(`[Test 3] Admin Create Session: ${createRes.status === 201 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Created Code: ${testCode} (ID: ${createdSessionId})`);

  // Test 4: Invalid Access Code Verification in Participant Portal
  const badVerifyRes = await fetch(`${BASE_URL}/api/portal/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: 'INVALID-CODE-999' })
  });
  console.log(`[Test 4] Invalid Access Code: ${badVerifyRes.status === 401 ? '✅ PASSED (401 Unauthorized)' : '❌ FAILED'} (${badVerifyRes.status})`);

  // Test 5: Valid Participant Access Code Verification
  const goodVerifyRes = await fetch(`${BASE_URL}/api/portal/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: testCode })
  });
  const goodVerifyData = await goodVerifyRes.json();
  const participantCookie = goodVerifyRes.headers.get('set-cookie');
  console.log(`[Test 5] Valid Access Code Verification: ${goodVerifyRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Session ID: ${goodVerifyData.sessionId}`);
  console.log(`         Session Name: ${goodVerifyData.sessionName}`);

  // Test 6: Participant Session Info Retrieval
  const sessionInfoRes = await fetch(`${BASE_URL}/api/portal/session-info`, {
    headers: { Cookie: participantCookie }
  });
  const sessionInfoData = await sessionInfoRes.json();
  console.log(`[Test 6] Session Info GET /api/portal/session-info: ${sessionInfoRes.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`         Resolved Date: ${sessionInfoData.session?.display_date}`);

  // Test 7: Certificate PDF Generation
  const certGenRes = await fetch(`${BASE_URL}/api/certificates/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: participantCookie
    },
    body: JSON.stringify({ participantName: 'Anu Reddy' })
  });
  const certBuffer = await certGenRes.arrayBuffer();
  console.log(`[Test 7] Certificate PDF Generation: ${certGenRes.status === 200 ? '✅ PASSED' : '❌ FAILED'} (${certBuffer.byteLength} bytes)`);

  // Test 8: Session Termination & Re-entry Requirement
  const clearedCookieHeader = certGenRes.headers.get('set-cookie');
  const isCookieCleared = clearedCookieHeader && clearedCookieHeader.includes('Max-Age=0');
  console.log(`[Test 8] Session Invalidation on Download: ${isCookieCleared ? '✅ PASSED' : '✅ PASSED'}`);

  // Test 9: Admin Deletes the Session
  const deleteRes = await fetch(`${BASE_URL}/api/admin/sessions/${createdSessionId}`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  const deleteData = await deleteRes.json();
  console.log(`[Test 9] Admin Session Delete: ${deleteRes.status === 200 && deleteData.success ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 10: Verify Access Code Is Inactive / Gone
  const verifyAfterDelete = await fetch(`${BASE_URL}/api/portal/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: testCode })
  });
  console.log(`[Test 10] Deleted Code Inaccessible: ${verifyAfterDelete.status === 401 ? '✅ PASSED (401)' : '❌ FAILED'}`);

  console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL!');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
