# PROJECT BRIEF: BUILD GROWW SIP FIT
## AI-Powered Financial Readiness and SIP Continuity Platform

### 1. PROJECT OVERVIEW

Build a fully functional, responsive fintech web application called **Groww SIP Fit**.

SIP Fit is an AI-powered financial readiness and investment continuity assistant designed to help first-time mutual fund investors understand their financial circumstances before starting a Systematic Investment Plan (SIP).

The application should help users assess whether they can comfortably sustain a recurring investment commitment based on:

- Monthly income and income stability.
- Essential and discretionary expenses.
- Rent, EMIs and other financial obligations.
- Family responsibilities.
- Emergency savings and available liquidity.
- Existing investments and financial commitments.
- Financial goals and investment horizons.
- Risk willingness and financial capacity for loss.
- Unexpected expenses and changing financial circumstances.

The application should use a conversational AI interface to collect information, a deterministic financial calculation engine to analyse the information, and an AI explanation layer to communicate the results in simple language.

**The central objective is not to persuade people to invest more. It is to help people understand how much they can reasonably commit to recurring investments without compromising their essential financial needs.**

This is a product-management case-study prototype based on a proposed Groww feature. It is not an official Groww application or an authorised investment advisory service.

---

# 2. THE PROBLEM WE ARE SOLVING

Many first-time mutual fund investors start SIPs based on their current financial circumstances without fully accounting for recurring expenses, upcoming obligations, income fluctuations or emergency requirements.

For example:

- A salaried employee schedules an SIP before their salary is credited.
- A person with variable income commits to an amount that is affordable only during high-income months.
- Someone managing rent, EMIs and family responsibilities overestimates their available monthly surplus.
- An unexpected medical expense forces an investor to interrupt their investment.
- An investor does not understand the relationship between investment risk, liquidity and their financial goals.
- A user encounters a failed AutoPay transaction but does not understand the reason or available recovery options.

Existing investment platforms generally provide ways to create and manage SIPs, but users may still lack a unified understanding of how those commitments interact with their broader financial circumstances.

### The proposed solution

Build SIP Fit as an additional financial planning layer that sits around the existing investment experience.

It should provide:

1. A mandatory financial-readiness checkpoint before a first-time user starts their first SIP.
2. An AI-powered conversational financial assessment.
3. A deterministic financial affordability engine.
4. A monthly cash-flow forecasting dashboard.
5. A financial scenario simulator.
6. Contextual investment education.
7. Contextual payment and SIP-management assistance.
8. An ongoing financial-readiness monitoring experience.

---

# 3. TARGET USERS

Primary target segment:

First-time mutual fund SIP investors, primarily aged 22–35, who have less than two years of SIP experience.

Include the following user profiles:

**Profile A: Early-career salaried professional**
- Receives a fixed monthly salary.
- Has rent and recurring household expenses.
- Has limited monthly budgeting habits.
- Wants to begin investing but is unsure about affordability.

**Profile B: Salaried employee with variable income**
- Receives a fixed salary plus incentives.
- Has significant differences between high-income and low-income months.
- May overcommit during months when income is unusually high.

**Profile C: Freelancer or self-employed individual**
- Receives income at unpredictable dates.
- May receive multiple payments from different clients.
- Has difficulty maintaining a fixed recurring debit schedule.

**Profile D: Financially responsible household member**
- Supports parents or family members.
- Has EMIs and other household responsibilities.
- Wants to invest without compromising emergency liquidity.

Do not assume that younger users are statistically more likely to discontinue SIPs. Age is a recruitment and design consideration, not a validated dropout predictor.

---

# 4. CORE PRODUCT EXPERIENCE

The application's main experience should be divided into three stages.

### Stage 1: Assess

Understand the user's financial circumstances before their first SIP.

### Stage 2: Plan

Calculate indicative affordability, identify financial conflicts and allow users to simulate different scenarios.

### Stage 3: Sustain

Monitor financial readiness over time, identify potential cash-flow problems and provide contextual assistance.

The application must feel like a financial planning assistant, not a generic chatbot.

---

# 5. FEATURE 1: MANDATORY PRE-INVESTMENT AI CONVERSATION

