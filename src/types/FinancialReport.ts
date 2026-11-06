import type { ConflictWarning } from './CashflowEvent';

/** Financial readiness classification tier */
export type ReadinessTier =
  | 'READY'
  | 'LIMITED_FLEXIBILITY'
  | 'LIQUIDITY_NEEDS_ATTENTION'
  | 'MORE_INFO_REQUIRED';

/** Full breakdown of how each number was derived */
export interface CalculationBreakdown {
  /** Conservative income used as the baseline */
  conservativeMonthlyIncome: number;
  incomeMethod: string;
  essentialExpenses: number;
  emiObligations: number;
  familySupport: number;
  existingSipTotal: number;
  discretionaryMinimum: number;
  otherRecurring: number;
  totalObligations: number;
  availableSurplus: number;
  targetEmergencyReserve: number;
  existingEmergencyFund: number;
  emergencyReserveGap: number;
  plannedMonthlyReserveContribution: number;
  irregularExpenseBuffer: number;
  uncommittedSurplus: number;
  indicativeSipMin: number;
  indicativeSipMax: number;
  reserveMonthsUsed: number;
  assumptions: string[];
}

/** Compatibility between goal and financial capacity */
export interface GoalCompatibility {
  goalPurpose: string;
  targetAmount: number;
  horizonYears: number;
  alreadySaved: number;
  savingsGap: number;
  /** Monthly saving required to close the gap at 0% return (conservative, transparent) */
  requiredMonthlySaving: number;
  /** true if the horizon is less than 3 years */
  isHorizonShort: boolean;
  compatibilityNote: string;
}

export interface FinancialReport {
  id: string;
  sessionId: string;
  userId: string;
  readinessTier: ReadinessTier;
  breakdown: CalculationBreakdown;
  goalCompatibility: GoalCompatibility;
  cashflowConflicts: ConflictWarning[];
  nextSteps: string[];
  missingFields: string[];
  generatedAt: string;
  /** Version of the calculation engine used */
  engineVersion: string;
}

