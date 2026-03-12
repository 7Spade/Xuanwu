/**
 * Module: acl-projection/_projector.ts
 * Purpose: ACL read-path permission mirror [D31]
 * Responsibilities: Mirror CBG_AUTH permission changes into a read-side projection for QRY_API_GW auto-JOIN filtering
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.acl-projection — _projector.ts
 *
 * ACL read-path permission mirror [D31].
 * CRITICAL projection (SLA ≤ 500ms).
 *
 * Per 01-logical-flow.md [D31]:
 *   ACL_PROJ_V["projection.acl-projection [D31]
 *     讀取路徑權限鏡像
 *     CBG_AUTH 權限變更事件 → L5 同步更新
 *     QRY_API_GW 讀取自動 JOIN 過濾"]
 *
 * Stored at: aclProjection/{subjectId}_{resourceId}
 *
 * [S2] SK_VERSION_GUARD: versionGuardAllows enforced before every write.
 * [R8] traceId from the originating EventEnvelope is propagated.
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

export type AclPermission = 'read' | 'write' | 'admin' | 'none';

/** Serialisable record shape written to Firestore. */
type AclProjectionRecord = Omit<AclProjectionEntry, 'updatedAt'> & {
  updatedAt: ReturnType<typeof serverTimestamp>;
};

export interface AclProjectionEntry {
  /** Subject (accountId / userId) */
  subjectId: string;
  /** Resource being accessed (workspaceId, orgId, etc.) */
  resourceId: string;
  /** Resource type for context-scoped filtering */
  resourceType: 'workspace' | 'organization' | 'global';
  /** Effective permission at this resource */
  permission: AclPermission;
  /** Role tag slug that grants this permission, if any */
  roleTagSlug?: string;
  /** Last aggregate version processed [S2] */
  lastProcessedVersion: number;
  /** TraceId from the originating EventEnvelope [R8] */
  traceId?: string;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

function docPath(subjectId: string, resourceId: string): string {
  return `aclProjection/${subjectId}_${resourceId}`;
}

/**
 * Apply a permission grant/revoke event to the ACL projection [D31].
 * [S2] versionGuardAllows enforced before write.
 * [R8] traceId forwarded from EventEnvelope.
 */
export async function applyAclPermissionChanged(
  subjectId: string,
  resourceId: string,
  resourceType: AclProjectionEntry['resourceType'],
  permission: AclPermission,
  aggregateVersion: number,
  traceId?: string,
  roleTagSlug?: string
): Promise<void> {
  const existing = await getDocument<AclProjectionEntry>(docPath(subjectId, resourceId));

  if (
    !versionGuardAllows({
      eventVersion: aggregateVersion,
      viewLastProcessedVersion: existing?.lastProcessedVersion ?? 0,
    })
  ) {
    return;
  }

  const record: AclProjectionRecord = {
    subjectId,
    resourceId,
    resourceType,
    permission,
    ...(roleTagSlug ? { roleTagSlug } : {}),
    lastProcessedVersion: aggregateVersion,
    ...(traceId ? { traceId } : {}),
    updatedAt: serverTimestamp(),
  };

  await setDocument(docPath(subjectId, resourceId), record);
}

/**
 * Remove an ACL entry when access is fully revoked.
 */
export async function applyAclPermissionRevoked(
  subjectId: string,
  resourceId: string
): Promise<void> {
  // Set permission to 'none' rather than deleting — preserves audit trail.
  const existing = await getDocument<AclProjectionEntry>(docPath(subjectId, resourceId));
  if (!existing) return;

  await setDocument(docPath(subjectId, resourceId), {
    ...existing,
    permission: 'none' as AclPermission,
    updatedAt: serverTimestamp(),
  });
}
