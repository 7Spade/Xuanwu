/**
 * Module: audit-log.ts
 * Purpose: Centralized audit log domain type definitions.
 * Responsibilities: AuditLog entity and AuditLogType for governance and compliance tracking.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel';

export type AuditLogType = 'create' | 'update' | 'delete' | 'security';

export interface AuditLog {
  id: string;
  accountId: string;
  workspaceId?: string;
  workspaceName?: string;
  recordedAt: Timestamp;
  actor: string;
  actorId?: string;
  action: string;
  target: string;
  type: AuditLogType;
  metadata?: {
    before?: unknown;
    after?: unknown;
    ip?: string;
  };
}

