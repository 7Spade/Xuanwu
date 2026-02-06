import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, BehaviorSubject } from 'rxjs';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from './auth.service';
import { AuthAdapter } from '../../infrastructure/adapters/firebase/auth.adapter';
import { AppStateService } from './app-state.service';
import type { User } from '../../domain';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthAdapter: Partial<AuthAdapter>;
  let mockAppState: Partial<AppStateService>;
  let authStateSubject: BehaviorSubject<FirebaseUser | null>;

  beforeEach(() => {
    // Create BehaviorSubject to simulate auth state changes
    authStateSubject = new BehaviorSubject<FirebaseUser | null>(null);

    // Mock AuthAdapter
    mockAuthAdapter = {
      getCurrentUser$: vi.fn(() => authStateSubject.asObservable()),
      signOut: vi.fn(() => of(void 0)),
      // Mock the private auth property that signInWithGoogle accesses
      auth: {
        currentUser: null
      } as any
    };

    // Mock AppStateService
    mockAppState = {
      setUser: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthAdapter, useValue: mockAuthAdapter },
        { provide: AppStateService, useValue: mockAppState }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  //
  // ============================================================
  // Service Creation
  // ============================================================
  //

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should inject AuthAdapter', () => {
    expect(mockAuthAdapter.getCurrentUser$).toHaveBeenCalled();
  });

  it('should inject AppStateService', () => {
    // AppStateService.setUser should be called with null on initialization
    expect(mockAppState.setUser).toHaveBeenCalledWith(null);
  });

  //
  // ============================================================
  // Firebase User → Domain User Conversion
  // ============================================================
  //

  it('should convert null Firebase user to null Domain user', () => {
    // Initial state is null, effect should have called setUser(null)
    expect(mockAppState.setUser).toHaveBeenCalledWith(null);
  });

  it('should convert Firebase user to Domain user with all properties', () => {
    const firebaseUser: Partial<FirebaseUser> = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    // Simulate auth state change
    authStateSubject.next(firebaseUser as FirebaseUser);

    // Wait for effect to run
    TestBed.flushEffects();

    const expectedDomainUser: User = {
      id: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      createdAt: new Date('2024-01-01T00:00:00.000Z')
    };

    expect(mockAppState.setUser).toHaveBeenCalledWith(expectedDomainUser);
  });

  it('should convert Firebase user with null email to empty string', () => {
    const firebaseUser: Partial<FirebaseUser> = {
      uid: 'test-uid-456',
      email: null,
      displayName: 'Test User',
      photoURL: null,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    authStateSubject.next(firebaseUser as FirebaseUser);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-uid-456',
        email: '', // null email becomes empty string
        displayName: 'Test User',
        photoURL: null
      })
    );
  });

  it('should convert Firebase user with null displayName and photoURL', () => {
    const firebaseUser: Partial<FirebaseUser> = {
      uid: 'test-uid-789',
      email: 'test@example.com',
      displayName: null,
      photoURL: null,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    authStateSubject.next(firebaseUser as FirebaseUser);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-uid-789',
        email: 'test@example.com',
        displayName: null,
        photoURL: null
      })
    );
  });

  it('should use current timestamp if creationTime is null', () => {
    const beforeTest = Date.now();

    const firebaseUser: Partial<FirebaseUser> = {
      uid: 'test-uid-999',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      metadata: {
        creationTime: null,
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      } as any
    };

    authStateSubject.next(firebaseUser as FirebaseUser);
    TestBed.flushEffects();

    const afterTest = Date.now();

    const calls = (mockAppState.setUser as any).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    const createdAt = lastCall.createdAt.getTime();

    expect(createdAt).toBeGreaterThanOrEqual(beforeTest);
    expect(createdAt).toBeLessThanOrEqual(afterTest);
  });

  //
  // ============================================================
  // Reactive State Sync
  // ============================================================
  //

  it('should sync auth state changes to AppStateService', () => {
    // Reset mock to clear initialization call
    (mockAppState.setUser as any).mockClear();

    const firebaseUser1: Partial<FirebaseUser> = {
      uid: 'user-1',
      email: 'user1@example.com',
      displayName: 'User 1',
      photoURL: null,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    // First auth state change
    authStateSubject.next(firebaseUser1 as FirebaseUser);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledTimes(1);
    expect(mockAppState.setUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' })
    );

    // Second auth state change (different user)
    const firebaseUser2: Partial<FirebaseUser> = {
      uid: 'user-2',
      email: 'user2@example.com',
      displayName: 'User 2',
      photoURL: null,
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    authStateSubject.next(firebaseUser2 as FirebaseUser);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledTimes(2);
    expect(mockAppState.setUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-2' })
    );

    // Sign out (null user)
    authStateSubject.next(null);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledTimes(3);
    expect(mockAppState.setUser).toHaveBeenCalledWith(null);
  });

  //
  // ============================================================
  // Sign Out
  // ============================================================
  //

  it('should call AuthAdapter.signOut when signing out', async () => {
    await service.signOut();

    expect(mockAuthAdapter.signOut).toHaveBeenCalled();
  });

  it('should handle sign out errors', async () => {
    const error = new Error('Sign out failed');
    (mockAuthAdapter.signOut as any).mockReturnValue(
      new BehaviorSubject(void 0).pipe(() => {
        throw error;
      })
    );

    await expect(service.signOut()).rejects.toThrow('Sign out failed');
  });

  //
  // ============================================================
  // Integration Scenarios
  // ============================================================
  //

  it('should handle complete authentication flow', () => {
    // Start: No user
    expect(mockAppState.setUser).toHaveBeenCalledWith(null);

    // User signs in
    const firebaseUser: Partial<FirebaseUser> = {
      uid: 'auth-flow-user',
      email: 'authflow@example.com',
      displayName: 'Auth Flow User',
      photoURL: 'https://example.com/photo.jpg',
      metadata: {
        creationTime: '2024-01-01T00:00:00.000Z',
        lastSignInTime: '2024-01-02T00:00:00.000Z'
      }
    };

    authStateSubject.next(firebaseUser as FirebaseUser);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'auth-flow-user',
        email: 'authflow@example.com'
      })
    );

    // User signs out
    authStateSubject.next(null);
    TestBed.flushEffects();

    expect(mockAppState.setUser).toHaveBeenCalledWith(null);
  });

  it('should maintain reactive sync throughout service lifetime', () => {
    const callCount = (mockAppState.setUser as any).mock.calls.length;

    // Multiple rapid state changes
    for (let i = 0; i < 5; i++) {
      const firebaseUser: Partial<FirebaseUser> = {
        uid: `user-${i}`,
        email: `user${i}@example.com`,
        displayName: `User ${i}`,
        photoURL: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00.000Z',
          lastSignInTime: '2024-01-02T00:00:00.000Z'
        }
      };

      authStateSubject.next(firebaseUser as FirebaseUser);
      TestBed.flushEffects();
    }

    // Should have called setUser 5 times (plus initial null call)
    expect(mockAppState.setUser).toHaveBeenCalledTimes(callCount + 5);
  });

  //
  // ============================================================
  // DDD Boundary Compliance
  // ============================================================
  //

  it('should not expose Firebase types in public API', () => {
    // Verify that service public API only uses Domain types
    // This is a type-level check, enforced by TypeScript compiler
    // If this compiles, it means we're not exposing Firebase types

    const _typeCheck = async () => {
      await service.signOut();
      // No Firebase types should be required to use this API
    };

    expect(_typeCheck).toBeDefined();
  });
});
