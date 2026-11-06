/**
 * piiRedactor.ts
 * Layer 5 — Safety Guardrails
 *
 * Scans text for sensitive personally identifiable information (PII)
 * and financial credentials (PAN, Aadhaar, Cards, OTPs, Bank Account Numbers).
 * Automatically replaces occurrences with a standardized warning token
 * and logs a Privacy_incident analytics event.
 */

import { track } from '../utils/analytics';

export const REDACTED_TOKEN = '[REDACTED - please do not share sensitive credentials]';

export interface PiiDetectionPattern {
  name: string;
  regex: RegExp;
}

export const PII_PATTERNS: PiiDetectionPattern[] = [
  // Indian Permanent Account Number (PAN): 5 letters, 4 numbers, 1 letter
  {
    name: 'PAN',
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi,
  },
  // Indian Aadhaar: 12 digits, optionally spaced into 4-4-4
  {
    name: 'Aadhaar',
    regex: /\b[2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g,
  },
  // Credit / Debit Card: 16 digits formatted or consecutive
  {
    name: 'CardNumber',
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  },
  // OTP: 4-8 digits in proximity to "otp" or "one time password"
  {
    name: 'OTP',
    regex: /\b(?:otp|one[-\s]?time[-\s]?password)(?:\s+is|\s*[:=-])?\s+\d{4,8}\b|\b\d{4,8}\b\s+(?:is\s+(?:your\s+)?)?(?:otp|one[-\s]?time[-\s]?password)\b/gi,
  },
  // Bank Account Numbers: 9 to 18 digits in context of account keywords or long sequence
  {
    name: 'BankAccount',
    regex: /(?:(?:account|acct|acc|a\/c)[\s#.:-]*)\b\d{9,18}\b/gi,
  },
];

/**
 * Scan input text and redact all detected sensitive credentials.
 * If credentials are found, logs a privacy incident.
 */
export function piiRedactor(text: string): string {
  if (!text) return text;

  let redacted = text;
  let detectedAny = false;
  const detectedTypes: string[] = [];

  for (const { name, regex } of PII_PATTERNS) {
    if (regex.test(redacted)) {
      detectedAny = true;
      detectedTypes.push(name);
      // Reset lastIndex for stateful regexes and replace
      regex.lastIndex = 0;
      redacted = redacted.replace(regex, REDACTED_TOKEN);
    }
  }

  if (detectedAny) {
    track('Privacy_incident', {
      detectedTypes,
      timestamp: new Date().toISOString(),
    });
  }

  return redacted;
}
