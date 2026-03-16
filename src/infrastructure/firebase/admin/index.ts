/**
 * Firebase Admin SDK — server-side entry point.
 *
 * Initialises the firebase-admin App singleton for use in Next.js
 * Server Actions, Route Handlers, and API Routes.
 *
 * The Admin SDK bypasses Firebase Security Rules and must NEVER be
 * imported in Client Components or bundled for the browser.
 *
 * Authentication priority:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON (base64-encoded service account JSON)
 *   2. GOOGLE_APPLICATION_CREDENTIALS (path to service account key file)
 *   3. Application Default Credentials (ADC) — used automatically in
 *      Cloud Run, Cloud Functions, and other GCP-hosted environments.
 *
 * @module infrastructure/firebase/admin
 */

import admin from "firebase-admin";
import type { App } from "firebase-admin/app";

let _adminApp: App | null = null;

/**
 * Returns the firebase-admin App singleton.
 * Initialises the app on the first call.
 */
export function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  if (admin.apps.length > 0) {
    _adminApp = admin.apps[0]!;
    return _adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountJson, "base64").toString("utf-8"),
    ) as admin.ServiceAccount;

    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var or ADC.
    _adminApp = admin.initializeApp({
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  }

  return _adminApp;
}

export { admin };
