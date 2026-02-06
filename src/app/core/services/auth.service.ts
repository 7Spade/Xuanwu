import { Injectable, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { from } from 'rxjs';
import type { User } from '../../domain';
import { AuthAdapter } from '../../infrastructure/adapters/firebase/auth.adapter';
import { AppStateService } from './app-state.service';

/**
 * Authentication Service
 *
 * Coordinates authentication between Firebase Auth (infrastructure)
 * and application state management (domain).
 *
 * @layer Core (Technical Services)
 * @responsibility
 * - Bridge Firebase Auth and Domain models
 * - Coordinate AuthAdapter and AppStateService
 * - Convert Firebase User → Domain User
 * - Provide high-level authentication API
 *
 * @remarks
 * DDD Boundary Compliance:
 * - Depends on Domain layer (User model)
 * - Depends on Infrastructure layer (AuthAdapter)
 * - Depends on Core layer (AppStateService)
 * - Converts external types (Firebase) to internal types (Domain)
 *
 * Reactive State Management:
 * - Uses toSignal to convert Observable → Signal
 * - Uses effect to sync Firebase auth state to AppStateService
 * - Maintains reactive dependency throughout service lifetime
 *
 * @example
 * ```typescript
 * @Component({...})
 * export class LoginComponent {
 *   private auth = inject(AuthService);
 *
 *   async login() {
 *     try {
 *       await this.auth.signInWithGoogle();
 *       // User state automatically updated in AppStateService
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   }
 *
 *   async logout() {
 *     await this.auth.signOut();
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //
  // ============================================================
  // Dependencies
  // ============================================================
  //

  /**
   * Firebase authentication adapter (infrastructure layer)
   */
  private readonly authAdapter = inject(AuthAdapter);

  /**
   * Application state service (core layer)
   */
  private readonly appState = inject(AppStateService);

  //
  // ============================================================
  // Reactive State Sync
  // ============================================================
  //

  /**
   * Firebase auth state as a Signal
   *
   * Converts the Observable from AuthAdapter to a Signal for reactive tracking.
   * Uses toSignal at class level (not inside reactive contexts) per Angular best practices.
   *
   * @see https://angular.dev/guide/signals/rxjs-interop#tosignal
   */
  private readonly firebaseUser = toSignal(
    this.authAdapter.getCurrentUser$(),
    { initialValue: null }
  );

  /**
   * Constructor
   *
   * Establishes reactive sync between Firebase auth state and AppStateService.
   * The effect watches firebaseUser signal and updates AppStateService whenever
   * authentication state changes.
   *
   * @remarks
   * Using effect() in constructor is acceptable here because:
   * - It's declarative (reactive dependency) not imperative (side effect)
   * - It's part of service initialization (similar to FirebaseService precedent)
   * - It maintains reactive sync throughout service lifetime
   */
  constructor() {
    effect(() => {
      const fbUser = this.firebaseUser();
      const domainUser = this.convertFirebaseUser(fbUser);
      this.appState.setUser(domainUser);
    });
  }

  //
  // ============================================================
  // Public API Methods
  // ============================================================
  //

  /**
   * Sign in with Google
   *
   * Opens Google sign-in popup and authenticates user.
   * On success, auth state automatically syncs to AppStateService via effect.
   *
   * @returns Promise that resolves when sign-in completes
   * @throws Error if sign-in fails
   *
   * @example
   * ```typescript
   * try {
   *   await this.auth.signInWithGoogle();
   *   console.log('Signed in successfully');
   * } catch (error) {
   *   console.error('Sign-in failed:', error);
   * }
   * ```
   */
  async signInWithGoogle(): Promise<void> {
    const auth = this.authAdapter['auth']; // Access private auth instance
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // User state will be automatically updated by the effect
  }

  /**
   * Sign out the current user
   *
   * Signs out from Firebase Auth.
   * On success, auth state automatically syncs to AppStateService via effect.
   *
   * @returns Promise that resolves when sign-out completes
   * @throws Error if sign-out fails
   *
   * @example
   * ```typescript
   * await this.auth.signOut();
   * console.log('Signed out successfully');
   * ```
   */
  async signOut(): Promise<void> {
    await from(this.authAdapter.signOut()).toPromise();
    // User state will be automatically updated by the effect
  }

  //
  // ============================================================
  // Private Helper Methods
  // ============================================================
  //

  /**
   * Convert Firebase User to Domain User
   *
   * Maintains DDD boundary purity by converting external Firebase types
   * to internal Domain types. This prevents Firebase-specific types from
   * leaking into the domain layer.
   *
   * @param firebaseUser - Firebase Auth user or null
   * @returns Domain user model or null
   *
   * @remarks
   * Type Conversion:
   * - Firebase uid → Domain id
   * - Firebase email (nullable) → Domain email (defaults to empty string)
   * - Firebase displayName → Domain displayName (preserved nullability)
   * - Firebase photoURL → Domain photoURL (preserved nullability)
   * - Firebase metadata.creationTime → Domain createdAt (Date object)
   */
  private convertFirebaseUser(firebaseUser: FirebaseUser | null): User | null {
    if (!firebaseUser) {
      return null;
    }

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now())
    };
  }
}
