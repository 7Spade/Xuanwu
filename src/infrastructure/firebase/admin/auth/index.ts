/**
 * Server-side Firebase Authentication helpers.
 *
 * Uses the firebase-admin Auth service to perform privileged operations
 * that cannot be done safely from the client (e.g. custom token creation,
 * session verification, user management).
 *
 * Only use these helpers in Server Actions or Route Handlers.
 */

import { getAuth, type Auth } from "firebase-admin/auth";
import { getAdminApp } from "../index";

let _adminAuth: Auth | null = null;

/** Returns the firebase-admin Auth singleton. */
export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

/**
 * Verifies a Firebase ID token and returns the decoded claims.
 * Throws if the token is invalid or expired.
 */
export async function verifyIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken, true);
}

/**
 * Creates a custom token for the given UID.
 * Use this to exchange an external identity (e.g. SSO) for a Firebase
 * token.
 */
export async function createCustomToken(
  uid: string,
  additionalClaims?: Record<string, unknown>,
): Promise<string> {
  return getAdminAuth().createCustomToken(uid, additionalClaims);
}

/**
 * Sets custom claims on a user.
 * Claims are available in the ID token after the next refresh.
 */
export async function setCustomUserClaims(
  uid: string,
  claims: Record<string, unknown>,
): Promise<void> {
  return getAdminAuth().setCustomUserClaims(uid, claims);
}

/**
 * Revokes all refresh tokens for a user, forcing re-authentication.
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  return getAdminAuth().revokeRefreshTokens(uid);
}
