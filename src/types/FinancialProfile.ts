/**
 * Core domain types for a user's financial profile.
 * These types are shared across the engine, stores, and AI layers.
 * No `any` types — all fields are strictly typed.
 */

/** How the user earns their income */
export type IncomeType =
  | 'salaried_fixed'
  | 'salaried_variable'
  | 'freelance_self_employed'
  | 'unemployed';

/** Self-assessed willingness to tolerate market volatility */
export type RiskWillingness = 'conservative' | 'moderate' | 'aggressive';

/** Objective financial capacity to absorb losses */
export type RiskCapacity = 'low' | 'moderate' | 'high';

/** Self-assessed knowledge of investment concepts */
export type MarketUnderstanding = 'beginner' | 'intermediate' | 'experienced';

/** All amounts are in Indian Rupees (integers). */
export interface FinancialProfile {
  id: string;
  userId: string;

  income: {
    /** Monthly take-home salary (after tax and deductions) */
    monthlyTakeHome: number;
    type: IncomeType;
    /** Day of the month salary/income is typically credited (1–31) */
    creditDay: number;
    /** For variable earners: approximate low-income month amount */
    variableLowMonth?: number;
    /** For variable earners: approximate typical month amount */
    variableTypicalMonth?: number;
    /** For variable earners: approximate high-income month amount */
    variableHighMonth?: number;
    /** Other reliable, recurring income (e.g., rental income) */
    otherReliableIncome: number;
    /** Has income been consistent in the last 6 months? */
    isStableLast6Months: boolean;
  };

  expenses: {
    rent: number;
    groceriesAndUtilities: number;
    transportAndHealthcare: number;
    insurancePremiums: number;
    education: number;
    subscriptions: number;
    familySupport: number;
    /** Entertainment and lifestyle spending */
    discretionary: number;
    otherRecurring: number;
  };

  liabilities: {
    /** Total active EMI obligations per month */
    activeEmisMonthly: number;
    creditCardDebt: number;
    /** Large financial commitments expected in the next 6–12 months */
    upcomingLargeCommitments: number;
  };

  savings: {
    /** Cash / liquid savings accessible within 7 days */
    accessibleEmergencyFund: number;
    /** User-selected reserve target in months (3–6) */
    reserveMonthsTarget: number;
  };

  existingInvestments: {
    /** Sum of all active SIP monthly debits */
    activeSipTotal: number;
    /** Other recurring investment commitments (PPF, RD, etc.) */
    otherRecurringInvestments: number;
  };

  goal: {
    /** Free-text goal description (e.g., "Buying a house") */
    purpose: string;
    /** Target corpus in rupees */
    targetAmount: number;
    /** Investment horizon in years */
    horizonYears: number;
    /** Amount already saved/invested towards this goal */
    alreadySaved: number;
  };

  risk: {
    willingness: RiskWillingness;
    capacity: RiskCapacity;
    marketUnderstanding: MarketUnderstanding;
  };
}

/** A partial profile used during assessment collection */
export type PartialFinancialProfile = Partial<FinancialProfile> & {
  id: string;
  userId: string;
};

