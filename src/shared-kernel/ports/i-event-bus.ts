/**
 * Module: i-event-bus.ts
 * Purpose: define SK_PORTS EventBus interface in shared-kernel (L9)
 * Responsibilities: abstract domain event publish and subscribe operations
 * Constraints: deterministic logic, no infrastructure imports, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §3 EventBus.
 */

import type { EventEnvelope } from '../data-contracts/event-envelope';

export interface EventBus {
  /**
   * Publish a single domain event to the bus.
   * The event MUST satisfy EventEnvelope with an L7-canonical PascalCase eventType.
   */
  publish<E extends EventEnvelope>(event: E): Promise<void>;

  /**
   * Publish multiple domain events atomically (all or none).
   * Used by aggregate save cycle: save() → eventBus.publishAll(aggregate.collectEvents()).
   */
  publishAll<E extends EventEnvelope>(events: E[]): Promise<void>;

  /**
   * Register a handler for events matching the given L7-canonical eventType.
   * Returns an unsubscribe function.
   */
  subscribe<E extends EventEnvelope>(
    eventType: string,
    handler: (event: E) => Promise<void>,
  ): () => void;
}
