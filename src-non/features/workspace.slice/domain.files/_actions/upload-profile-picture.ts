import { uploadProfilePicture as uploadProfilePictureFacade } from '@/shared-infra/firebase-client/storage/storage.facade'

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  return uploadProfilePictureFacade(userId, file)
}
