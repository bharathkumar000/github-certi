import crypto from 'crypto';

/**
 * Generates a clean 6-digit numeric workshop access code (100000 to 999999)
 * Example: 849201 or 593821
 */
export function generateRandomAccessCode() {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Computes a secure SHA-256 hash with salt for access codes
 */
const SALT = process.env.ACCESS_CODE_SALT || 'github_workshop_salt_2026_xyz';

export function hashAccessCode(code) {
  if (!code) return '';
  const normalized = String(code).trim().toUpperCase();
  return crypto.createHmac('sha256', SALT).update(normalized).digest('hex');
}

/**
 * Compares a user-provided access code with a stored hash
 */
export function verifyAccessCodeHash(rawCode, storedHash) {
  if (!rawCode || !storedHash) return false;
  const computed = hashAccessCode(rawCode);
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return false;
  }
}
