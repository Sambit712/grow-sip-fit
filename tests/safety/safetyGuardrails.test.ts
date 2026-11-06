import { describe, it, expect } from 'vitest';
import { piiRedactor, REDACTED_TOKEN } from '../../src/safety/piiRedactor';
import { adviceBlocker, ADVICE_DISCLAIMER_NOTE } from '../../src/safety/adviceBlocker';
import { returnGuaranteeFilter, SEBI_MARKET_RISK_DISCLAIMER } from '../../src/safety/returnGuaranteeFilter';
import { applySafetyFilters } from '../../src/safety/safetyGuardrails';

describe('Layer 5 Safety Guardrail: PII Redactor', () => {
  it('detects and redacts standard Indian PAN numbers', () => {
    const text = 'My PAN number is ABCDE1234F please update it';
    const redacted = piiRedactor(text);
    expect(redacted).not.toContain('ABCDE1234F');
    expect(redacted).toContain(REDACTED_TOKEN);
  });

  it('detects and redacts 12-digit Aadhaar numbers', () => {
    const text = 'Here is my Aadhaar card 2345 6789 0123 for verification';
    const redacted = piiRedactor(text);
    expect(redacted).not.toContain('2345 6789 0123');
    expect(redacted).toContain(REDACTED_TOKEN);
  });

  it('detects and redacts 16-digit debit/credit card numbers', () => {
    const text = 'Debit card number 4111 2222 3333 4444 exp 12/28';
    const redacted = piiRedactor(text);
    expect(redacted).not.toContain('4111 2222 3333 4444');
    expect(redacted).toContain(REDACTED_TOKEN);
  });

  it('detects and redacts OTP sequences in proximity to OTP keywords', () => {
    const text = 'Your Groww OTP is 482910 to confirm login';
    const redacted = piiRedactor(text);
    expect(redacted).not.toContain('482910');
    expect(redacted).toContain(REDACTED_TOKEN);
  });

  it('detects and redacts bank account numbers', () => {
    const text = 'Send funds to account number: 998877665544';
    const redacted = piiRedactor(text);
    expect(redacted).not.toContain('998877665544');
    expect(redacted).toContain(REDACTED_TOKEN);
  });

  it('leaves clean financial text intact without false positives', () => {
    const text = 'I want to invest 25,000 rupees every month into an equity SIP with 5 year horizon';
    const redacted = piiRedactor(text);
    expect(redacted).toBe(text);
  });
});

describe('Layer 5 Safety Guardrail: Advice Blocker', () => {
  it('blocks specific mutual fund scheme names and appends compliance note', () => {
    const text = 'You should start an SIP in Parag Parikh Flexi Cap Fund right away';
    const blocked = adviceBlocker(text);
    expect(blocked).not.toContain('Parag Parikh Flexi Cap Fund');
    expect(blocked).toContain('a diversified mutual fund scheme');
    expect(blocked).toContain(ADVICE_DISCLAIMER_NOTE);
  });

  it('blocks other major AMC scheme names (HDFC, SBI, ICICI, Axis)', () => {
    const text = 'Invest in HDFC Top 100 Fund or SBI Bluechip Growth';
    const blocked = adviceBlocker(text);
    expect(blocked).not.toContain('HDFC Top 100 Fund');
    expect(blocked).not.toContain('SBI Bluechip Growth');
    expect(blocked).toContain(ADVICE_DISCLAIMER_NOTE);
  });

  it('blocks direct stock recommendation patterns and tickers', () => {
    const text = 'You should buy RELIANCE stock or invest in TCS shares';
    const blocked = adviceBlocker(text);
    expect(blocked).not.toContain('RELIANCE stock');
    expect(blocked).not.toContain('TCS shares');
    expect(blocked).toContain('an individual listed equity');
  });

  it('leaves general educational asset discussions intact', () => {
    const text = 'A Systematic Investment Plan in equity mutual funds helps smooth out volatility over long horizons.';
    const blocked = adviceBlocker(text);
    expect(blocked).toBe(text);
  });
});

describe('Layer 5 Safety Guardrail: Return Guarantee Filter', () => {
  it('neutralizes promises of specific fixed percentage returns', () => {
    const text = 'If you invest for 5 years you will get 15% guaranteed return';
    const filtered = returnGuaranteeFilter(text);
    expect(filtered).not.toContain('15%');
    expect(filtered).not.toContain('guaranteed return');
    expect(filtered).toContain(SEBI_MARKET_RISK_DISCLAIMER);
    expect(filtered.toLowerCase()).toContain('market risks');
  });

  it('neutralizes claims of doubling money or guaranteed profits', () => {
    const text = 'This plan will double your money with assured profits';
    const filtered = returnGuaranteeFilter(text);
    expect(filtered).not.toContain('double your money');
    expect(filtered).toContain(SEBI_MARKET_RISK_DISCLAIMER);
  });

  it('leaves educational discussion of compounding and historical volatility intact', () => {
    const text = 'Mutual funds do not guarantee returns; equity investments fluctuate with market cycles.';
    const filtered = returnGuaranteeFilter(text);
    expect(filtered).toBe(text);
  });
});

describe('Layer 5 Safety Guardrail: Full Composed Pipeline (applySafetyFilters)', () => {
  it('cleanses a message containing multiple simultaneous compliance violations', () => {
    const toxicText =
      'My PAN is ABCDE1234F. You must buy HDFC Top 100 Fund because you will get 15% guaranteed return and double your money!';

    const clean = applySafetyFilters(toxicText);

    // 1. PAN scrubbed
    expect(clean).not.toContain('ABCDE1234F');
    expect(clean).toContain(REDACTED_TOKEN);

    // 2. Fund scheme scrubbed
    expect(clean).not.toContain('HDFC Top 100 Fund');

    // 3. Return promise scrubbed
    expect(clean).not.toContain('guaranteed return');
    expect(clean).not.toContain('double your money');
    expect(clean.toLowerCase()).toContain('market risks');
  });
});

