/**
 * Module: acc-outbox
 * Purpose: Encapsulate account role event publishing behind an outbox boundary
 * Responsibilities: provide a single enqueue API for VS2 account events
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  publishOrgEvent,
  type OrganizationEventKey,
  type OrganizationEventPayloadMap,
} from '@/features/organization.slice';
import type { OutboxAck, OutboxLane, OutboxRouting } from '@/shared-kernel';

import {
  publishAccountEvent,
  type AccountEventKey,
  type AccountEventPayloadMap,
} from './account-event-bus';

export type AccountOutboxLane = OutboxLane;

export type AccountOutboxRouting = OutboxRouting;

export type AccountOutboxAck = OutboxAck;

const DEFAULT_ACCOUNT_OUTBOX_ROUTING: AccountOutboxRouting = {
  lane: 'CRITICAL_LANE',
  dlqTier: 'SECURITY_BLOCK',
};

export async function enqueueAccountOutboxEvent<K extends OrganizationEventKey>(
  eventKey: K,
  payload: OrganizationEventPayloadMap[K],
  routing: AccountOutboxRouting = DEFAULT_ACCOUNT_OUTBOX_ROUTING,
): Promise<AccountOutboxAck> {
  await publishOrgEvent(eventKey, payload);
  return {
    lane: routing.lane,
    dlqTier: routing.dlqTier,
  };
}

export async function enqueueAccountLifecycleOutboxEvent<K extends AccountEventKey>(
  eventKey: K,
  payload: AccountEventPayloadMap[K],
  routing: AccountOutboxRouting = DEFAULT_ACCOUNT_OUTBOX_ROUTING,
): Promise<AccountOutboxAck> {
  await publishAccountEvent(eventKey, payload);
  return {
    lane: routing.lane,
    dlqTier: routing.dlqTier,
  };
}
