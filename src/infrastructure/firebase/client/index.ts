/**
 * Firebase Client SDK — public API
 *
 * Web SDK adapters for use in Client Components and browser-side code.
 * Do NOT import from this module in Server Actions or Route Handlers —
 * use `@/infrastructure/firebase/admin` for server-side operations.
 *
 * @example
 * import { getFirebaseAuth }        from "@/infrastructure/firebase/client";
 * import { getFirestoreDb }         from "@/infrastructure/firebase/client";
 * import { getFirebaseRemoteConfig } from "@/infrastructure/firebase/client";
 */

export { getFirebaseApp, resolvedFirebaseConfig } from "../app";

export {
  getFirebaseAuth,
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  EmailAuthProvider,
} from "./auth";
export type { User } from "./auth";

export {
  getFirestoreDb,
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
} from "./firestore";

export {
  getFirebaseStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
  type UploadTask,
  type UploadMetadata,
} from "./storage";

export {
  getFirebaseMessaging,
  requestFcmToken,
  onMessage,
} from "./messaging";

export {
  getFirebaseAnalytics,
  logEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from "./analytics";

export { initAppCheck } from "./app-check";

export {
  getFirebaseDatabase,
  dbRef,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  rtdbServerTimestamp,
  type DataSnapshot,
  type DatabaseReference,
  type Unsubscribe,
} from "./database";

export {
  getFirebaseRemoteConfig,
  fetchRemoteConfig,
  getValue,
  getString,
  getBoolean,
  getNumber,
  type Value,
} from "./remoteConfig";
