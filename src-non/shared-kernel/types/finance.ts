/**
 * Module: finance.ts
 * Purpose: Centralized finance domain type definitions.
 * Responsibilities: Finance lifecycle stages, claim drafting, and aggregate state types.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { ReadConsistencyMode } from '@/shared-kernel/infra-contracts/read-consistency';

// CostItemTypeValue is re-exported from semantic-graph.slice as an alias for CostItemType
// It remains referenced from the feature slice to preserve the cross-BC import contract.
export type { ReadConsistencyMode };

export type FinanceLifecycleStage =
  | 'claim-preparation'
  | 'claim-submitted'
  | 'claim-approved'
  | 'invoice-requested'
  | 'payment-term'
  | 'payment-received'
  | 'completed';

export interface FinanceDirectiveItem {
  readonly id: string;
  readonly name: string;
  readonly sourceDocument: string;
  readonly intentId: string;
  readonly semanticTagSlug: string;
  /** CostItemType value — references the semantic classification from VS8. */
  readonly costItemType: string;
  readonly unitPrice: number;
  readonly totalQuantity: number;
  readonly remainingQuantity: number;
}

export interface FinanceClaimDraftEntry {
  readonly selected: boolean;
  readonly quantity: number;
}

export interface FinanceClaimLineItem {
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineAmount: number;
}

export interface FinanceStrongReadSnapshot {
  readonly readConsistencyMode: ReadConsistencyMode;
  readonly source: 'aggregate';
  readonly totalClaimableAmount: number;
  readonly receivedAmount: number;
  readonly outstandingClaimableAmount: number;
}

export interface FinanceAggregateState {
  readonly workspaceId: string;
  readonly stage: FinanceLifecycleStage;
  readonly cycleIndex: number;
  readonly receivedAmount: number;
  readonly directiveItems: FinanceDirectiveItem[];
  readonly currentClaimLineItems: FinanceClaimLineItem[];
  readonly paymentTermStartAtISO: string | null;
  readonly paymentReceivedAtISO: string | null;
  readonly updatedAt: number;
}
