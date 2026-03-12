/**
 * src/shared-infra/dlq-manager/index.ts
 *
 * Compatibility re-export stub — DDD progressive migration.
 *
 * The implementation was moved to `src/features/infra.dlq-manager/`
 * as part of the DDD architecture migration (features/infra.* layer).
 *
 * This file preserves the old `@/shared-infra/dlq-manager` import path
 * so existing callers continue to compile without modification.
 *
 * Migration target: Update all callers to import from
 *   `@/features/infra.dlq-manager` (tracked in DDD migration backlog).
 *
 * Per docs/architecture/README.md: Infrastructure layer is authoritative.
 */
export * from '@/features/infra.dlq-manager';
