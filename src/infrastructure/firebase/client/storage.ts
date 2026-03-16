/**
 * Firebase Storage adapter.
 *
 * Provides a lazily-initialised Storage instance and helper utilities for
 * uploading, downloading, and managing files in Firebase Cloud Storage.
 */

import {
  getStorage,
  type FirebaseStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadTask,
  type UploadMetadata,
} from "firebase/storage";
import { getFirebaseApp } from "../app";

let _storage: FirebaseStorage | null = null;

/**
 * Returns the Firebase Storage singleton.
 * Must only be called on the client side.
 */
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}

// ---------------------------------------------------------------------------
// Re-export Storage helpers for feature-level use.
// ---------------------------------------------------------------------------

export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadTask,
  type UploadMetadata,
};
