import { createWorkspaceFile as createFileFacade } from '@/shared-infra/firebase-client/firestore/firestore.facade'
import { serverTimestamp } from '@/shared-infra/firebase-client/firestore/firestore.write.adapter'
import { commandFailureFrom, commandSuccess, type CommandResult } from '@/shared-kernel'

import type { CreateWorkspaceFileInput } from '../_types'

export async function createWorkspaceFile(
  workspaceId: string,
  fileData: CreateWorkspaceFileInput
): Promise<CommandResult> {
  try {
    const fileId = await createFileFacade(workspaceId, {
      ...fileData,
      updatedAt: serverTimestamp(),
    })

    return commandSuccess(fileId, Date.now())
  } catch (err) {
    return commandFailureFrom(
      'CREATE_WORKSPACE_FILE_FAILED',
      err instanceof Error ? err.message : 'Failed to create workspace file'
    )
  }
}
