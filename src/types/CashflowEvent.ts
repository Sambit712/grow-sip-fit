import type { ReadinessTier } from './FinancialReport';

/**
 * A single cash-flow event (income or outflow) on a specific day of the month.
 */
export type EventCategory =
  | 'salary'
  | 'other_income'
  | 'rent'
  | 'emi'
  | 'grocery'
  | 'utility'
  | 'insurance'
  | 'transport'
  | 'healthcare'
  | 'family_support'
  | 'subscription'
  | 'education'
  | 'sip'
  | 'discretionary'
  | 'other_expense';

export interface CashflowEvent {
  id: string;
  profileId: string;
  title: string;
  category: EventCategory;
  /** Amount in rupees (always positive; use is_inflow to determine direction) */
  amount: number;
  /** Day of the month this event occurs (1–31) */
  dayOfMonth: number;
  /** True = money coming in, False = money going out */
  isInflow: boolean;
  /** Whether this repeats every month */
  isRecurring: boolean;
  createdAt: string;
}

/**
 * A detected cash-flow pressure point where running balance may dip
 * dangerously low relative to the safety buffer.
 */
export interface ConflictWarning {
  /** Day of the month where pressure is detected */
  conflictDay: number;
  /** Estimated running balance at that point */
  estimatedBalance: number;
  /** The safety buffer that was breached */
  safetyBuffer: number;
  /** Events contributing to the conflict */
  conflictingEvents: Array<{ title: string; amount: number; category: EventCategory }>;
  /** Human-readable suggested remediation */
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Scenario types that the simulator can apply to a financial profile.
 */
export type ScenarioType =
  | 'delayed_salary'
  | 'increased_rent'
  | 'unexpected_medical_expense'
  | 'reduced_income'
  | 'new_emi'
  | 'variable_income_month';

export interface ScenarioModification {
  type: ScenarioType;
  /** For delayed_salary: number of days delayed */
  salaryDelayDays?: number;
  /** For increased_rent: extra rent amount in rupees */
  rentIncreaseAmount?: number;
  /** For unexpected_medical_expense: one-time expense in rupees */
  medicalExpenseAmount?: number;
  /** For reduced_income: fraction to reduce (e.g., 0.20 = 20% reduction) */
  incomeReductionFraction?: number;
  /** For new_emi: monthly EMI amount in rupees */
  newEmiAmount?: number;
  /** For new_emi: day of month for the new EMI */
  newEmiDay?: number;
  /** For variable_income_month: which month type to simulate */
  variableIncomeMonth?: 'low' | 'typical' | 'high';
}

export interface ScenarioResult {
  scenarioType: ScenarioType;
  originalSurplus: number;
  newSurplus: number;
  delta: number;
  originalReadinessTier: ReadinessTier;
  newReadinessTier: ReadinessTier;
  originalReserveGap?: number;
  newReserveGap?: number;
  originalSipMin?: number;
  originalSipMax?: number;
  newSipMin?: number;
  newSipMax?: number;
  newConflicts: ConflictWarning[];
  originalConflictCount: number;
  explanation: string;
  stackedModifications?: ScenarioModification[];
  createdAt: string;
}

