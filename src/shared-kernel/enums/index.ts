/**
 * Module: index.ts
 * Purpose: Barrel exports for shared-kernel enum-like runtime lists.
 * Responsibilities: provide a stable entrypoint for iterable enum values.
 * Constraints: deterministic logic, respect module boundaries
 */

export { OUTBOX_LANES } from './outbox-lane';
export { CostItemType } from './cost-item-type';
export type { CostItemTypeValue } from './cost-item-type';
