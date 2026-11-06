import type { FinancialProfile } from './FinancialProfile';

export type AssessmentCategory =
  | 'goals'
  | 'income'
  | 'expenses'
  | 'liabilities'
  | 'savings'
  | 'investments'
  | 'risk';

export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface AssessmentMessage {
  id: string;
  sessionId: string;
  sender: 'assistant' | 'user' | 'system';
  content: string;
  quickReplies?: string[];
  category: AssessmentCategory;
  stepIndex: number;
  timestamp: string;
  dataKey?: string;
  canEdit?: boolean;
}

export interface AssessmentSession {
  id: string;
  userId: string;
  status: AssessmentStatus;
  currentCategory: AssessmentCategory;
  stepIndex: number;
  collectedData: Partial<FinancialProfile>;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

