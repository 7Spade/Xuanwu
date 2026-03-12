/**
 * Module: finance-claim.pipe.ts
 * Purpose: Canonical finance claim transformation pipes.
 * Responsibilities: provide pure selection/line-item mapping helpers for finance claim drafts.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  FinanceClaimDraftEntry,
  FinanceClaimLineItem,
  FinanceDirectiveItem,
} from '@/shared-kernel/types/finance';

export function clampRemainingQuantity(item: FinanceDirectiveItem, persistedRemaining: number | undefined): number {
  if (typeof persistedRemaining !== 'number' || Number.isNaN(persistedRemaining)) {
    return item.remainingQuantity;
  }
  return Math.max(0, Math.min(item.totalQuantity, persistedRemaining));
}

export function hasValidClaimSelection(
  directiveItems: readonly FinanceDirectiveItem[],
  claimDraft: Readonly<Record<string, FinanceClaimDraftEntry>>,
): boolean {
  return directiveItems.some((item) => {
    const draft = claimDraft[item.id];
    if (!draft?.selected) return false;
    return draft.quantity > 0 && draft.quantity <= item.remainingQuantity;
  });
}

export function buildClaimLineItems(
  directiveItems: readonly FinanceDirectiveItem[],
  claimDraft: Readonly<Record<string, FinanceClaimDraftEntry>>,
): FinanceClaimLineItem[] {
  return directiveItems.flatMap((item) => {
    const draft = claimDraft[item.id];
    if (!draft?.selected) return [];
    if (draft.quantity <= 0 || draft.quantity > item.remainingQuantity) return [];

    return [{
      itemId: item.id,
      name: item.name,
      quantity: draft.quantity,
      unitPrice: item.unitPrice,
      lineAmount: item.unitPrice * draft.quantity,
    } satisfies FinanceClaimLineItem];
  });
}
