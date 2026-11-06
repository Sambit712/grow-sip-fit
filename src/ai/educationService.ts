/**
 * educationService.ts
 *
 * Contextual AI Education Assistant service (Phase 5).
 * Delivers jargon-free, objective financial education adapted to the user's
 * current financial profile and investment goals.
 *
 * Strictly adheres to non-negotiable guardrails:
 * - Zero specific mutual fund scheme or stock recommendations
 * - Zero return promises or guaranteed CAGR claims
 * - Autonomous fallback operation if Groq is unreachable
 */

import type { FinancialProfile } from '../types/FinancialProfile';
import { Groq } from 'groq-sdk';
import { applySafetyFilters } from '../safety/safetyGuardrails';

export interface EducationalTopic {
  id: string;
  chipLabel: string;
  fullQuestion: string;
  category: 'basics' | 'mechanics' | 'risk_and_market' | 'planning_and_continuity';
}

export const EDUCATIONAL_TOPICS: EducationalTopic[] = [
  {
    id: 'what-is-sip',
    chipLabel: 'What is an SIP?',
    fullQuestion: 'What is an SIP and how does it work?',
    category: 'basics',
  },
  {
    id: 'how-mutual-funds-work',
    chipLabel: 'How do mutual funds work?',
    fullQuestion: 'How do mutual funds work and who manages them?',
    category: 'basics',
  },
  {
    id: 'what-is-nav',
    chipLabel: 'What is NAV?',
    fullQuestion: 'What is NAV and why does it change every day?',
    category: 'mechanics',
  },
  {
    id: 'market-volatility',
    chipLabel: 'What is market volatility?',
    fullQuestion: 'What is market volatility and how should I react when markets crash?',
    category: 'risk_and_market',
  },
  {
    id: 'invested-vs-current-value',
    chipLabel: 'Invested value vs current value',
    fullQuestion: 'What is the difference between invested value and current value?',
    category: 'mechanics',
  },
  {
    id: 'can-i-lose-money',
    chipLabel: 'Can I lose money in mutual funds?',
    fullQuestion: 'Can I lose money in a mutual fund? Is my capital safe?',
    category: 'risk_and_market',
  },
  {
    id: 'horizon-for-house',
    chipLabel: 'Investment horizon for buying a house',
    fullQuestion: 'What is a good investment horizon for buying a house or large purchase?',
    category: 'planning_and_continuity',
  },
  {
    id: 'what-is-liquidity',
    chipLabel: 'What is liquidity?',
    fullQuestion: 'What is liquidity and why is it important before starting an SIP?',
    category: 'planning_and_continuity',
  },
  {
    id: 'missed-sip-instalment',
    chipLabel: 'What if I miss an SIP instalment?',
    fullQuestion: 'What happens if I miss an SIP instalment or my bank account has insufficient balance?',
    category: 'planning_and_continuity',
  },
  {
    id: 'pause-vs-stop-sip',
    chipLabel: 'How do I pause or stop an SIP?',
    fullQuestion: 'How do I pause or stop an SIP on Groww without losing my money?',
    category: 'mechanics',
  },
];

/**
 * Deterministic responses for all 10 core topics with personalization slots.
 */
