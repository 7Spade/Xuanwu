import { addWorkspaceFileVersion as addVersionFacade } from '@/shared-infra/firebase-client/firestore/firestore.facade'
import { commandFailureFrom, commandSuccess, type CommandResult } from '@/shared-kernel'

import type { WorkspaceFileVersion } from '../_types'

export async function addWorkspaceFileVersion(
  workspaceId: string,
  fileId: string,
  version: WorkspaceFileVersion,
  currentVersionId: string
): Promise<CommandResult> {
  try {
    await addVersionFacade(workspaceId, fileId, version, currentVersionId)
    return commandSuccess(fileId, Date.now())
  } catch (err) {
    return commandFailureFrom(
      'ADD_WORKSPACE_FILE_VERSION_FAILED',
      err instanceof Error ? err.message : 'Failed to add workspace file version'
    )
  }
}
