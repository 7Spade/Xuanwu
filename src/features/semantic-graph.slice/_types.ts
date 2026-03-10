/**
 * semantic-graph.slice — _types.ts
 *
 * Shared types for semantic-graph.slice.
 * Public types re-exported from @/shared-kernel; internal domain types defined here.
 *
 * [D8]  Tag logic resides HERE, not in shared-kernel (shared-kernel holds contracts only).
 * [D19] Core contracts are defined in shared-kernel/semantic-primitives.
 */

// =================================================================
// Public types (re-exported from shared-kernel)
// =================================================================

export type {
  TaxonomyDimension,
  TaxonomyNode,
  SemanticSearchHit,
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
} from '@/shared-kernel';

// =================================================================
// Internal domain types
// Used by outbox/, subscribers/, wiki-editor/, proposal-stream/.
// Not part of the public API — consumed within this slice only.
// =================================================================

import type { TagSlugRef } from '@/shared-kernel';

// ─── Semantic relation types ────────────────────────────────────────────────

/**
 * Supported semantic relation types for tag–tag edges.
 *
 * IS_A    — inheritance / subsumption (e.g. skill:expert IS_A skill:senior)
 * REQUIRES — dependency (e.g. role:team-lead REQUIRES skill:leadership)
 */
export type SemanticRelationType = 'IS_A' | 'REQUIRES';

/**
 * A directed semantic edge between two tag entity nodes.
 */
export interface SemanticEdge {
  readonly edgeId: string;
  readonly fromTagSlug: TagSlugRef;
  readonly toTagSlug: TagSlugRef;
  readonly relationType: SemanticRelationType;
  /** Relation strength: 0.0 (weak) → 1.0 (direct). Defaults to 1.0. [D21-3] */
  readonly weight: number;
  readonly createdAt: string;
}

// ─── Tag lifecycle types ────────────────────────────────────────────────────

/**
 * Tag lifecycle states (Draft → Active → Stale → Deprecated).
 */
export type TagLifecycleState = 'Draft' | 'Active' | 'Stale' | 'Deprecated';

/**
 * Discriminator for TagLifecycleEvent.
 */
export type TagLifecycleEventType =
  | 'TAG_CREATED'
  | 'TAG_ACTIVATED'
  | 'TAG_DEPRECATED'
  | 'TAG_STALE_FLAGGED'
  | 'TAG_DELETED';

export interface TagLifecycleEvent {
  readonly eventId: string;
  readonly tagSlug: TagSlugRef;
  readonly eventType: TagLifecycleEventType;
  readonly fromState: TagLifecycleState;
  readonly toState: TagLifecycleState;
  readonly transitionedAt: string;
  readonly triggeredBy: string;
  readonly aggregateVersion: number;
}

/**
 * Stale tag warning — emitted when a tag exceeds TAG_MAX_STALENESS.
 */
export interface StaleTagWarning {
  readonly tagSlug: TagSlugRef;
  readonly stalenessMs: number;
  readonly detectedAt: string;
}

