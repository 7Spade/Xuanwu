/**
 * Module: finance-staging-pool/index.ts
 * Purpose: Finance staging pool projection public API [#A20]
 * Responsibilities: Export projector and queries for the accepted-but-unbilled tasks pool
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.finance-staging-pool — Public API [#A20]
 *
 * Accepted-but-unbilled tasks pool. Standard projection (SLA ≤ 10s).
 * Consumed from CRITICAL_LANE on TaskAcceptedConfirmed events.
 */

export {
  applyTaskAcceptedToPool,
  applyFinanceStagingLocked,
  applyFinanceStagingRemoved,
} from './_projector';
export type { FinanceStagingEntry, FinanceStagingStatus } from './_projector';

export {
  getFinanceStagingPool,
  getFinanceStagingByStatus,
  getPendingFinanceStagingItems,
} from './_queries';
