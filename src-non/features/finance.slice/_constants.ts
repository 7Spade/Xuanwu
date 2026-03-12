/**
 * Module: _constants.ts
 * Purpose: Finance constants compatibility shim.
 * Responsibilities: re-export canonical finance constants from shared-kernel.
 * Constraints: deterministic logic, respect module boundaries
 */

export {
  FINANCE_LIFECYCLE_STAGES,
  NON_TASK_COST_ITEM_TYPES,
} from '@/shared-kernel';
