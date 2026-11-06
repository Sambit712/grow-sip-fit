import { z } from 'zod';

export const incomeTypeSchema = z.enum([
  'salaried_fixed',
  'salaried_variable',
  'freelance_self_employed',
  'unemployed',
]);

export const riskWillingnessSchema = z.enum(['conservative', 'moderate', 'aggressive']);
export const riskCapacitySchema = z.enum(['low', 'moderate', 'high']);
export const marketUnderstandingSchema = z.enum(['beginner', 'intermediate', 'experienced']);

export const incomeSchema = z.object({
  monthlyTakeHome: z.number().min(0, 'Monthly take-home income cannot be negative'),
  type: incomeTypeSchema,
  creditDay: z.number().int().min(1).max(31, 'Salary credit day must be between 1 and 31'),
  variableLowMonth: z.number().min(0).optional(),
  variableTypicalMonth: z.number().min(0).optional(),
  variableHighMonth: z.number().min(0).optional(),
  otherReliableIncome: z.number().min(0).default(0),
  isStableLast6Months: z.boolean().default(true),
});

export const expensesSchema = z.object({
  rent: z.number().min(0, 'Rent cannot be negative'),
  groceriesAndUtilities: z.number().min(0),
  transportAndHealthcare: z.number().min(0),
  insurancePremiums: z.number().min(0).default(0),
  education: z.number().min(0).default(0),
  subscriptions: z.number().min(0).default(0),
  familySupport: z.number().min(0).default(0),
  discretionary: z.number().min(0).default(0),
  otherRecurring: z.number().min(0).default(0),
});

export const liabilitiesSchema = z.object({
  activeEmisMonthly: z.number().min(0).default(0),
  creditCardDebt: z.number().min(0).default(0),
  upcomingLargeCommitments: z.number().min(0).default(0),
});

export const savingsSchema = z.object({
  accessibleEmergencyFund: z.number().min(0).default(0),
  reserveMonthsTarget: z.number().int().min(1).max(12).default(3),
});

export const existingInvestmentsSchema = z.object({
  activeSipTotal: z.number().min(0).default(0),
  otherRecurringInvestments: z.number().min(0).default(0),
});

export const goalSchema = z.object({
  purpose: z.string().min(1, 'Goal purpose is required'),
  targetAmount: z.number().min(0),
  horizonYears: z.number().min(0.5, 'Investment horizon must be at least 6 months'),
  alreadySaved: z.number().min(0).default(0),
});

export const riskSchema = z.object({
  willingness: riskWillingnessSchema.default('moderate'),
  capacity: riskCapacitySchema.default('moderate'),
  marketUnderstanding: marketUnderstandingSchema.default('beginner'),
});

export const financialProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  income: incomeSchema,
  expenses: expensesSchema,
  liabilities: liabilitiesSchema,
  savings: savingsSchema,
  existingInvestments: existingInvestmentsSchema,
  goal: goalSchema,
  risk: riskSchema,
});

export const profileSchema = financialProfileSchema;

export type ValidatedFinancialProfile = z.infer<typeof financialProfileSchema>;

