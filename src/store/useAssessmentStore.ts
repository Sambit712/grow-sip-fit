import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentSession, AssessmentMessage, AssessmentCategory } from '../types/AssessmentSession';
import type { FinancialProfile } from '../types/FinancialProfile';
import { freshDemoUser } from '../data/demoProfiles';

interface AssessmentState {
  session: AssessmentSession | null;
  messages: AssessmentMessage[];
  currentCategory: AssessmentCategory;
  stepIndex: number;
  collectedData: Partial<FinancialProfile>;
  isTyping: boolean;

  startSession: (userId?: string) => void;
  addMessage: (msg: AssessmentMessage) => void;
  updateCollectedData: (patch: Partial<FinancialProfile>) => void;
  setCategory: (category: AssessmentCategory) => void;
  setStepIndex: (index: number) => void;
  setIsTyping: (isTyping: boolean) => void;
  editAnswer: (messageId: string, newAnswer: string) => void;
  completeSession: () => void;
  resetSession: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      session: null,
      messages: [],
      currentCategory: 'goals',
      stepIndex: 0,
      collectedData: {
        goal: { ...freshDemoUser.profile.goal },
      },
      isTyping: false,

      startSession: (userId = 'demo-user-fresh') => {
        const existing = get().session;
        if (existing && existing.status === 'in_progress') {
          return;
        }

        const newSession: AssessmentSession = {
          id: `sess-${Date.now()}`,
          userId,
          status: 'in_progress',
          currentCategory: 'goals',
          stepIndex: 0,
          collectedData: {
            goal: { ...freshDemoUser.profile.goal },
          },
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          session: newSession,
          messages: [],
          currentCategory: 'goals',
          stepIndex: 0,
          collectedData: {
            goal: { ...freshDemoUser.profile.goal },
          },
          isTyping: false,
        });
      },

      addMessage: (msg) =>
        set((state) => {
          const nextMessages = [...state.messages, msg];
          return {
            messages: nextMessages,
            session: state.session
              ? {
                  ...state.session,
                  stepIndex: msg.stepIndex,
                  currentCategory: msg.category,
                  updatedAt: new Date().toISOString(),
                }
              : null,
          };
        }),

      updateCollectedData: (patch) =>
        set((state) => {
          const updated: Partial<FinancialProfile> = {
            ...state.collectedData,
            ...patch,
            income: patch.income
              ? { ...state.collectedData.income, ...patch.income } as FinancialProfile['income']
              : state.collectedData.income,
            expenses: patch.expenses
              ? { ...state.collectedData.expenses, ...patch.expenses } as FinancialProfile['expenses']
              : state.collectedData.expenses,
            liabilities: patch.liabilities
              ? { ...state.collectedData.liabilities, ...patch.liabilities } as FinancialProfile['liabilities']
              : state.collectedData.liabilities,
            savings: patch.savings
              ? { ...state.collectedData.savings, ...patch.savings } as FinancialProfile['savings']
              : state.collectedData.savings,
            existingInvestments: patch.existingInvestments
              ? { ...state.collectedData.existingInvestments, ...patch.existingInvestments } as FinancialProfile['existingInvestments']
              : state.collectedData.existingInvestments,
            goal: patch.goal
              ? { ...state.collectedData.goal, ...patch.goal } as FinancialProfile['goal']
              : state.collectedData.goal,
            risk: patch.risk
              ? { ...state.collectedData.risk, ...patch.risk } as FinancialProfile['risk']
              : state.collectedData.risk,
          };

          return {
            collectedData: updated,
            session: state.session
              ? {
                  ...state.session,
                  collectedData: updated,
                  updatedAt: new Date().toISOString(),
                }
              : null,
          };
        }),

      setCategory: (category) =>
        set((state) => ({
          currentCategory: category,
          session: state.session
            ? { ...state.session, currentCategory: category, updatedAt: new Date().toISOString() }
            : null,
        })),

      setStepIndex: (index) =>
        set((state) => ({
          stepIndex: index,
          session: state.session
            ? { ...state.session, stepIndex: index, updatedAt: new Date().toISOString() }
            : null,
        })),

      setIsTyping: (isTyping) => set({ isTyping }),

      editAnswer: (messageId, newAnswer) => {
        const state = get();
        const msgIndex = state.messages.findIndex((m) => m.id === messageId);
        if (msgIndex === -1) return;

        // Truncate messages after this point so the user can re-answer from this step
        const targetMsg = state.messages[msgIndex];
        const updatedMsg: AssessmentMessage = {
          ...targetMsg,
          content: newAnswer,
          timestamp: new Date().toISOString(),
        };

        const truncated = [...state.messages.slice(0, msgIndex), updatedMsg];

        set({
          messages: truncated,
          stepIndex: targetMsg.stepIndex,
          currentCategory: targetMsg.category,
        });
      },

      completeSession: () =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                status: 'completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : null,
        })),

      resetSession: () =>
        set({
          session: null,
          messages: [],
          currentCategory: 'goals',
          stepIndex: 0,
          collectedData: {
            goal: { ...freshDemoUser.profile.goal },
          },
          isTyping: false,
        }),
    }),
    {
      name: 'groww_sip_fit_assessment_store',
      // Exclude transient UI flags like isTyping from local storage
      partialize: (state) => ({
        session: state.session,
        messages: state.messages,
        currentCategory: state.currentCategory,
        stepIndex: state.stepIndex,
        collectedData: state.collectedData,
      }),
    }
  )
);