This is the most important part of the application.

Whenever a first-time user attempts to start their first SIP, redirect them to the SIP Fit financial-readiness conversation.

The user should complete this assessment before proceeding to SIP setup.

The experience should be conversational, interactive and adaptive.

Do not present all questions on one long form.

The AI should ask one question at a time, understand the response, ask relevant follow-up questions and move to the next assessment category.

Use quick-response options wherever possible, alongside the ability to enter a custom response.

### Conversation opening

Display:

"Before you begin investing, let's understand your financial situation.

We'll help you evaluate your monthly financial commitments, available savings and investment goals so that you can make an informed decision about starting an SIP.

This assessment takes approximately 3–5 minutes."

This is a proposed design target, not a guaranteed completion time.

### Assessment category A: Financial goals

Ask:

1. What are you primarily investing for?
   - Buying a house.
   - Retirement.
   - Children's education.
   - Higher education.
   - Wealth creation.
   - Buying a vehicle.
   - Other.

2. When do you expect to need this money?
   - Within 1–3 years.
   - 3–5 years.
   - 5–10 years.
   - More than 10 years.
   - Not decided.

3. Do you have a specific financial target?

4. Approximately how much money do you expect to need?

5. Have you already saved some money towards this goal?

The AI should understand the relationship between the goal, its deadline and the required liquidity.

### Assessment category B: Income

Ask:

1. What is your monthly take-home income?
2. Are you salaried, self-employed, freelancing or unemployed?
3. Is your monthly income fixed or variable?
4. On approximately which date do you receive your salary or income?
5. Do you receive incentives, bonuses, freelance payments or other income?
6. Has your income been stable during the last six months?

For variable-income users, collect an approximate low-income month, typical month and high-income month.

Do not use an unusually high month as the affordability baseline.

### Assessment category C: Monthly expenses

Collect the user's approximate monthly expenses:

- Rent or housing.
- Food and groceries.
- Electricity and utilities.
- Transport.
- Healthcare.
- Insurance premiums.
- Education.
- Subscriptions.
- Entertainment and discretionary spending.
- Family support.
- Other recurring expenses.

Ask whether the user expects any significant changes in these expenses within the coming 6–12 months.

### Assessment category D: Loans and liabilities

Ask:

- Do you have any active EMIs?
- What is the approximate monthly EMI total?
- Do you have outstanding personal or credit-card debt?
- Are you planning to take another loan?
- Do you have any upcoming large financial commitments?

### Assessment category E: Savings and emergency funds

Ask:

1. How much accessible emergency savings do you currently have?
2. Approximately how many months of essential expenses can these savings cover?
3. Do you expect a major expense in the near future?
4. Would you need to redeem your investments to pay for unexpected expenses?

Allow approximate ranges instead of requiring exact account balances.

### Assessment category F: Existing investments

Ask:

- Do you currently have any SIPs?
- How much do you invest each month?
- Do you have other investments?
- Do you have recurring investment commitments?
- Are you planning to increase your existing SIPs?

The purpose is to understand the user's total recurring commitment, not just a new SIP in isolation.

### Assessment category G: Risk profile and investment knowledge

Evaluate two separate factors.

**Risk willingness:**
- How comfortable are you with market fluctuations?
- How would you respond if your investments temporarily lost value?
- Would you remain invested during market volatility?

**Risk capacity:**
- Can you financially absorb potential investment losses?
- When do you need the money?
- Do you have sufficient liquidity outside your investments?
- Are essential expenses dependent on this money?

Also assess whether the user understands:
- SIP mechanics.
- Mutual fund NAV.
- Market volatility.
- The difference between invested value and current value.
- The possibility of capital loss.
- The absence of guaranteed returns.

The application must not treat willingness and capacity for risk as interchangeable.

### Conversation requirements

- Ask one question at a time.
- Display assessment progress.
- Allow users to go back and edit responses.
- Save responses locally or in the database.
- Allow users to resume an incomplete assessment.
- Ask follow-up questions when information is ambiguous.
- Explain why sensitive financial questions are being asked.
- Never request PAN, OTP, bank passwords, full account numbers or salary slips.