function getDeterministicResponse(topicKey: string, profile?: FinancialProfile | null): string {
  const goalContext = profile?.goal
    ? `For your goal of "${profile.goal.purpose}" (target: ₹${profile.goal.targetAmount.toLocaleString('en-IN')}, horizon: ${profile.goal.horizonYears} years), `
    : '';

  switch (topicKey) {
    case 'what-is-sip':
      return `${goalContext}A Systematic Investment Plan (SIP) is a disciplined method of investing a fixed sum of money at regular intervals (typically monthly) into a mutual fund scheme. Instead of trying to guess whether the stock market is high or low ("timing the market"), an SIP buys units continuously. When prices are high, your fixed amount buys fewer units; when prices drop, it buys more units. Over long periods, this phenomenon—called Rupee Cost Averaging—smooths out purchase price volatility and harnesses compound interest.`;

    case 'how-mutual-funds-work':
      return `A mutual fund pools money from thousands of individual investors to invest in a diversified basket of assets like equities (company shares), debt instruments (government bonds, corporate debentures), or gold. It is managed by a professional fund manager and regulated by SEBI in India. By contributing even ₹500 or ₹1,000 via SIP, you gain exposure to dozens of leading companies across sectors, reducing the risk of depending on a single stock's fortunes.`;

    case 'what-is-nav':
      return `NAV stands for Net Asset Value. It represents the per-unit market price of a mutual fund scheme at the close of each trading day. NAV is calculated by taking the total market value of all securities held by the fund, subtracting operating expenses and management fees, and dividing by the total number of units issued to investors. When your monthly SIP debit succeeds, the fund house issues units to your folio based on that day's closing NAV.`;

    case 'market-volatility':
      return `${goalContext}Market volatility refers to the normal upward and downward fluctuations in asset prices driven by macroeconomic factors, corporate earnings, interest rates, and global events. In equity investing, short-term volatility is not a defect—it is the very engine that generates equity risk premiums over time. During sharp market corrections, disciplined SIP investors actually accumulate units at discounted NAVs, which accelerates wealth accumulation once markets recover.`;

    case 'invested-vs-current-value':
      return `In your investment portfolio:
• "Invested Value" (Cost Basis) is the actual cumulative amount of cash debited from your bank account across all SIP installments.
• "Current Value" is the present market worth of all accumulated units (calculated as: Total Units × Today's NAV).
If Current Value is higher than Invested Value, you have an unrealized capital gain. If Current Value is lower during a market downturn, you have an unrealized (paper) loss—which only becomes a real loss if you sell your units at that depressed price.`;

    case 'can-i-lose-money':
      return `Yes, mutual funds are market-linked instruments and do not offer capital guarantees or fixed returns like fixed deposits. In the short term (under 3 years), equity mutual funds can show negative returns during bear markets. However, the risk of permanent capital loss is significantly mitigated by holding well-diversified funds across broad market indices, keeping a horizon of 5–7+ years, and avoiding panic selling during drawdowns. Maintaining an independent emergency fund ensures you never need to distress-sell during a dip.`;

    case 'horizon-for-house':
      if (profile?.goal.purpose) {
        return `For major capital milestones like buying a house, horizon matching is critical. If your horizon is short (under 3 years), equity mutual funds carry significant timing risk; capital preservation through liquid, ultra-short duration, or arbitrage funds is generally safer. If your horizon is 5 to 10+ years (like your ${profile.goal.horizonYears}-year target for "${profile.goal.purpose}"), equity-oriented SIPs have historically outpaced inflation and built substantial down-payment corpuses.`;
      }
      return `For major capital milestones like buying a house, horizon matching is critical. If your horizon is short (under 3 years), equity mutual funds carry significant volatility risk; capital preservation through liquid or ultra-short debt funds is safer. For horizons of 5 to 10+ years, equity-oriented SIPs provide inflation-beating compound growth for building a down-payment corpus.`;

    case 'what-is-liquidity':
      return `Liquidity measures how quickly and easily you can convert an asset into spendable cash without losing value. Bank savings balances and liquid funds are highly liquid (accessible in hours or 1 business day). Equity mutual funds, real estate, and long-term deposits are less liquid or carry exit loads and tax friction. Having 3 to 6 months of living expenses parked in liquid reserves BEFORE committing surplus to long-term SIPs protects your continuity and prevents costly premature redemptions.`;

    case 'missed-sip-instalment':
      return `If your bank balance is insufficient on the scheduled debit day:
1. Groww and fund houses (AMCs) do NOT charge any penalty or cancel your fund portfolio for a single missed instalment.
2. Your bank, however, may levy an AutoPay / NACH bounce charge (typically ₹250 to ₹500 + GST).
3. If 3 consecutive monthly debits fail, the AMC automatically deactivates the recurring SIP mandate.
You can easily make an instant one-time manual purchase on Groww once funds arrive, and the recurring schedule will resume automatically next month.`;

    case 'pause-vs-stop-sip':
      return `Groww provides flexible controls so you never lose control over your cash-flow:
• Pause SIP: Temporarily stops debits for 1, 2, or 3 months (useful during heavy expense months like medical bills or festive seasons). The SIP automatically resumes afterwards without any bank charges.
• Cancel SIP: Permanently stops future debits. All previously accumulated units remain fully invested in the fund and continue to earn market returns until you decide to redeem them. You never lose existing investments when cancelling a mandate.`;

    default:
      if (goalContext) {
        return `${goalContext}Disciplined investing works best when your essential expenses, safety reserves, and investment goals are harmonized. Feel free to tap any topic chip above or ask about NAV, cash-flow scheduling, or AutoPay mechanics!`;
      }
      return `A disciplined SIP works best when your essential expenses, EMIs, and emergency funds are clearly partitioned. Feel free to tap any topic chip above or ask about NAV, cash-flow scheduling, or AutoPay mechanics!`;
  }
}

/**
 * Query check for financial advice / stock tips / return guarantees
 */
