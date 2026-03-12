/**
 * finance.slice — VS9 Finance Slice Public API
 *
 * Vertical slice for the finance bounded context.
 * Covers: Finance lifecycle (claim preparation → payment), finance aggregate state,
 *         strong-read consistency, and claim cycle management.
 *
 * External consumers import exclusively from this file.
 */

// =================================================================
// Components
// =================================================================
export { WorkspaceFinance } from './_components/finance-view';

// =================================================================
// Actions
// =================================================================
export { saveFinanceAggregateState } from './_actions';

// =================================================================
// Queries
// =================================================================
export { getFinanceAggregateState } from './_queries';

// =================================================================
// Types
// =================================================================
export type { FinanceAggregateState, FinanceLifecycleStage, FinanceDirectiveItem, FinanceClaimLineItem, FinanceStrongReadSnapshot } from './_types';
