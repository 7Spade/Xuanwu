/**
 * Module: task-finance-label-view/_projector.ts
 * Purpose: Task finance display label projection [#A22]
 * Responsibilities: Maintain finance status labels for tasks for UI display
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.task-finance-label-view — _projector.ts
 *
 * Task finance display labels [#A22]. Standard projection (SLA ≤ 10s).
 * Consumed by QGWAY_FIN_LABEL and task display UI.
 *
 * Per 01-logical-flow.md (PROJ_BUS STD_PROJ):
 *   TASK_FIN_LABEL_V["projection.task-finance-label-view [#A22]
 *     任務金融顯示標籤投影
 *     消費 FinanceRequestStatusChanged（STANDARD_LANE）
 *     欄位：taskId, financeStatus, requestId, requestLabel
 *     applyVersionGuard() [S2]"]
 *
 * Stored at: taskFinanceLabelView/{taskId}
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

export type FinanceLabelStatus =
  | 'ACCEPTED'
  | 'PENDING_BILLING'
  | 'REQUEST_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PAID'
  | 'REJECTED';

export interface TaskFinanceLabelEntry {
  taskId: string;
  /** Display status combining acceptance + finance state [#A22] */
  financeStatus: FinanceLabelStatus;
  /** Finance request ID if a request exists */
  requestId?: string;
  /** Human-readable label e.g. "REQ-001" [#A22] */
  requestLabel?: string;
  /** Last aggregate version processed [S2] */
  lastProcessedVersion: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

/**
 * Apply a FinanceRequestStatusChanged event to the label view [#A22].
 * Consumed from STANDARD_LANE.
 * [S2] versionGuardAllows enforced before write.
 * [R8] traceId forwarded from EventEnvelope.
 */
export async function applyFinanceLabelUpdated(
  taskId: string,
  financeStatus: FinanceLabelStatus,
  aggregateVersion: number,
  requestId?: string,
  requestLabel?: string,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<TaskFinanceLabelEntry>(`taskFinanceLabelView/${taskId}`);

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  await setDocument(`taskFinanceLabelView/${taskId}`, {
    taskId,
    financeStatus,
    ...(requestId ? { requestId } : {}),
    ...(requestLabel ? { requestLabel } : {}),
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Initialize the label view when a task is accepted (before any Finance_Request exists).
 * Sets initial status to 'ACCEPTED'.
 */
export async function applyTaskAcceptedLabel(
  taskId: string,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  return applyFinanceLabelUpdated(
    taskId,
    'ACCEPTED',
    aggregateVersion,
    undefined,
    undefined,
    traceId
  );
}
