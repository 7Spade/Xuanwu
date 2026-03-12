/**
 * Module: workspace.ts
 * Purpose: Centralized workspace core domain type definitions.
 * Responsibilities: Workspace entity, lifecycle state, address, personnel, capability types.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel';

import type { WorkspaceFile } from './workspace-file';
import type { WorkspaceGrant } from './workspace-role';
import type { WorkspaceIssue } from './workspace-issue';
import type { WorkspaceTask } from './workspace-task';

export type WorkspaceLifecycleState = 'preparatory' | 'active' | 'stopped';

/** Designated role-holders for a workspace (經理/督導/安衛). */
export interface WorkspacePersonnel {
  managerId?: string;
  supervisorId?: string;
  safetyOfficerId?: string;
}

export interface CapabilitySpec {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data' | 'governance' | 'monitoring';
  status: 'stable' | 'beta';
  description: string;
}

export interface Capability extends CapabilitySpec {
  config?: object;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  details?: string;
}

/**
 * WorkspaceLocation — a sub-location within a workspace (廠區子地點).
 * Per docs/prd-schedule-workforce-skills.md FR-L1/FR-L2/FR-L3.
 * Workspace OWNER can create/edit/delete sub-locations.
 */
export interface WorkspaceLocation {
  locationId: string;
  label: string;
  description?: string;
  capacity?: number;
}

export interface Workspace {
  id: string;
  dimensionId: string;
  name: string;
  photoURL?: string;
  lifecycleState: WorkspaceLifecycleState;
  visibility: 'visible' | 'hidden';
  scope: string[];
  protocol: string;
  capabilities: Capability[];
  grants: WorkspaceGrant[];
  teamIds: string[];
  tasks?: Record<string, WorkspaceTask>;
  issues?: Record<string, WorkspaceIssue>;
  files?: Record<string, WorkspaceFile>;
  address?: Address;
  /** Sub-locations within this workspace (廠區子地點). FR-L1. */
  locations?: WorkspaceLocation[];
  /** Designated role-holders (經理 | 督導 | 安衛). */
  personnel?: WorkspacePersonnel;
  createdAt: Timestamp;
}

