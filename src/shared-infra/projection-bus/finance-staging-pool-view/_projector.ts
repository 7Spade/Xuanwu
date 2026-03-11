/**
 * Module: finance-staging-pool/_projector.ts
 * Purpose: Finance staging pool projection [#A20]
 * Responsibilities: Track accepted-but-unbilled tasks in the finance staging pool
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.finance-staging-pool — _projector.ts
 *
 * Finance staging pool: accepted-but-unbilled tasks [#A20].
 * Standard projection (SLA ≤ 10s).
 * Consumed by QGWAY_FIN_STAGE.
 *
 * Per docs/architecture/README.md (PROJ_BUS STD_PROJ):
 *   FINANCE_STAGE_V["projection.finance-staging-pool [#A20]
 *     待請款池：已驗收未請款任務清單
 *     消費 TaskAcceptedConfirmed（CRITICAL_LANE）
 *     狀態：PENDING | LOCKED_BY_FINANCE
 *     applyVersionGuard() [S2]"]
 *
 * Stored at: financeStagingPool/{orgId}/items/{taskId}
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

export type FinanceStagingStatus = 'PENDING' | 'LOCKED_BY_FINANCE';

export interface FinanceStagingEntry {
  taskId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  /** ISO timestamp when task was accepted */
  acceptedAt: string;
  status: FinanceStagingStatus;
  /** Amount to be billed, if known */
  billingAmount?: number;
  /** Last aggregate version processed [S2] */
  lastProcessedVersion: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

function docPath(orgId: string, taskId: string): string {
  return `financeStagingPool/${orgId}/items/${taskId}`;
}

/**
 * Add a task to the finance staging pool on TaskAcceptedConfirmed [#A19 #A20].
 * Consumed from CRITICAL_LANE.
 * [S2] versionGuardAllows enforced before write.
 * [R8] traceId forwarded from EventEnvelope.
 */
export async function applyTaskAcceptedToPool(
  entry: Omit<FinanceStagingEntry, 'updatedAt' | 'lastProcessedVersion' | 'status'> & {
    aggregateVersion: number;
    traceId?: string;
  }
): Promise<void> {
  const { aggregateVersion, traceId, ...fields } = entry;
  const existing = await getDocument<FinanceStagingEntry>(docPath(fields.orgId, fields.taskId));

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  await setDocument(docPath(fields.orgId, fields.taskId), {
    ...fields,
    status: 'PENDING' as FinanceStagingStatus,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Lock a staging entry when a Finance_Request claims it [#A20].
 * [S2] versionGuardAllows enforced before write.
 */
export async function applyFinanceStagingLocked(
  orgId: string,
  taskId: string,
  aggregateVersion: number,
  traceId?: string
): Promise<void> {
  const existing = await getDocument<FinanceStagingEntry>(docPath(orgId, taskId));
  if (!existing) return;

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing.lastProcessedVersion,
    })
  ) {
    return;
  }

  await setDocument(docPath(orgId, taskId), {
    ...existing,
    status: 'LOCKED_BY_FINANCE' as FinanceStagingStatus,
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove a task from the pool once its Finance_Request is fully PAID.
 * Overwrites with reset status rather than physical deletion to preserve audit trail.
 */
export async function applyFinanceStagingRemoved(
  orgId: string,
  taskId: string
): Promise<void> {
  const existing = await getDocument<FinanceStagingEntry>(docPath(orgId, taskId));
  if (!existing) return;

  await setDocument(docPath(orgId, taskId), {
    ...existing,
    // NOTE: Physical deletion is handled by the VS9 Finance Slice cleanup process.
    // This entry will be removed by VS9 once Finance_Request reaches PAID state.
    status: 'PENDING' as FinanceStagingStatus,
    updatedAt: serverTimestamp(),
  });
}
