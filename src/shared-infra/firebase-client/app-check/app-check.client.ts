/**
 * Module: app-check.client.ts
 * Purpose: Initialize and expose Firebase App Check for frontend runtime
 * Responsibilities: bootstrap App Check with ReCaptcha provider when configured
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  ReCaptchaV3Provider,
  initializeAppCheck,
  type AppCheck,
} from 'firebase/app-check';

import { app } from '../app.client';

const APP_CHECK_SITE_KEY = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY?.trim() ?? '';
const APP_CHECK_ENABLED = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_ENABLED !== 'false';

let appCheck: AppCheck | null = null;
let initialized = false;

function canInitializeAppCheck(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!APP_CHECK_ENABLED) {
    return false;
  }

  return APP_CHECK_SITE_KEY.length > 0;
}

export function initAppCheck(): AppCheck | null {
  if (initialized) {
    return appCheck;
  }

  if (!canInitializeAppCheck()) {
    initialized = true;
    return null;
  }

  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
    initialized = true;
  } catch {
    appCheck = null;
    // Keep retriable for transient bootstrap failures.
    initialized = false;
  }

  return appCheck;
}

export { appCheck };
