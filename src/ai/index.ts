import type { IConversationEngine } from './IConversationEngine';
import { DeterministicFallbackEngine } from './DeterministicFallbackEngine';
import { GroqConversationEngine } from './GroqConversationEngine';

export { DeterministicFallbackEngine } from './DeterministicFallbackEngine';
export { GroqConversationEngine } from './GroqConversationEngine';
export { ASSESSMENT_QUESTIONS } from './assessmentQuestions';
export type { AssessmentQuestion } from './assessmentQuestions';
export type {
  IConversationEngine,
  EngineReply,
  ReportExplanation,
  PaymentIssue,
  PaymentGuidance,
} from './IConversationEngine';

/**
 * Factory function creating the active conversation engine.
 * Automatically selects Groq if VITE_GROQ_API_KEY is configured,
 * otherwise falls back cleanly to the DeterministicFallbackEngine.
 */
export function createConversationEngine(overrideKey?: string): IConversationEngine {
  const apiKey = overrideKey !== undefined ? overrideKey : import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    return new GroqConversationEngine(apiKey.trim());
  }
  return new DeterministicFallbackEngine();
}

