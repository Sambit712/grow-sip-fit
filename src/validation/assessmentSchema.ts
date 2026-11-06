import { z } from 'zod';

export const assessmentCategorySchema = z.enum([
  'goals',
  'income',
  'expenses',
  'liabilities',
  'savings',
  'investments',
  'risk',
]);

export const assessmentStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'abandoned',
]);

export const assessmentMessageSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  sender: z.enum(['assistant', 'user', 'system']),
  content: z.string(),
  quickReplies: z.array(z.string()).optional(),
  category: assessmentCategorySchema,
  stepIndex: z.number().int().min(0),
  timestamp: z.string(),
  dataKey: z.string().optional(),
  canEdit: z.boolean().optional(),
});

export const assessmentSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  status: assessmentStatusSchema,
  currentCategory: assessmentCategorySchema,
  stepIndex: z.number().int().min(0),
  collectedData: z.record(z.string(), z.unknown()),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});

