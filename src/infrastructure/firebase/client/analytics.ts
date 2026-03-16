/**
 * Google Analytics for Firebase adapter.
 *
 * Lazily initialises the Analytics instance only in browser environments
 * where Analytics is supported. Analytics is optional — all calls gracefully
 * no-op when the environment doesn't support Analytics (e.g., SSR, blocked
 * by browser).
 */

import {
  getAnalytics,
  isSupported,
  logEvent as _logEvent,
  setUserId as _setUserId,
  setUserProperties as _setUserProperties,
  type Analytics,
} from "firebase/analytics";
import { getFirebaseApp, resolvedFirebaseConfig } from "../app";

let _analytics: Analytics | null = null;

/**
 * Returns the Analytics singleton, or `null` when Analytics is not supported
 * (e.g., SSR, blocked by browser, measurement ID absent from config).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!resolvedFirebaseConfig.measurementId) return null;
  if (_analytics) return _analytics;

  const supported = await isSupported();
  if (!supported) return null;

  _analytics = getAnalytics(getFirebaseApp());
  return _analytics;
}

/**
 * Log a custom analytics event.
 * Silently no-ops when Analytics is unavailable.
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, unknown>,
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  _logEvent(analytics, eventName, params);
}

/**
 * Set the analytics user ID (call after sign-in).
 * Pass `null` to clear the user ID on sign-out.
 */
export async function setAnalyticsUserId(uid: string | null): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  _setUserId(analytics, uid ?? "");
}

/**
 * Set analytics user properties.
 */
export async function setAnalyticsUserProperties(
  properties: Record<string, string>,
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  _setUserProperties(analytics, properties);
}
