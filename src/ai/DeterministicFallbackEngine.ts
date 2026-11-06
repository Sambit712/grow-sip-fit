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
import { ASSESSMENT_QUESTIONS } from './assessmentQuestions';
import { parseCurrencyInput, formatINR } from '../validation/currencyParser';

export class DeterministicFallbackEngine implements IConversationEngine {
  /**
   * Advance the conversational assessment step-by-step
   */
  async generateReply(
    session: AssessmentSession,
    userMessage: string
  ): Promise<EngineReply> {
    const currentIndex = session.stepIndex;
    const currentQ = ASSESSMENT_QUESTIONS[currentIndex];

    // If session is already completed or at the end
    if (currentIndex >= ASSESSMENT_QUESTIONS.length) {
      return {
        message:
          'You have completed the SIP Fit financial readiness assessment! All your inputs have been calculated by our deterministic engine. You can now view your personalized report.',
        isComplete: true,
      };
    }

    // Process user's response to current question
    const extractedData = this.parseAnswer(currentQ.dataKey, userMessage, currentQ.inputType);

    // Merge extracted data into collectedData
    const updatedData: Partial<FinancialProfile> = {
      ...session.collectedData,
      ...extractedData,
      income: {
        ...session.collectedData.income,
        ...(extractedData.income || {}),
      } as FinancialProfile['income'],
      expenses: {
        ...session.collectedData.expenses,
        ...(extractedData.expenses || {}),
      } as FinancialProfile['expenses'],
      liabilities: {
        ...session.collectedData.liabilities,
        ...(extractedData.liabilities || {}),
      } as FinancialProfile['liabilities'],
      savings: {
        ...session.collectedData.savings,
        ...(extractedData.savings || {}),
      } as FinancialProfile['savings'],
      existingInvestments: {
        ...session.collectedData.existingInvestments,
        ...(extractedData.existingInvestments || {}),
      } as FinancialProfile['existingInvestments'],
      goal: {
        ...session.collectedData.goal,
        ...(extractedData.goal || {}),
      } as FinancialProfile['goal'],
      risk: {
        ...session.collectedData.risk,
        ...(extractedData.risk || {}),
      } as FinancialProfile['risk'],
    };

    // Find next valid question (handling skip conditions)
    let nextIndex = currentIndex + 1;
    while (
      nextIndex < ASSESSMENT_QUESTIONS.length &&
      ASSESSMENT_QUESTIONS[nextIndex].skipCondition &&
      ASSESSMENT_QUESTIONS[nextIndex].skipCondition!(updatedData)
    ) {
      nextIndex++;
    }

    // If reached the end
    if (nextIndex >= ASSESSMENT_QUESTIONS.length) {
      return {
        message:
          'Thank you for providing your financial details. We have evaluated your income stability, essential living obligations, and emergency reserve buffer. Your Financial Readiness Report is ready to generate.',
        extractedData,
        isComplete: true,
        stepIndex: nextIndex,
      };
    }

    const nextQ = ASSESSMENT_QUESTIONS[nextIndex];

    return {
      message: nextQ.text,
      quickReplies: nextQ.quickReplies,
      extractedData,
      nextCategory: nextQ.category,
      stepIndex: nextIndex,
      sensitivityNote: nextQ.sensitivityNote,
      inputType: nextQ.inputType,
      isComplete: false,
    };
  }

