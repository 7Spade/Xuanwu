/**
 * Module: document-parser.ts
 * Purpose: Centralized document parser domain type definitions.
 * Responsibilities: ParsingIntent entity, ParsedLineItem, and import status types for the document parsing pipeline.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { SkillRequirement } from '@/shared-kernel/data-contracts/skill-tier';
import type { Timestamp } from '@/shared-kernel';

// ─── Brand Types ─────────────────────────────────────────────────────────────

/** Branded ID for a ParsingIntent document — prevents mixing with plain strings. */
export type IntentID = string & { readonly _brand: 'IntentID' };

/** Branded pointer to a source file download URL — immutable contract anchor. */
export type SourcePointer = string & { readonly _brand: 'SourcePointer' };

// ─── Parser Status Types ──────────────────────────────────────────────────────

export type ParsingIntentStatus =
  | 'pending'
  | 'importing'
  | 'imported'
  | 'superseded'
  | 'failed';

export type ParsingIntentSourceType = 'ai' | 'human' | 'system';

export type ParsingIntentReviewStatus =
  | 'not_required'
  | 'pending_review'
  | 'approved'
  | 'rejected';

// ─── Parsed Line Item ─────────────────────────────────────────────────────────

export interface ParsedLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  /**
   * Layer-2 Semantic Classification (VS8) — set during the document parse phase.
   * String representation of CostItemType from semantic-graph.slice.
   */
  costItemType: string;
  /** Business-facing parsed type to avoid overloading costItemType with process semantics. */
  lineItemType?: string;
  /** Routing status emitted by parser (task candidate / auto-accepted / finance-only / excluded). */
  routingStatus?: string;
  /** Billing intent inferred during parse phase. */
  billingMode?: string;
  /**
   * VS8 semantic tag identity (tagSlug) for this line item.
   */
  semanticTagSlug: string;
  /**
   * Original 0-based row position from ParsingIntent lineItems for deterministic materialization order.
   */
  sourceIntentIndex: number;
  /** Organization-scoped task type slug resolved from VS4 org semantic dictionary. */
  taskTypeSlug?: string;
  /** Organization-scoped task type display name resolved from VS4 org semantic dictionary. */
  taskTypeName?: string;
  /** Task-specific skill requirements resolved from taskType definition (if matched). */
  requiredSkills?: SkillRequirement[];
}

// ─── Parsing Intent ───────────────────────────────────────────────────────────

export interface ParsingIntent {
  /** Branded ID — use `IntentID` cast when constructing references. */
  id: IntentID;
  workspaceId: string;
  sourceFileName: string;
  /** Immutable pointer to the original file in Firebase Storage. */
  sourceFileDownloadURL?: SourcePointer;
  sourceFileId?: string;
  sourceFileVersionId?: string;
  sourceFileStoragePath?: string;
  intentVersion: number;
  supersededByIntentId?: IntentID;
  baseIntentId?: IntentID;
  lineItems: ParsedLineItem[];
  skillRequirements?: SkillRequirement[];
  parserVersion?: string;
  modelVersion?: string;
  sourceType: ParsingIntentSourceType;
  reviewStatus: ParsingIntentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  semanticHash?: string;
  /** Lifecycle (unidirectional): pending -> importing -> imported; importing -> failed; any non-terminal -> superseded. */
  status: ParsingIntentStatus;
  createdAt: Timestamp;
  importedAt?: Timestamp;
}

// ─── Parsing Import ───────────────────────────────────────────────────────────

export type ParsingImportStatus = 'started' | 'applied' | 'partial' | 'failed';

export interface ParsingImport {
  id: string;
  workspaceId: string;
  intentId: IntentID;
  intentVersion: number;
  idempotencyKey: string;
  status: ParsingImportStatus;
  appliedTaskIds: string[];
  startedAt: Timestamp;
  completedAt?: Timestamp;
  error?: {
    code: string;
    message: string;
  };
}

