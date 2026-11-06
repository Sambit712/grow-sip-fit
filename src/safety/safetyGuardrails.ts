/**
 * safetyGuardrails.ts
 * Layer 5 — Safety Guardrails Pipeline
 *
 * Composes PII Redactor, Advice Blocker, and Return Guarantee Filter into
 * a single unified safety pipeline. Every AI-generated string and user-facing narrative
 * is sanitized through applySafetyFilters before being rendered to the user.
 */

import { piiRedactor } from './piiRedactor';
import { adviceBlocker } from './adviceBlocker';
import { returnGuaranteeFilter } from './returnGuaranteeFilter';

export { piiRedactor, REDACTED_TOKEN } from './piiRedactor';
export { adviceBlocker, ADVICE_DISCLAIMER_NOTE } from './adviceBlocker';
export { returnGuaranteeFilter, SEBI_MARKET_RISK_DISCLAIMER } from './returnGuaranteeFilter';

/**
 * Apply all Layer 5 safety guardrails sequentially to raw text.
 *
 * 1. PII Redactor: Scrubs PAN, Aadhaar, Cards, OTPs, Bank Account Numbers.
 * 2. Advice Blocker: Neutralizes specific scheme names and stock picks.
 * 3. Return Guarantee Filter: Replaces return promises with SEBI disclaimers.
 */
export function applySafetyFilters(rawText: string): string {
  if (!rawText) return rawText;

  return [piiRedactor, adviceBlocker, returnGuaranteeFilter].reduce(
    (text, filter) => filter(text),
    rawText
  );
}

