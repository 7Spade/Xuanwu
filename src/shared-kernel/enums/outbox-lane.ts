/**
 * Module: outbox-lane.ts
 * Purpose: Runtime iterable lane values for outbox routing.
 * Responsibilities: define canonical outbox lane values used by shared routing contracts.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { OutboxLane } from '@/shared-kernel/types/outbox-routing';

export const OUTBOX_LANES: readonly OutboxLane[] = ['STANDARD_LANE', 'CRITICAL_LANE'] as const;
