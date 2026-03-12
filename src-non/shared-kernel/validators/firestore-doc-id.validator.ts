/**
 * Module: firestore-doc-id.validator.ts
 * Purpose: Canonical validation helpers for Firestore document IDs.
 * Responsibilities: prevent path traversal by enforcing safe Firestore ID format.
 * Constraints: deterministic logic, respect module boundaries
 */

const SAFE_FIRESTORE_DOC_ID_PATTERN = /^[\w-]+$/;

export function isSafeFirestoreDocId(value: unknown): value is string {
  return typeof value === 'string' && SAFE_FIRESTORE_DOC_ID_PATTERN.test(value);
}

export function assertSafeFirestoreDocId(value: unknown, fieldName = 'id'): asserts value is string {
  if (!isSafeFirestoreDocId(value)) {
    throw new Error(`Invalid ${fieldName} format - must match /^[\\w-]+$/`);
  }
}
