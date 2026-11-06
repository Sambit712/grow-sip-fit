/**
 * analytics.ts
 *
 * Lightweight prototype analytics tracker.
 * Logs structured analytics events to the developer console.
 * Drop-in compatible with Mixpanel, Amplitude, or GA4.
 */

export interface AnalyticsPayload {
  userId?: string;
  category?: string;
  stepIndex?: number;
  durationMs?: number;
  readinessTier?: string;
  scenarioType?: string;
  resultTier?: string;
  reportId?: string;
  topic?: string;
  action?: string;
  page?: string;
  updatedFields?: string[];
  indicativeSipMin?: number;
  indicativeSipMax?: number;
  [key: string]: unknown;
}

export function track(eventName: string, payload: AnalyticsPayload = {}): void {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log(`%c[Analytics] ${eventName}`, 'color: #00D09C; font-weight: bold;', payload);
  }
}