For this prototype, use manually entered information. Do not connect real bank accounts.

---

# 6. FEATURE 2: DETERMINISTIC FINANCIAL READINESS ENGINE

After completing the conversation, send the collected financial information to a separate calculation engine.

Do not allow the language model to invent financial calculations.

Create a deterministic module responsible for calculating:

### A. Monthly income

For fixed-income users:

Monthly income = Take-home salary + Other reliable income.

For variable-income users, use a conservative user-provided income estimate rather than simply assuming the average or highest month will repeat.

### B. Monthly financial obligations

Calculate:

Total obligations = Essential expenses + EMIs + Family responsibilities + Existing investment commitments + Other recurring expenses.

### C. Available monthly surplus

Calculate:

Available surplus = Conservative monthly income - Total recurring obligations.

### D. Emergency reserve requirement

Calculate an illustrative reserve gap using:

Emergency reserve target = Essential monthly expenses × Selected reserve months.

Reserve months must be configurable and presented as a planning assumption, not a universal financial rule.

Emergency reserve gap = Reserve target - Existing accessible emergency savings.

Do not automatically subtract the entire reserve target from current monthly income. Use a separate reserve-building contribution assumption and display it transparently.

### E. Potential SIP affordability

Calculate an indicative contribution range using:

Potential SIP capacity = Available surplus - Planned reserve contribution - Provision for irregular expenses.

If the result is negative, display that the user does not currently have an estimated surplus available for an additional recurring investment.

Never force a positive SIP recommendation.

### Important calculation safeguards

- Do not treat total bank balance as available monthly surplus.
- Do not ignore existing SIP commitments.
- Do not assume variable income is guaranteed.
- Do not ignore upcoming expenses.
- Do not double-count savings or investments.
- Handle missing information explicitly.
- Display assumptions used in all calculations.
- Use Indian Rupees and the Indian numbering format.
- Round displayed values sensibly.

Every financial result must be traceable to the supplied inputs and calculation formula.

---

# 7. FEATURE 3: PERSONAL FINANCIAL READINESS REPORT

After completing the assessment, generate a structured report.

The report should contain the following sections.

### Section 1: Financial overview

Display:

- Monthly income.
- Essential expenses.
- Total monthly obligations.
- Existing investment commitments.
- Available estimated surplus.
- Emergency savings.
- Emergency reserve gap.

Use clear visual summaries.

### Section 2: Financial readiness

Create four possible result categories:

**Ready for further SIP consideration**
The user's estimated financial position appears to support additional recurring contributions under the assumptions supplied.

**Limited flexibility**
The user has some estimated surplus, but their financial commitments may leave little room for additional investments.

**Liquidity needs attention**
The user has insufficient accessible savings relative to their selected reserve assumption or significant near-term obligations.

**More information required**
The user has not provided enough reliable information for a meaningful affordability assessment.

These are financial-readiness categories, not investment ratings.

### Section 3: Indicative contribution capacity

Display:

- Estimated monthly contribution range.
- Conservative income assumptions.
- Reserve contribution assumptions.
- Financial obligations considered.
- Upcoming expense considerations.

Do not describe the calculated value as a guaranteed safe investment amount.

### Section 4: Goal compatibility

Evaluate:

- Financial goal.
- Required amount.
- Expected deadline.
- Existing savings.
- Estimated savings gap.
- Liquidity requirements.

Clearly explain when an investment horizon creates material market risk for the user's goal.

### Section 5: Next steps

Provide relevant options, such as:

- Review monthly expenses.
- Build accessible savings.
- Reassess recurring commitments.
- Explore an appropriate SIP amount.
- Continue to Groww's existing scheme-selection experience.

Do not automatically select or recommend specific mutual funds.

---

# 8. FEATURE 4: MONTHLY CASH-FLOW DASHBOARD

Create an interactive financial dashboard accessible after onboarding.

The dashboard should display:

### Top financial summary

- Monthly take-home income.
- Monthly recurring obligations.
- Existing SIP commitments.
- Estimated available surplus.
- Emergency savings.

### Monthly cash-flow calendar

