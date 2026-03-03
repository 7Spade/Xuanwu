/**
 * @fileoverview workspace-business.files — Firestore CRUD actions.
 *
 * Wraps createWorkspaceFile, addWorkspaceFileVersion, and
 * restoreWorkspaceFileVersion so that UI components (files-view.tsx) do not
 * import from @/shared/infra directly.
 *
 * [D3]  All mutations live here — not in _components/.
 * [D5]  UI components must not import src/shared/infra; use this module.
 */

import {
  createWorkspaceFile as createFileFacade,
  addWorkspaceFileVersion as addVersionFacade,
  restoreWorkspaceFileVersion as restoreVersionFacade,
} from '@/shared/infra/firestore/firestore.facade';
import { serverTimestamp } from '@/shared/infra/firestore/firestore.write.adapter';
import type { WorkspaceFile, WorkspaceFileVersion } from '@/shared/types';

export type CreateWorkspaceFileInput = Omit<WorkspaceFile, 'id' | 'updatedAt'>;

/**
 * Creates a new file document in the workspace files subcollection.
 * Adds a server-generated `updatedAt` sentinel automatically so that UI
 * components do not need to import `serverTimestamp` from the infra layer.
 *
 * @param workspaceId The ID of the workspace.
 * @param fileData    File metadata without `id` or `updatedAt`.
 * @returns           The Firestore document ID of the newly created file.
 */
export async function createWorkspaceFile(
  workspaceId: string,
  fileData: CreateWorkspaceFileInput
): Promise<string> {
  return createFileFacade(workspaceId, {
    ...fileData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Appends a new version to an existing workspace file and marks it as current.
 *
 * @param workspaceId      The ID of the workspace.
 * @param fileId           The ID of the file document.
 * @param version          The new version object to append.
 * @param currentVersionId The versionId to mark as the active version.
 */
export async function addWorkspaceFileVersion(
  workspaceId: string,
  fileId: string,
  version: WorkspaceFileVersion,
  currentVersionId: string
): Promise<void> {
  return addVersionFacade(workspaceId, fileId, version, currentVersionId);
}

/**
 * Restores a workspace file to a specific past version by updating
 * `currentVersionId`.
 *
 * @param workspaceId The ID of the workspace.
 * @param fileId      The ID of the file document.
 * @param versionId   The versionId to restore as the active version.
 */
export async function restoreWorkspaceFileVersion(
  workspaceId: string,
  fileId: string,
  versionId: string
): Promise<void> {
  return restoreVersionFacade(workspaceId, fileId, versionId);
}
