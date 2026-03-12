/**
 * Module: acl-projection/_queries.ts
 * Purpose: Read queries for the ACL projection [D31]
 * Responsibilities: Provide QRY_API_GW auto-JOIN filtering lookups
 * Constraints: deterministic logic, respect module boundaries
 */

import { getDocument } from '@/shared-infra/firebase-client/firestore/firestore.read.adapter';

import type { AclProjectionEntry, AclPermission } from './_projector';

// Module-level constant avoids repeated object allocation on every hasAclPermission call.
const PERMISSION_RANK: Record<AclPermission, number> = {
  none: 0,
  read: 1,
  write: 2,
  admin: 3,
};

/**
 * Get the ACL entry for a subject/resource pair [D31].
 * Returns null if no entry exists (treat as 'none' permission).
 */
export async function getAclProjectionEntry(
  subjectId: string,
  resourceId: string
): Promise<AclProjectionEntry | null> {
  return getDocument<AclProjectionEntry>(`aclProjection/${subjectId}_${resourceId}`);
}

/**
 * Check whether a subject has at least the given permission on a resource [D31].
 * Used by QRY_API_GW auto-JOIN filtering.
 */
export async function hasAclPermission(
  subjectId: string,
  resourceId: string,
  requiredPermission: AclPermission
): Promise<boolean> {
  const entry = await getAclProjectionEntry(subjectId, resourceId);
  if (!entry || entry.permission === 'none') return false;

  return PERMISSION_RANK[entry.permission] >= PERMISSION_RANK[requiredPermission];
}
