/**
 * Firebase Authentication adapter.
 *
 * Provides a lazily-initialised Auth instance scoped to the Firebase app
 * singleton. All auth operations (sign-in, sign-out, token refresh) should
 * go through this module to keep infrastructure concerns centralised.
 */

import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  type Auth,
  type User,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirebaseApp } from "../app";

let _auth: Auth | null = null;

/**
 * Returns the Firebase Auth singleton.
 * Must only be called on the client side.
 */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// ---------------------------------------------------------------------------
// Auth providers and operations (re-exported for convenience)
// ---------------------------------------------------------------------------

export {
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
};
export type { User };
