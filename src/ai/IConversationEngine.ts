import type { AssessmentSession, AssessmentCategory } from '../types/AssessmentSession';
import type { FinancialProfile } from '../types/FinancialProfile';
import type { FinancialReport } from '../types/FinancialReport';

export interface EngineReply {
  message: string;
  quickReplies?: string[];
  extractedData?: Partial<FinancialProfile>;
  nextCategory?: AssessmentCategory;
  stepIndex?: number;
  isComplete?: boolean;
  sensitivityNote?: string;
  inputType?: 'quick_reply' | 'currency' | 'number' | 'date' | 'text';
}

export interface ReportExplanation {
  overviewSummary: string;
  readinessExplanation: string;
  sipAffordabilityNote: string;
  goalAnalysis: string;
  actionableNextSteps: string[];
}

export interface PaymentIssue {
  issueType: string;
  userDescription?: string;
  transactionAmount?: number;
  bankName?: string;
}

export interface PaymentGuidance {
  issueSummary: string;
  probableReason: string;
  diagnosticSteps: string[];
  recommendedAction: string;
  officialSupportRequired: boolean;
  disclaimer: string;
}

export interface IConversationEngine {
  generateReply(session: AssessmentSession, userMessage: string): Promise<EngineReply>;
  generateReportExplanation(report: FinancialReport): Promise<ReportExplanation>;
  answerEducationalQuery(query: string, context?: FinancialProfile): Promise<string>;
  troubleshootPayment(issue: PaymentIssue): Promise<PaymentGuidance>;
}