  /**
   * Maps user's raw message or quick reply into structured FinancialProfile keys
   */
  private parseAnswer(
    dataKey: string,
    message: string,
    inputType: string
  ): Partial<FinancialProfile> {
    const raw = message.trim();
    const result: Record<string, unknown> = {};

    // Helper for nested key setting
    const setPath = (path: string, val: unknown) => {
      const parts = path.split('.');
      let curr = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]] as Record<string, unknown>;
      }
      curr[parts[parts.length - 1]] = val;
    };

    if (inputType === 'currency') {
      const num = parseCurrencyInput(raw) ?? 0;
      setPath(dataKey, num);
      return result as Partial<FinancialProfile>;
    }

    // Quick replies mapping logic
    switch (dataKey) {
      case 'goal.purpose':
        setPath('goal.purpose', raw);
        break;

      case 'goal.horizonYears': {
        let years = 5;
        if (raw.includes('1–3') || raw.includes('1-3')) years = 2;
        else if (raw.includes('3–5') || raw.includes('3-5')) years = 4;
        else if (raw.includes('5–10') || raw.includes('5-10')) years = 7;
        else if (raw.includes('10')) years = 12;
        setPath('goal.horizonYears', years);
        break;
      }

      case 'income.type': {
        let type = 'salaried_fixed';
        if (raw.toLowerCase().includes('incentive') || raw.toLowerCase().includes('variable')) {
          type = 'salaried_variable';
        } else if (raw.toLowerCase().includes('freelance') || raw.toLowerCase().includes('self')) {
          type = 'freelance_self_employed';
        } else if (raw.toLowerCase().includes('unemployed')) {
          type = 'unemployed';
        }
        setPath('income.type', type);
        break;
      }

      case 'income.creditDay': {
        const dayMatch = raw.match(/\b([0-9]{1,2})\b/);
        const day = dayMatch ? parseInt(dayMatch[1], 10) : 5;
        setPath('income.creditDay', Math.min(31, Math.max(1, day)));
        break;
      }

      case 'income.isStableLast6Months':
        setPath('income.isStableLast6Months', !raw.toLowerCase().includes('no'));
        break;

      case 'liabilities.hasEmi': {
        const has = raw.toLowerCase().includes('yes');
        setPath('liabilities.hasEmi', has);
        if (!has) setPath('liabilities.activeEmisMonthly', 0);
        break;
      }

      case 'liabilities.hasCardDebt': {
        const has = raw.toLowerCase().includes('yes');
        setPath('liabilities.creditCardDebt', has ? 15000 : 0);
        break;
      }

      case 'savings.reserveMonthsTarget': {
        let months = 3;
        if (raw.includes('6')) months = 6;
        else if (raw.includes('12')) months = 12;
        setPath('savings.reserveMonthsTarget', months);
        break;
      }

      case 'existingInvestments.hasSip': {
        const has = raw.toLowerCase().includes('yes');
        setPath('existingInvestments.hasSip', has);
        if (!has) setPath('existingInvestments.activeSipTotal', 0);
        break;
      }

      case 'risk.willingness': {
        let w: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
        if (raw.toLowerCase().includes('comfortable')) w = 'aggressive';
        else if (raw.toLowerCase().includes('stressed')) w = 'conservative';
        setPath('risk.willingness', w);
        break;
      }

      case 'risk.capacity': {
        let c: 'low' | 'moderate' | 'high' = 'moderate';
        if (raw.toLowerCase().includes('easily')) c = 'high';
        else if (raw.toLowerCase().includes('no')) c = 'low';
        setPath('risk.capacity', c);
        break;
      }

      case 'risk.marketUnderstanding': {
        let u: 'beginner' | 'intermediate' | 'experienced' = 'beginner';
        if (raw.toLowerCase().includes('intermediate')) u = 'intermediate';
        else if (raw.toLowerCase().includes('experienced')) u = 'experienced';
        setPath('risk.marketUnderstanding', u);
        break;
      }

      default:
        setPath(dataKey, raw);
    }

    return result as Partial<FinancialProfile>;
  }

  /**
   * Deterministic report synthesis based strictly on engine values
   */
  async generateReportExplanation(report: FinancialReport): Promise<ReportExplanation> {
    const b = report.breakdown;
    const g = report.goalCompatibility;

    const formattedSurplus = formatINR(b.availableSurplus);
    const formattedIncome = formatINR(b.conservativeMonthlyIncome);
    const formattedReserve = formatINR(b.targetEmergencyReserve);
    const formattedGap = formatINR(b.emergencyReserveGap);

    let readinessExplanation = '';
    switch (report.readinessTier) {
      case 'READY':
        readinessExplanation = `Based on your conservative monthly income of ${formattedIncome} and recurring obligations of ${formatINR(b.totalObligations)}, you have an estimated monthly surplus of ${formattedSurplus}. With your emergency savings in place, recurring SIP investments appear sustainable under your current financial circumstances.`;
        break;
      case 'LIMITED_FLEXIBILITY':
        readinessExplanation = `You have an estimated monthly surplus of ${formattedSurplus}, but your fixed obligations consume a significant portion of your income. We recommend staying near the conservative end of your indicative SIP range to protect against cash-flow strains.`;
        break;
      case 'LIQUIDITY_NEEDS_ATTENTION':
        readinessExplanation = `Your emergency reserve gap is estimated at ${formattedGap} (target: ${formattedReserve}). Committing to a long-term recurring investment before securing liquid savings increases the risk of distress redemptions or missed payments.`;
        break;
      case 'MORE_INFO_REQUIRED':
        readinessExplanation = `Some critical financial information was omitted. Please complete the missing categories to generate an accurate readiness assessment.`;
        break;
    }

    const sipAffordabilityNote =
      b.indicativeSipMax > 0
        ? `We estimate an indicative recurring SIP capacity of ${formatINR(b.indicativeSipMin)} – ${formatINR(b.indicativeSipMax)} per month after setting aside a 10% buffer for irregular expenses.`
        : `Currently, there is no uncommitted surplus available for an additional recurring SIP. Focus on optimizing essential expenses or clearing debt first.`;

    const goalAnalysis = g.isHorizonShort
      ? `For your goal of "${g.goalPurpose}", your planned horizon (${g.horizonYears} years) is relatively short. Equity mutual funds carry volatility over short periods; consider whether debt or liquid instruments better match your timeline.`
      : `Your goal of "${g.goalPurpose}" with a ${g.horizonYears}-year horizon aligns well with equity compounding cycles. At a conservative baseline (0% real return), closing the remaining gap requires approximately ${formatINR(g.requiredMonthlySaving)}/month.`;

    return {
      overviewSummary: `Conservative Monthly Income: ${formattedIncome} | Total Obligations: ${formatINR(b.totalObligations)} | Available Surplus: ${formattedSurplus}`,
      readinessExplanation,
      sipAffordabilityNote,
      goalAnalysis,
      actionableNextSteps: report.nextSteps,
    };
  }

  /**
   * Educational Q&A assistant
   */
  async answerEducationalQuery(query: string, context?: FinancialProfile): Promise<string> {
    const q = query.toLowerCase();

    if (q.includes('recommend') || q.includes('which fund') || q.includes('best mutual fund') || q.includes('stock')) {
      return 'Groww SIP Fit is a financial readiness and planning assistant, not a SEBI-registered investment advisor. We do not recommend specific mutual fund schemes, stocks, or promise returns. You can explore mutual fund categories directly on Groww once your readiness is verified.';
    }

    if (q.includes('what is an sip') || q.includes('sip meaning') || q.includes('systematic investment')) {
      return 'A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money at regular intervals (monthly or weekly) into a mutual fund. It helps inculcate financial discipline and benefits from Rupee Cost Averaging without timing the market.';
    }

    if (q.includes('nav') || q.includes('net asset value')) {
      return 'NAV (Net Asset Value) is the per-unit market price of a mutual fund scheme. It represents the total value of all assets held by the fund, minus liabilities, divided by total outstanding units. When you invest via SIP, your money purchases units at the prevailing NAV on the debit date.';
    }

    if (q.includes('volatility') || q.includes('market drops') || q.includes('loss')) {
      return 'Mutual funds invest in market-linked securities (like equities or debt). In the short term, prices fluctuate due to economic and corporate events. Over longer investment horizons (5+ years), market volatility tends to smooth out, making disciplined SIPs powerful for wealth creation.';
    }

    if (q.includes('emergency fund') || q.includes('reserve')) {
      return 'An emergency fund consists of liquid, easily accessible savings (such as savings bank balance or liquid funds) covering 3 to 6 months of essential living expenses. It prevents you from needing to prematurely stop or redeem your SIP during sudden job or medical events.';
    }

    if (context?.goal.purpose) {
      return `For your goal of "${context.goal.purpose}" over ${context.goal.horizonYears} years, SIP continuity is vital. Staying disciplined and avoiding AutoPay debit bounces around your salary date will ensure you steadily build towards your target.`;
    }

    return 'A disciplined SIP works best when your essential expenses, EMIs, and emergency funds are clearly partitioned. Let us know if you want to explore more about NAV, cash-flow scheduling, or AutoPay mechanics!';
  }

  /**
   * Payment & AutoPay troubleshooting flow
   */
  async troubleshootPayment(issue: PaymentIssue): Promise<PaymentGuidance> {
    const type = issue.issueType.toLowerCase();

    if (type.includes('balance') || type.includes('insufficient')) {
      return {
        issueSummary: 'AutoPay SIP debit failed due to insufficient bank account balance.',
        probableReason: 'The scheduled debit date fell before salary credit or coincided with heavy EMI deductions.',
        diagnosticSteps: [
          'Verify your available account balance on the debit date in your bank app.',
          'Check if AutoPay mandate was triggered before your salary credit arrived.',
        ],
        recommendedAction: 'Move your SIP debit date to 3–5 days after your regular salary credit date. You can retry the investment manually as a one-time order for this month.',
        officialSupportRequired: false,
        disclaimer: 'This guidance is an educational diagnostic. Check your Groww order history for exact transaction status.',
      };
    }

    if (type.includes('mandate') || type.includes('autopay')) {
      return {
        issueSummary: 'AutoPay mandate is pending or failed bank registration.',
        probableReason: 'Mandates via NetBanking or Debit Card can take 24–48 hours for bank NPCI authorization.',
        diagnosticSteps: [
          'Check your bank SMS/Email for mandate verification OTP or authorization notification.',
          'Verify if your bank account supports e-Mandates / NACH.',
        ],
        recommendedAction: 'Check the AutoPay section under Profile > Bank & AutoPay in the Groww app. If rejected by bank, re-authenticate via UPI e-Mandate.',
        officialSupportRequired: false,
        disclaimer: 'Prototype diagnostic simulation. Mandate approvals are governed by your bank and NPCI.',
      };
    }

    return {
      issueSummary: 'Payment processing delay or deduction mismatch.',
      probableReason: 'Bank debited the amount but fund house allotment (NAV) is pending clearing confirmation.',
      diagnosticSteps: [
        'Check if 2-3 business days (T+2) have elapsed since debit.',
        'Review your bank statement for the UTR (Unique Transaction Reference) number.',
      ],
      recommendedAction: 'If units are not allotted after 2 business days, navigate to Help & Support > Mutual Funds in Groww with your bank UTR number.',
      officialSupportRequired: true,
      disclaimer: 'Prototype diagnostic simulation. For account-specific payment queries, consult official Groww Help & Support.',
    };
  }
}