Display important dates:

- Salary credit date.
- Rent payment.
- EMI payments.
- Insurance premiums.
- Existing SIP debits.
- Other recurring expenses.

Highlight potential cash-flow conflicts.

Example:

Salary: 5th of the month.

Rent: 7th.

EMI: 10th.

SIP: 8th.

If available cash is expected to be insufficient around the SIP date, show:

"Your upcoming commitments may create pressure on your available balance around your SIP debit date."

Do not claim a payment will definitely fail unless actual payment and bank data establish that fact.

### Visualisations

Include:

1. Income versus expenses chart.
2. Monthly spending breakdown.
3. Investment commitment breakdown.
4. Cash-flow calendar.
5. Emergency reserve progress.
6. Projected monthly surplus chart.

Keep the dashboard simple and understandable.

---

# 9. FEATURE 5: FINANCIAL SCENARIO SIMULATOR

Allow users to explore what happens when their financial circumstances change.

Create interactive scenario controls.

The user should be able to simulate:

**Scenario A: Delayed salary**
Move salary-credit date forward by 5, 10 or 15 days.

**Scenario B: Increased rent**
Increase monthly rent by ₹1,000, ₹3,000, ₹5,000 or a custom amount.

**Scenario C: Unexpected medical expense**
Add a one-time expense of ₹5,000, ₹10,000, ₹25,000 or a custom amount.

**Scenario D: Reduced income**
Reduce monthly income by 10%, 20%, 30% or a custom percentage.

**Scenario E: New EMI**
Add a new monthly EMI.

**Scenario F: Variable freelance income**
Simulate low-income, typical-income and high-income months.

### Simulator output

For every scenario display:

- Original estimated monthly surplus.
- New estimated monthly surplus.
- Change in available liquidity.
- Potential cash-flow conflicts.
- Estimated reserve gap.
- Explanation of the implications.

Example:

"Your expected monthly income has decreased by 20%. After accounting for your recurring expenses, your estimated available surplus is now ₹X lower than before."

Allow users to compare multiple scenarios.

Use a deterministic calculation engine for every simulation.

---

# 10. FEATURE 6: CONTEXTUAL AI INVESTMENT EDUCATION

Create a conversational educational assistant.

It should explain:

- What an SIP is.
- How mutual fund investments work.
- NAV.
- Market volatility.
- Risk and return.
- Investment horizons.
- Liquidity.
- Invested amount versus current value.
- Why investments can decline in value.

The AI should adapt its explanations to the user's financial goal and investment experience.

For example:

A user saving for a house within 3–5 years should receive explanations about time horizon, market uncertainty and the importance of liquidity.

The assistant must not make specific fund, stock or portfolio allocation recommendations.

Do not promise returns or guarantee that the user will achieve a financial target.

---

# 11. FEATURE 7: CONTEXTUAL PAYMENT ASSISTANCE

Create a section to help users understand common SIP payment issues.

Examples:

- Insufficient bank balance.
- AutoPay mandate failure.
- Bank account changes.
- Payment processing delays.
- SIP debit shown as failed despite a bank debit.
- Confusion between stopping an SIP and disabling AutoPay.

The assistant should:

1. Understand the user's problem.
2. Explain possible reasons.
3. Identify what information is missing.
4. Guide the user to the relevant official Groww support or SIP-management options.
5. Clearly explain when the issue needs official support.

Use mock payment examples in the prototype.

Do not pretend to access a user's real bank or Groww payment status.

---

# 12. USER EXPERIENCE AND NAVIGATION

Build a polished, modern, mobile-first fintech application.

### Main navigation

Include:

1. Home.
2. SIP Fit Assessment.
3. Financial Dashboard.
4. Scenario Simulator.
5. AI Assistant.
6. My Profile.

### Main user journey

New user:

Landing page → Start assessment → Financial conversation → Financial calculations → Readiness report → Dashboard.

Existing user:

Dashboard → Cash-flow overview → Scenario simulation → Contextual guidance.

### Key screens

Create the following screens:

