/**
 * Module: tasks-view/_queries.ts
 * Purpose: Read queries for the tasks-view projection [D27-Order]
 * Responsibilities: Retrieve tasks ordered by createdAt + sourceIntentIndex
 * Constraints: deterministic logic, respect module boundaries
 */

import { db } from '@/shared-infra/frontend-firebase';
import {
  collection,
  getDocs,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';
import { getDocument } from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';

import type { TaskViewEntry, TaskStatus } from './_projector';

/**
 * Get a single task view entry by workspaceId + taskId.
 */
export async function getTaskViewEntry(
  workspaceId: string,
  taskId: string
): Promise<TaskViewEntry | null> {
  return getDocument<TaskViewEntry>(`tasksView/${workspaceId}/tasks/${taskId}`);
}

/**
 * Get all tasks in a workspace, ordered per [D27-Order]:
 * - Primary: createdAt ascending (inter-batch)
 * - Secondary: sourceIntentIndex ascending (intra-batch)
 *
 * NOTE: Ordering is applied client-side. For production scale, add a Firestore
 * composite index on (createdAt ASC, sourceIntentIndex ASC) and use Firestore
 * orderBy clauses to push ordering to the server.
 */
export async function getTasksView(workspaceId: string): Promise<TaskViewEntry[]> {
  const q = query(collection(db, `tasksView/${workspaceId}/tasks`));
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as TaskViewEntry);
  return tasks.slice().sort((a: TaskViewEntry, b: TaskViewEntry) => {
    const dateDiff = a.createdAt - b.createdAt;
    if (dateDiff !== 0) return dateDiff;
    return (a.sourceIntentIndex ?? 0) - (b.sourceIntentIndex ?? 0);
  });
}

/**
 * Get tasks filtered by status.
 */
export async function getTasksViewByStatus(
  workspaceId: string,
  status: TaskStatus
): Promise<TaskViewEntry[]> {
  const all = await getTasksView(workspaceId);
  return all.filter((t) => t.status === status);
}
