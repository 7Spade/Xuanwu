/**
 * Module: workspace-role.ts
 * Purpose: Centralized workspace role and grant domain type definitions.
 * Responsibilities: WorkspaceRole and WorkspaceGrant access control types.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel/ports';

export type WorkspaceRole = 'Manager' | 'Contributor' | 'Viewer';

export interface WorkspaceGrant {
  grantId: string;
  userId: string;
  role: WorkspaceRole;
  protocol: string;
  status: 'active' | 'revoked' | 'expired';
  grantedAt: Timestamp;
  revokedAt?: Timestamp;
  expiresAt?: Timestamp;
}