1. Landing / onboarding page.
2. AI assessment conversation.
3. Assessment completion screen.
4. Financial readiness report.
5. Monthly financial dashboard.
6. Cash-flow calendar.
7. Scenario simulator.
8. AI educational assistant.
9. Payment assistance page.
10. Profile and financial information management.

### UX requirements

- Mobile-first responsive design.
- Clean, premium fintech interface.
- White or very light background.
- Green as the primary accent colour.
- Dark, readable typography.
- Rounded cards.
- Minimal visual clutter.
- Accessible contrast.
- Simple charts and visualisations.
- Smooth transitions.
- Clear loading and empty states.
- Form validation and error messages.

Use a visual direction inspired by contemporary Indian fintech applications, without copying or falsely representing official Groww screens.

---

# 13. AI ARCHITECTURE

Separate financial computation from conversational AI.

Build the application using the following logical architecture.

### Layer 1: User interaction

Collect financial information through the chat interface and structured input controls.

### Layer 2: Data normalisation

Convert user responses into validated structured financial information.

### Layer 3: Deterministic calculation engine

Perform:

- Income calculations.
- Expense aggregation.
- Monthly surplus.
- Reserve calculations.
- Cash-flow projections.
- Scenario simulations.
- Affordability estimation.

### Layer 4: AI explanation engine

Use an LLM to:

- Understand natural-language responses.
- Ask relevant follow-up questions.
- Summarise financial information.
- Explain calculated outcomes.
- Provide educational information.

The model must receive calculated results from the deterministic engine rather than generate numerical results independently.

### Layer 5: Safety and validation

Validate every generated response.

The application must:

- Prevent unsupported financial claims.
- Prevent specific fund or stock recommendations.
- Prevent return guarantees.
- Flag insufficient information.
- Explain uncertainty.
- Avoid coercive retention language.
- Decline questions outside its supported scope.

### Important AI requirement

Create an interface that can work with an LLM API through environment variables.

If no API key is available, provide a functional deterministic demo conversation with predefined responses.

Do not hardcode API keys.

The rest of the application must continue functioning without the AI API.

---

# 14. DATA MODEL AND STORAGE

Create appropriate database tables or collections.

Suggested entities:

### Users
- User ID.
- Name or display name.
- Email, if authentication is implemented.
- Creation date.

### Financial profiles
- Monthly income.
- Income type.
- Income-credit date.
- Monthly expenses.
- EMI commitments.
- Family obligations.
- Emergency savings.
- Existing investments.
- Financial goals.
- Investment horizon.
- Risk willingness.
- Risk capacity.
- Knowledge level.

### Assessments
- Assessment ID.
- User ID.
- Questions and responses.
- Completion status.
- Assessment date.
- Version.

### Financial reports
- Report ID.
- User ID.
- Calculation inputs.
- Calculation outputs.
- Assumptions.
- Readiness classification.
- Generation date.

### Cash-flow events
- Event ID.
- User ID.
- Event category.
- Expected date.
- Amount.
- Recurrence.
- Description.

### Scenarios
- Scenario ID.
- User ID.
- Original financial assumptions.
- Modified assumptions.
- Calculated outcomes.
- Creation date.

### AI conversation history
- Conversation ID.
- User ID.
- Assessment ID.
- Messages.
- Timestamps.

Minimise stored personal financial information. Provide an option to delete the profile and assessment history.

For a local demo, seeded example users and local persistence are acceptable. For deployment, use a secure database and appropriate access controls.

Never store bank credentials, OTPs or unnecessary sensitive identifiers.

---

# 15. SAMPLE DEMONSTRATION USER

Create a demo profile to demonstrate the application end to end.

Use these values as the initial demo context:

Financial goal: Buying a house.

Expected purchase horizon: 3–5 years.

Other financial details: Leave unanswered initially so the application demonstrates the conversational collection process.

Do not assume the user's income, expenses, savings, risk tolerance or investment capacity.

The user must enter these details through the AI assessment.

Also provide an option to reset the demo profile.

---

# 16. SUCCESS METRICS AND PRODUCT ANALYTICS

Instrument the prototype with events that would support product evaluation.

Track:

