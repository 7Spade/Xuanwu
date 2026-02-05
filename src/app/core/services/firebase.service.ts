/**
 * Firebase Service
 * Direct Firebase SDK initialization and management
 * Replaces @angular/fire for better stability and control
 * 
 * @layer Core
 * @package firebase
 * @responsibility Initialize and provide Firebase service instances
 */
import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { environment } from '../../../environments/environment';

/**
 * Firebase Service
 * Singleton service that initializes Firebase and provides service instances
 * 
 * Benefits over @angular/fire:
 * - No version conflicts with Angular
 * - Smaller bundle size (no wrapper overhead)
 * - Direct control over Firebase SDK version
 * - Better SSR compatibility
 * - More stable and predictable
 * 
 * @example
 * ```typescript
 * constructor(private firebaseService: FirebaseService) {
 *   const firestore = this.firebaseService.getFirestore();
 *   const auth = this.firebaseService.getAuth();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private firestore: Firestore;
  private auth: Auth;
  private storage: FirebaseStorage;
  private appCheck: AppCheck | null = null;

  constructor() {
    // Initialize Firebase App
    this.app = initializeApp(environment.firebase);

    // Initialize Firestore
    this.firestore = getFirestore(this.app);

    // Initialize Auth
    this.auth = getAuth(this.app);

    // Initialize Storage
    this.storage = getStorage(this.app);

    // Initialize App Check (browser-only)
    this.initializeAppCheck();
  }

  /**
   * Initialize Firebase App Check for security
   * Only works in browser environment
   */
  private initializeAppCheck(): void {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // ⚠️ IMPORTANT: Replace with your actual reCAPTCHA site key
        // Get your key from: https://www.google.com/recaptcha/admin
        // For development, you can use debug tokens:
        // Set (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true in browser console
        this.appCheck = initializeAppCheck(this.app, {
          provider: new ReCaptchaV3Provider('6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'), // Replace with your key
          isTokenAutoRefreshEnabled: true
        });
      } catch (error) {
        console.warn('App Check initialization failed (likely in SSR):', error);
      }
    }
  }

  /**
   * Get Firebase App instance
   */
  getApp(): FirebaseApp {
    return this.app;
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    return this.firestore;
  }

  /**
   * Get Auth instance
   */
  getAuth(): Auth {
    return this.auth;
  }

  /**
   * Get Storage instance
   */
  getStorage(): FirebaseStorage {
    return this.storage;
  }

  /**
   * Get App Check instance (may be null in SSR)
   */
  getAppCheck(): AppCheck | null {
    return this.appCheck;
  }
}
