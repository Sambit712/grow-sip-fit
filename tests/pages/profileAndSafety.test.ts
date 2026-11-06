import { describe, it, expect, beforeEach } from 'vitest';
import { useFinancialProfileStore } from '../../src/store/useFinancialProfileStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useAssessmentStore } from '../../src/store/useAssessmentStore';
import { allDemoProfiles } from '../../src/data/demoProfiles';
import { profileSchema } from '../../src/validation/profileSchema';
import type { FinancialProfile } from '../../src/types/FinancialProfile';

describe('Profile Management & Zod Schema Validation', () => {
  beforeEach(() => {
    useFinancialProfileStore.getState().deleteProfile();
    useAssessmentStore.getState().resetSession();
  });

  it('validates a complete financial profile successfully with profileSchema', () => {
    const raw = allDemoProfiles.profileA.profile;
    const result = profileSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('rejects invalid financial profile data (e.g. negative rent, invalid credit day)', () => {
    const invalidProfile = {
      ...allDemoProfiles.profileA.profile,
      expenses: {
        ...allDemoProfiles.profileA.profile.expenses,
        rent: -5000, // Invalid: negative rent
      },
      income: {
        ...allDemoProfiles.profileA.profile.income,
        creditDay: 42, // Invalid: day > 31
      },
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('expenses.rent');
      expect(paths).toContain('income.creditDay');
    }
  });

  it('updates financial profile in store and persists changes', () => {
    const initial = allDemoProfiles.profileA.profile;
    useFinancialProfileStore.getState().setProfile(initial);

    expect(useFinancialProfileStore.getState().profile?.income.monthlyTakeHome).toBe(45000);

    // Update income
    useFinancialProfileStore.getState().updateProfile({
      income: {
        ...initial.income,
        monthlyTakeHome: 55000,
      },
    });

    expect(useFinancialProfileStore.getState().profile?.income.monthlyTakeHome).toBe(55000);
  });

  it('resets demo persona restores seeded baseline', () => {
    const initial = allDemoProfiles.profileB.profile;
    useFinancialProfileStore.getState().setProfile(initial);

    // Mutate rent
    useFinancialProfileStore.getState().updateProfile({
      expenses: {
        ...initial.expenses,
        rent: 50000,
      },
    });
    expect(useFinancialProfileStore.getState().profile?.expenses.rent).toBe(50000);

    // Restore baseline
    useFinancialProfileStore.getState().setProfile(JSON.parse(JSON.stringify(allDemoProfiles.profileB.profile)));
    expect(useFinancialProfileStore.getState().profile?.expenses.rent).toBe(20000);
  });

  it('clears all data cleanly on deleteProfile', () => {
    useFinancialProfileStore.getState().setProfile(allDemoProfiles.profileC.profile);
    expect(useFinancialProfileStore.getState().profile.userId).toBe('user-chetan-profile-c');

    useFinancialProfileStore.getState().deleteProfile();
    expect(useFinancialProfileStore.getState().profile.userId).toBe('demo-user-fresh');
  });
});