- Assessment_started.
- Assessment_question_answered.
- Assessment_completed.
- Assessment_abandoned.
- Readiness_report_generated.
- Scenario_created.
- Scenario_completed.
- Dashboard_viewed.
- AI_question_asked.
- Contextual_action_clicked.
- Profile_updated.

Proposed product metrics:

**Primary metric**

12-month first-time SIP persistency rate:

Number of eligible first-time investors with at least one successfully completed SIP instalment in the last 30 days of the month-12 measurement point, divided by total eligible first-time SIP investors.

**Leading indicators**
- First-SIP assessment completion.
- Assessment comprehension.
- Financial report engagement.
- Scenario simulator usage.
- Early failed-instalment rate.
- Successful payment recovery.
- 3-month and 6-month persistency.

**Guardrail metrics**
- Assessment abandonment.
- Time required to complete onboarding.
- False cash-flow alerts.
- Incorrect AI calculations.
- Unsafe or unsupported financial advice.
- User complaints.
- Privacy incidents.

Do not invent product improvement percentages or claim that the prototype has increased SIP persistency.

---

# 17. DEVELOPMENT REQUIREMENTS

Before development:

1. Inspect the existing project directory.
2. Identify the current framework and dependencies.
3. Preserve the existing architecture where practical.
4. Create a clear development plan.
5. Implement the complete application rather than only a landing page.

If the project is empty, use a modern stack such as:

Frontend:
- React.
- TypeScript.
- Tailwind CSS.
- A suitable component library.
- Recharts for visualisations.

Backend:
- Node.js.
- TypeScript.
- Appropriate API framework.

Database:
- PostgreSQL or Supabase.

AI:
- Configurable LLM API.
- Structured outputs.
- A deterministic fallback mode.

The stack can be adapted to existing project files.

### Engineering requirements

- Build reusable components.
- Separate financial calculations into tested modules.
- Validate all user inputs.
- Handle missing values and invalid values.
- Store calculations and their assumptions.
- Create proper loading and error states.
- Use secure environment variables.
- Include meaningful comments.
- Add a README with installation and deployment instructions.
- Include sample data.
- Include unit tests for financial calculations.

Do not create decorative buttons that do nothing.

Every navigation item, form, scenario slider and action button must work.

---

# 18. ACCEPTANCE CRITERIA

The application will be considered a successful MVP only when all the following work:

1. A new user can start a financial assessment.
2. The AI or fallback conversation asks all required financial questions.
3. The assessment remembers earlier responses.
4. The user can edit responses.
5. The financial calculation engine processes the answers.
6. The readiness report is generated using real calculations.
7. Missing financial data is identified rather than invented.
8. The cash-flow dashboard displays the calculated values.
9. Users can add, edit and remove recurring expenses.
10. Users can simulate delayed salary, reduced income and unexpected expenses.
11. Scenario results recalculate immediately and correctly.
12. The AI explains financial results using the calculation engine's output.
13. The AI cannot independently invent financial amounts.
14. No specific fund or stock recommendations are generated.
15. The application works on mobile and desktop.
16. Data persists after a page refresh.
17. A user can reset or delete their demo financial profile.
18. The application works in deterministic demo mode without an API key.

---

# 19. FINAL PRODUCT EXPECTATION

I do not want a basic chatbot with a financial questionnaire.

I want a complete, interactive fintech product prototype that demonstrates how a first-time investor can:

1. Explain their financial goals.
2. Share their income, expenses and financial obligations through a conversation.
3. Understand their actual financial position.
4. See an indicative recurring investment capacity.
5. Explore what happens when their financial circumstances change.
6. Understand investment risk and liquidity considerations.
7. Make an informed decision about starting an SIP.
8. Continue monitoring their financial readiness after investing.

The finished product should feel like a realistic feature that could eventually be integrated into Groww.

### THE CENTRAL PRODUCT PRINCIPLE

"Before helping someone invest, understand whether that investment commitment fits their financial life. And after they invest, help them adapt when their financial life changes."

Build this as a working MVP with realistic data, functional interactions, transparent calculations, a polished interface and a clear demonstration journey.

Prioritise functional completeness, financial accuracy and user trust over unnecessary animations or decorative elements.