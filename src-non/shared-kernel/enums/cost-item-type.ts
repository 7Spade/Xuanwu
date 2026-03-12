/**
 * Module: cost-item-type.ts
 * Purpose: Canonical cost item semantic category values.
 * Responsibilities: define stable runtime values for cost-item semantic classification.
 * Constraints: deterministic logic, respect module boundaries
 */

export const CostItemType = {
  EXECUTABLE: 'EXECUTABLE',
  MANAGEMENT: 'MANAGEMENT',
  RESOURCE: 'RESOURCE',
  FINANCIAL: 'FINANCIAL',
  PROFIT: 'PROFIT',
  ALLOWANCE: 'ALLOWANCE',
} as const;

export type CostItemType = (typeof CostItemType)[keyof typeof CostItemType];
export type CostItemTypeValue = CostItemType;
