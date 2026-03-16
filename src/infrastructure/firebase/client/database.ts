/**
 * Firebase Realtime Database adapter.
 *
 * Provides a lazily-initialised Realtime Database instance.
 * The database URL is included in the resolved Firebase config
 * (databaseURL field in app.ts).
 */

import {
  getDatabase,
  type Database,
  ref as dbRef,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  serverTimestamp,
  type DataSnapshot,
  type DatabaseReference,
  type Unsubscribe,
} from "firebase/database";
import { getFirebaseApp } from "../app";

let _database: Database | null = null;

/**
 * Returns the Realtime Database singleton.
 * Must only be called in environments where Firebase is available.
 */
export function getFirebaseDatabase(): Database {
  if (!_database) {
    _database = getDatabase(getFirebaseApp());
  }
  return _database;
}

// ---------------------------------------------------------------------------
// Re-export RTDB helpers for feature-level use.
// ---------------------------------------------------------------------------

export {
  dbRef,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  serverTimestamp as rtdbServerTimestamp,
  type DataSnapshot,
  type DatabaseReference,
  type Unsubscribe,
};
