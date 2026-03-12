/**
 * Normalize phone number — strip spaces, dashes, and ensure 10-digit format
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // If starts with +91, remove it
  if (cleaned.startsWith("+91")) {
    return cleaned.slice(3);
  }
  // If starts with 91 and is 12 digits
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return cleaned.slice(2);
  }

  return cleaned;
}

/**
 * Validate that phone is a 10-digit Indian mobile number
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}
