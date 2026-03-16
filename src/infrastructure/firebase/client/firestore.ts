/**
 * Firestore adapter.
 *
 * Provides a lazily-initialised Firestore instance together with thin helper
 * utilities used by repository implementations.
 *
 * Rules for infrastructure adapters:
 *   - Never import from Application or Domain layers.
 *   - Repository implementations belong in their own feature slice infra layer;
 *     this module exposes only the shared Firestore client.
 */

import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseApp } from "../app";

let _db: Firestore | null = null;

/**
 * Returns the Firestore singleton.
 * Must only be called on the client side.
 */
export function getFirestoreDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Re-export commonly used Firestore helpers so feature slices don't need to
// import directly from the firebase/firestore package.
// ---------------------------------------------------------------------------

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
};
