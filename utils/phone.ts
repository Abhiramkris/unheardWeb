/**
 * Robust phone number normalization for unHeard.
 * Converts various formats into standard E.164 (e.g., +918848656908).
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';

  // 1. Remove all non-numeric characters (keep + if present)
  let cleaned = phone.replace(/[^\d+]/g, '');

  // 2. Handle 00 prefix (common international dial code)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // 3. Handle numbers without + prefix
  if (!cleaned.startsWith('+')) {
    // If it starts with 91 and is 12 digits, it's likely India with country code but no +
    // If it's 10 digits, it's likely India without country code.
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      // Default to adding + if it's longer than 10 digits (international)
      cleaned = '+' + cleaned;
    }
  }

  return cleaned;
};

/**
 * Formats a phone number for WhatsApp internal usage (Baileys format).
 * E.g., +918848656908 -> 918848656908@s.whatsapp.net
 */
export const toWhatsAppJid = (phone: string): string => {
  const normalized = normalizePhone(phone);
  const numericOnly = normalized.replace('+', '');
  return `${numericOnly}@s.whatsapp.net`;
};
