/**
 * Module: tasks-view/_projector.ts
 * Purpose: Tasks list read model projection [D27-Order]
 * Responsibilities: Maintain task list ordered by createdAt (inter-batch) then sourceIntentIndex (intra-batch)
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.tasks-view — _projector.ts
 *
 * Tasks list read model [D27-Order]. Standard projection (SLA ≤ 10s).
 *
 * Per 01-logical-flow.md (PROJ_BUS STD_PROJ):
 *   TASK_V["projection.tasks-view
 *     任務清單（createdAt 批次間
 *     → sourceIntentIndex 批次內）[D27-Order]
 *     applyVersionGuard() [S2]"]
 *
 * Stored at: tasksView/{workspaceId}/tasks/{taskId}
 *
 * [S2] SK_VERSION_GUARD applied before every write.
 * [R8] traceId from the originating EventEnvelope propagated.
 */

import { getDocument } from '@/shared-infra/firebase-client/firestore/firestore.read.adapter';
import {
  setDocument,
  serverTimestamp,
} from '@/shared-infra/firebase-client/firestore/firestore.write.adapter';
import { versionGuardAllows } from '@/shared-kernel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus =
  | 'IN_PROGRESS'
  | 'PENDING_QUALITY'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'BLOCKED';

export interface TaskViewEntry {
  taskId: string;
  workspaceId: string;
  title: string;
  status: TaskStatus;
  /** Inter-batch ordering: creation timestamp epoch ms [D27-Order] */
  createdAt: number;
  /** Intra-batch ordering: position within the parsed document batch [D27-Order] */
  sourceIntentIndex?: number;
  /** Semantic tag slug for skill matching */
  semanticTagSlug?: string;
  assignedMemberIds: string[];
  /** Last aggregate version processed [S2] */
  lastProcessedVersion: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

function docPath(workspaceId: string, taskId: string): string {
  return `tasksView/${workspaceId}/tasks/${taskId}`;
}

/**
 * Upsert a task into the tasks-view projection [D27-Order].
 * [S2] versionGuardAllows enforced before write.
 * [R8] traceId forwarded from EventEnvelope.
 */
export async function applyTaskUpserted(
  entry: Omit<TaskViewEntry, 'updatedAt' | 'lastProcessedVersion'> & {
    aggregateVersion: number;
    traceId?: string;
  }
): Promise<void> {
  const { aggregateVersion, traceId, ...fields } = entry;
  const existing = await getDocument<TaskViewEntry>(docPath(fields.workspaceId, fields.taskId));

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  await setDocument(docPath(fields.workspaceId, fields.taskId), {
    ...fields,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update task status in the projection (e.g., on state transitions).
 * [S2] versionGuardAllows enforced before write.
 */
export async function applyTaskStatusChanged(
  workspaceId: string,
  taskId: string,
  status: TaskStatus,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<TaskViewEntry>(docPath(workspaceId, taskId));
  if (!existing) return;

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing.lastProcessedVersion,
    })
  ) {
    return;
  }

  await setDocument(docPath(workspaceId, taskId), {
    ...existing,
    status,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}
