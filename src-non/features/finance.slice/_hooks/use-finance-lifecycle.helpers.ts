/**
 * Module: use-finance-lifecycle.helpers.ts
 * Purpose: Host pure helper functions used by finance lifecycle hook.
 * Responsibilities: mapping, validation, and deterministic lifecycle transitions.
 * Constraints: deterministic logic, respect module boundaries
 */

import { classifyCostItem } from '@/features/semantic-graph.slice';
import type { DocumentParserItemsExtractedPayload } from '@/features/workspace.slice';
import {
  buildClaimLineItems,
  clampRemainingQuantity,
  getNextStageFromAction,
  hasValidClaimSelection,
  isActiveParsingIntentStatus,
  normalizeLifecycleStage,
} from '@/shared-kernel';

import type {
  FinanceDirectiveItem,
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

export {
  isActiveParsingIntentStatus,
  normalizeLifecycleStage,
  clampRemainingQuantity,
  hasValidClaimSelection,
  buildClaimLineItems,
  getNextStageFromAction,
};
