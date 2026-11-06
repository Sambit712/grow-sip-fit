/**
 * readinessTierClassifier.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Classifies the user's financial readiness into one of four tiers based on
 * the calculated metrics. Classification rules are applied in strict priority
 * order — the first matching rule wins.
 *
 * Priority:
 *  1. MORE_INFO_REQUIRED   — critical data is missing
 *  2. LIQUIDITY_NEEDS_ATTENTION — reserve gap is severe OR no surplus
 *  3. LIMITED_FLEXIBILITY  — surplus is thin OR EMI burden is high
 *  4. READY                — all checks pass
 */

import type { ReadinessTier } from '../types/FinancialReport';

export interface ReadinessTierInput {
  availableSurplus: number;
  reserveGap: number;
  essentialExpenses: number;
  emiObligations: number;
  totalObligations: number;
  conservativeMonthlyIncome: number;
  /** true when any critical field (income, expenses) is missing */
  hasMissingCriticalData: boolean;
  missingFields: string[];
}

export interface ReadinessTierResult {
  tier: ReadinessTier;
  /** Short, plain-language label for display */
  label: string;
  /** Tailwind-compatible colour token (used by Badge component) */
  colour: 'brand' | 'amber' | 'danger' | 'slate';
  reasoning: string;
  /** Specific conditions that triggered this tier */
  triggeringConditions: string[];
}

/**
 * Classify the user's financial readiness tier.
 *
 * @param input - Aggregated metrics from the engine pipeline
 * @returns ReadinessTierResult with tier, label, colour, and reasoning
 */
export function classifyReadinessTier(input: ReadinessTierInput): ReadinessTierResult {
  const {
    availableSurplus,
    reserveGap,
    essentialExpenses,
    emiObligations,
    conservativeMonthlyIncome,
    hasMissingCriticalData,
    missingFields,
  } = input;

  const triggers: string[] = [];

  // ── Rule 1: Missing critical data ────────────────────────────────────
  if (hasMissingCriticalData) {
    return {
      tier: 'MORE_INFO_REQUIRED',
      label: 'More information required',
      colour: 'slate',
      reasoning:
        'Some critical financial information has not been provided. The assessment cannot produce a reliable readiness evaluation without it.',
      triggeringConditions: missingFields.map(f => `Missing: ${f}`),
    };
  }

  // ── Rule 2: Severe liquidity concerns ────────────────────────────────
  if (availableSurplus <= 0) {
    triggers.push(`Available surplus is ₹${availableSurplus.toLocaleString('en-IN')} (zero or negative)`);
  }
  if (essentialExpenses > 0 && reserveGap > essentialExpenses * 3) {
    triggers.push(
      `Emergency reserve gap (₹${reserveGap.toLocaleString('en-IN')}) exceeds 3× monthly essential expenses`
    );
  }

  if (triggers.length > 0) {
    return {
      tier: 'LIQUIDITY_NEEDS_ATTENTION',
      label: 'Liquidity needs attention',
      colour: 'danger',
      reasoning:
        'Your current financial position suggests that building accessible savings should take priority over new recurring investment commitments.',
      triggeringConditions: triggers,
    };
  }

  // ── Rule 3: Limited flexibility ───────────────────────────────────────
  const surplusRatio =
    conservativeMonthlyIncome > 0
      ? availableSurplus / conservativeMonthlyIncome
      : 0;

  const emiRatio =
    conservativeMonthlyIncome > 0
      ? emiObligations / conservativeMonthlyIncome
      : 0;

  if (surplusRatio < 0.15) {
    triggers.push(
      `Surplus (₹${availableSurplus.toLocaleString('en-IN')}) is less than 15% of income (${Math.round(surplusRatio * 100)}%)`
    );
  }
  if (emiRatio > 0.40) {
    triggers.push(
      `EMI obligations consume ${Math.round(emiRatio * 100)}% of income (above 40% threshold)`
    );
  }

  if (triggers.length > 0) {
    return {
      tier: 'LIMITED_FLEXIBILITY',
      label: 'Limited flexibility',
      colour: 'amber',
      reasoning:
        'You have some estimated surplus, but your financial commitments leave limited room for additional recurring investments. A conservative SIP amount is advisable.',
      triggeringConditions: triggers,
    };
  }

  // ── Rule 4: Ready ─────────────────────────────────────────────────────
  return {
    tier: 'READY',
    label: 'Ready for further SIP consideration',
    colour: 'brand',
    reasoning:
      'Your estimated financial position appears to support additional recurring contributions under the assumptions provided.',
    triggeringConditions: [
      `Surplus: ₹${availableSurplus.toLocaleString('en-IN')} (${Math.round(surplusRatio * 100)}% of income)`,
      `Reserve gap: ₹${reserveGap.toLocaleString('en-IN')}`,
      `EMI ratio: ${Math.round(emiRatio * 100)}%`,
    ],
  };
}

