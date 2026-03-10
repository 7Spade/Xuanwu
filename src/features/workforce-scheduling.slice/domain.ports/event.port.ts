/**
 * Module: event.port.ts
 * Purpose: Define VS6 event publication port contracts.
 * Responsibilities: Standardize scheduling domain event enqueue boundaries.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  OrganizationEventKey,
  OrganizationEventPayloadMap,
} from '@/features/organization.slice';
import type { OutboxAck, OutboxLane, OutboxRouting } from '@/shared-kernel';

export type SchedulingOutboxLane = OutboxLane;

export type SchedulingOutboxRouting = OutboxRouting;

export type SchedulingOutboxAck = OutboxAck;

export interface SchedulingEventPort {
  enqueueSchedulingOutboxEvent<K extends OrganizationEventKey>(
    eventKey: K,
    payload: OrganizationEventPayloadMap[K],
    routing?: SchedulingOutboxRouting,
  ): Promise<SchedulingOutboxAck>;
}
