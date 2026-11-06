import Groq from 'groq-sdk';
import type {
  IConversationEngine,
  EngineReply,
  ReportExplanation,
  PaymentIssue,
  PaymentGuidance,
} from './IConversationEngine';
import type { AssessmentSession } from '../types/AssessmentSession';
import type { FinancialProfile } from '../types/FinancialProfile';
import type { FinancialReport } from '../types/FinancialReport';
import { DeterministicFallbackEngine } from './DeterministicFallbackEngine';
import { applySafetyFilters } from '../safety/safetyGuardrails';
import { ASSESSMENT_QUESTIONS } from './assessmentQuestions';

export class GroqConversationEngine implements IConversationEngine {
  private groq: Groq;
  private fallback: DeterministicFallbackEngine;
  private model: string;
  private temperature: number;

  constructor(apiKey: string, model?: string, temperature?: number) {
    this.groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true, // For client-side demo execution
    });
    this.fallback = new DeterministicFallbackEngine();
    this.model = model || import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';
    this.temperature = temperature ?? 0.1;
  }

  async generateReply(
    session: AssessmentSession,
    userMessage: string
  ): Promise<EngineReply> {
    try {
      const fallbackReply = await this.fallback.generateReply(session, userMessage);

      // If assessment is already finished, return completion message directly
      if (fallbackReply.isComplete) {
        return fallbackReply;
      }

      const currentIndex = session.stepIndex;
      const currentQ = ASSESSMENT_QUESTIONS[currentIndex];

      const systemPrompt = `You are the Groww SIP Fit conversational financial readiness assistant.
Your goal is to guide first-time mutual fund investors through an assessment to understand their financial readiness.
You must be empathetic, professional, clear, and reassuring.

STRICT RULES:
1. Do NOT invent or hallucinate financial numbers.
2. Do NOT recommend specific mutual fund schemes, stocks, or promise returns.
3. Keep conversational explanations concise (1-2 sentences).
4. Return your output in strict JSON format matching this schema:
{
  "message": "Friendly acknowledgement of their previous answer, followed by the next question.",
  "quickReplies": ["option 1", "option 2"] (optional array of strings),
  "sensitivityNote": "Brief reason why this question is needed"
}`;

      const userPrompt = `Current Assessment State:
Category: ${currentQ.category} (${currentQ.categoryTitle})
User just answered: "${userMessage}"
Next deterministic question to ask: "${fallbackReply.message}"
Quick replies available: ${JSON.stringify(fallbackReply.quickReplies ?? [])}
Sensitivity explanation: "${fallbackReply.sensitivityNote ?? ''}"

Rephrase the next question naturally in friendly Indian fintech tone (Groww style), while keeping the core question and options intact.`;

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: this.temperature,
      });

      const rawContent = completion.choices[0]?.message?.content;
      if (!rawContent) {
        return fallbackReply;
      }

      const parsed = JSON.parse(rawContent) as {
        message?: string;
        quickReplies?: string[];
        sensitivityNote?: string;
      };

      return {
        ...fallbackReply,
        message: applySafetyFilters(parsed.message || fallbackReply.message),
        quickReplies: parsed.quickReplies || fallbackReply.quickReplies,
        sensitivityNote: parsed.sensitivityNote ? applySafetyFilters(parsed.sensitivityNote) : fallbackReply.sensitivityNote,
      };
    } catch (err) {
      console.warn('[GroqConversationEngine] API call failed, falling back to deterministic engine:', err);
      return this.fallback.generateReply(session, userMessage);
    }
  }

  async generateReportExplanation(report: FinancialReport): Promise<ReportExplanation> {
    try {
      const fallbackExplanation = await this.fallback.generateReportExplanation(report);
      const b = report.breakdown;

      const systemPrompt = `You are Groww SIP Fit's financial readiness explainer.
You must synthesize the financial calculation results into clear, encouraging, yet honest financial explanations.
NEVER contradict the calculated numbers.
NEVER recommend specific funds or promise returns.
Output MUST be strict JSON:
{
  "overviewSummary": "...",
  "readinessExplanation": "...",
  "sipAffordabilityNote": "...",
  "goalAnalysis": "...",
  "actionableNextSteps": ["step 1", "step 2", "step 3"]
}`;

      const userPrompt = `Deterministic Calculations:
- Monthly Income: ₹${b.conservativeMonthlyIncome}
- Obligations: ₹${b.totalObligations}
- Available Surplus: ₹${b.availableSurplus}
- Target Emergency Reserve: ₹${b.targetEmergencyReserve}
- Reserve Gap: ₹${b.emergencyReserveGap}
- Indicative SIP Range: ₹${b.indicativeSipMin} - ₹${b.indicativeSipMax}
- Readiness Tier: ${report.readinessTier}
- Goal: "${report.goalCompatibility.goalPurpose}" in ${report.goalCompatibility.horizonYears} years`;

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: this.temperature,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) return fallbackExplanation;

      const parsed = JSON.parse(raw) as ReportExplanation;
      return {
        overviewSummary: applySafetyFilters(parsed.overviewSummary || fallbackExplanation.overviewSummary),
        readinessExplanation: applySafetyFilters(parsed.readinessExplanation || fallbackExplanation.readinessExplanation),
        sipAffordabilityNote: applySafetyFilters(parsed.sipAffordabilityNote || fallbackExplanation.sipAffordabilityNote),
        goalAnalysis: applySafetyFilters(parsed.goalAnalysis || fallbackExplanation.goalAnalysis),
        actionableNextSteps: (parsed.actionableNextSteps || fallbackExplanation.actionableNextSteps).map((s) => applySafetyFilters(s)),
      };
    } catch {
      return this.fallback.generateReportExplanation(report);
    }
  }

  async answerEducationalQuery(query: string, context?: FinancialProfile): Promise<string> {
    try {
      const fallbackResponse = await this.fallback.answerEducationalQuery(query, context);

      // Guardrail check
      const q = query.toLowerCase();
      if (q.includes('recommend') || q.includes('which fund') || q.includes('best stock') || q.includes('top 5') || q.includes('guarantee')) {
        return applySafetyFilters(fallbackResponse);
      }

      const systemPrompt = `You are Groww's educational investment coach. Explain mutual fund and SIP concepts in simple, jargon-free English for a first-time investor in India. Do NOT recommend specific schemes or stocks. Keep answers under 3 paragraphs.`;

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.2,
      });

      const reply = completion.choices[0]?.message?.content || fallbackResponse;
      return applySafetyFilters(reply);
    } catch {
      return applySafetyFilters(await this.fallback.answerEducationalQuery(query, context));
    }
  }

  async troubleshootPayment(issue: PaymentIssue): Promise<PaymentGuidance> {
    // Payment guidance is deterministic to maintain factual safety
    return this.fallback.troubleshootPayment(issue);
  }
}

