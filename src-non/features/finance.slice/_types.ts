/**
 * Module: _types.ts
 * Purpose: Finance lifecycle and claim drafting domain types.
 * Responsibilities: Type contracts for finance UI, state machine, and read snapshot.
 * Constraints: deterministic logic, respect module boundaries
 *
 * @deprecated 🛑 型別定義已集中管理。
 * 請優先從 `@/shared-kernel/types/finance` 引用 FinanceLifecycleStage、FinanceClaimDraftEntry、
 * FinanceClaimLineItem、FinanceStrongReadSnapshot。
 * 注意：FinanceDirectiveItem 與 FinanceAggregateState 因依賴 semantic-graph.slice 的 CostItemTypeValue，暫維持本地定義。
 * 定義位置（部分）：src/shared-kernel/types/finance.ts
 */

import type { CostItemTypeValue } from '@/features/semantic-graph.slice';
import type { ReadConsistencyMode } from '@/shared-kernel';

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
  readonly costItemType: CostItemTypeValue;
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
