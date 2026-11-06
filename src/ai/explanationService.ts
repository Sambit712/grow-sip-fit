import type { FinancialReport } from '../types/FinancialReport';
import type { ReportExplanation } from './IConversationEngine';
import { createConversationEngine } from './index';
import { applySafetyFilters } from '../safety/safetyGuardrails';

/**
 * Service to generate explanations for the Financial Readiness Report.
 * Uses Groq LLM if configured, otherwise falls back gracefully to the deterministic synthesizer.
 * All generated narratives pass through Layer 5 safety guardrails before being returned.
 */
export async function getReportExplanation(report: FinancialReport): Promise<ReportExplanation> {
  const engine = createConversationEngine();
  const raw = await engine.generateReportExplanation(report);

  return {
    overviewSummary: applySafetyFilters(raw.overviewSummary),
    readinessExplanation: applySafetyFilters(raw.readinessExplanation),
    sipAffordabilityNote: applySafetyFilters(raw.sipAffordabilityNote),
    goalAnalysis: applySafetyFilters(raw.goalAnalysis),
    actionableNextSteps: raw.actionableNextSteps.map((step) => applySafetyFilters(step)),
  };
}

