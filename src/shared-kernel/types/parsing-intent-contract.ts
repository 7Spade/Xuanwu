/**
 * Module: parsing-intent-contract.ts
 * Purpose: Canonical contract types for parsing-intent domain workflows.
 * Responsibilities: define shared parsing-intent contract and creation input models.
 * Constraints: deterministic logic, respect module boundaries
 */

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
};

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
