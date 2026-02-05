/**
 * Auth Adapter
 * Wrapper for Firebase Authentication operations
 * 
 * @layer Infrastructure
 * @package firebase/auth
 * @responsibility User authentication and management
 */
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { from, Observable } from 'rxjs';
import { FirebaseService } from '../../../core/services/firebase.service';

/**
 * Auth Adapter
 * Provides authentication operations using Firebase Auth
 * 
 * @example
 * ```typescript
 * // Sign in
 * this.authAdapter.signIn(email, password).subscribe(user => {
 *   console.log('Signed in:', user);
 * });
 * 
 * // Get current user state
 * this.authAdapter.getCurrentUser$().subscribe(user => {
 *   console.log('Current user:', user);
 * });
 * 
 * // Sign out
 * this.authAdapter.signOut().subscribe(() => {
 *   console.log('Signed out');
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthAdapter {
  private readonly firebaseService = inject(FirebaseService);
  private readonly auth: Auth = this.firebaseService.getAuth();

  /**
   * Sign in with email and password
   * @param email - User email
   * @param password - User password
   * @returns Observable of UserCredential
   */
  signIn(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Create a new user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Observable of UserCredential
   */
  signUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Sign out the current user
   * @returns Observable of void
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Get the current user state as an Observable
   * @returns Observable stream of User or null
   */
  getCurrentUser$(): Observable<User | null> {
    return new Observable(subscriber => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        user => subscriber.next(user),
        error => subscriber.error(error),
        () => subscriber.complete()
      );
      return () => unsubscribe();
    });
  }

  /**
   * Get the current user synchronously
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Send password reset email
   * @param email - User email
   * @returns Observable of void
   */
  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Update user profile
   * @param displayName - User display name
   * @param photoURL - User photo URL
   * @returns Observable of void
   */
  updateUserProfile(displayName?: string, photoURL?: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    return from(updateProfile(user, { displayName, photoURL }));
  }

  /**
   * Update user email
   * @param newEmail - New email address
   * @returns Observable of void
   */
  updateUserEmail(newEmail: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    return from(updateEmail(user, newEmail));
  }

  /**
   * Update user password
   * @param newPassword - New password
   * @returns Observable of void
   */
  updateUserPassword(newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    return from(updatePassword(user, newPassword));
  }
}
