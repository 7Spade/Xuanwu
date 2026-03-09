import { getWorkspaceFiles as getWorkspaceFilesFacade } from '@/shared-infra/frontend-firebase/firestore/firestore.facade'

import type { WorkspaceFile } from '../_types'

export async function getWorkspaceFiles(workspaceId: string): Promise<WorkspaceFile[]> {
  return getWorkspaceFilesFacade(workspaceId)
}
