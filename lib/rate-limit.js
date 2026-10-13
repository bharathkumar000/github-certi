/**
 * In-memory sliding window rate limiter for access-code attempts
 */

const tracker = new Map();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 60 * 1000; // 1 minute window

export function checkRateLimit(ip = 'unknown') {
  const now = Date.now();
  const record = tracker.get(ip) || { count: 0, firstAttempt: now, blockedUntil: 0 };

  if (record.blockedUntil > now) {
    const secondsRemaining = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      message: `Too many attempts. Please try again in ${secondsRemaining} seconds.`,
      secondsRemaining
    };
  }

  // If outside the window, reset
  if (now - record.firstAttempt > WINDOW_MS) {
    record.count = 1;
    record.firstAttempt = now;
    tracker.set(ip, record);
    return { allowed: true };
  }

  record.count += 1;
  tracker.set(ip, record);

  if (record.count > MAX_ATTEMPTS) {
    // Block for 2 minutes
    record.blockedUntil = now + 2 * 60 * 1000;
    tracker.set(ip, record);
    return {
      allowed: false,
      message: 'Too many incorrect attempts. Please wait 2 minutes before trying again.',
      secondsRemaining: 120
    };
  }

  return { allowed: true };
}

export function resetRateLimit(ip = 'unknown') {
  tracker.delete(ip);
}
