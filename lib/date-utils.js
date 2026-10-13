/**
 * Date utility functions for GitHub Workshop Certificate Generator
 * Formats dates adhering to timezone (default Asia/Kolkata)
 */

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns formatted date string like "13 October 2026"
 * in the specified timezone (defaults to Asia/Kolkata).
 * Ensures no UTC date skew for participants in India.
 * 
 * @param {Date|string|number} dateInput - optional Date object or timestamp
 * @param {string} timezone - e.g. 'Asia/Kolkata'
 * @returns {string}
 */
export function getFormattedDateInTimezone(dateInput = new Date(), timezone = DEFAULT_TIMEZONE) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return '';
    }

    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone || DEFAULT_TIMEZONE
    });

    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    // Fallback to basic en-GB formatting
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

/**
 * Resolves the display date for a session:
 * If date_mode is 'custom' and custom_date_text is provided, returns that.
 * Otherwise returns today's date formatted in the session's timezone.
 */
export function resolveCertificateDate(session) {
  if (!session) return getFormattedDateInTimezone();
  
  if (session.date_mode === 'custom' && session.custom_date_text) {
    return session.custom_date_text.trim();
  }
  
  const tz = session.timezone || DEFAULT_TIMEZONE;
  return getFormattedDateInTimezone(new Date(), tz);
}
