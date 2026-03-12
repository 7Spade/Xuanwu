import { restoreWorkspaceFileVersion as restoreVersionFacade } from '@/shared-infra/firebase-client/firestore/firestore.facade'
import { commandFailureFrom, commandSuccess, type CommandResult } from '@/shared-kernel'

export async function restoreWorkspaceFileVersion(
  workspaceId: string,
  fileId: string,
  versionId: string
): Promise<CommandResult> {
  try {
    await restoreVersionFacade(workspaceId, fileId, versionId)
    return commandSuccess(fileId, Date.now())
  } catch (err) {
    return commandFailureFrom(
      'RESTORE_WORKSPACE_FILE_VERSION_FAILED',
      err instanceof Error ? err.message : 'Failed to restore workspace file version'
    )
  }
}
