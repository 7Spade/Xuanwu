import { uploadWorkspaceDocument } from '@/shared-infra/firebase-client/storage/storage.facade'

export async function uploadRawFile(
  workspaceId: string,
  fileId: string,
  versionId: string,
  file: File
): Promise<{ downloadURL: string; storagePath: string }> {
  return uploadWorkspaceDocument(workspaceId, fileId, versionId, file)
}
