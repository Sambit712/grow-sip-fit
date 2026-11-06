import { describe, it, expect } from 'vitest';
import { validateProfile } from '../../src/validation/validateProfile';
import { demoProfileA, demoProfileB, demoProfileC, demoProfileD, freshDemoUser } from '../../src/data/demoProfiles';

describe('profileValidation — validateProfile', () => {

  it('validates seeded demoProfileA as complete and valid', () => {
    const result = validateProfile(demoProfileA.profile);
    expect(result.isComplete).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.completenessPercentage).toBe(100);
  });

  it('validates demoProfileB, C, D as complete', () => {
    expect(validateProfile(demoProfileB.profile).isComplete).toBe(true);
    expect(validateProfile(demoProfileC.profile).isComplete).toBe(true);
    expect(validateProfile(demoProfileD.profile).isComplete).toBe(true);
  });

  it('correctly identifies freshDemoUser as incomplete (only goal pre-filled)', () => {
    const result = validateProfile(freshDemoUser.profile);
    expect(result.isComplete).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.completenessPercentage).toBeLessThan(100);
    // Goal is present
    expect(result.missingFields).not.toContain('Financial Goal');
  });

  it('returns incomplete with all missing fields for null or empty profile', () => {
    const result = validateProfile(null);
    expect(result.isComplete).toBe(false);
    expect(result.completenessPercentage).toBe(0);
  });

  it('flags warning when high risk willingness is paired with low capacity', () => {
    const custom = JSON.parse(JSON.stringify(demoProfileA.profile));
    custom.risk.willingness = 'aggressive';
    custom.risk.capacity = 'low';

    const result = validateProfile(custom);
    expect(result.issues.some((issue) => issue.message.includes('Mismatch'))).toBe(true);
  });

  it('flags warning when emergency fund is zero', () => {
    const custom = JSON.parse(JSON.stringify(demoProfileA.profile));
    custom.savings.accessibleEmergencyFund = 0;

    const result = validateProfile(custom);
    expect(result.issues.some((issue) => issue.message.includes('No accessible emergency savings'))).toBe(true);
  });
});

