/**
 * src/shared-infra/observability/index.ts
 *
 * Compatibility re-export stub — DDD progressive migration.
 *
 * The implementation was moved to `src/features/observability/`
 * as part of the DDD architecture migration (features/observability layer).
 *
 * This file preserves the old `@/shared-infra/observability` import path
 * so existing callers continue to compile without modification.
 *
 * Migration target: Update all callers to import from
 *   `@/features/observability` (tracked in DDD migration backlog).
 *
 * Per docs/architecture/README.md: Infrastructure layer is authoritative.
 */
export * from '@/features/observability';
