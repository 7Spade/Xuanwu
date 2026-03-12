/**
 * Module: semantic-taxonomy.ts
 * Purpose: Canonical semantic ontology vocabularies shared across slices.
 * Responsibilities: define stable search-domain and taxonomy-dimension concept sets.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  SearchDomain,
  TaxonomyDimension,
} from '@/shared-kernel';

export const SEARCH_DOMAINS: readonly SearchDomain[] = [
  'workspace',
  'member',
  'schedule',
  'tag',
  'skill',
  'organization',
  'document',
] as const;

export const TAXONOMY_DIMENSIONS: readonly TaxonomyDimension[] = [
  'skill',
  'location',
  'temporal',
  'organizational',
  'compliance',
] as const;

