/**
 * Module: search.ts
 * Purpose: Centralized global search domain type definitions.
 * Responsibilities: Search filter, state, and response types for the cross-domain search portal.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  SearchDomain,
  SemanticSearchHit,
  SemanticSearchQuery,
  SemanticSearchResult,
} from '@/shared-kernel';
import type { TagSlugRef } from '@/shared-kernel';

export type { SearchDomain, SemanticSearchHit, SemanticSearchQuery, SemanticSearchResult };

// ─── Search Filter Types ─────────────────────────────────────────────────────

/**
 * Date range filter for scoping search results.
 */
export interface DateRangeFilter {
  readonly from?: string;
  readonly to?: string;
}

/**
 * Unified search filters combining domain, tag, and temporal constraints.
 */
export interface SearchFilters {
  readonly domains?: readonly SearchDomain[];
  readonly tagSlugs?: readonly TagSlugRef[];
  readonly dateRange?: DateRangeFilter;
  readonly orgId?: string;
  readonly workspaceId?: string;
  readonly createdBy?: string;
}

// ─── Search State (Client-side) ──────────────────────────────────────────────

/**
 * Client-side search state for the Cmd+K search portal.
 */
export interface SearchState {
  readonly query: string;
  readonly filters: SearchFilters;
  readonly results: SemanticSearchResult | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  /** Recent search queries for autocomplete. */
  readonly recentQueries: readonly string[];
}

/**
 * Initial (empty) search state.
 */
export const INITIAL_SEARCH_STATE: SearchState = {
  query: '',
  filters: {},
  results: null,
  isLoading: false,
  error: null,
  recentQueries: [],
};

// ─── Search Action Input/Output ──────────────────────────────────────────────

/**
 * Input for executing a cross-domain search.
 */
export interface ExecuteSearchInput {
  readonly query: string;
  readonly filters?: SearchFilters;
  readonly limit?: number;
  readonly cursor?: string;
  readonly traceId?: string;
}

/**
 * Aggregated search output with per-domain grouping.
 */
export interface GroupedSearchResult {
  readonly domain: SearchDomain;
  readonly hits: readonly SemanticSearchHit[];
  readonly count: number;
}

/**
 * Final search response returned to the UI layer.
 */
export interface SearchResponse {
  readonly query: string;
  readonly groups: readonly GroupedSearchResult[];
  readonly totalCount: number;
  readonly cursor?: string;
  readonly executedAt: string;
  readonly traceId?: string;
}

