import { describe, it, expect, beforeEach } from 'vitest';
import { DeterministicFallbackEngine } from '../../src/ai/DeterministicFallbackEngine';
import { GroqConversationEngine } from '../../src/ai/GroqConversationEngine';
import { createConversationEngine } from '../../src/ai';
import { ASSESSMENT_QUESTIONS } from '../../src/ai/assessmentQuestions';
import { demoProfileA } from '../../src/data/demoProfiles';
import { runFullEngine } from '../../src/engine';
import type { AssessmentSession } from '../../src/types/AssessmentSession';

describe('Phase 3: AI & Conversational Assessment Engine', () => {
  let engine: DeterministicFallbackEngine;
  let mockSession: AssessmentSession;

  beforeEach(() => {
    engine = new DeterministicFallbackEngine();
    mockSession = {
      id: 'test-session-1',
      userId: 'test-user-1',
      status: 'in_progress',
      currentCategory: 'goals',
      stepIndex: 0,
      collectedData: {},
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  describe('assessmentQuestions configuration', () => {
    it('covers all 7 required assessment categories', () => {
      const categories = new Set(ASSESSMENT_QUESTIONS.map((q) => q.category));
      expect(categories.has('goals')).toBe(true);
      expect(categories.has('income')).toBe(true);
      expect(categories.has('expenses')).toBe(true);
      expect(categories.has('liabilities')).toBe(true);
      expect(categories.has('savings')).toBe(true);
      expect(categories.has('investments')).toBe(true);
      expect(categories.has('risk')).toBe(true);
    });

    it('has valid non-empty sensitivity notes for sensitive financial questions', () => {
      const incomeQ = ASSESSMENT_QUESTIONS.find((q) => q.id === 'income_monthly_take_home');
      expect(incomeQ?.sensitivityNote).toBeDefined();
      expect(incomeQ?.sensitivityNote?.length).toBeGreaterThan(10);
    });
  });

  describe('DeterministicFallbackEngine conversational flow', () => {
    it('returns the next question and updates collectedData on answer', async () => {
      const reply = await engine.generateReply(mockSession, 'Buying a house');

      expect(reply.isComplete).toBe(false);
      expect(reply.extractedData?.goal?.purpose).toBe('Buying a house');
      expect(reply.stepIndex).toBe(1);
      expect(reply.quickReplies).toBeDefined();
    });

    it('parses currency input in answers correctly', async () => {
      // Advance to income question
      const incomeTakeHomeIdx = ASSESSMENT_QUESTIONS.findIndex(
        (q) => q.id === 'income_monthly_take_home'
      );
      mockSession.stepIndex = incomeTakeHomeIdx;

      const reply = await engine.generateReply(mockSession, '75,000');
      expect(reply.extractedData?.income?.monthlyTakeHome).toBe(75000);
    });

    it('skips variable income question when user is fixed salaried', async () => {
      const incomeTypeIdx = ASSESSMENT_QUESTIONS.findIndex((q) => q.id === 'income_type');
      mockSession.stepIndex = incomeTypeIdx;

      // User selects fixed salary
      const reply = await engine.generateReply(mockSession, 'Salaried (Fixed salary)');
      expect(reply.extractedData?.income?.type).toBe('salaried_fixed');

      // The next question should be monthly take home, NOT low month
      const nextQ = ASSESSMENT_QUESTIONS[reply.stepIndex!];
      expect(nextQ.id).toBe('income_monthly_take_home');
    });

    it('reaches completion when traversing through all questions', async () => {
      mockSession.stepIndex = ASSESSMENT_QUESTIONS.length - 1;
      const lastQ = ASSESSMENT_QUESTIONS[mockSession.stepIndex];

      const reply = await engine.generateReply(mockSession, lastQ.quickReplies?.[0] || 'Beginner');
      expect(reply.isComplete).toBe(true);
    });
  });

  describe('Report Explanation Synthesis', () => {
    it('synthesizes report explanation purely from calculated engine figures', async () => {
      const report = runFullEngine(demoProfileA.profile);
      const explanation = await engine.generateReportExplanation(report);

      expect(explanation.overviewSummary).toContain('45,000');
      expect(explanation.readinessExplanation).toBeDefined();
      expect(explanation.sipAffordabilityNote).toBeDefined();
      expect(explanation.actionableNextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Educational Assistant Guardrails', () => {
    it('explains SIP, NAV and compounding without recommending specific funds', async () => {
      const res = await engine.answerEducationalQuery('What is an SIP?');
      expect(res.toLowerCase()).toContain('systematic investment plan');
    });

    it('strictly declines specific fund or stock recommendation requests', async () => {
      const res = await engine.answerEducationalQuery('Which is the best mutual fund scheme to invest in?');
      expect(res.toLowerCase()).toContain('not a sebi-registered investment advisor');
      expect(res.toLowerCase()).toContain('do not recommend specific');
    });
  });

  describe('Payment Diagnostic Assistance', () => {
    it('provides clear actionable steps for insufficient balance AutoPay failures', async () => {
      const guidance = await engine.troubleshootPayment({
        issueType: 'Insufficient balance for SIP AutoPay debit',
      });

      expect(guidance.probableReason).toContain('salary');
      expect(guidance.recommendedAction).toContain('Move your SIP debit date');
      expect(guidance.disclaimer).toBeDefined();
    });
  });

  describe('createConversationEngine Factory', () => {
    it('defaults to DeterministicFallbackEngine when key is empty', () => {
      const activeEngine = createConversationEngine('');
      expect(activeEngine).toBeInstanceOf(DeterministicFallbackEngine);
    });

    it('returns GroqConversationEngine when API key is provided', () => {
      const activeEngine = createConversationEngine('mock-test-key');
      expect(activeEngine).toBeInstanceOf(GroqConversationEngine);
    });
  });
});

