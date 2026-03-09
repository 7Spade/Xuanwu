/**
 * Module: task-finance-label-view/_queries.ts
 * Purpose: Read queries for the task finance label view [#A22]
 * Responsibilities: Retrieve finance display labels for tasks
 * Constraints: deterministic logic, respect module boundaries
 */

import { getDocument } from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';
import type { TaskFinanceLabelEntry } from './_projector';

/**
 * Get the finance label for a task [#A22].
 */
export async function getTaskFinanceLabel(
  taskId: string
): Promise<TaskFinanceLabelEntry | null> {
  return getDocument<TaskFinanceLabelEntry>(`taskFinanceLabelView/${taskId}`);
}

/**
 * Get finance labels for multiple tasks in one batch-friendly call.
 */
export async function getTaskFinanceLabels(
  taskIds: string[]
): Promise<Map<string, TaskFinanceLabelEntry>> {
  const results = await Promise.all(taskIds.map((id) => getTaskFinanceLabel(id)));
  const map = new Map<string, TaskFinanceLabelEntry>();
  results.forEach((entry, idx) => {
    if (entry) map.set(taskIds[idx], entry);
  });
  return map;
}
