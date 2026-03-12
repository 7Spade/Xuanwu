/**
 * Module: outbox-routing.ts
 * Purpose: Canonical cross-slice outbox lane and routing contracts.
 * Responsibilities: provide shared type contracts for outbox lane/routing/ack semantics.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { DlqTier } from '@/shared-kernel/infra-contracts/outbox-contract';

export type OutboxLane = 'STANDARD_LANE' | 'CRITICAL_LANE';

export interface OutboxRouting {
  lane: OutboxLane;
  dlqTier: DlqTier;
}

export interface OutboxAck {
  lane: OutboxLane;
  dlqTier: DlqTier;
}
