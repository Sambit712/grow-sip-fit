/**
 * obligationsCalculator.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Aggregates all monthly financial obligations into a structured breakdown.
 * Never modifies the input profile — pure function.
 */

import type { FinancialProfile } from '../types/FinancialProfile';

export interface ObligationsResult {
  /** Rent + groceries + utilities + transport + healthcare + insurance + education + subscriptions */
  essentialExpenses: number;
  emiObligations: number;
  familySupport: number;
  existingSipTotal: number;
  otherRecurringInvestments: number;
  discretionaryMinimum: number;
  otherRecurring: number;
  /** Sum of all the above */
  totalObligations: number;
  warnings: string[];
}

/**
 * Calculate all monthly financial obligations from the user's profile.
 *
 * @param expenses       - Profile expenses section
 * @param liabilities    - Profile liabilities section
 * @param existingInvestments - Profile existingInvestments section
 * @returns ObligationsResult with itemised breakdown and total
 */
export function calculateObligations(
  expenses: FinancialProfile['expenses'],
  liabilities: FinancialProfile['liabilities'],
  existingInvestments: FinancialProfile['existingInvestments']
): ObligationsResult {
  const warnings: string[] = [];

  // ── Essential non-discretionary expenses ─────────────────────────────
  const essentialExpenses =
    Math.max(0, expenses.rent) +
    Math.max(0, expenses.groceriesAndUtilities) +
    Math.max(0, expenses.transportAndHealthcare) +
    Math.max(0, expenses.insurancePremiums) +
    Math.max(0, expenses.education);

  // ── Subscriptions (semi-essential) ───────────────────────────────────
  const subscriptions = Math.max(0, expenses.subscriptions);

  // ── Family support obligations ────────────────────────────────────────
  const familySupport = Math.max(0, expenses.familySupport);

  // ── Loan obligations ──────────────────────────────────────────────────
  const emiObligations = Math.max(0, liabilities.activeEmisMonthly);

  if (emiObligations > 0 && liabilities.creditCardDebt > 0) {
    warnings.push(
      'Outstanding credit-card debt detected. Consider clearing high-interest debt before committing to additional recurring investments.'
    );
  }

  // ── Existing investment commitments ───────────────────────────────────
  const existingSipTotal = Math.max(0, existingInvestments.activeSipTotal);
  const otherRecurringInvestments = Math.max(0, existingInvestments.otherRecurringInvestments);

  // ── Discretionary spending (minimum) ─────────────────────────────────
  const discretionaryMinimum = Math.max(0, expenses.discretionary);

  // ── Other recurring expenses ──────────────────────────────────────────
  const otherRecurring = Math.max(0, expenses.otherRecurring) + subscriptions;

  // ── Total ─────────────────────────────────────────────────────────────
  const totalObligations =
    essentialExpenses +
    emiObligations +
    familySupport +
    existingSipTotal +
    otherRecurringInvestments +
    discretionaryMinimum +
    otherRecurring;

  if (totalObligations === 0) {
    warnings.push(
      'No expenses have been entered. Total obligations defaulting to ₹0. Please complete the expenses section for an accurate assessment.'
    );
  }

  return {
    essentialExpenses,
    emiObligations,
    familySupport,
    existingSipTotal,
    otherRecurringInvestments,
    discretionaryMinimum,
    otherRecurring,
    totalObligations,
    warnings,
  };
}

