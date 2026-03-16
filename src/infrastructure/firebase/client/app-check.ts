/**
 * Firebase App Check adapter.
 *
 * Protects Firebase backend resources from abuse by verifying each request
 * originates from a genuine instance of your app.
 *
 * Provider: reCAPTCHA Enterprise (requires a site key registered in the
 * Google Cloud Console and enabled in Firebase App Check).
 *
 * The hardcoded key is the Xuanwu dev project's reCAPTCHA Enterprise key.
 * Override it via NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_KEY.
 * For local debug bypasses set NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN.
 *
 * App Check must be initialised BEFORE any other Firebase service call.
 * Call `initAppCheck()` from a Client Component in your root layout.
 */

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from "firebase/app-check";
import { getFirebaseApp } from "../app";

/** Hardcoded reCAPTCHA Enterprise site key for the Xuanwu dev project. */
const DEV_RECAPTCHA_ENTERPRISE_KEY = "6LfSHGgsAAAAAAjTO77dmeQ7rZntLtaB6kOv4qPT";

let _appCheck: AppCheck | null = null;

/**
 * Initialises Firebase App Check using reCAPTCHA Enterprise.
 * Safe to call multiple times — subsequent calls return the existing instance.
 *
 * In development, the debug token is used when
 * `NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN` is set so that App Check
 * succeeds without a real reCAPTCHA interaction.
 */
export function initAppCheck(): AppCheck | null {
  if (_appCheck) return _appCheck;
  if (typeof window === "undefined") return null;

  const isDev = process.env.NODE_ENV !== "production";
  const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;

  if (isDev && debugToken) {
    // Expose the debug token on the window object so the App Check SDK can
    // pick it up automatically in development.
    // See: https://firebase.google.com/docs/app-check/web/debug-provider
    (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  const recaptchaKey =
    process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_KEY ?? DEV_RECAPTCHA_ENTERPRISE_KEY;

  _appCheck = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });

  return _appCheck;
}
