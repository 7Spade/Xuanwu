/**
 * Module: analytics.adapter.ts
 * Purpose: Provide safe wrappers for Firebase Analytics writes
 * Responsibilities: log telemetry-only events through ACL boundary
 * Constraints: deterministic logic, respect module boundaries
 */

import { logEvent, setUserId } from 'firebase/analytics';

import { analytics } from './analytics.client';

export interface AnalyticsEventPayload {
  readonly [key: string]: string | number | boolean | null | undefined;
}

export function trackAnalyticsEvent(
  name: string,
  payload?: AnalyticsEventPayload,
): void {
  if (!analytics) {
    return;
  }

  logEvent(analytics, name, payload);
}

export function bindAnalyticsUser(userId: string | null): void {
  if (!analytics) {
    return;
  }

  setUserId(analytics, userId ?? null);
}

export const logAnalyticsEvent = trackAnalyticsEvent;
