import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserPersona } from '../types/User';
import { allDemoProfiles, freshDemoUser } from '../data/demoProfiles';

interface UserState {
  currentUser: User;
  activePersona: UserPersona;
  setUser: (user: User) => void;
  switchPersona: (personaKey: keyof typeof allDemoProfiles) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: freshDemoUser.user,
      activePersona: 'custom',

      setUser: (user) => set({ currentUser: user, activePersona: user.persona }),

      switchPersona: (personaKey) => {
        const persona = allDemoProfiles[personaKey];
        if (persona) {
          set({
            currentUser: persona.user,
            activePersona: persona.user.persona,
          });
        }
      },

      resetUser: () =>
        set({
          currentUser: freshDemoUser.user,
          activePersona: 'custom',
        }),
    }),
    {
      name: 'groww_sip_fit_user_store',
    }
  )
);

