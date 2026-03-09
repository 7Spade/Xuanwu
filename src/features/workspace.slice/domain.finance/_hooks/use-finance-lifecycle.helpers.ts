/**
 * Module: use-finance-lifecycle.helpers.ts
 * Purpose: Host pure helper functions used by finance lifecycle hook.
 * Responsibilities: mapping, validation, and deterministic lifecycle transitions.
 * Constraints: deterministic logic, respect module boundaries
 */

import { classifyCostItem } from '@/features/semantic-graph.slice';
import type { DocumentParserItemsExtractedPayload } from '@/features/workspace.slice/core.event-bus/_events';

import type {
  FinanceClaimDraftEntry,
  FinanceClaimLineItem,
  FinanceDirectiveItem,
  FinanceLifecycleStage,
} from '../_types';

export function buildDirectiveItem(
  payload: DocumentParserItemsExtractedPayload,
  item: DocumentParserItemsExtractedPayload['items'][number],
): FinanceDirectiveItem {
  const classification = classifyCostItem(item.name, { includeSemanticTagSlug: true });
  return {
    id: `${payload.intentId}:${item.sourceIntentIndex}`,
    name: item.name,
    sourceDocument: payload.sourceDocument,
    intentId: payload.intentId,
    semanticTagSlug: item.semanticTagSlug ?? classification.semanticTagSlug,
    costItemType: item.costItemType ?? classification.costItemType,
    unitPrice: item.unitPrice,
    totalQuantity: item.quantity,
    remainingQuantity: item.quantity,
  };
}

export function buildDirectiveItemFromParsingIntentLineItem(
  intent: {
    id: string;
    sourceFileName: string;
  },
  lineItem: {
    name: string;
    quantity: number;
    unitPrice: number;
    sourceIntentIndex?: number;
    semanticTagSlug?: string;
    costItemType?: FinanceDirectiveItem['costItemType'];
  },
  fallbackIndex: number,
): FinanceDirectiveItem | null {
  if (lineItem.quantity <= 0 || lineItem.unitPrice < 0) {
    return null;
  }

  const classification = classifyCostItem(lineItem.name, { includeSemanticTagSlug: true });
  const sourceIntentIndex = typeof lineItem.sourceIntentIndex === 'number'
    ? lineItem.sourceIntentIndex
    : fallbackIndex;

  return {
    id: `${intent.id}:${sourceIntentIndex}`,
    name: lineItem.name,
    sourceDocument: intent.sourceFileName,
    intentId: intent.id,
    semanticTagSlug: lineItem.semanticTagSlug ?? classification.semanticTagSlug,
    costItemType: lineItem.costItemType ?? classification.costItemType,
    unitPrice: lineItem.unitPrice,
    totalQuantity: lineItem.quantity,
    remainingQuantity: lineItem.quantity,
  };
}

export function isActiveParsingIntentStatus(status: string | undefined): boolean {
  return status === 'pending'
    || status === 'importing'
    || status === 'imported'
    || status === 'failed';
}

export function normalizeLifecycleStage(stage: string | undefined): FinanceLifecycleStage {
  if (
    stage === 'claim-preparation'
    || stage === 'claim-submitted'
    || stage === 'claim-approved'
    || stage === 'invoice-requested'
    || stage === 'payment-term'
    || stage === 'payment-received'
    || stage === 'completed'
  ) {
    return stage;
  }
  return 'claim-preparation';
}

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

export function getNextStageFromAction(currentStage: FinanceLifecycleStage): FinanceLifecycleStage {
  if (currentStage === 'claim-submitted') return 'claim-approved';
  if (currentStage === 'claim-approved') return 'invoice-requested';
  if (currentStage === 'invoice-requested') return 'payment-term';
  if (currentStage === 'payment-term') return 'payment-received';
  return currentStage;
}
