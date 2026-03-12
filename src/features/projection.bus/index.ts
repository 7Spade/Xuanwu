/**
 * src/features/projection.bus/index.ts
 *
 * Canonical DDD import alias for the projection bus.
 *
 * This module provides the `@/features/projection.bus` import path
 * (dot notation per DDD layer naming convention) as a re-export of
 * the existing `@/features/projection-bus` implementation.
 *
 * Per docs/architecture/README.md:
 *   - Scheduling queries MUST import eligible-member views via QGWAY_SCHED
 *     using the projection bus channel.
 *   - External consumers use `@/shared-infra/projection-bus` for most cases;
 *     scheduling domain uses this DDD-aligned path.
 */

export * from '@/features/projection-bus';
