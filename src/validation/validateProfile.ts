import type { FinancialProfile } from '../types/FinancialProfile';
import { financialProfileSchema } from './profileSchema';

export interface FieldIssue {
  field: string;
  category: string;
  message: string;
  severity: 'missing' | 'warning' | 'info';
}

export interface ProfileValidationResult {
  isComplete: boolean;
  isValid: boolean;
  missingFields: string[];
  issues: FieldIssue[];
  completenessPercentage: number;
}

export function validateProfile(profile: Partial<FinancialProfile> | null | undefined): ProfileValidationResult {
  const missingFields: string[] = [];
  const issues: FieldIssue[] = [];

  if (!profile) {
    return {
      isComplete: false,
      isValid: false,
      missingFields: ['Complete Financial Profile'],
      issues: [{ field: 'profile', category: 'general', message: 'No profile data found', severity: 'missing' }],
      completenessPercentage: 0,
    };
  }

  // Track completeness points across 7 categories
  let scoredPoints = 0;
  const totalPoints = 7;

  // 1. Goals
  if (profile.goal && profile.goal.purpose && profile.goal.purpose.trim() !== '') {
    scoredPoints += 1;
    if (profile.goal.horizonYears < 1) {
      issues.push({
        field: 'goal.horizonYears',
        category: 'goals',
        message: 'Horizon is under 1 year. Equity SIPs generally require longer horizons.',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Financial Goal');
    issues.push({
      field: 'goal.purpose',
      category: 'goals',
      message: 'Primary financial goal is not specified',
      severity: 'missing',
    });
  }

  // 2. Income
  if (
    profile.income &&
    profile.income.type &&
    (profile.income.monthlyTakeHome > 0 || (profile.income.variableLowMonth ?? 0) > 0)
  ) {
    scoredPoints += 1;
    if (profile.income.monthlyTakeHome <= 0 && profile.income.type === 'salaried_fixed') {
      issues.push({
        field: 'income.monthlyTakeHome',
        category: 'income',
        message: 'Take-home salary entered is ₹0',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Monthly Income & Type');
    issues.push({
      field: 'income',
      category: 'income',
      message: 'Valid income information is required',
      severity: 'missing',
    });
  }

  // 3. Expenses
  if (profile.expenses && typeof profile.expenses.rent === 'number') {
    scoredPoints += 1;
    const totalExp =
      (profile.expenses.rent || 0) +
      (profile.expenses.groceriesAndUtilities || 0) +
      (profile.expenses.transportAndHealthcare || 0);

    if (totalExp === 0) {
      issues.push({
        field: 'expenses',
        category: 'expenses',
        message: 'Total essential expenses are ₹0. Please verify your expense entries.',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Monthly Expenses');
    issues.push({
      field: 'expenses',
      category: 'expenses',
      message: 'Monthly expenses are not completed',
      severity: 'missing',
    });
  }

  // 4. Liabilities
  if (profile.liabilities) {
    scoredPoints += 1;
    if (profile.liabilities.creditCardDebt > 0) {
      issues.push({
        field: 'liabilities.creditCardDebt',
        category: 'liabilities',
        message: 'Outstanding credit-card debt detected. High interest charges may impair SIP continuity.',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Loans & Liabilities');
    issues.push({
      field: 'liabilities',
      category: 'liabilities',
      message: 'Liabilities information is missing',
      severity: 'missing',
    });
  }

  // 5. Savings
  if (profile.savings && typeof profile.savings.accessibleEmergencyFund === 'number') {
    scoredPoints += 1;
    if (profile.savings.accessibleEmergencyFund === 0) {
      issues.push({
        field: 'savings.accessibleEmergencyFund',
        category: 'savings',
        message: 'No accessible emergency savings reported. Liquidity buffer is at risk.',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Emergency Savings');
    issues.push({
      field: 'savings',
      category: 'savings',
      message: 'Savings details are not provided',
      severity: 'missing',
    });
  }

  // 6. Existing Investments
  if (profile.existingInvestments) {
    scoredPoints += 1;
  } else {
    missingFields.push('Existing Investments');
    issues.push({
      field: 'existingInvestments',
      category: 'investments',
      message: 'Existing investment commitments are not recorded',
      severity: 'missing',
    });
  }

  // 7. Risk
  if (profile.risk && profile.risk.willingness && profile.risk.capacity) {
    scoredPoints += 1;
    if (profile.risk.willingness === 'aggressive' && profile.risk.capacity === 'low') {
      issues.push({
        field: 'risk',
        category: 'risk',
        message: 'Mismatch detected: High risk willingness combined with low financial loss capacity.',
        severity: 'warning',
      });
    }
  } else {
    missingFields.push('Risk Profile & Knowledge');
    issues.push({
      field: 'risk',
      category: 'risk',
      message: 'Risk capacity and willingness assessment is incomplete',
      severity: 'missing',
    });
  }

  // Zod schema check if fully formed
  const zodResult = financialProfileSchema.safeParse(profile);

  const completenessPercentage = Math.round((scoredPoints / totalPoints) * 100);

  return {
    isComplete: missingFields.length === 0,
    isValid: zodResult.success,
    missingFields,
    issues,
    completenessPercentage,
  };
}

