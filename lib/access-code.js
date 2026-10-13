import crypto from 'crypto';

/**
 * Generates a clean, readable workshop access code
 * Example: GH-OCT-4821 or GH-WS-9302
 */
export function generateRandomAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  return `GH-WS-${randomPart}`;
}

/**
 * Computes a secure SHA-256 hash with salt for access codes
 * (Access codes are typically 8-12 alphanumeric characters)
 */
const SALT = process.env.ACCESS_CODE_SALT || 'github_workshop_salt_2026_xyz';

export function hashAccessCode(code) {
  if (!code) return '';
  const normalized = code.trim().toUpperCase();
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
