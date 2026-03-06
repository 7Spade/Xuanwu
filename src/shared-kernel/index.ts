/**
 * Module: index.ts
 * Purpose: expose canonical shared-kernel public API
 * Responsibilities: provide stable VS0 entrypoint and preserve migration compatibility
 * Constraints: deterministic logic, respect module boundaries
 */

export * from '@/features/shared-kernel';
