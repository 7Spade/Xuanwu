/**
 * Module: index.ts
 * Purpose: Analytics export surface for firebase-client boundary
 * Responsibilities: expose analytics client and adapter helpers
 * Constraints: deterministic logic, respect module boundaries
 */

export { analytics } from './analytics.client';
export {
  trackAnalyticsEvent,
  bindAnalyticsUser,
  type AnalyticsEventPayload,
} from './analytics.adapter';
