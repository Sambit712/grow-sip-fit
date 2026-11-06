import type { FinancialProfile } from '../types/FinancialProfile';
import type { User } from '../types/User';

export interface DemoPersona {
  user: User;
  profile: FinancialProfile;
  description: string;
  keyChallenge: string;
}

/**
 * Profile A: Early-career salaried professional
 * - Receives fixed monthly salary
 * - Has rent and recurring expenses
 * - Limited monthly budgeting habits
 * - Wants to begin investing but unsure about affordability
 */
export const demoProfileA: DemoPersona = {
  user: {
    id: 'user-arjun-profile-a',
    name: 'Arjun Mehta',
    persona: 'early_career',
    targetSegment: 'Profile A: Early-career salaried professional',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  description: '24-year-old software engineer earning a fixed salary in Bengaluru with high rent and minimal savings.',
  keyChallenge: 'Limited emergency cushion; overestimating monthly surplus due to unaccounted discretionary spending.',
  profile: {
    id: 'profile-arjun-a',
    userId: 'user-arjun-profile-a',
    income: {
      monthlyTakeHome: 45000,
      type: 'salaried_fixed',
      creditDay: 5,
      otherReliableIncome: 0,
      isStableLast6Months: true,
    },
    expenses: {
      rent: 14000,
      groceriesAndUtilities: 7000,
      transportAndHealthcare: 3500,
      insurancePremiums: 1200,
      education: 0,
      subscriptions: 800,
      familySupport: 0,
      discretionary: 6000,
      otherRecurring: 1500,
    },
    liabilities: {
      activeEmisMonthly: 0,
      creditCardDebt: 5000,
      upcomingLargeCommitments: 0,
    },
    savings: {
      accessibleEmergencyFund: 25000,
      reserveMonthsTarget: 3,
    },
    existingInvestments: {
      activeSipTotal: 0,
      otherRecurringInvestments: 0,
    },
    goal: {
      purpose: 'Wealth creation',
      targetAmount: 1000000,
      horizonYears: 5,
      alreadySaved: 20000,
    },
    risk: {
      willingness: 'moderate',
      capacity: 'moderate',
      marketUnderstanding: 'beginner',
    },
  },
};

/**
 * Profile B: Salaried employee with variable income
 * - Receives fixed salary plus quarterly/monthly incentives
 * - Wide variance between high-income and low-income months
 * - Risk of overcommitting in good months
 */
export const demoProfileB: DemoPersona = {
  user: {
    id: 'user-bhavna-profile-b',
    name: 'Bhavna Sharma',
    persona: 'variable_incentive',
    targetSegment: 'Profile B: Salaried employee with variable income',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  description: '28-year-old sales manager whose monthly earnings fluctuate based on performance bonuses.',
  keyChallenge: 'Prone to committing to SIP amounts affordable only in peak-incentive months.',
  profile: {
    id: 'profile-bhavna-b',
    userId: 'user-bhavna-profile-b',
    income: {
      monthlyTakeHome: 70000,
      type: 'salaried_variable',
      creditDay: 1,
      variableLowMonth: 45000,
      variableTypicalMonth: 70000,
      variableHighMonth: 125000,
      otherReliableIncome: 0,
      isStableLast6Months: false,
    },
    expenses: {
      rent: 20000,
      groceriesAndUtilities: 9000,
      transportAndHealthcare: 4000,
      insurancePremiums: 2500,
      education: 0,
      subscriptions: 1500,
      familySupport: 5000,
      discretionary: 12000,
      otherRecurring: 2000,
    },
    liabilities: {
      activeEmisMonthly: 8500,
      creditCardDebt: 0,
      upcomingLargeCommitments: 0,
    },
    savings: {
      accessibleEmergencyFund: 120000,
      reserveMonthsTarget: 4,
    },
    existingInvestments: {
      activeSipTotal: 5000,
      otherRecurringInvestments: 2000,
    },
    goal: {
      purpose: 'Buying a car',
      targetAmount: 800000,
      horizonYears: 3,
      alreadySaved: 100000,
    },
    risk: {
      willingness: 'aggressive',
      capacity: 'moderate',
      marketUnderstanding: 'intermediate',
    },
  },
};

/**
 * Profile C: Freelancer or self-employed individual
 * - Receives income at unpredictable dates
 * - Multiple clients, fluctuating debit dates
 * - AutoPay mandate bounce risk
 */
export const demoProfileC: DemoPersona = {
  user: {
    id: 'user-chetan-profile-c',
    name: 'Chetan Verma',
    persona: 'freelancer',
    targetSegment: 'Profile C: Freelancer / Self-employed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  description: '27-year-old freelance UI/UX designer with fluctuating retainers and irregular invoice payment cycles.',
  keyChallenge: 'Debit dates misaligned with cash inflows, causing frequent balance pressure.',
  profile: {
    id: 'profile-chetan-c',
    userId: 'user-chetan-profile-c',
    income: {
      monthlyTakeHome: 55000,
      type: 'freelance_self_employed',
      creditDay: 15,
      variableLowMonth: 28000,
      variableTypicalMonth: 55000,
      variableHighMonth: 95000,
      otherReliableIncome: 0,
      isStableLast6Months: false,
    },
    expenses: {
      rent: 16000,
      groceriesAndUtilities: 7500,
      transportAndHealthcare: 3000,
      insurancePremiums: 1800,
      education: 0,
      subscriptions: 2200,
      familySupport: 0,
      discretionary: 7000,
      otherRecurring: 1500,
    },
    liabilities: {
      activeEmisMonthly: 4000,
      creditCardDebt: 0,
      upcomingLargeCommitments: 20000,
    },
    savings: {
      accessibleEmergencyFund: 60000,
      reserveMonthsTarget: 6,
    },
    existingInvestments: {
      activeSipTotal: 2500,
      otherRecurringInvestments: 0,
    },
    goal: {
      purpose: 'Emergency cushion & long-term wealth',
      targetAmount: 1500000,
      horizonYears: 5,
      alreadySaved: 40000,
    },
    risk: {
      willingness: 'moderate',
      capacity: 'low',
      marketUnderstanding: 'intermediate',
    },
  },
};

/**
 * Profile D: Financially responsible household member
 * - Supports parents or family members
 * - Significant EMI commitments
 * - High desire to invest without risking emergency liquidity
 */
export const demoProfileD: DemoPersona = {
  user: {
    id: 'user-deepika-profile-d',
    name: 'Deepika Rao',
    persona: 'family_dependent',
    targetSegment: 'Profile D: Financially responsible household member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  description: '31-year-old senior analyst supporting aging parents with active personal & medical EMIs.',
  keyChallenge: 'High fixed obligations leave thin monthly margins; liquid safety buffer cannot be compromised.',
  profile: {
    id: 'profile-deepika-d',
    userId: 'user-deepika-profile-d',
    income: {
      monthlyTakeHome: 72000,
      type: 'salaried_fixed',
      creditDay: 7,
      otherReliableIncome: 0,
      isStableLast6Months: true,
    },
    expenses: {
      rent: 18000,
      groceriesAndUtilities: 10000,
      transportAndHealthcare: 6000,
      insurancePremiums: 3500,
      education: 0,
      subscriptions: 1000,
      familySupport: 15000,
      discretionary: 3500,
      otherRecurring: 2000,
    },
    liabilities: {
      activeEmisMonthly: 12000,
      creditCardDebt: 0,
      upcomingLargeCommitments: 0,
    },
    savings: {
      accessibleEmergencyFund: 45000,
      reserveMonthsTarget: 4,
    },
    existingInvestments: {
      activeSipTotal: 0,
      otherRecurringInvestments: 2500,
    },
    goal: {
      purpose: 'Higher education & family security',
      targetAmount: 2000000,
      horizonYears: 4,
      alreadySaved: 50000,
    },
    risk: {
      willingness: 'conservative',
      capacity: 'low',
      marketUnderstanding: 'beginner',
    },
  },
};

/**
 * Fresh Demo User (Blank context as per Section 15 of context.md)
 * Pre-filled ONLY with Goal = Buying a house, Horizon = 3–5 years (4 years), Target = ₹25,00,000.
 * All other financial fields are left empty or 0 to demonstrate the conversational collection flow.
 */
export const freshDemoUser: DemoPersona = {
  user: {
    id: 'demo-user-fresh',
    name: 'Demo Investor',
    persona: 'custom',
    targetSegment: 'New First-Time SIP Investor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  description: 'First-time mutual fund investor planning to buy a house in 3–5 years. Starts with a blank profile.',
  keyChallenge: 'Needs to discover sustainable monthly SIP capacity through conversational assessment.',
  profile: {
    id: 'profile-demo-fresh',
    userId: 'demo-user-fresh',
    income: {
      monthlyTakeHome: 0,
      type: 'salaried_fixed',
      creditDay: 5,
      otherReliableIncome: 0,
      isStableLast6Months: true,
    },
    expenses: {
      rent: 0,
      groceriesAndUtilities: 0,
      transportAndHealthcare: 0,
      insurancePremiums: 0,
      education: 0,
      subscriptions: 0,
      familySupport: 0,
      discretionary: 0,
      otherRecurring: 0,
    },
    liabilities: {
      activeEmisMonthly: 0,
      creditCardDebt: 0,
      upcomingLargeCommitments: 0,
    },
    savings: {
      accessibleEmergencyFund: 0,
      reserveMonthsTarget: 3,
    },
    existingInvestments: {
      activeSipTotal: 0,
      otherRecurringInvestments: 0,
    },
    goal: {
      purpose: 'Buying a house',
      targetAmount: 2500000,
      horizonYears: 4,
      alreadySaved: 0,
    },
    risk: {
      willingness: 'moderate',
      capacity: 'moderate',
      marketUnderstanding: 'beginner',
    },
  },
};

export const allDemoProfiles: Record<string, DemoPersona> = {
  profileA: demoProfileA,
  profileB: demoProfileB,
  profileC: demoProfileC,
  profileD: demoProfileD,
  demo: freshDemoUser,
};

export const DEMO_PROFILES: FinancialProfile[] = [
  demoProfileA.profile,
  demoProfileB.profile,
  demoProfileC.profile,
  demoProfileD.profile,
];


