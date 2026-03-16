/**
 * Firebase Cloud Messaging (FCM) adapter.
 *
 * Provides helpers for requesting notification permissions and obtaining
 * FCM registration tokens. Actual message handling should be done in the
 * application layer.
 *
 * FCM requires:
 *   NEXT_PUBLIC_FIREBASE_VAPID_KEY — the Web Push VAPID key from the
 *   Firebase Console (Project Settings → Cloud Messaging → Web Push).
 *
 * A `public/firebase-messaging-sw.js` service worker must also be present.
 * See the example at `public/firebase-messaging-sw.example.js`.
 */

import { getMessaging, type Messaging, getToken, onMessage } from "firebase/messaging";
import { getFirebaseApp } from "../app";

let _messaging: Messaging | null = null;

/**
 * Returns the FCM Messaging singleton.
 * Must only be called in browser environments where `window` is defined.
 */
export function getFirebaseMessaging(): Messaging {
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase Messaging is only available in browser environments.",
    );
  }
  if (!_messaging) {
    _messaging = getMessaging(getFirebaseApp());
  }
  return _messaging;
}

/**
 * Request notification permission and retrieve the FCM registration token.
 * Returns `null` when the user denies permission or the VAPID key is missing.
 */
export async function requestFcmToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn(
      "[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set. Skipping token request.",
    );
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
    const token = await getToken(getFirebaseMessaging(), { vapidKey });
    return token ?? null;
  } catch {
    return null;
  }
}

export { onMessage };
