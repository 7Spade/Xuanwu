/**
 * Module: relationship-visualizer
 * Purpose: SIMA — Semantic relationship graph visualization
 * Responsibilities: Build read-only structural snapshots of the semantic graph
 *   that can be consumed by UI renderers (e.g., force-directed graph, hierarchy
 *   trees); produces pure data — no rendering logic lives here.
 * Constraints: deterministic logic, ZERO infrastructure imports, ZERO React imports
 *
 * TODO [VS8_PROJ]: Implement full graph snapshot once the Knowledge Graph (支柱一 🧠)
 * edge store is wired to Firestore via SK_PORTS.
 * See: docs/architecture/README.md (Phase 2)
 */

import type { SemanticRelationType } from '../_types';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A node in the visualization graph. */
export interface VisNode {
  readonly id: string;
  /** Display label (falls back to the raw slug). */
  readonly label: string;
  /** Category used for coloring/grouping in the UI. */
  readonly category: 'tag' | 'workspace-tag' | 'global-tag';
}

/** An edge in the visualization graph. */
export interface VisEdge {
  readonly source: string;
  readonly target: string;
  readonly relationType: SemanticRelationType;
}

/** A serializable snapshot of the full semantic graph ready for rendering. */
export interface GraphSnapshot {
  readonly nodes: readonly VisNode[];
  readonly edges: readonly VisEdge[];
  readonly generatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _emptySnapshot(): GraphSnapshot {
  return { nodes: [], edges: [], generatedAt: new Date().toISOString() };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a full graph snapshot (all relation types) from the current edge store.
 * [KG-1] Knowledge Graph edges are written exclusively via _actions.ts.
 */
export function buildFullGraphSnapshot(): GraphSnapshot {
  return _emptySnapshot();
}

/**
 * Build an IS_A hierarchy snapshot for subsumption tree rendering.
 */
export function buildIsAHierarchySnapshot(): GraphSnapshot {
  return _emptySnapshot();
}

/**
 * Build a REQUIRES dependency snapshot for dependency graph rendering.
 */
export function buildRequiresDependencySnapshot(): GraphSnapshot {
  return _emptySnapshot();
}