function violatesGuardrails(query: string): string | null {
  const q = query.toLowerCase();

  // Stock / Scheme recommendation query
  if (
    q.includes('recommend') ||
    q.includes('which fund') ||
    q.includes('best mutual fund') ||
    q.includes('best fund') ||
    q.includes('best stock') ||
    q.includes('which stock') ||
    q.includes('what stock') ||
    q.includes('top stock') ||
    q.includes('top 5') ||
    q.includes('what should i buy') ||
    q.includes('top funds') ||
    q.includes('portfolio review') ||
    q.includes('stock tip') ||
    q.includes('stocks to invest') ||
    q.includes('shares to buy')
  ) {
    return 'Groww SIP Fit is an educational readiness and planning assistant, not a SEBI-registered investment advisor. We do not provide specific mutual fund scheme recommendations or stock picks. For personalized portfolio selection, please consult a certified SEBI-registered financial planner.';
  }

  // Return promise / guarantee query
  if (
    q.includes('guarantee') ||
    q.includes('how much return will i get') ||
    q.includes('fixed return') ||
    q.includes('guaranteed profit') ||
    q.includes('double my money') ||
    q.includes('promise return')
  ) {
    return 'Mutual fund investments are subject to market risks. SEBI regulations strictly prohibit any person or platform from guaranteeing returns or promising capital appreciation. Historical returns are not an indicator of future performance.';
  }

  return null;
}

/**
 * Main query processor with Groq LLM integration and deterministic fallback
 */
export async function askEducationalQuestion(
  userQuery: string,
  profile?: FinancialProfile | null,
  options?: { forceDeterministic?: boolean }
): Promise<string> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return 'Please ask a question about mutual funds, SIP mechanics, or financial readiness.';
  }

  // 1. Guardrail filter check
  const guardrailViolation = violatesGuardrails(trimmed);
  if (guardrailViolation) {
    return guardrailViolation;
  }

  // 2. Identify if user clicked or typed a matching topic chip
  const lower = trimmed.toLowerCase();
  const matchedTopic = EDUCATIONAL_TOPICS.find((t) => {
    return (
      lower.includes(t.chipLabel.toLowerCase()) ||
      lower.includes(t.id) ||
      (t.id === 'what-is-sip' && (lower.includes('what is sip') || lower.includes('sip meaning') || lower.includes('systematic investment'))) ||
      (t.id === 'what-is-nav' && (lower.includes('nav') || lower.includes('net asset value'))) ||
      (t.id === 'market-volatility' && (lower.includes('volatility') || lower.includes('market crash'))) ||
      (t.id === 'can-i-lose-money' && (lower.includes('lose money') || lower.includes('safe'))) ||
      (t.id === 'what-is-liquidity' && lower.includes('liquidity')) ||
      (t.id === 'missed-sip-instalment' && (lower.includes('miss') || lower.includes('insufficient'))) ||
      (t.id === 'pause-vs-stop-sip' && (lower.includes('pause') || lower.includes('stop'))) ||
      (t.id === 'horizon-for-house' && (lower.includes('house') || lower.includes('horizon'))) ||
      (t.id === 'how-mutual-funds-work' && lower.includes('mutual fund work')) ||
      (t.id === 'invested-vs-current-value' && (lower.includes('invested value') || lower.includes('current value')))
    );
  });

  // 3. Try Groq if API key exists and forceDeterministic is not set, otherwise return deterministic
  const apiKey = !options?.forceDeterministic ? import.meta.env.VITE_GROQ_API_KEY : undefined;
  if (apiKey) {
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const model = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';

      const userContextStr = profile
        ? `User context: Goal="${profile.goal.purpose}", Horizon=${profile.goal.horizonYears} years, Target=₹${profile.goal.targetAmount.toLocaleString('en-IN')}, IncomeType=${profile.income.type}.`
        : 'User context: New investor.';

      const systemPrompt = `You are Groww SIP Fit's investment education assistant.
Your mission is to explain mutual funds, Systematic Investment Plans (SIPs), cash-flow planning, and financial readiness in clear, accessible, jargon-free English for Indian retail investors.
CRITICAL COMPLIANCE RULES:
- Never recommend specific mutual fund schemes, fund houses, or stocks.
- Never guarantee or promise returns (e.g. do not say "you will get 12%").
- If asked for recommendations or predictions, decline politely and remind them you are an educational tool.
- Provide objective, empathetic, financially sound explanations under 3 paragraphs.
${userContextStr}`;

      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        temperature: 0.2,
      });

      const reply = completion.choices[0]?.message?.content;
      if (reply && reply.trim().length > 20) {
        return applySafetyFilters(reply.trim());
      }
    } catch {
      // Fallback to deterministic
    }
  }

  // 4. Deterministic response
  if (matchedTopic) {
    return applySafetyFilters(getDeterministicResponse(matchedTopic.id, profile));
  }

  return applySafetyFilters(getDeterministicResponse('default', profile));
}
