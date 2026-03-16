/**
 * Firebase App initialization.
 *
 * Default values are the Xuanwu development project credentials.
 * These web-SDK config values are intentionally public — they are embedded in
 * every client bundle and Firebase security is enforced via Security Rules.
 *
 * Override any field by setting the corresponding NEXT_PUBLIC_FIREBASE_*
 * environment variable (see .env.local.example).
 */

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";

/** Hardcoded dev / test project configuration. */
const DEV_FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyBkniZGal_Lls4CR3eFuZvSVMZBe73STNs",
  authDomain: "xuanwu-i-00708880-4e2d8.firebaseapp.com",
  databaseURL:
    "https://xuanwu-i-00708880-4e2d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "xuanwu-i-00708880-4e2d8",
  storageBucket: "xuanwu-i-00708880-4e2d8.firebasestorage.app",
  messagingSenderId: "65970295651",
  appId: "1:65970295651:web:4a1a83b030cb730ec93956",
  measurementId: "G-CJYNJP5J86",
};

/**
 * Resolved Firebase configuration.
 * Environment variables take precedence over the hardcoded dev defaults.
 * Exported so other adapters (e.g. analytics) can read derived values.
 */
export const resolvedFirebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? DEV_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? DEV_FIREBASE_CONFIG.authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? DEV_FIREBASE_CONFIG.databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? DEV_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? DEV_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    DEV_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? DEV_FIREBASE_CONFIG.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? DEV_FIREBASE_CONFIG.measurementId,
};

/**
 * Returns the Firebase app singleton.
 * Initialises the app on first call using `resolvedFirebaseConfig`.
 */
export function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0]!;
  }
  return initializeApp(resolvedFirebaseConfig);
}
