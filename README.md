# Groww SIP Fit — AI-Powered Financial Readiness & SIP Continuity

> **Never start an SIP you can't comfortably sustain.**

Groww SIP Fit is a financial readiness decision aid and educational simulator designed to address the retail mutual fund industry's recurring SIP pause, stop, and bounce challenge. Built on a strict 5-layer decoupled architecture, it uses deterministic mathematical formulas for all financial figures (income baselines, obligations, surplus, emergency reserves, indicative SIP ranges, and cash-flow timing pressure points) while using conversational AI (via Groq Cloud or autonomous deterministic fallback) to guide users through an empathetic, jargon-free readiness assessment.

---

## 🛠 Stack Summary

- **Frontend Framework**: React 19 + TypeScript (strict mode, zero `any` domain types)
- **Bundler & Tooling**: Vite 6, Tailwind CSS v4, Lucide React icons
- **State Management**: Zustand 5 with `persist` middleware (local browser storage)
- **Validation**: Zod (schema enforcement) + custom Indian currency parser (`25k`, `2.5L`, `1Cr`, `₹50,000`)
- **Visualizations**: Recharts (Surplus gauge, expense pie, cash-flow calendar, emergency reserve progress)
- **AI Engine**: Groq SDK (`groq-sdk`) supporting fast LPU inference, paired with a complete autonomous Deterministic Fallback Engine
- **Safety Pipeline**: Layer 5 safety guardrails (PII credential redactor, mutual fund advice blocker, return guarantee neutralizer)
- **Testing**: Vitest with `jsdom` (14 test suites, 142 unit & integration tests)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation & Run
```bash
# 1. Navigate to the project directory
cd groww-sip-fit

# 2. Install all dependencies
npm install

# 3. Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Configuration

Groww SIP Fit is designed with a **dual-mode AI architecture**:
1. **Groq Cloud LLM Mode**: When an API key is provided, the conversational assistant uses fast LLM inference to deliver empathetic, personalized financial explanations.
2. **Deterministic Fallback Mode**: When no API key is supplied (or when offline/rate-limited), the application runs 100% autonomously using a deterministic finite-state machine. Every feature (assessment, report synthesis, scenario stress testing, education, payment troubleshooting) operates completely without external network dependencies.

### Setting up `.env`
Create a `.env` or `.env.local` file in the `groww-sip-fit/` root directory (refer to `.env.example`):

```bash
# Groq API Key (Optional — leave blank for autonomous fallback mode)
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# Groq Model Identifier (defaults to openai/gpt-oss-120b)
VITE_GROQ_MODEL=openai/gpt-oss-120b

# Deterministic Fallback Toggle (set true to force deterministic engine even if API key exists)
VITE_ENABLE_DETERMINISTIC_FALLBACK=false
```

---

## 🧪 Running Unit & Integration Tests

The test suite covers pure calculation modules, validation schemas, currency parsing, scenario stacking, conversational engines, dashboard stores, and Layer 5 safety filters:

```bash
# Run all 14 test suites with Vitest
npm test

# Run tests in watch mode
npx vitest

# Run a specific test suite
npx vitest run tests/safety/safetyGuardrails.test.ts
npx vitest run tests/engine/scenarioEngine.test.ts
npx vitest run tests/pages/simulatorAndEducation.test.ts
```

All 142 tests execute in under 5 seconds with zero failures.

---

## 👤 Pre-Seeded Demo Profiles

Groww SIP Fit includes 4 realistic Indian investor personas and 1 fresh demo profile to demonstrate how the deterministic engine and AI adapt to diverse income profiles:

| Profile | Persona Name | Income Type | Monthly Income | Key Challenge |
| :--- | :--- | :--- | :--- | :--- |
| **Profile A** | Arjun Mehta | Salaried Fixed | ₹45,000 / mo | High rent, low savings; overestimating monthly surplus due to unaccounted discretionary spends. |
| **Profile B** | Bhavna Sharma | Salaried Variable | ₹70,000 / mo (₹45K–₹1.25L) | Prone to committing to SIP amounts affordable only in peak incentive months. |
| **Profile C** | Chetan Verma | Freelance / Self-employed | ₹55,000 / mo (₹30K–₹85K) | Irregular payment dates causing debit bounces when AutoPay precedes client disbursements. |
| **Profile D** | Deepika Nair | Salaried Fixed (Family Support) | ₹70,000 / mo | Multiple fixed EMIs and parental medical expenses limiting risk capacity. |
| **Demo User** | Fresh Demo User | Unconfigured | Target: House (4 yrs) | Blank baseline for testing the conversational assessment from scratch. |

### How to Switch Between Profiles
- **From Landing Page (`/`)**: Click "Load Demo Profile" on any persona card to instantly populate stores and open the Dashboard.
- **From Desktop Navigation Sidebar**: Use the "Active Persona" dropdown selector in the sidebar footer to switch personas at any point.
- **From Profile Settings (`/profile`)**: Edit individual figures or click "Reset Demo Profile" to restore defaults.

---

## 🛡 Layer 5 Safety & Compliance Guardrails

In strict compliance with SEBI advertising guidelines and financial safety requirements, Groww SIP Fit enforces non-negotiable guardrails before any AI or user narrative renders:
- **PII Credential Redactor (`piiRedactor.ts`)**: Scans for and redacts Indian PAN numbers, 12-digit Aadhaar cards, 16-digit debit/credit cards, OTP sequences, and bank account numbers. Detected infractions trigger a `Privacy_incident` audit log.
- **Advice Blocker (`adviceBlocker.ts`)**: Intercepts specific mutual fund scheme names (e.g. Parag Parikh Flexi Cap, HDFC Top 100, SBI Bluechip) and stock tickers (RELIANCE, TCS), replacing them with compliant generic terminology and appending educational notices.
- **Return Guarantee Neutralizer (`returnGuaranteeFilter.ts`)**: Intercepts claims of fixed returns ("guaranteed 15%", "double your money") and replaces them with statutory SEBI market-risk disclaimers.

---

## 📦 Production Build & Deployment

```bash
# Build production bundle with TypeScript type-checking
npm run build

# Preview the built production output locally
npm run preview
```

The build compiles into the `dist/` directory, ready for deployment to Vercel, Netlify, Cloudflare Pages, or AWS S3.

---

## ⚖️ Regulatory Disclaimer

*Groww SIP Fit is an educational decision aid and financial readiness prototype. It does not provide SEBI-registered investment advice, stock tips, or guarantee future investment returns. All financial figures are mathematical derivations based on user inputs. Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing.*
