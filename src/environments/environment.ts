/**
 * Development Environment Configuration
 * This configuration is used for local development
 * 
 * ⚠️ SECURITY NOTE:
 * - The Firebase configuration is currently committed to the repository
 * - This is acceptable for public Firebase projects with proper security rules
 * - For production apps, consider using environment variables or secret management
 * - Always ensure Firestore and Storage security rules are properly configured
 */
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyD7SaUuZkibUwK3pd1g4pEIbyKvhLdWuJA",
    authDomain: "studio-9041158994-db5b0.firebaseapp.com",
    databaseURL: "https://studio-9041158994-db5b0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "studio-9041158994-db5b0",
    storageBucket: "studio-9041158994-db5b0.firebasestorage.app",
    messagingSenderId: "288144164035",
    appId: "1:288144164035:web:5c22ed6eef86399e0c0e76"
  }
};
