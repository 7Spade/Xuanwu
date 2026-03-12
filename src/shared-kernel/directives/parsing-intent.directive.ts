/**
 * Module: parsing-intent.directive.ts
 * Purpose: Canonical lifecycle directives for parsing-intent contracts.
 * Responsibilities: define pure creation and transition rules for parsing-intent contract state.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  CreateParsingIntentInput,
  ParsingIntentContract,
} from '@/shared-kernel/types/parsing-intent-contract';

export function createParsingIntentContract(
  input: CreateParsingIntentInput,
): ParsingIntentContract {
  const now = Date.now();
  return {
    intentId: input.intentId,
    workspaceId: input.workspaceId,
    sourceFileId: input.sourceFileId,
    sourceVersionId: input.sourceVersionId,
    intentVersion: input.intentVersion ?? 1,
    baseIntentId: input.baseIntentId,
    taskDraftCount: input.taskDraftCount,
    skillRequirements: input.skillRequirements ?? [],
    parserVersion: input.parserVersion,
    modelVersion: input.modelVersion,
    sourceType: input.sourceType ?? 'ai',
    reviewStatus: input.reviewStatus ?? 'pending_review',
    reviewedBy: input.reviewedBy,
    reviewedAt: input.reviewedAt,
    semanticHash: input.semanticHash,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

export function markParsingIntentImported(
  current: ParsingIntentContract,
): ParsingIntentContract {
  return {
    ...current,
    status: 'imported',
    updatedAt: Date.now(),
  };
}

export function supersedeParsingIntent(
  current: ParsingIntentContract,
  nextIntentId: string,
): ParsingIntentContract {
  return {
    ...current,
    status: 'superseded',
    supersededByIntentId: nextIntentId,
    updatedAt: Date.now(),
  };
}
