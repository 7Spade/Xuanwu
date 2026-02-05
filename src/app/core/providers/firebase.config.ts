/**
 * Firebase Configuration Provider
 * Initializes Firebase services for the application
 * 
 * @layer Infrastructure Core
 * @package @angular/fire
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { environment } from '../../../environments/environment';

/**
 * Firebase Application Configuration
 * 
 * Provides Firebase services:
 * - Firebase App initialization
 * - Firestore (database)
 * - Storage (file storage)
 * - App Check (security)
 * - Auth (authentication)
 */
export const firebaseConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    // App Check for production security
    // ⚠️ IMPORTANT: Replace the placeholder reCAPTCHA site key below with your actual key
    // Get your key from: https://www.google.com/recaptcha/admin
    // Note: In development, you can use debug tokens
    // Set self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; in browser console
    provideAppCheck(() => {
      const appCheck = initializeAppCheck(undefined as any, {
        provider: new ReCaptchaV3Provider('6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'), // ⚠️ Replace with your reCAPTCHA site key
        isTokenAutoRefreshEnabled: true
      });
      return appCheck;
    })
  ]
};
