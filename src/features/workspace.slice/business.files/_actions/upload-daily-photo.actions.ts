import { uploadDailyPhoto as uploadDailyPhotoFacade } from '@/shared-infra/frontend-firebase/storage/storage.facade'

export async function uploadDailyPhoto(
  accountId: string,
  workspaceId: string,
  file: File
): Promise<string> {
  return uploadDailyPhotoFacade(accountId, workspaceId, file)
}
