import { uploadTaskAttachment as uploadTaskAttachmentFacade } from '@/shared-infra/frontend-firebase/storage/storage.facade'

export async function uploadTaskAttachment(
  workspaceId: string,
  file: File
): Promise<string> {
  return uploadTaskAttachmentFacade(workspaceId, file)
}
