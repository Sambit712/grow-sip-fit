/**
 * incomeCalculator.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Computes a conservative monthly income baseline from a user's income profile.
 * Rules:
 *  - Salaried fixed   → take-home + other reliable income
 *  - Salaried variable → min(typicalMonth, lowMonth × 1.1)  — never use the high month
 *  - Freelance / self-employed → same conservative low-month rule, with explicit note
 *  - Unemployed       → 0, flagged as requiring more information
 *
 * This module is PURE — no side effects, no I/O, no React imports.
 */

import type { FinancialProfile, IncomeType } from '../types/FinancialProfile';

export interface IncomeResult {
  conservativeMonthlyIncome: number;
  /** Human-readable explanation of which method was applied */
  method: string;
  /** true when the income type means data is insufficient for assessment */
  requiresMoreInfo: boolean;
  warnings: string[];
}

/**
 * Calculate the conservative monthly income baseline.
 *
 * @param income - The income section of the user's FinancialProfile
 * @returns IncomeResult containing the conservative figure and audit trail
 */
export function calculateConservativeIncome(
  income: FinancialProfile['income']
): IncomeResult {
  const warnings: string[] = [];

  switch (income.type as IncomeType) {
    case 'salaried_fixed': {
      const base = Math.max(0, income.monthlyTakeHome);
      const other = Math.max(0, income.otherReliableIncome);
      const total = base + other;

      if (total === 0) {
        warnings.push('Monthly take-home income is ₹0. Please verify your income entry.');
      }
      if (!income.isStableLast6Months) {
        warnings.push(
          'Income has not been stable in the last 6 months. Assessment uses the declared take-home as a conservative baseline.'
        );
      }

      return {
        conservativeMonthlyIncome: total,
        method: `Salaried fixed: ₹${base.toLocaleString('en-IN')} take-home + ₹${other.toLocaleString('en-IN')} other reliable income`,
        requiresMoreInfo: total === 0,
        warnings,
      };
    }

    case 'salaried_variable': {
      const low = Math.max(0, income.variableLowMonth ?? 0);
      const typical = Math.max(0, income.variableTypicalMonth ?? income.monthlyTakeHome);
      const other = Math.max(0, income.otherReliableIncome);

      if (low === 0 && typical === 0) {
        warnings.push('No income figures provided for variable income earner.');
        return {
          conservativeMonthlyIncome: 0,
          method: 'Variable salaried: insufficient data',
          requiresMoreInfo: true,
          warnings,
        };
      }

      // Conservative rule: never use the high month as baseline
      const conservativeBase = low > 0
        ? Math.min(typical, low * 1.1)
        : typical;

      warnings.push(
        'Variable income detected. Conservative baseline uses the lower of your typical or 110% of your low-income month. High-income months are excluded from affordability calculations.'
      );

      return {
        conservativeMonthlyIncome: conservativeBase + other,
        method: `Variable salaried: min(typical ₹${typical.toLocaleString('en-IN')}, low×1.1 ₹${Math.round(low * 1.1).toLocaleString('en-IN')}) = ₹${conservativeBase.toLocaleString('en-IN')} + other ₹${other.toLocaleString('en-IN')}`,
        requiresMoreInfo: false,
        warnings,
      };
    }

    case 'freelance_self_employed': {
      const low = Math.max(0, income.variableLowMonth ?? 0);
      const typical = Math.max(0, income.variableTypicalMonth ?? income.monthlyTakeHome);
      const other = Math.max(0, income.otherReliableIncome);

      if (low === 0 && typical === 0) {
        warnings.push('No income figures provided for freelance / self-employed earner.');
        return {
          conservativeMonthlyIncome: 0,
          method: 'Freelance: insufficient data',
          requiresMoreInfo: true,
          warnings,
        };
      }

      const conservativeBase = low > 0
        ? Math.min(typical, low * 1.1)
        : typical;

      warnings.push(
        'Freelance / self-employed income is not guaranteed. Conservative baseline uses the lower of typical or 110% of low-income month. Variable income is not assumed to repeat each month.'
      );

      return {
        conservativeMonthlyIncome: conservativeBase + other,
        method: `Freelance: conservative min(typical ₹${typical.toLocaleString('en-IN')}, low×1.1 ₹${Math.round(low * 1.1).toLocaleString('en-IN')}) = ₹${conservativeBase.toLocaleString('en-IN')} + other ₹${other.toLocaleString('en-IN')}`,
        requiresMoreInfo: false,
        warnings,
      };
    }

    case 'unemployed': {
      warnings.push(
        'No active income declared. SIP affordability assessment cannot be completed without an income source.'
      );
      return {
        conservativeMonthlyIncome: 0,
        method: 'Unemployed: income set to ₹0',
        requiresMoreInfo: true,
        warnings,
      };
    }

    default: {
      warnings.push('Unknown income type. Please re-enter your income information.');
      return {
        conservativeMonthlyIncome: 0,
        method: 'Unknown income type',
        requiresMoreInfo: true,
        warnings,
      };
    }
  }
}

