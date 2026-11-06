import { describe, it, expect } from 'vitest';
import { parseCurrencyInput, formatINR } from '../../src/validation/currencyParser';

describe('currencyParser — parseCurrencyInput', () => {

  describe('Indian abbreviation formats', () => {
    it('parses "25k" and "25K" as 25,000', () => {
      expect(parseCurrencyInput('25k')).toBe(25000);
      expect(parseCurrencyInput('25K')).toBe(25000);
      expect(parseCurrencyInput('25 thousand')).toBe(25000);
    });

    it('parses decimal thousand e.g. "2.5k" as 2500', () => {
      expect(parseCurrencyInput('2.5k')).toBe(2500);
      expect(parseCurrencyInput('2.5 K')).toBe(2500);
    });

    it('parses Lakh abbreviations e.g. "2.5L", "5 Lakh", "5lakhs", "10 lac"', () => {
      expect(parseCurrencyInput('2.5L')).toBe(250000);
      expect(parseCurrencyInput('2.5l')).toBe(250000);
      expect(parseCurrencyInput('5 Lakh')).toBe(500000);
      expect(parseCurrencyInput('5lakhs')).toBe(500000);
      expect(parseCurrencyInput('10 lac')).toBe(1000000);
      expect(parseCurrencyInput('10 lacs')).toBe(1000000);
    });

    it('parses Crore abbreviations e.g. "1Cr", "1.5 Cr", "1 Crore"', () => {
      expect(parseCurrencyInput('1Cr')).toBe(10000000);
      expect(parseCurrencyInput('1cr')).toBe(10000000);
      expect(parseCurrencyInput('1.5 Cr')).toBe(15000000);
      expect(parseCurrencyInput('2 Crore')).toBe(20000000);
      expect(parseCurrencyInput('2crores')).toBe(20000000);
    });
  });

  describe('Comma-separated and numeric inputs', () => {
    it('parses Indian comma format e.g. "2,50,000"', () => {
      expect(parseCurrencyInput('2,50,000')).toBe(250000);
      expect(parseCurrencyInput('1,00,00,000')).toBe(10000000);
    });

    it('parses standard comma format e.g. "25,000"', () => {
      expect(parseCurrencyInput('25,000')).toBe(25000);
    });

    it('parses plain numeric strings and numbers', () => {
      expect(parseCurrencyInput('50000')).toBe(50000);
      expect(parseCurrencyInput(50000)).toBe(50000);
      expect(parseCurrencyInput(0)).toBe(0);
    });

    it('strips currency prefixes like "₹", "Rs", "INR"', () => {
      expect(parseCurrencyInput('₹25,000')).toBe(25000);
      expect(parseCurrencyInput('₹ 2.5L')).toBe(250000);
      expect(parseCurrencyInput('Rs. 50000')).toBe(50000);
      expect(parseCurrencyInput('INR 60000')).toBe(60000);
      expect(parseCurrencyInput('Rs 1.5 Cr')).toBe(15000000);
    });
  });

  describe('Invalid or unrecognisable inputs', () => {
    it('returns null for empty strings or whitespace', () => {
      expect(parseCurrencyInput('')).toBeNull();
      expect(parseCurrencyInput('   ')).toBeNull();
    });

    it('returns null for null and undefined', () => {
      expect(parseCurrencyInput(null)).toBeNull();
      expect(parseCurrencyInput(undefined)).toBeNull();
    });

    it('returns null for unrecognizable text (never guesses)', () => {
      expect(parseCurrencyInput('hello')).toBeNull();
      expect(parseCurrencyInput('not a number')).toBeNull();
      expect(parseCurrencyInput('abc123xyz')).toBeNull();
      expect(parseCurrencyInput('$$$')).toBeNull();
    });

    it('returns null for negative numbers or NaN', () => {
      expect(parseCurrencyInput(-5000)).toBeNull();
      expect(parseCurrencyInput(NaN)).toBeNull();
    });
  });
});

describe('currencyParser — formatINR', () => {
  it('formats amounts in Indian numbering system', () => {
    expect(formatINR(25000)).toBe('₹25,000');
    expect(formatINR(250000)).toBe('₹2,50,000');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
  });

  it('formats compact amounts correctly', () => {
    expect(formatINR(25000, true)).toBe('₹25K');
    expect(formatINR(250000, true)).toBe('₹2.5 L');
    expect(formatINR(15000000, true)).toBe('₹1.5 Cr');
  });

  it('handles 0 and negative amounts gracefully', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-5000)).toBe('-₹5,000');
  });
});

