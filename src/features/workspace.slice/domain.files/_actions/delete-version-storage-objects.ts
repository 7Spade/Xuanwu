import { deleteWorkspaceStorageObject } from '@/shared-infra/firebase-client/storage/storage.facade'

export async function deleteVersionStorageObjects(
  storagePaths: readonly string[]
): Promise<void> {
  for (const path of storagePaths) {
    if (!path) continue
    try {
      await deleteWorkspaceStorageObject(path)
    } catch {
      // Ignore not-found or stale paths to keep file deregistration resilient.
    }
  }
}
