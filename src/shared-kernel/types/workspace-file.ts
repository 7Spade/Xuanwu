/**
 * Module: workspace-file.ts
 * Purpose: Centralized workspace file domain type definitions.
 * Responsibilities: WorkspaceFile entity and versioning structures.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { Timestamp } from '@/shared-kernel/ports';

export interface WorkspaceFileVersion {
  versionId: string;
  versionNumber: number;
  versionName: string;
  size: number;
  uploadedBy: string;
  createdAt: Timestamp | Date;
  downloadURL: string;
  storagePath?: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: string;
  currentVersionId: string;
  updatedAt: Timestamp | Date;
  versions: WorkspaceFileVersion[];
}

export type CreateWorkspaceFileInput = Omit<WorkspaceFile, 'id' | 'updatedAt'>;
