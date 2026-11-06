import { describe, it, expect } from 'vitest';
import { detectCashflowConflicts } from '../../src/engine/cashflowConflictDetector';
import type { CashflowEvent } from '../../src/types/CashflowEvent';

/** Build a minimal CashflowEvent */
function ev(overrides: Partial<CashflowEvent> & Pick<CashflowEvent, 'category' | 'amount' | 'dayOfMonth' | 'isInflow'>): CashflowEvent {
  return {
    id: Math.random().toString(),
    profileId: 'p1',
    title: overrides.category,
    isRecurring: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('cashflowConflictDetector — detectCashflowConflicts', () => {

  it('returns no conflicts when salary lands before major outflows', () => {
    const events: CashflowEvent[] = [
      ev({ category: 'salary', amount: 60000, dayOfMonth: 1, isInflow: true }),
      ev({ category: 'rent', amount: 15000, dayOfMonth: 5, isInflow: false }),
      ev({ category: 'sip', amount: 5000, dayOfMonth: 8, isInflow: false }),
    ];
    const conflicts = detectCashflowConflicts(1, events, 20000);
    expect(conflicts).toHaveLength(0);
  });

  it('detects a conflict when SIP debit occurs before salary credit', () => {
    // Salary on day 7, SIP on day 5 — opening balance insufficient
    const events: CashflowEvent[] = [
      ev({ category: 'salary', amount: 60000, dayOfMonth: 7, isInflow: true }),
      ev({ category: 'sip', amount: 10000, dayOfMonth: 5, isInflow: false }),
    ];
    // Opening balance = 2000 → after SIP on day 5: 2000-10000 = -8000 → conflict
    const conflicts = detectCashflowConflicts(7, events, 2000);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.some(c => c.conflictDay <= 7)).toBe(true);
  });

  it('suggests moving the SIP debit date when conflict involves a SIP', () => {
    const events: CashflowEvent[] = [
      ev({ category: 'salary', amount: 60000, dayOfMonth: 10, isInflow: true }),
      ev({ category: 'sip', amount: 15000, dayOfMonth: 5, isInflow: false }),
    ];
    const conflicts = detectCashflowConflicts(10, events, 1000);
    const sipConflict = conflicts.find(c => c.suggestion.toLowerCase().includes('sip'));
    expect(sipConflict).toBeDefined();
    expect(sipConflict?.suggestion).toMatch(/day \d+/);
  });

  it('marks conflicts with high severity when balance goes negative', () => {
    const events: CashflowEvent[] = [
      ev({ category: 'rent', amount: 30000, dayOfMonth: 3, isInflow: false }),
    ];
    const conflicts = detectCashflowConflicts(1, events, 5000);
    const highSeverity = conflicts.find(c => c.severity === 'high');
    expect(highSeverity).toBeDefined();
  });

  it('returns no conflicts with generous opening balance and all outflows after salary', () => {
    const events: CashflowEvent[] = [
      ev({ category: 'salary', amount: 70000, dayOfMonth: 1, isInflow: true }),
      ev({ category: 'rent', amount: 20000, dayOfMonth: 3, isInflow: false }),
      ev({ category: 'emi', amount: 10000, dayOfMonth: 5, isInflow: false }),
      ev({ category: 'sip', amount: 8000, dayOfMonth: 10, isInflow: false }),
    ];
    const conflicts = detectCashflowConflicts(1, events, 50000);
    expect(conflicts).toHaveLength(0);
  });

  it('uses the custom safety buffer when provided', () => {
    const events: CashflowEvent[] = [
      ev({ category: 'salary', amount: 10000, dayOfMonth: 15, isInflow: true }),
      ev({ category: 'rent', amount: 8000, dayOfMonth: 5, isInflow: false }),
    ];
    // With a high safety buffer of 20000, should detect conflict even with opening 15000
    const conflicts = detectCashflowConflicts(15, events, 15000, 20000);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});

