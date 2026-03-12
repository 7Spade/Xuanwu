/**
 * src/shared-infra/event-router/index.ts
 *
 * Compatibility re-export stub — DDD progressive migration.
 *
 * The implementation was moved to `src/features/infra.event-router/`
 * as part of the DDD architecture migration (features/infra.* layer).
 *
 * This file preserves the old `@/shared-infra/event-router` import path
 * so existing callers continue to compile without modification.
 *
 * Migration target: Update all callers to import from
 *   `@/features/infra.event-router` (tracked in DDD migration backlog).
 *
 * Per docs/architecture/README.md: Infrastructure layer is authoritative.
 */
export * from '@/features/infra.event-router';
