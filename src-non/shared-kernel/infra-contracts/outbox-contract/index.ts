/**
 * shared.kernel/outbox-contract — SK_OUTBOX_CONTRACT [S1]
 */

export type DlqTier = 'SAFE_AUTO' | 'REVIEW_REQUIRED' | 'SECURITY_BLOCK';

export type OutboxStatus = 'pending' | 'relayed' | 'dlq';

export interface OutboxRecord {
  readonly outboxId: string;
  readonly idempotencyKey: string;
  readonly dlqTier: DlqTier;
  readonly payload: string;
  readonly createdAt: string;
  readonly status: OutboxStatus;
}

export function buildIdempotencyKey(
  eventId: string,
  aggId: string,
  version: number,
): string {
  return `${eventId}:${aggId}:${version}`;
}

export interface ImplementsOutboxContract {
  readonly implementsOutboxContract: true;
}
