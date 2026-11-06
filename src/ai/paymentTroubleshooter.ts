/**
 * paymentTroubleshooter.ts
 * Layer 4 — AI & Diagnostics
 *
 * Dedicated troubleshooter service for payment failures, AutoPay mandate issues,
 * and banking delays. Calls createConversationEngine().troubleshootPayment()
 * and applies Layer 5 safety filters.
 */

import { createConversationEngine } from './index';
import type { PaymentIssue, PaymentGuidance } from './IConversationEngine';
import { applySafetyFilters } from '../safety/safetyGuardrails';

export async function troubleshootPaymentIssue(issue: PaymentIssue): Promise<PaymentGuidance> {
  const engine = createConversationEngine();
  const rawGuidance = await engine.troubleshootPayment(issue);

  return {
    issueSummary: applySafetyFilters(rawGuidance.issueSummary),
    probableReason: applySafetyFilters(rawGuidance.probableReason),
    diagnosticSteps: rawGuidance.diagnosticSteps.map((step) => applySafetyFilters(step)),
    recommendedAction: applySafetyFilters(rawGuidance.recommendedAction),
    officialSupportRequired: rawGuidance.officialSupportRequired,
    disclaimer: applySafetyFilters(rawGuidance.disclaimer),
  };
}

