import type {
  SkillRequirement,
  ParsingIntentReviewStatus,
  ParsingIntentSourceType,
  ParsingIntentStatus,
} from '@/shared-kernel';

export type {
  ParsingIntentStatus,
  ParsingIntentSourceType,
  ParsingIntentReviewStatus,
} from '@/shared-kernel';

export interface ParsingIntentContract {
  intentId: string;
  workspaceId: string;
  sourceFileId: string;
  sourceVersionId: string;
  intentVersion: number;
  baseIntentId?: string;
  taskDraftCount: number;
  skillRequirements: SkillRequirement[];
  parserVersion?: string;
  modelVersion?: string;
  sourceType: ParsingIntentSourceType;
  reviewStatus: ParsingIntentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  semanticHash?: string;
  status: ParsingIntentStatus;
  supersededByIntentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateParsingIntentInput {
  intentId: string;
  workspaceId: string;
  sourceFileId: string;
  sourceVersionId: string;
  intentVersion?: number;
  baseIntentId?: string;
  taskDraftCount: number;
  skillRequirements?: SkillRequirement[];
  parserVersion?: string;
  modelVersion?: string;
  sourceType?: ParsingIntentSourceType;
  reviewStatus?: ParsingIntentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  semanticHash?: string;
}

export function createParsingIntentContract(
  input: CreateParsingIntentInput
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
    // Defaults target the automated AI parsing path; human/system pipelines should pass explicit values.
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
  current: ParsingIntentContract
): ParsingIntentContract {
  return {
    ...current,
    status: 'imported',
    updatedAt: Date.now(),
  };
}

export function supersedeParsingIntent(
  current: ParsingIntentContract,
  nextIntentId: string
): ParsingIntentContract {
  return {
    ...current,
    status: 'superseded',
    supersededByIntentId: nextIntentId,
    updatedAt: Date.now(),
  };
}
