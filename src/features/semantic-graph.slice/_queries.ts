/**
 * semantic-graph.slice — _queries.ts
 *
 * [D4] QGWAY_SEARCH read-out port for semantic-graph.slice.
 *
 * This file is the query gateway adaptor — it bridges the in-memory
 * semantic services to external consumers who access the slice only
 * through its index.ts barrel.
 *
 * Architecture rules:
 *   [D4]  Read-only; no mutations allowed here.
 *   [D7]  Exposed via index.ts only — internal modules NOT re-exported here.
 *   [D24] No direct firebase/* import.
 *   [D26] VS8 is the Global Search authority; this file is its outbound query API.
 */

import { querySemanticIndex, getIndexStats } from './_services';

// ─── Semantic index reads (VS8 / Global Search) ─────────────────────────────

/**
 * Query the semantic index — delegates to _services.querySemanticIndex.
 * Used by Global Search (QGWAY_SEARCH) cross-domain retrieval.
 */
export { querySemanticIndex, getIndexStats };
