import { uploadDailyPhoto as uploadDailyPhotoFacade } from '@/shared-infra/firebase-client/storage/storage.facade'

export async function uploadDailyPhoto(
  accountId: string,
  workspaceId: string,
  file: File
): Promise<string> {
  return uploadDailyPhotoFacade(accountId, workspaceId, file)
}
