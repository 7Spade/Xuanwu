/**
 * Module: finance.ts
 * Purpose: Canonical finance constants shared across finance and parser flows.
 * Responsibilities: provide stable lifecycle and non-task cost-item constant sets.
 * Constraints: deterministic logic, respect module boundaries
 */

import { CostItemType, type CostItemTypeValue } from '@/shared-kernel/enums/cost-item-type';
import type { FinanceLifecycleStage } from '@/shared-kernel/types/finance';

export const FINANCE_LIFECYCLE_STAGES: readonly FinanceLifecycleStage[] = [
  'claim-preparation',
  'claim-submitted',
  'claim-approved',
  'invoice-requested',
  'payment-term',
  'payment-received',
  'completed',
] as const;

export const NON_TASK_COST_ITEM_TYPES: ReadonlySet<CostItemTypeValue> = new Set<CostItemTypeValue>([
  CostItemType.MANAGEMENT,
  CostItemType.RESOURCE,
  CostItemType.FINANCIAL,
  CostItemType.PROFIT,
  CostItemType.ALLOWANCE,
]);
