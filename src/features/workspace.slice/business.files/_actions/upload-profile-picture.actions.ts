import { uploadProfilePicture as uploadProfilePictureFacade } from '@/shared-infra/frontend-firebase/storage/storage.facade'

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  return uploadProfilePictureFacade(userId, file)
}
