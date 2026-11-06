/**
 * returnGuaranteeFilter.ts
 * Layer 5 — Safety Guardrails
 *
 * Scans text for promises of specific returns, fixed CAGRs, or guarantee claims.
 * Replaces illegal return promises with mandatory SEBI regulatory disclaimer language.
 */

export const SEBI_MARKET_RISK_DISCLAIMER =
  '[Market-linked investment. Returns cannot be guaranteed or promised; mutual funds are subject to market volatility and past performance does not ensure future results]';

const GUARANTEE_PATTERNS = [
  /\b\d{1,2}(?:\.\d+)?%\s+(?:guaranteed|assured|promised|fixed)\s*(?:returns?|profits?|gains?)?\b/gi,
  /\b(?:guaranteed|assured|promised|fixed|risk-free)\s+(?:returns?|profits?|gains?|yields?|cagr)\b/gi,
  /\byou\s+will\s+(?:get|earn|make|receive)\s+(?:\d{1,2}(?:\.\d+)?%|double\s+your\s+money)/gi,
  /\b(?:cagr|annual\s+returns?|returns?)\s+of\s+\d{1,2}(?:\.\d+)?%/gi,
  /\b\d{1,2}(?:\.\d+)?%\s+(?:per\s+year|annually|guaranteed|fixed\s+returns?|every\s+year)/gi,
  /\b(?:double\s+your\s+money|triple\s+your\s+wealth)\b/gi,
];

export function returnGuaranteeFilter(text: string): string {
  if (!text) return text;

  let filtered = text;
  let intercepted = false;

  for (const pattern of GUARANTEE_PATTERNS) {
    if (pattern.test(filtered)) {
      intercepted = true;
      pattern.lastIndex = 0;
      filtered = filtered.replace(pattern, SEBI_MARKET_RISK_DISCLAIMER);
    }
  }

  if (intercepted && !filtered.toLowerCase().includes('subject to market risks')) {
    filtered = `${filtered.trim()} *(Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing.)*`;
  }

  return filtered;
}
