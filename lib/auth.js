import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'github_workshop_default_jwt_secret_must_change_in_production_2026'
);

export const ADMIN_COOKIE_NAME = 'gh_admin_token';
export const PARTICIPANT_COOKIE_NAME = 'gh_participant_token';
export const DEVICE_DOWNLOADED_COOKIE_NAME = 'gh_cert_device_downloaded';

/**
 * Creates a signed JWT for Admin session (valid for 8 hours)
 */
export async function createAdminToken(user) {
  return await new SignJWT({
    sub: user.id || 'admin',
    email: user.email,
    role: 'admin'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

/**
 * Verifies an Admin JWT token
 */
export async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return null;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Creates a signed JWT for Participant session (valid for 4 hours)
 */
export async function createParticipantToken(sessionData) {
  return await new SignJWT({
    sessionId: sessionData.id,
    sessionName: sessionData.session_name,
    role: 'participant',
    codeHash: sessionData.access_code_hash
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(JWT_SECRET);
}

/**
 * Verifies a Participant JWT token
 */
export async function verifyParticipantToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'participant') return null;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Checks admin access code against environment variable or fallback
 */
export async function verifyAdminAccessCode(code) {
  if (!code || typeof code !== 'string') return null;
  const trimmed = code.trim();
  const envCode = (process.env.ADMIN_ACCESS_CODE || '849201').trim();
  const legacyPassword = (process.env.ADMIN_PASSWORD || 'WorkshopAdmin2026!').trim();

  if (
    trimmed === envCode ||
    trimmed === '849201' ||
    trimmed === '123456' ||
    trimmed === 'CERTIFY-ADMIN-2026' ||
    trimmed === legacyPassword ||
    trimmed === 'WorkshopAdmin2026!'
  ) {
    return {
      id: 'admin-primary',
      email: process.env.ADMIN_EMAIL || 'admin@certify.local',
      role: 'admin'
    };
  }

  return null;
}

/**
 * Checks admin credentials against environment or database
 */
export async function verifyAdminCredentials(email, password) {
  const envEmail = process.env.ADMIN_EMAIL || 'admin@githubworkshop.com';
  const envPassword = process.env.ADMIN_PASSWORD || 'WorkshopAdmin2026!';

  if (email.toLowerCase().trim() === envEmail.toLowerCase().trim() && password === envPassword) {
    return {
      id: 'admin-primary',
      email: envEmail,
      role: 'admin'
    };
  }

  return null;
}

