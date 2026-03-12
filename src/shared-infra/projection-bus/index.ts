/**
 * src/shared-infra/projection-bus/index.ts
 *
 * Compatibility re-export stub — DDD progressive migration.
 *
 * The implementation was moved to `src/features/projection-bus/`
 * as part of the DDD architecture migration (features/projection-bus layer).
 *
 * This file preserves the old `@/shared-infra/projection-bus` import path
 * so existing callers continue to compile without modification.
 *
 * Migration target: Update all callers to import from
 *   `@/features/projection-bus` (tracked in DDD migration backlog).
 *
 * Per docs/architecture/README.md: Infrastructure layer is authoritative.
 */
export * from '@/features/projection-bus';
