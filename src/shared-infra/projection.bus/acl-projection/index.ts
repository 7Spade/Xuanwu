/**
 * Module: acl-projection/index.ts
 * Purpose: ACL projection public API [D31]
 * Responsibilities: Export projector and queries for the ACL read-path permission mirror
 * Constraints: deterministic logic, respect module boundaries
 */

/**
 * projection.acl-projection — Public API [D31]
 *
 * ACL read-path permission mirror. CRITICAL projection (SLA ≤ 500ms).
 * CBG_AUTH permission change events → L5 sync update.
 * QRY_API_GW read auto-JOIN filter.
 */

export { applyAclPermissionChanged, applyAclPermissionRevoked } from './_projector';
export type { AclProjectionEntry, AclPermission } from './_projector';

export { getAclProjectionEntry, hasAclPermission } from './_queries';
