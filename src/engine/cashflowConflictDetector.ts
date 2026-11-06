/**
 * cashflowConflictDetector.ts
 * Layer 3 — Deterministic Financial Engine
 *
 * Simulates the running daily bank balance across a 31-day month and detects
 * potential cash-flow pressure points where the balance may fall below the
 * safety buffer — especially around SIP debit dates.
 *
 * Uses the user-declared accessible emergency fund as the opening balance
 * approximation. Salary credits are applied on the declared credit day.
 *
 * IMPORTANT: Conflict warnings are ESTIMATES based on user-provided data.
 * They do not represent confirmed payment failures.
 */

import type { CashflowEvent, ConflictWarning } from '../types/CashflowEvent';

const DEFAULT_SAFETY_BUFFER = 5000; // ₹5,000

/**
 * Build a 31-element array representing net cash flow for each day (1–31).
 * Positive values = inflows; negative = outflows.
 */
function buildDailyFlows(events: CashflowEvent[]): number[] {
  // Index 0 = day 1, index 30 = day 31
  const flows = new Array<number>(31).fill(0);

  for (const event of events) {
    const dayIndex = Math.min(30, Math.max(0, event.dayOfMonth - 1));
    const signed = event.isInflow ? event.amount : -event.amount;
    flows[dayIndex] += signed;
  }

  return flows;
}

/**
 * Detect cash-flow conflicts across a simulated month.
 *
 * @param salaryCreditDay      - Day of month the salary lands (1–31)
 * @param events               - All recurring cashflow events for the month
 * @param openingBalance       - Approximate opening balance (use accessibleEmergencyFund or 0)
 * @param safetyBuffer         - Minimum acceptable balance (default ₹5,000)
 * @returns ConflictWarning[]  - One entry per day where the balance dips below the buffer
 */
export function detectCashflowConflicts(
  salaryCreditDay: number,
  events: CashflowEvent[],
  openingBalance: number = 0,
  safetyBuffer: number = DEFAULT_SAFETY_BUFFER
): ConflictWarning[] {
  const dailyFlows = buildDailyFlows(events);
  const conflicts: ConflictWarning[] = [];
  let runningBalance = Math.max(0, openingBalance);

  // SIP events for targeted suggestions
  const sipEvents = events.filter(e => e.category === 'sip' && !e.isInflow);

  for (let dayIndex = 0; dayIndex < 31; dayIndex++) {
    const day = dayIndex + 1;
    runningBalance += dailyFlows[dayIndex];

    if (runningBalance < safetyBuffer) {
      // Find events occurring on this day that are outflows
      const conflictingOutflows = events
        .filter(e => e.dayOfMonth === day && !e.isInflow)
        .map(e => ({ title: e.title, amount: e.amount, category: e.category }));

      let suggestion = `Your estimated balance on day ${day} may be below the ₹${safetyBuffer.toLocaleString('en-IN')} safety buffer.`;

      // Targeted suggestion for SIP conflicts
      const nearSip = sipEvents.find(
        s => Math.abs(s.dayOfMonth - day) <= 3
      );

      if (nearSip) {
        const recommendedDay = salaryCreditDay + 3;
        suggestion = `Your expected balance may be under pressure around your SIP debit date (day ${nearSip.dayOfMonth}). Consider moving the SIP debit to day ${recommendedDay <= 31 ? recommendedDay : recommendedDay - 28} — 3 days after your salary credit (day ${salaryCreditDay}).`;
      }

      const severity: ConflictWarning['severity'] =
        runningBalance < 0 ? 'high' : runningBalance < safetyBuffer / 2 ? 'medium' : 'low';

      conflicts.push({
        conflictDay: day,
        estimatedBalance: Math.round(runningBalance),
        safetyBuffer,
        conflictingEvents: conflictingOutflows,
        suggestion,
        severity,
      });
    }
  }

  return conflicts;
}

