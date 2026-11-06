/**
 * adviceBlocker.ts
 * Layer 5 — Safety Guardrails
 *
 * Scans generated or incoming text for specific mutual fund schemes,
 * AMC fund product names, or individual stock recommendations.
 * Replaces them with compliant generic terminology and appends an educational compliance notice.
 */

export const ADVICE_DISCLAIMER_NOTE =
  ' [Note: Specific fund or stock recommendations are withheld per SEBI compliance guidelines. Consult a certified financial advisor for individual scheme selection.]';

/** Known fund house patterns and mutual fund scheme name signatures */
const MUTUAL_FUND_SCHEME_PATTERNS = [
  /\b(?:HDFC|SBI|ICICI|Axis|Kotak|Mirae\s*Asset|Nippon\s*India|Parag\s*Parikh|UTI|Quant|Tata|Bandhan|Motilal\s*Oswal|Aditya\s*Birla\s*Sun\s*Life)\s+[\w\s]{2,30}(?:Fund|Plan|Cap|Index|Equity|Growth|Direct|Regular|Opportunity|Advantage|ETF)\b/gi,
  /\b(?:Nifty\s*50\s*Index\s*Fund|Sensex\s*Plan|Flexi\s*Cap\s*Fund|Small\s*Cap\s*Fund|Mid\s*Cap\s*Fund|Large\s*&\s*Mid\s*Cap\s*Fund)\b/gi,
];

/** Prominent stock symbols and stock tip patterns */
const STOCK_TICKER_PATTERNS = [
  /\b(?:RELIANCE|TCS|INFY|HDFCBANK|ICICIBANK|TATAMOTORS|TATASTEEL|SBIN|BHARTIARTL|ITC|WIPRO|HINDUNILVR|BAJFINANCE|MARUTI)\b(?:\s+(?:stock|share|equity))?/g,
  /\b(?:buy|invest in|pick|purchase)\s+(?:shares of\s+)?([A-Z]{3,10})\b/gi,
];

export function adviceBlocker(text: string): string {
  if (!text) return text;

  let cleaned = text;
  let intercepted = false;

  // Intercept mutual fund scheme names
  for (const pattern of MUTUAL_FUND_SCHEME_PATTERNS) {
    if (pattern.test(cleaned)) {
      intercepted = true;
      pattern.lastIndex = 0;
      cleaned = cleaned.replace(pattern, 'a diversified mutual fund scheme');
    }
  }

  // Intercept specific stock tickers
  for (const pattern of STOCK_TICKER_PATTERNS) {
    if (pattern.test(cleaned)) {
      intercepted = true;
      pattern.lastIndex = 0;
      cleaned = cleaned.replace(pattern, 'an individual listed equity');
    }
  }

  if (intercepted && !cleaned.includes(ADVICE_DISCLAIMER_NOTE)) {
    cleaned = `${cleaned.trim()}${ADVICE_DISCLAIMER_NOTE}`;
  }

  return cleaned;
}

