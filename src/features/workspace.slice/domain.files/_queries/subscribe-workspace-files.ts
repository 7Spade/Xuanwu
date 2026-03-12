import { db } from '@/shared-infra/firebase-client'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from '@/shared-infra/firebase-client/firestore/firestore.read.adapter'

import type { WorkspaceFile } from '../_types'

export function subscribeToWorkspaceFiles(
  workspaceId: string,
  onUpdate: (files: WorkspaceFile[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'workspaces', workspaceId, 'files'),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snap) => {
    const files = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkspaceFile[]

    onUpdate(files)
  })
}
