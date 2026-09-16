// ============================================================================
// iQuire Formatters
// ============================================================================

/**
 * Capitalize the first letter of each word
 */
export const titleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format phone number for display: 0801 234 5678
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Mask email for privacy: j***@example.com
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return email;
  return `${local.charAt(0)}${'*'.repeat(Math.max(local.length - 2, 1))}${local.charAt(
    local.length - 1
  )}@${domain}`;
};

/**
 * Format date as: Jan 15, 2026
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};