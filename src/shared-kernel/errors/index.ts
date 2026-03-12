/**
 * Module: index.ts
 * Purpose: barrel export for shared-kernel/errors
 * Responsibilities: expose canonical domain error types
 * Constraints: deterministic logic, respect module boundaries
 */

export { OptimisticLockException } from './optimistic-lock.error';
