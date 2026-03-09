/**
 * Module: tasks-view/index.ts
 * Purpose: Tasks-view projection public API [D27-Order]
 * Responsibilities: Export projector and queries for the task list read model
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.tasks-view — Public API [D27-Order]
 *
 * Tasks list read model. Standard projection (SLA ≤ 10s).
 * Ordered by createdAt (inter-batch) → sourceIntentIndex (intra-batch).
 */

export { applyTaskUpserted, applyTaskStatusChanged } from './_projector';
export type { TaskViewEntry, TaskStatus } from './_projector';

export { getTaskViewEntry, getTasksView, getTasksViewByStatus } from './_queries';
