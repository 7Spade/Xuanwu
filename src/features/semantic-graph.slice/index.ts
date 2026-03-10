/**
 * semantic-graph.slice — Public API
 *
 * VS8 Semantic Graph: The Brain — manages tag taxonomy, temporal conflict
 * detection for scheduling, and semantic indexing for cross-domain queries.
 *
 * Per 00-logic-overview.md (VS8):
 *   • Everything as a Tag: all domain concepts modelled as semantic tags,
 *      governed by VS8 (Semantic Graph).
 *
 * Sub-modules:
 *   _types      — Domain types (temporal conflict, taxonomy, semantic index)
 *   _bus        — In-process tag event bus (onTagEvent / publishTagEvent)
 *   _aggregate  — Temporal conflict detection + taxonomy validation
 *   _services   — Semantic index management
 *   _queries    — [D4] QGWAY_SEARCH read-out port
 *   _actions    — All tag mutations (server actions) [D3]
 *   _cost-classifier — Semantic cost / parser line-item classification
 *
 * Architecture rules:
 *   [D3]  All entity changes via _actions.ts only.
 *   [D7]  Unique public API: only selectors and Commands are exposed.
 *   [D8]  Tag logic resides HERE, not in shared-kernel.
 *   [D19] Core contracts defined in shared-kernel/semantic-primitives.
 *   [D21] New tag categories only defined via VS8.
 *   [D26] semantic-graph.slice owns _actions.ts / _services.ts.
 *
 * External consumers import from '@/features/semantic-graph.slice'.
 */

// =================================================================
// Domain Types
// =================================================================
export type {
  TemporalTagAssignment,
  TemporalConflict,
  TemporalConflictCheckInput,
  TemporalConflictCheckResult,
  TaxonomyTree,
  TaxonomyValidationResult,
  TaxonomyValidationError,
  TaxonomyErrorCode,
  SemanticIndexEntry,
  SemanticIndexStats,
  // Re-export shared primitives for consumers who import from this slice
  TaxonomyDimension,
  TaxonomyNode,
  SemanticSearchHit,
} from './_types';

// =================================================================
// Aggregate — Temporal Conflict Detection + Taxonomy Validation
// =================================================================
export {
  detectTemporalConflicts,
  checkTemporalConflict,
  validateTaxonomyAssignment,
  validateTaxonomyPath,
} from './_aggregate';

// =================================================================
// Server Actions (all tag mutations go through here) [D3]
// =================================================================
export {
  upsertTagWithConflictCheck,
  assignSemanticTag,
  removeTag,
} from './_actions';

// =================================================================
// Services — Semantic Index (query interface for global-search)
// =================================================================
export {
  indexEntity,
  removeFromIndex,
  querySemanticIndex,
  getIndexStats,
} from './_services';

export { SEARCH_DOMAINS, TAXONOMY_DIMENSIONS } from './_semantic-authority';

// =================================================================
// Tag Event Bus — in-process pub/sub for tag lifecycle events [T1]
// [T1] New slices MUST subscribe via onTagEvent(); do NOT maintain own tag data.
// =================================================================
export { onTagEvent, publishTagEvent } from './_bus';
export type {
  TagLifecycleEventPayloadMap,
  TagLifecycleEventKey,
  TagCreatedPayload,
  TagUpdatedPayload,
  TagDeprecatedPayload,
  TagDeletedPayload,
  CentralizedTagEntry,
  CentralizedTagDeleteRule,
} from '@/shared-kernel';

// =================================================================
// Cost Item Classification — Layer-2 Semantic Classification [D8][D21]
// Pure keyword-based classifier; no SDK imports (classifies during parse phase).
// =================================================================
export {
  classifyCostItem,
  classifyCostItemWithSemanticTag,
  classifyParserLineItem,
  CostItemType,
  ParserLineItemType,
  ParserRoutingStatus,
  ParserBillingMode,
  shouldMaterializeAsTask,
} from './_cost-classifier';
export type {
  CostItemType as CostItemTypeValue,
  SemanticTagSlug,
  CostItemSemanticClassification,
  ParserLineItemType as ParserLineItemTypeValue,
  ParserRoutingStatus as ParserRoutingStatusValue,
  ParserBillingMode as ParserBillingModeValue,
  ParserLineItemClassification,
} from './_cost-classifier';

export {
  getTagSnapshotPresentation,
  getTagSnapshotPresentationMap,
} from './projections/tag-snapshot.slice';
export type {
  TagSnapshotPresentation,
  TagSnapshotColorToken,
  TagSnapshotIconToken,
} from './projections/tag-snapshot.slice';
