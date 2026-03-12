/**
 * src/features/shared-kernel/index.ts
 *
 * Legacy compatibility path — DDD progressive migration.
 *
 * The canonical shared kernel is at `src/shared-kernel/`.
 * This file is a re-export stub so existing `@/features/shared-kernel` import
 * paths continue to work during the progressive DDD migration.
 *
 * Migration target: Update all callers to import from `@/shared-kernel` directly.
 *
 * Per docs/architecture/README.md:
 *   Shared Kernel (VS0/L1) is the canonical cross-slice contract center.
 *   No infrastructure imports are allowed here — pure contracts only.
 */

export * from '@/shared-kernel';
