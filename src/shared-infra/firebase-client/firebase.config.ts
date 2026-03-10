/**
 * Module: firebase.config.ts
 * Purpose: Backward-compatible export for frontend Firebase config
 * Responsibilities: re-export config from shared-infra/firebase-client
 * Constraints: deterministic logic, respect module boundaries
 */

export { firebaseConfig } from '@/shared-infra/firebase-client';
