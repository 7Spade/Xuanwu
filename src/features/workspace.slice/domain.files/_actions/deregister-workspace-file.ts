import { deleteWorkspaceFile as deleteFileFacade } from '@/shared-infra/firebase-client/firestore/firestore.facade'
import { commandFailureFrom, commandSuccess, type CommandResult } from '@/shared-kernel'

export async function deregisterWorkspaceFile(
  workspaceId: string,
  fileId: string
): Promise<CommandResult> {
  try {
    await deleteFileFacade(workspaceId, fileId)
    return commandSuccess(fileId, Date.now())
  } catch (err) {
    return commandFailureFrom(
      'DEREGISTER_WORKSPACE_FILE_FAILED',
      err instanceof Error ? err.message : 'Failed to deregister workspace file'
    )
  }
}
