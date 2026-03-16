/**
 * Firebase Remote Config adapter.
 *
 * Provides a lazily-initialised Remote Config instance for fetching
 * dynamic configuration values without requiring a new app release.
 *
 * Use Remote Config to:
 *   - Toggle feature flags
 *   - Adjust numeric thresholds (e.g. batch sizes, polling intervals)
 *   - Deliver A/B test parameters
 *
 * Cost note: Set a reasonable `minimumFetchIntervalMillis` (default: 12 h)
 * to avoid hitting quota limits. Fetched values are cached locally.
 */

"use client";

import {
  getRemoteConfig,
  type RemoteConfig,
  fetchAndActivate,
  getValue,
  getString,
  getBoolean,
  getNumber,
  type Value,
} from "firebase/remote-config";
import { getFirebaseApp } from "../app";

/** Minimum fetch interval in milliseconds (default: 12 h). */
const FETCH_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_FIREBASE_REMOTE_CONFIG_FETCH_INTERVAL_MS) ||
  12 * 60 * 60 * 1000;

let _remoteConfig: RemoteConfig | null = null;

/**
 * Returns the Remote Config singleton.
 * Must only be called on the client side.
 */
export function getFirebaseRemoteConfig(): RemoteConfig {
  if (!_remoteConfig) {
    const rc = getRemoteConfig(getFirebaseApp());
    rc.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
    _remoteConfig = rc;
  }
  return _remoteConfig;
}

/**
 * Fetches the latest remote config and activates it.
 * Safe to call on app mount; respects `minimumFetchIntervalMillis` to
 * avoid unnecessary quota consumption.
 *
 * Returns `true` if new values were activated, `false` if the cache was
 * still fresh or fetch failed.
 */
export async function fetchRemoteConfig(): Promise<boolean> {
  try {
    return await fetchAndActivate(getFirebaseRemoteConfig());
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Re-export typed getters for feature-level use.
// ---------------------------------------------------------------------------

export { getValue, getString, getBoolean, getNumber, type Value };
