/**
 * Module: task-finance-label-view/index.ts
 * Purpose: Task finance label view projection public API [#A22]
 * Responsibilities: Export projector and queries for the task finance display labels
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.task-finance-label-view — Public API [#A22]
 *
 * Task finance display labels. Standard projection (SLA ≤ 10s).
 * Consumed from STANDARD_LANE on FinanceRequestStatusChanged events.
 */

export { applyFinanceLabelUpdated, applyTaskAcceptedLabel } from './_projector';
export type { TaskFinanceLabelEntry, FinanceLabelStatus } from './_projector';

export { getTaskFinanceLabel, getTaskFinanceLabels } from './_queries';
