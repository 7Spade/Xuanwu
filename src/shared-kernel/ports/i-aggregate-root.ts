/**
 * Module: i-aggregate-root.ts
 * Purpose: define AggregateRoot base interface in shared-kernel (L6/L8)
 * Responsibilities: enforce aggregate identity, version, and event-collection contract
 * Constraints: deterministic logic, no infrastructure imports, respect module boundaries
 *
 * Per docs/architecture/models/domain-model.md §Aggregate Root boundary
 * and docs/architecture/blueprints/application-service-spec.md §1 Command Handler pattern.
 */

import type { EventEnvelope } from '../data-contracts/event-envelope';

export interface AggregateRoot {
  /** Globally unique aggregate identifier. */
  readonly aggregateId: string;

  /**
   * Monotonic version counter for optimistic concurrency control.
   * Incremented on every successful state change.
   * Used by OptimisticLockGuard (Step 4, L8 7-step handler pattern).
   */
  readonly version: number;

  /**
   * Apply a command and return the resulting domain events.
   * MUST NOT produce side effects (no I/O, no async).
   * Events are buffered internally and published via eventBus.publishAll().
   */
  handle<C>(command: C): EventEnvelope[];

  /**
   * Drain and return all buffered domain events.
   * Called after save() to publish events to the EventBus.
   * Clears the internal event buffer.
   */
  collectEvents(): EventEnvelope[];
}
