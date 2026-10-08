/**
 * Phone Number Utilities for Indian Mobile Numbers (+91)
 */

/**
 * Normalizes a raw phone number input into standardized +91XXXXXXXXXX format.
 * Strips whitespace, dashes, and extra prefixes.
 */
export function normalizePhoneNumber(rawNumber: string): string {
  if (!rawNumber) return '';

  // Remove non-numeric characters except leading '+'
  let cleaned = rawNumber.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Keep only the 10-digit base number
  const digitsOnly = cleaned.replace(/\D/g, '').slice(0, 10);
  return digitsOnly ? `+91${digitsOnly}` : '';
}

/**
 * Validates whether the given string represents a valid 10-digit Indian mobile number.
 * Valid Indian mobile numbers begin with 6, 7, 8, or 9 and have 10 digits.
 */
export function validatePhoneNumber(rawNumber: string): boolean {
  if (!rawNumber) return false;
  const normalized = normalizePhoneNumber(rawNumber);
  if (!normalized.startsWith('+91') || normalized.length !== 13) {
    return false;
  }
  const digits = normalized.substring(3);
  // Must be 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Formats a phone number for user display, e.g. +91 98765 43210
 */
export function formatDisplayPhone(rawNumber?: string): string {
  if (!rawNumber) return '';
  const normalized = normalizePhoneNumber(rawNumber);
  if (normalized.length !== 13) return rawNumber;

  const code = normalized.substring(0, 3);
  const part1 = normalized.substring(3, 8);
  const part2 = normalized.substring(8);
  return `${code} ${part1} ${part2}`;
}

/**
 * Masks a phone number for OTP verification display: +91 ******3210
 */
export function maskPhoneNumber(rawNumber?: string): string {
  if (!rawNumber) return '';
  const normalized = normalizePhoneNumber(rawNumber);
  if (normalized.length < 13) {
    return rawNumber || '';
  }

  const code = normalized.substring(0, 3);
  const lastFour = normalized.slice(-4);
  return `${code} ******${lastFour}`;
}
