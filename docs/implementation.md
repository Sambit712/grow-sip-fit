# GROWW SIP FIT — PHASE-WISE IMPLEMENTATION PLAN
**AI-Powered Financial Readiness & SIP Continuity Platform**
*Document Version: 1.0.0 | Status: Ready for Execution*

> [!IMPORTANT]
> This plan must be executed in strict phase order. Each phase has defined inputs, deliverables, and acceptance gates. Do not start a phase until the previous phase's acceptance gate is passed. Every navigation item, form field, button, and slider must be functional — no decorative placeholders.

---

## Table of Contents
1. [Project Setup & Repository Structure](#1-project-setup--repository-structure)
2. [Phase 1 — Deterministic Financial Engine](#2-phase-1--deterministic-financial-engine)
3. [Phase 2 — Data Store, Types & Demo Profiles](#3-phase-2--data-store-types--demo-profiles)
4. [Phase 3 — Conversational Assessment Chat](#4-phase-3--conversational-assessment-chat)
5. [Phase 4 — Financial Readiness Report & Dashboard](#5-phase-4--financial-readiness-report--dashboard)
6. [Phase 5 — Scenario Simulator, Education & Payment Help](#6-phase-5--scenario-simulator-education--payment-help)
7. [Phase 6 — Safety Guardrails, Accessibility & Hardening](#7-phase-6--safety-guardrails-accessibility--hardening)
8. [Master Acceptance Criteria Checklist](#8-master-acceptance-criteria-checklist)
9. [Analytics Event Reference](#9-analytics-event-reference)

---

## 1. Project Setup & Repository Structure

### 1.1 Prerequisites
- Node.js 20 LTS or higher
- npm 10+ or pnpm 9+
- Git

### 1.2 Scaffold Command
```bash
npm create vite@latest groww-sip-fit -- --template react-ts
cd groww-sip-fit
npm install
```

### 1.3 Dependency Installation
```bash
# Core UI & styling
npm install tailwindcss @tailwindcss/vite lucide-react clsx

# UI primitives
npm install @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-tabs \
            @radix-ui/react-tooltip @radix-ui/react-progress

# State management & persistence
npm install zustand

# Data validation
npm install zod

# Charts & visualizations
npm install recharts

# Routing
npm install react-router-dom

# Dev & testing
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom

# AI (optional — app works without it)
npm install groq-sdk
```

### 1.4 Target Directory Structure

```
groww-sip-fit/
├── public/
│   └── favicon.svg
├── src/
│   ├── engine/                        # Layer 3: Pure deterministic calculation engine
│   │   ├── incomeCalculator.ts
│   │   ├── obligationsCalculator.ts
│   │   ├── surplusCalculator.ts
│   │   ├── reserveCalculator.ts
│   │   ├── sipCapacityCalculator.ts
│   │   ├── cashflowConflictDetector.ts
│   │   ├── scenarioEngine.ts
│   │   ├── readinessTierClassifier.ts
│   │   ├── goalCompatibilityAnalyzer.ts
│   │   └── index.ts
│   ├── validation/                    # Layer 2: Zod schemas & normalizers
│   │   ├── currencyParser.ts
│   │   ├── profileSchema.ts
│   │   ├── assessmentSchema.ts
│   │   └── validateProfile.ts
│   ├── ai/                            # Layer 4: AI dual-mode adapter
│   │   ├── IConversationEngine.ts
│   │   ├── GroqConversationEngine.ts
│   │   ├── DeterministicFallbackEngine.ts
│   │   ├── assessmentQuestions.ts
│   │   ├── explanationService.ts
│   │   ├── educationService.ts
│   │   └── paymentTroubleshooter.ts
│   ├── safety/                        # Layer 5: Guardrails
│   │   ├── piiRedactor.ts
│   │   ├── adviceBlocker.ts
│   │   ├── returnGuaranteeFilter.ts
│   │   └── safetyGuardrails.ts
│   ├── store/                         # Zustand persistent stores
│   │   ├── useUserStore.ts
│   │   ├── useAssessmentStore.ts
│   │   ├── useFinancialProfileStore.ts
│   │   ├── useReportStore.ts
│   │   └── useScenarioStore.ts
│   ├── types/                         # Shared TypeScript domain types
│   │   ├── FinancialProfile.ts
│   │   ├── AssessmentSession.ts
│   │   ├── FinancialReport.ts
│   │   ├── CashflowEvent.ts
│   │   └── Scenario.ts
│   ├── data/                          # Seed & demo data
│   │   ├── demoProfiles.ts
│   │   └── paymentScenarios.ts
│   ├── components/                    # Shared/reusable UI components
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── QuickReplyChips.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Disclaimer.tsx
│   │   ├── charts/
│   │   │   ├── SurplusGauge.tsx
│   │   │   ├── ExpenseBreakdownPie.tsx
│   │   │   ├── CashflowBarChart.tsx
│   │   │   ├── ReserveProgressBar.tsx
│   │   │   └── ScenarioDeltaChart.tsx
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       ├── BottomNav.tsx
│   │       └── TopBar.tsx
│   ├── pages/                         # Route-level page components
│   │   ├── LandingPage.tsx            # /
│   │   ├── AssessmentPage.tsx         # /assess
│   │   ├── ReportPage.tsx             # /report
│   │   ├── DashboardPage.tsx          # /dashboard
│   │   ├── SimulatorPage.tsx          # /simulator
│   │   ├── EducationPage.tsx          # /education
│   │   ├── PaymentHelpPage.tsx        # /payment-help
│   │   └── ProfilePage.tsx            # /profile
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── engine/
│   │   ├── incomeCalculator.test.ts
│   │   ├── surplusCalculator.test.ts
│   │   ├── reserveCalculator.test.ts
│   │   ├── sipCapacity.test.ts
│   │   ├── cashflowConflict.test.ts
│   │   └── scenarioEngine.test.ts
│   ├── validation/
│   │   └── currencyParser.test.ts
│   └── safety/
│       └── safetyGuardrails.test.ts
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── README.md
└── package.json
```

### 1.5 Environment Configuration
Create `.env.example`:
```env
# Optional: Provide a Groq API key to enable the LLM conversation engine.
# If left empty, the app runs in deterministic fallback mode — fully functional.
VITE_GROQ_API_KEY=
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_AI_TEMPERATURE=0.1
```

### 1.6 Tailwind & Design Token Configuration
`tailwind.config.ts` — extend with Groww brand tokens:
```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand:   '#00D09C',  // Groww Green
        heading: '#1E222B',
        body:    '#44475B',
        surface: '#F8FAFC',
        card:    '#FFFFFF',
        border:  '#E5E7EB',
        amber:   '#FFB800',
        danger:  '#EB5757',
        info:    '#4A90E2',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        card: '12px',
        chip: '100px',
      },
    },
  },
};
```

---

## 2. Phase 1 — Deterministic Financial Engine

> [!NOTE]
> This is the most critical deliverable. All UI phases depend on this engine. It must be pure TypeScript with zero side effects, no React imports, and no external API calls. Every function must be unit-tested before moving to Phase 2.

### 2.1 Goals
- Implement the complete financial calculation engine as Layer 3.
- Achieve 100% unit test coverage on all calculation paths.
- Validate all edge cases: zero income, variable income, negative surplus, missing data.

### 2.2 Deliverables

#### `src/engine/incomeCalculator.ts`
- Accepts `FinancialProfile.income`.
- Returns `conservativeMonthlyIncome: number`.
- Logic:
  - `salaried_fixed`: `takeHomeSalary + otherReliableIncome`
  - `salaried_variable`: `Math.min(typicalMonthIncome, lowMonthIncome * 1.1)`
  - `freelance_self_employed`: conservative low-month baseline with explicit note that variable income is not guaranteed.
  - `unemployed`: returns `0`, flags `MORE_INFO_REQUIRED`.

#### `src/engine/obligationsCalculator.ts`
- Accepts `FinancialProfile.expenses`, `.liabilities`, `.existingInvestments`.
- Returns `totalObligations: number` broken down into:
  - `essentialExpenses` (rent + groceries + utilities + transport + healthcare + insurance)
  - `emiObligations`
  - `familySupport`
  - `existingSipTotal`
  - `discretionaryMinimum`
  - `otherRecurring`

#### `src/engine/surplusCalculator.ts`
- Inputs: `conservativeMonthlyIncome`, `totalObligations`.
- Returns: `availableSurplus: number` (can be negative).

#### `src/engine/reserveCalculator.ts`
- Inputs: `essentialExpenses`, `accessibleEmergencyFund`, `reserveMonthsTarget` (3–6, default 3).
- Returns:
  - `targetReserve: number`
  - `reserveGap: number` (clamped to 0 minimum)
  - `plannedMonthlyReserveContribution: number` (min of `availableSurplus × 0.30` or `reserveGap / 12`)

#### `src/engine/sipCapacityCalculator.ts`
- Inputs: `availableSurplus`, `plannedMonthlyReserveContribution`.
- Returns:
  - `uncommittedSurplus: number`
  - `indicativeSipMin: number` (rounded to nearest ₹500, 60% of uncommitted)
  - `indicativeSipMax: number` (rounded to nearest ₹500)
  - If `uncommittedSurplus <= 0`, both are `0`.

#### `src/engine/readinessTierClassifier.ts`
- Inputs: `availableSurplus`, `reserveGap`, `essentialExpenses`, `totalObligations`, `conservativeMonthlyIncome`, data completeness flags.
- Returns one of: `'READY' | 'LIMITED_FLEXIBILITY' | 'LIQUIDITY_NEEDS_ATTENTION' | 'MORE_INFO_REQUIRED'`
- Classification rules (in priority order):
  1. Missing critical data → `MORE_INFO_REQUIRED`
  2. `reserveGap > essentialExpenses * 3` OR `availableSurplus <= 0` → `LIQUIDITY_NEEDS_ATTENTION`
  3. `availableSurplus > 0` AND (`availableSurplus < conservativeMonthlyIncome * 0.15` OR `emiObligations / conservativeMonthlyIncome > 0.40`) → `LIMITED_FLEXIBILITY`
  4. Otherwise → `READY`

#### `src/engine/cashflowConflictDetector.ts`
- Inputs: `salary_credit_day`, array of `CashflowEvent[]` (each with `day_of_month`, `amount`, `is_inflow`), `accessibleEmergencyFund`, safety buffer (default ₹5,000).
- Simulates day-by-day running balance from day 1–31.
- Returns: `ConflictWarning[]` — each with `conflictDay`, `estimatedBalance`, `conflictingEvents`, `suggestion` (e.g., "Move SIP debit 3 days after salary credit").

#### `src/engine/scenarioEngine.ts`
- Accepts `FinancialProfile` + `ScenarioModification` (one of Scenarios A–F).
- Returns `ScenarioResult`: `originalSurplus`, `newSurplus`, `delta`, `newReadinessTier`, `newConflicts[]`, `explanation`.
- Must re-run the full engine pipeline on the modified profile.

#### `src/engine/goalCompatibilityAnalyzer.ts`
- Inputs: `goal` from `FinancialProfile`, `indicativeSipMin`, `indicativeSipMax`.
- Returns:
  - `savingsGap: number`
  - `requiredMonthlySaving: number` (to meet goal target in horizon years, assumed at 0% real return for transparency)
  - `isHorizonShort: boolean` (< 3 years triggers liquidity risk warning)
  - `compatibilityNote: string`

### 2.3 Unit Tests (`tests/engine/`)
Every function must have tests covering:
- **Happy path**: typical salaried user with surplus.
- **Edge case — zero income**: no income entered.
- **Edge case — variable income**: must not use high month as baseline.
- **Edge case — negative surplus**: large EMI burden.
- **Edge case — zero emergency fund**: reserve gap = full target reserve.
- **Edge case — partial data**: missing expenses return `MORE_INFO_REQUIRED`.
- **Cash-flow conflict**: SIP debit on day 5, salary on day 7 → conflict detected.
- **Scenario simulation**: 20% income reduction results in correct new surplus.

```bash
# Run after Phase 1 implementation
npx vitest run --reporter verbose
```

### 2.4 Phase 1 Acceptance Gate
- [ ] All 6 calculator modules implemented.
- [ ] All unit tests pass with `0 failures`.
- [ ] No `any` TypeScript types in engine code.
- [ ] Engine functions are pure (no side effects, no I/O).
- [ ] `npx tsc --noEmit` returns no errors.

---

## 3. Phase 2 — Data Store, Types & Demo Profiles

> [!NOTE]
> Phase 2 builds the application's memory. All state lives here. Zustand `persist` middleware ensures LocalStorage persistence. No UI rendering yet — this phase is data infrastructure only.

### 3.1 Goals
- Define all shared TypeScript domain types.
- Implement Zustand stores with full LocalStorage persistence.
- Seed 4 demo profiles and 1 fresh demo user.
- Implement the currency parser and Zod validation schemas.

### 3.2 Deliverables

#### `src/types/` — TypeScript Domain Definitions
Define the following types (do not use `any`):

| File | Key Types |
| :--- | :--- |
| `FinancialProfile.ts` | `FinancialProfile`, `IncomeType`, `RiskWillingness`, `RiskCapacity` |
| `AssessmentSession.ts` | `AssessmentSession`, `AssessmentMessage`, `AssessmentCategory`, `AssessmentStatus` |
| `FinancialReport.ts` | `FinancialReport`, `ReadinessTier`, `GoalCompatibility`, `CalculationBreakdown` |
| `CashflowEvent.ts` | `CashflowEvent`, `EventCategory`, `ConflictWarning` |
| `Scenario.ts` | `ScenarioType`, `ScenarioModification`, `ScenarioResult` |

#### `src/validation/currencyParser.ts`
Accepts freetext and returns integer rupees:
- `"25k"` → `25000`
- `"2.5L"` → `250000`
- `"25,000"` → `25000`
- `"2,50,000"` → `250000`
- `"1Cr"` → `10000000`
- Returns `null` for unrecognizable input (never guess).

#### `src/validation/profileSchema.ts`
Zod schema that validates a fully-formed `FinancialProfile`. Used before engine calculations.

#### `src/validation/validateProfile.ts`
Returns a `ValidationResult` listing which fields are missing, which fields are present but suspect, and overall `isComplete: boolean`.

#### `src/store/useAssessmentStore.ts`
```typescript
interface AssessmentState {
  session: AssessmentSession | null;
  messages: AssessmentMessage[];
  currentCategory: AssessmentCategory;
  stepIndex: number;
  collectedData: Partial<FinancialProfile>;
  startSession: () => void;
  addMessage: (msg: AssessmentMessage) => void;
  updateCollectedData: (patch: Partial<FinancialProfile>) => void;
  editAnswer: (stepIndex: number, newAnswer: string) => void;
  completeSession: () => void;
  resetSession: () => void;
}
```
Persist all keys except transient UI state.

#### `src/store/useFinancialProfileStore.ts`
```typescript
interface FinancialProfileState {
  profile: FinancialProfile | null;
  setProfile: (p: FinancialProfile) => void;
  updateProfile: (patch: Partial<FinancialProfile>) => void;
  deleteProfile: () => void;
}
```

#### `src/store/useReportStore.ts`
```typescript
interface ReportState {
  report: FinancialReport | null;
  setReport: (r: FinancialReport) => void;
  clearReport: () => void;
}
```

#### `src/store/useScenarioStore.ts`
```typescript
interface ScenarioState {
  scenarios: ScenarioResult[];
  activeScenario: ScenarioResult | null;
  runScenario: (mod: ScenarioModification, profile: FinancialProfile) => void;
  clearScenarios: () => void;
}
```

#### `src/data/demoProfiles.ts`
Seed all 4 personas and the Demo user:

| Profile | Income | Key Feature | Pre-filled? |
| :--- | :--- | :--- | :--- |
| **A** — Arjun (Early-career Salaried) | ₹45,000/mo fixed | Low savings, rent-heavy | Yes (all fields) |
| **B** — Bhavna (Variable Incentive) | ₹60K–₹1.2L variable | Overcommit risk in high months | Yes (all fields) |
| **C** — Chetan (Freelancer) | ₹30K–₹80K variable | Irregular income dates | Yes (all fields) |
| **D** — Deepika (Family Dependent) | ₹70,000/mo fixed | EMIs + parental support | Yes (all fields) |
| **Demo** — Fresh Demo User | Unknown | Goal: Buy a house, 3–5 years | Only goal pre-filled |

### 3.3 Phase 2 Acceptance Gate
- [ ] All TypeScript types defined with no `any`.
- [ ] All 5 Zustand stores implemented with `persist`.
- [ ] State survives page refresh (LocalStorage present in browser DevTools).
- [ ] `currencyParser` handles all 5 Indian currency formats.
- [ ] All 4 demo profiles and Demo user seeded in `demoProfiles.ts`.
- [ ] `npx tsc --noEmit` returns no errors.

---

## 4. Phase 3 — Conversational Assessment Chat

> [!IMPORTANT]
> This is the core user-facing experience. The AI conversation must feel like a financial planning assistant — adaptive, empathetic, and educational. Never present all questions at once. Each question appears one at a time.

### 4.1 Goals
- Build the dual-mode conversational AI adapter (Groq LLM + Deterministic Fallback).
- Implement the full 7-category, 35+ question assessment flow.
- Build the chat UI with quick-reply chips, inline currency input, and answer editing.

### 4.2 AI Engine Deliverables

#### `src/ai/IConversationEngine.ts`
The shared interface that both engines implement:
```typescript
export interface IConversationEngine {
  generateReply(session: AssessmentSession, userMessage: string): Promise<EngineReply>;
  generateReportExplanation(report: FinancialReport): Promise<ReportExplanation>;
  answerEducationalQuery(query: string, context: FinancialProfile): Promise<string>;
  troubleshootPayment(issue: PaymentIssue): Promise<PaymentGuidance>;
}

export interface EngineReply {
  message: string;
  quickReplies?: string[];
  extractedData?: Partial<FinancialProfile>;
  nextCategory?: AssessmentCategory;
  isComplete?: boolean;
}
```

#### `src/ai/assessmentQuestions.ts`
Complete question script for all 7 categories:

| Category | Questions | Key Adaptive Branches |
| :--- | :---: | :--- |
| **A — Financial Goals** | 5 | Follow up on specific target amount if goal has one |
| **B — Income** | 6 | Branch to variable-income sub-questions if not fixed |
| **C — Monthly Expenses** | 11 | Group into essential vs. discretionary; ask for upcoming changes |
| **D — Loans & Liabilities** | 5 | Follow up on EMI total if user has active loans |
| **E — Savings & Emergency Fund** | 4 | Accept approximate ranges, not exact balances |
| **F — Existing Investments** | 5 | Surface total monthly commitment including existing SIPs |
| **G — Risk Profile & Knowledge** | 7 | Separate willingness vs. capacity questions |

Each question object defines:
```typescript
interface AssessmentQuestion {
  id: string;
  category: AssessmentCategory;
  text: string;
  inputType: 'quick_reply' | 'currency' | 'number' | 'date' | 'text' | 'scale';
  quickReplies?: string[];
  dataKey: keyof FinancialProfile | string;  // path to store result
  followUpCondition?: (answer: string) => boolean;
  followUpId?: string;
  sensitivityNote?: string;  // explains why this question is asked
  isRequired: boolean;
}
```

#### `src/ai/DeterministicFallbackEngine.ts`
Implements `IConversationEngine` using a finite-state machine:
- Traverses `assessmentQuestions.ts` sequentially with branching.
- Calls `currencyParser.ts` on numeric responses.
- Updates `collectedData` in `useAssessmentStore` after every answer.
- Generates contextual follow-up messages using template strings.
- **Must handle all 7 categories completely without any API key.**

#### `src/ai/GroqConversationEngine.ts`
Implements `IConversationEngine` using the Groq Cloud API via `groq-sdk`:
- Reads `VITE_GROQ_API_KEY` from env — if empty, throws and caller falls back to `DeterministicFallbackEngine`.
- Default model: `llama-3.3-70b-versatile` (or `llama-3.1-8b-instant` for ultra-fast latency).
- System prompt includes: current category, prior collected data, the specific next question, and strict instruction not to invent financial amounts.
- Requests structured JSON output matching `EngineReply` (using `response_format: { type: 'json_object' }`).
- Temperature: `0.1`.

#### Engine Factory (in `App.tsx` or a service file):
```typescript
export function createConversationEngine(): IConversationEngine {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey) {
    return new GroqConversationEngine(apiKey);
  }
  return new DeterministicFallbackEngine();
}
```

### 4.3 UI Deliverables

#### `src/pages/AssessmentPage.tsx` (`/assess`)
**Opening Screen** (before chat starts):
- Display the mandatory opening message: *"Before you begin investing, let's understand your financial situation..."*
- Show estimated time (3–5 minutes — labelled as a design target, not a guarantee).
- "Start Assessment" primary button.
- "Resume" button if an incomplete session exists in the store.

**Chat Interface**:
- Scrollable conversation thread (assistant messages left, user messages right).
- Each assistant message bubble includes:
  - Message text.
  - Optional quick-reply chips below the bubble.
  - Optional inline currency input field.
  - Sensitivity explanation tooltip (e.g., *"We ask this to understand your monthly obligations"*).
- Progress indicator: `Category 2 of 7 — Income`.
- "Back" button to edit a previous answer (re-opens the message in an edit field).
- "Save & Resume Later" link persists session to store.
- Disabled input when waiting for engine reply (show typing indicator).

**Completion Screen**:
- Summary of collected information (category-by-category).
- "Generate My Financial Report" primary CTA → navigates to `/report`.

#### `src/components/ui/QuickReplyChips.tsx`
- Renders a row of pill buttons from an array of strings.
- On click, fires `onSelect(value)` and auto-submits the message.
- Visually disabled once one is selected.

#### `src/components/ui/CurrencyInput.tsx`
- Text input that accepts Indian currency formats.
- On blur, parses via `currencyParser.ts` and shows formatted value (e.g., `₹25,000`).
- Shows red border and error message for unrecognizable input.
- Shows a "Why do we ask this?" link that expands a tooltip.

### 4.4 Phase 3 Acceptance Gate
- [ ] Assessment opens with mandatory welcome message.
- [ ] Questions appear one at a time — no multi-question forms.
- [ ] Quick-reply chips submit the answer and advance to the next question.
- [ ] All 7 categories covered in the deterministic fallback engine.
- [ ] User can click any prior answer bubble to edit it; conversation re-branches.
- [ ] Session state persists — refreshing the page resumes from last question.
- [ ] "Save & Resume Later" works.
- [ ] "Generate My Financial Report" is enabled only when minimum required data is collected.
- [ ] Currency input rejects garbage and accepts all 5 Indian formats.
- [ ] App works in fallback mode with `VITE_GROQ_API_KEY` empty.
- [ ] AC-01, AC-02, AC-03, AC-04 from acceptance criteria are met.

---

## 5. Phase 4 — Financial Readiness Report & Dashboard

> [!NOTE]
> Phase 4 transforms raw collected data into the core product outputs: a 5-section readiness report and an interactive cash-flow dashboard. All numbers come from the Phase 1 engine — never from AI estimation.

### 5.1 Goals
- Render the 5-section Financial Readiness Report populated by real engine calculations.
- Build the interactive cash-flow dashboard with the monthly calendar and 6 chart types.
- Implement the expense CRUD manager.

### 5.2 Report Page Deliverables

#### `src/pages/ReportPage.tsx` (`/report`)
On load, the page must:
1. Pull `collectedData` from `useAssessmentStore`.
2. Run `validateProfile()` — if incomplete, show which fields are missing rather than inventing values.
3. Run the full engine pipeline and store result via `useReportStore.setReport()`.
4. Render the 5 sections below.

**Section 1 — Financial Overview**
Display as a card grid:
| Metric | Value |
| :--- | :--- |
| Monthly Income (Conservative) | ₹X |
| Essential Monthly Expenses | ₹X |
| Total Monthly Obligations | ₹X |
| Existing Investment Commitments | ₹X |
| Available Estimated Surplus | ₹X |
| Emergency Savings (Accessible) | ₹X |
| Emergency Reserve Gap | ₹X |

Include a collapsible "How was this calculated?" section that expands to show the full formula with the user's actual inputs substituted in.

**Section 2 — Financial Readiness Status**
Large status badge (colour-coded per tier):
- `READY` → Emerald `#00D09C`
- `LIMITED_FLEXIBILITY` → Amber `#FFB800`
- `LIQUIDITY_NEEDS_ATTENTION` → Danger `#EB5757`
- `MORE_INFO_REQUIRED` → Slate `#64748B`

Explain the status in 2–3 natural language sentences (generated by `explanationService.ts` using calculated values as inputs — not independently invented).

**Section 3 — Indicative SIP Contribution Capacity**
- Display: `₹X,000 – ₹X,000 / month` (or `₹0 — no surplus available` if negative).
- List assumptions used: conservative income applied, reserve contribution deducted, 10% irregular expense buffer deducted.
- Label clearly: *"This is an indicative range based on the information you've provided. It is not a guaranteed safe investment amount."*

**Section 4 — Goal Compatibility**
- Goal: *[user's goal]*
- Target amount: ₹X
- Investment horizon: X years
- Already saved: ₹X
- Savings gap: ₹X
- Required monthly saving (at 0% real return, for transparency): ₹X
- Warning if horizon < 3 years: *"Short investment horizons carry higher market uncertainty. Consider liquidity risk before committing to equity SIPs."*

**Section 5 — Next Steps**
3–5 actionable next steps based on readiness tier:
- If `READY`: "Explore an appropriate SIP amount within ₹X–₹X" + "Continue to invest" button.
- If `LIMITED_FLEXIBILITY`: "Review discretionary expenses" + "Reassess in 3 months".
- If `LIQUIDITY_NEEDS_ATTENTION`: "Build your emergency fund first" + "Revisit the simulator after increasing savings".
- If `MORE_INFO_REQUIRED`: List the specific missing fields + "Complete Assessment" link.

> [!CAUTION]
> Do not add a "Recommended Fund" button or any fund/scheme specific call-to-action. The report navigates users to understand their readiness — not to pick a fund.

### 5.3 Dashboard Page Deliverables

#### `src/pages/DashboardPage.tsx` (`/dashboard`)

**Top Summary Strip** (always visible, sticky on mobile):
- Income / Obligations / SIPs / Surplus displayed as 4 metric cards.

**Monthly Cash-Flow Calendar**:
- 31-day grid (or month-appropriate length).
- Events plotted on their `day_of_month`:
  - 🟢 Salary credit (inflow).
  - 🔴 Rent, EMI, insurance (outflows).
  - 🟡 SIP debit date.
- Days where the running balance dips below the safety buffer highlighted in red.
- Hovering/tapping an event shows its label and amount.
- Conflict warnings displayed as banners: *"Your expected balance may be under pressure around your SIP debit date. Consider moving the debit date to [suggested day]."*

**6 Visualisations** (implemented with Recharts):
1. **Income vs. Expenses Bar Chart** — Monthly income bar vs. obligations stacked bar.
2. **Expense Breakdown Pie Chart** — Rent / Groceries / Transport / EMIs / Family / Other.
3. **Investment Commitment Breakdown** — Existing SIPs vs. available new capacity.
4. **Cash-Flow Calendar** (as above).
5. **Emergency Reserve Progress Bar** — Current savings / target reserve (colour transitions from red → amber → green).
6. **Projected Monthly Surplus** — Single number displayed prominently with positive/negative colour.

**Expense Manager** (`src/components/ExpenseManager.tsx`):
- Table of all `CashflowEvent[]` (expenses and income) from the store.
- Each row has: Edit (pencil icon) and Delete (trash icon) buttons.
- "Add Expense" button opens a modal with: title, category, amount (CurrencyInput), day of month, recurrence toggle.
- On save, re-runs the conflict detector and updates the dashboard.

#### Analytics Events (fire from this page):
```typescript
track('Dashboard_viewed', { userId, reportId });
track('Contextual_action_clicked', { action: 'edit_expense' | 'add_expense' | 'view_conflicts' });
```

### 5.4 Phase 4 Acceptance Gate
- [ ] Report is generated from real engine calculations — no hardcoded or AI-invented numbers.
- [ ] All 5 report sections render correctly.
- [ ] "How was this calculated?" expander shows the formula with user's actual inputs.
- [ ] Readiness badge matches the correct tier with the correct colour.
- [ ] SIP capacity shows `₹0` correctly when surplus is negative.
- [ ] Goal compatibility shows savings gap and horizon warning when applicable.
- [ ] Dashboard renders all 6 visualisations.
- [ ] Cash-flow calendar shows conflict banners when applicable.
- [ ] Expense CRUD (add, edit, delete) works; re-runs conflict detector on change.
- [ ] AC-05, AC-06, AC-07, AC-08, AC-09 from acceptance criteria are met.

---

## 6. Phase 5 — Scenario Simulator, Education & Payment Help

### 6.1 Goals
- Build the 6-scenario interactive simulator with instant recalculation.
- Build the contextual investment education assistant.
- Build the payment & AutoPay troubleshooter.

### 6.2 Simulator Deliverables

#### `src/pages/SimulatorPage.tsx` (`/simulator`)

**Left Panel — Scenario Controls**:
Build 6 scenario cards, each with its own control widget:

| Scenario | Control Type | Options |
| :--- | :--- | :--- |
| **A — Delayed Salary** | Slider | +5, +10, +15 days (or type custom) |
| **B — Increased Rent** | Slider | +₹1K, +₹3K, +₹5K, custom amount |
| **C — Unexpected Medical Expense** | Buttons + Custom Input | ₹5K, ₹10K, ₹25K, custom |
| **D — Reduced Income** | Slider | –10%, –20%, –30%, custom % |
| **E — New EMI** | Currency Input + Day Input | Monthly amount + debit day |
| **F — Variable Income Month** | 3-way toggle | Low / Typical / High month |

Each scenario activates independently. Multiple scenarios can be stacked (the engine receives the combined modifications).

**Right Panel — Scenario Results**:
On any slider/button change, run `scenarioEngine.ts` immediately (synchronously in the browser — this must be near-instantaneous, no loading spinner needed):
- **Before** column: original surplus, reserve gap, readiness tier, conflict count.
- **After** column: new surplus, new reserve gap, new tier, new conflict count.
- **Δ Delta** row: show change with coloured up/down arrows.
- Explanation text: 2–3 sentences generated by `explanationService.ts` explaining what changed and why.

**Compare Scenarios**:
- "Save This Scenario" button stores the current modification set to `useScenarioStore`.
- Saved scenarios appear as named tabs; user can compare up to 3 side-by-side.

#### Analytics Events:
```typescript
track('Scenario_created', { scenarioType, userId });
track('Scenario_completed', { scenarioType, resultTier, userId });
```

### 6.3 Education Page Deliverables

#### `src/pages/EducationPage.tsx` (`/education`)
Interactive Q&A chat interface (re-uses chat UI components from Phase 3).

**Topics available** (always offer as a browseable list of chips):
- What is an SIP?
- How do mutual funds work?
- What is NAV?
- What is market volatility?
- What is the difference between invested value and current value?
- Can I lose money in a mutual fund?
- What is a good investment horizon for buying a house?
- What is liquidity?
- What happens if I miss an SIP instalment?
- How do I pause or stop an SIP?

**Adaptive context** — if the user has a completed profile, the assistant personalises explanations to their goal and income profile (via `educationService.ts`). E.g., *"Given your 3–5 year horizon for buying a house, here's what market volatility means for your situation..."*

**Guardrails enforced**:
- No specific fund recommendations.
- No return promises or historical return projections.
- Must decline questions outside supported scope gracefully: *"I can help explain investment concepts and your financial readiness. For specific investment advice, please consult a SEBI-registered advisor."*

#### Analytics Events:
```typescript
track('AI_question_asked', { topic, userId });
```

### 6.4 Payment Help Deliverables

#### `src/pages/PaymentHelpPage.tsx` (`/payment-help`)

**Problem Selection** (chips to pick issue type):
- Insufficient balance for SIP debit.
- AutoPay mandate not registered.
- Bank account changed.
- SIP shown as failed but bank debited.
- Payment processing delay.
- Confused about stopping SIP vs. disabling AutoPay.

For each issue, the assistant runs a 3–5 step diagnostic conversation:
1. Understand the user's specific situation.
2. Explain the most likely reason.
3. Ask for clarifying information if needed.
4. Provide step-by-step guidance using **mock** Groww UI references.
5. State clearly when the issue requires contacting Groww support.

> [!WARNING]
> Do not claim to access real bank data, real Groww payment status, or real mandate status. All guidance is based on mock scenarios. Disclaimers must be explicit: *"This is a simulated example. For your actual SIP status, please check the Groww app."*

#### `src/data/paymentScenarios.ts`
Pre-defined mock payment scenarios with realistic transaction details (amounts, dates, failure codes) for the demo.

### 6.5 Phase 5 Acceptance Gate
- [ ] All 6 scenario controls render and are interactive (no sliders that do nothing).
- [ ] Scenario results update instantly on slider/button change with no perceptible lag.
- [ ] Multiple scenarios can be stacked and compared.
- [ ] "Save Scenario" persists to store and survives page refresh.
- [ ] Education page covers all 10 topic chips with adaptive personalised responses.
- [ ] Education assistant declines fund recommendation requests gracefully.
- [ ] Payment help flows through all 6 issue types to resolution.
- [ ] Payment help never claims to access real bank or Groww data.
- [ ] AC-10, AC-11, AC-12, AC-13, AC-14 from acceptance criteria are met.

---

## 7. Phase 6 — Safety Guardrails, Accessibility & Hardening

> [!CAUTION]
> This phase is not optional polish. Financial safety guardrails are a core non-negotiable requirement. The application must not generate specific investment advice, return guarantees, or capture sensitive credentials under any circumstances.

### 7.1 Goals
- Implement the full Layer 5 safety pipeline.
- Implement analytics event tracking throughout.
- Complete the Landing Page and Profile Page.
- Verify all 18 acceptance criteria.
- Final mobile and desktop responsive testing.
- Produce README.

### 7.2 Safety Deliverables

#### `src/safety/piiRedactor.ts`
- Regex patterns to detect and redact:
  - PAN: `[A-Z]{5}[0-9]{4}[A-Z]`
  - Aadhaar: 12-digit number
  - Credit/debit card: 16-digit sequences
  - OTP: 4–8 digit sequences in context of "OTP", "one time password"
  - Bank account numbers: 9–18 digit sequences
- On detection: replace with `[REDACTED - please do not share sensitive credentials]` and log a `Privacy_incident` event.

#### `src/safety/adviceBlocker.ts`
- Blocklist of mutual fund scheme patterns (regex-based).
- Blocklist of stock ticker patterns.
- On match: replace with generic term and append note.

#### `src/safety/returnGuaranteeFilter.ts`
- Pattern match for phrases: "you will get X%", "guaranteed return", "CAGR of X", "12% per year", etc.
- On match: replace with standard SEBI disclaimer language.

#### `src/safety/safetyGuardrails.ts`
Composes all 3 filters as a pipeline:
```typescript
export function applySafetyFilters(rawText: string): string {
  return [piiRedactor, adviceBlocker, returnGuaranteeFilter]
    .reduce((text, filter) => filter(text), rawText);
}
```
Every AI-generated string displayed to the user must pass through `applySafetyFilters()`.

#### `src/components/ui/Disclaimer.tsx`
Persistent footer component rendered on every page:
> *"Groww SIP Fit is a financial readiness decision aid and educational simulator. It does not provide SEBI-registered investment advice or guarantee future returns. This is a product prototype, not an official Groww service."*

### 7.3 Remaining Pages

#### `src/pages/LandingPage.tsx` (`/`)
- Hero section: product name, tagline, and 3-step value proposition (Assess → Plan → Sustain).
- 4 demo profile switcher cards (A/B/C/D) with a name, role, and brief challenge.
- "Start Fresh Assessment" button → navigates to `/assess` with a blank session.
- "Load Demo Profile" on each card → loads that profile's data into the stores and navigates to `/dashboard`.
- "What is SIP Fit?" collapsible FAQ section.

#### `src/pages/ProfilePage.tsx` (`/profile`)
- Display current profile summary (read-only cards).
- "Edit Financial Details" → opens individual editable sections (income, expenses, liabilities, savings, goal, risk).
- Changes are validated via `profileSchema.ts`, re-run through the engine, and saved to store.
- "Re-take Assessment" button → clears assessment store, navigates to `/assess`.
- "Reset Demo Profile" button → restores the original demo state with a confirmation dialog.
- "Delete All My Data" button → clears all Zustand stores and LocalStorage (with confirmation).

#### Analytics Events (fire throughout the app):
```typescript
track('Assessment_started', { userId });
track('Assessment_question_answered', { category, stepIndex, userId });
track('Assessment_completed', { userId, durationMs });
track('Assessment_abandoned', { category, stepIndex, userId });
track('Readiness_report_generated', { readinessTier, userId });
track('Profile_updated', { updatedFields: string[], userId });
```
In this prototype, `track()` logs to `console.log` with the event name and payload. No external analytics service is required.

#### `src/components/layout/AppShell.tsx`
Main navigation shell with 6 items:
1. Home (`/`)
2. SIP Fit Assessment (`/assess`)
3. Financial Dashboard (`/dashboard`)
4. Scenario Simulator (`/simulator`)
5. AI Assistant (`/education`)
6. My Profile (`/profile`)

On mobile: bottom navigation bar with icons + labels.
On desktop: left sidebar.
Active item highlighted with Groww green left border.

### 7.4 Responsive Testing Checklist
Test the following on both a 375px mobile viewport and a 1440px desktop viewport:

- [ ] Landing page renders correctly with no overflow.
- [ ] Chat bubbles wrap correctly on narrow screens.
- [ ] Dashboard charts resize and remain readable.
- [ ] Scenario sliders are touchable on mobile.
- [ ] Bottom nav is accessible and thumb-friendly.
- [ ] All modals and dialogs are scrollable on mobile.
- [ ] Typography remains readable at all breakpoints.

### 7.5 README Deliverable
`README.md` must include:
- Project overview (1 paragraph).
- Stack summary.
- Local development setup (clone → `npm install` → `npm run dev`).
- Environment variable configuration (`.env.example` reference).
- How to run with Groq API key vs. fallback mode.
- How to run unit tests.
- Demo profile descriptions and how to switch between them.
- Build & deployment instructions.
- Disclaimer.

### 7.6 Phase 6 Acceptance Gate
- [x] `applySafetyFilters()` is called on every AI-generated string before render.
- [x] PII redactor detects and redacts PAN, Aadhaar, card numbers, and OTPs.
- [x] No specific fund scheme names appear anywhere in the UI.
- [x] Disclaimer footer present on every page.
- [x] Landing page switcher loads each demo profile correctly.
- [x] Profile page edit, re-take, reset, and delete all work.
- [x] Bottom nav on mobile and sidebar on desktop both work.
- [x] All analytics events fire (visible in console.log in dev mode).
- [x] `npm run build` completes with no TypeScript or Vite errors.
- [x] `npx vitest run` passes with 0 failures.
- [x] README covers all required sections.

---

## 8. Master Acceptance Criteria Checklist

Verify each of the 18 acceptance criteria before declaring MVP complete:

| # | Criterion | Phase Implemented | Status |
| :--- | :--- | :---: | :---: |
| AC-01 | New user can start a financial assessment | P3 | ☑ |
| AC-02 | AI or fallback asks all required financial questions | P3 | ☑ |
| AC-03 | Assessment remembers earlier responses | P2, P3 | ☑ |
| AC-04 | User can edit responses | P3 | ☑ |
| AC-05 | Financial calculation engine processes answers | P1, P4 | ☑ |
| AC-06 | Readiness report generated using real calculations | P4 | ☑ |
| AC-07 | Missing data identified, not invented | P1, P4 | ☑ |
| AC-08 | Cash-flow dashboard displays calculated values | P4 | ☑ |
| AC-09 | Users can add, edit, and remove recurring expenses | P4 | ☑ |
| AC-10 | Users can simulate delayed salary, reduced income, unexpected expenses | P5 | ☑ |
| AC-11 | Scenario results recalculate immediately and correctly | P5 | ☑ |
| AC-12 | AI explains financial results using the engine output | P4, P5 | ☑ |
| AC-13 | AI cannot independently invent financial amounts | P3, P6 | ☑ |
| AC-14 | No specific fund or stock recommendations generated | P6 | ☑ |
| AC-15 | Application works on mobile and desktop | P6 | ☑ |
| AC-16 | Data persists after page refresh | P2 | ☑ |
| AC-17 | User can reset or delete demo financial profile | P6 | ☑ |
| AC-18 | Application works in deterministic demo mode without API key | P3 | ☑ |

---

## 9. Analytics Event Reference

| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `Assessment_started` | User clicks "Start Assessment" | `userId`, `profileType` |
| `Assessment_question_answered` | User submits a reply | `userId`, `category`, `stepIndex` |
| `Assessment_completed` | All 7 categories answered | `userId`, `durationMs` |
| `Assessment_abandoned` | User navigates away mid-assessment | `userId`, `category`, `stepIndex` |
| `Readiness_report_generated` | Report page renders | `userId`, `readinessTier`, `indicativeSipMin`, `indicativeSipMax` |
| `Scenario_created` | User activates a scenario control | `userId`, `scenarioType` |
| `Scenario_completed` | Scenario result is fully rendered | `userId`, `scenarioType`, `newTier` |
| `Dashboard_viewed` | User visits `/dashboard` | `userId` |
| `AI_question_asked` | User sends message in Education or Payment Help | `userId`, `topic` |
| `Contextual_action_clicked` | User clicks any contextual CTA | `userId`, `action`, `page` |
| `Profile_updated` | User saves changes in Profile page | `userId`, `updatedFields` |

> [!NOTE]
> In this prototype, all events are logged via `console.log`. No third-party analytics SDK is required. The event structure is designed to be drop-in compatible with Mixpanel, Amplitude, or Google Analytics 4 when transitioning to production.

---

*Phase-wise Implementation Plan — Approved for Execution.*
*Refer to `docs/architecture.md` for layer specifications and `docs/context.md` for product requirements.*

