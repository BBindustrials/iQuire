// ============================================================================
// iQuire Form Validators
// ============================================================================

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Nigerian phone number
 * Accepts: 08012345678, 07012345678, 09012345678, 08112345678, +2348012345678
 */
export const isValidNigerianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const regex = /^(\+?234|0)[789][01]\d{8}$/;
  return regex.test(cleaned);
};

/**
 * Validate password strength
 * Minimum 8 characters, at least 1 letter and 1 number
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (
  password: string
): { level: 'weak' | 'medium' | 'strong'; score: number } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak', score };
  if (score <= 4) return { level: 'medium', score };
  return { level: 'strong', score };
};

/**
 * Check if a value is empty (undefined, null, or whitespace)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

/**
 * Trim and normalize a string
 */
export const normalizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Format Nigerian phone to international format
 * e.g., 08012345678 -> +2348012345678
 */
export const formatPhoneToInternational = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+234')) return cleaned;
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
  return cleaned;
};