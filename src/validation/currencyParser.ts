/**
 * currencyParser.ts
 * Layer 2 — Data Normalisation & Validation
 *
 * Parses user input in various Indian and standard currency formats into integer Rupees.
 * Returns null for unrecognizable input (never guesses).
 *
 * Supported formats:
 * - "25k", "25K" → 25000
 * - "2.5k", "2.5K" → 2500
 * - "2.5L", "2.5 Lakh", "2.5 lakh", "2.5l" → 250000
 * - "1Cr", "1.5 Cr", "1 Crore", "1.5 crore" → 10000000, 15000000
 * - "25,000", "2,50,000" (Indian comma separators)
 * - "₹50,000", "Rs. 50000", "INR 50000"
 * - Plain numeric strings: "50000", 50000
 */

export function parseCurrencyInput(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input) || input < 0) {
      return null;
    }
    return Math.round(input);
  }

  const raw = input.trim();
  if (raw === '') {
    return null;
  }

  // Remove currency symbols, INR, Rs, dots, spaces around symbols
  let cleaned = raw
    .replace(/₹/g, '')
    .replace(/(?:^|\s)(?:inr|rs\.?|rupees?)(?:\s|$)/gi, ' ')
    .trim();

  // Remove internal whitespace for parsing
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Match Crore format: e.g. "1.5 Cr", "2 Crore", "2crores", "1cr"
  const croreMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:cr|crore|crores)$/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    if (!isNaN(val) && val >= 0) {
      return Math.round(val * 10000000);
    }
    return null;
  }

  // Match Lakh format: e.g. "2.5L", "5 Lakh", "5lakhs", "2.5 l", "10 lac", "10 lacs"
  const lakhMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:l|lakh|lakhs|lac|lacs)$/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    if (!isNaN(val) && val >= 0) {
      return Math.round(val * 100000);
    }
    return null;
  }

  // Match Thousand (k) format: e.g. "25k", "2.5 k", "50K"
  const thousandMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:k|thousand)$/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    if (!isNaN(val) && val >= 0) {
      return Math.round(val * 1000);
    }
    return null;
  }

  // Match Indian / Standard comma-separated number or plain digits: e.g. "2,50,000", "25,000", "50000"
  // Remove commas
  const noCommas = cleaned.replace(/,/g, '');
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(noCommas)) {
    const val = parseFloat(noCommas);
    if (!isNaN(val) && val >= 0) {
      return Math.round(val);
    }
  }

  return null;
}

/**
 * Format a number into standard Indian Rupee representation (e.g. ₹25,000, ₹2,50,000, ₹1.5 Cr)
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));

  if (compact) {
    if (abs >= 10000000) {
      const cr = (abs / 10000000).toFixed(2).replace(/\.?0+$/, '');
      return `${isNegative ? '-' : ''}₹${cr} Cr`;
    }
    if (abs >= 100000) {
      const l = (abs / 100000).toFixed(2).replace(/\.?0+$/, '');
      return `${isNegative ? '-' : ''}₹${l} L`;
    }
    if (abs >= 1000) {
      const k = (abs / 1000).toFixed(1).replace(/\.?0+$/, '');
      return `${isNegative ? '-' : ''}₹${k}K`;
    }
  }

  return `${isNegative ? '-' : ''}₹${abs.toLocaleString('en-IN')}`;
}
