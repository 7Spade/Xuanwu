/**
 * Unit tests for FirebaseService
 * Tests Firebase initialization and service instances
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FirebaseService } from './firebase.service';

// Note: We test the actual service without mocking because
// it's a simple initialization service and mocking Firebase SDK
// in vitest with hoisting is complex. For integration tests,
// we would use Firebase emulators.

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(() => {
    service = new FirebaseService();
  });

  describe('Service Creation', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(FirebaseService);
    });

    it('should have Firebase app instance', () => {
      const app = service.getApp();
      expect(app).toBeDefined();
    });

    it('should provide Firestore instance', () => {
      const firestore = service.getFirestore();
      expect(firestore).toBeDefined();
    });

    it('should provide Auth instance', () => {
      const auth = service.getAuth();
      expect(auth).toBeDefined();
    });

    it('should provide Storage instance', () => {
      const storage = service.getStorage();
      expect(storage).toBeDefined();
    });

    it('should return same Firestore instance (singleton)', () => {
      const firestore1 = service.getFirestore();
      const firestore2 = service.getFirestore();
      expect(firestore1).toBe(firestore2);
    });

    it('should return same Auth instance (singleton)', () => {
      const auth1 = service.getAuth();
      const auth2 = service.getAuth();
      expect(auth1).toBe(auth2);
    });

    it('should return same Storage instance (singleton)', () => {
      const storage1 = service.getStorage();
      const storage2 = service.getStorage();
      expect(storage1).toBe(storage2);
    });
  });
});
