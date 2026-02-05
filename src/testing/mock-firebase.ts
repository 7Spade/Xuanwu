/**
 * Mock Firebase SDK for testing
 * Provides mock implementations of Firebase services
 */

import { vi } from 'vitest';

/**
 * Mock Firestore instance
 */
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
};

/**
 * Mock Auth instance
 */
export const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
};

/**
 * Mock Storage instance
 */
export const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  listAll: vi.fn(),
};

/**
 * Mock Firebase App
 */
export const mockFirebaseApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
  },
  automaticDataCollectionEnabled: false,
};

/**
 * Mock App Check instance
 */
export const mockAppCheck = {
  activate: vi.fn(),
  getToken: vi.fn(),
};

/**
 * Reset all Firebase mocks
 */
export function resetFirebaseMocks() {
  Object.values(mockFirestore).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });

  Object.values(mockAuth).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });

  Object.values(mockStorage).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });

  mockAuth.currentUser = null;
}

/**
 * Create mock Firebase user
 */
export function createMockUser(overrides = {}) {
  return {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    ...overrides,
  };
}

/**
 * Create mock Firestore document
 */
export function createMockDoc<T>(id: string, data: T) {
  return {
    id,
    data: () => data,
    exists: () => true,
    ref: { id, path: `collection/${id}` },
  };
}

/**
 * Create mock Firestore query snapshot
 */
export function createMockQuerySnapshot<T>(docs: Array<{ id: string; data: T }>) {
  return {
    docs: docs.map((doc) => createMockDoc(doc.id, doc.data)),
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: unknown) => void) => {
      docs.forEach((doc) => callback(createMockDoc(doc.id, doc.data)));
    },
  };
}
