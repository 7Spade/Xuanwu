/**
 * src/shared/infra/storage/storage.adapter.ts
 *
 * StorageAdapter — Infrastructure adapter for file storage.
 *
 * [D24] Sole legitimate file-storage call site for feature slices.
 *       All SDK access is delegated to the firebase-client storage adapters;
 *       this class does NOT import firebase/storage directly.
 * [D25] Implements IFileStore port so feature slices depend only on the port interface.
 *
 * Per docs/architecture/README.md:
 *   Infrastructure Layer implements port interfaces.
 *   Application Layer MUST NOT import firebase/* directly — use port adapters.
 */

import type { IFileStore, UploadOptions } from '@/shared-kernel';
import { storageAdapter as firebaseStorageAdapter } from '@/shared-infra/firebase-client/storage/storage.adapter';

/**
 * StorageAdapter — DDD infrastructure adapter that implements IFileStore.
 *
 * Delegates all Firebase Storage SDK calls to the firebase-client storage adapter
 * to ensure no direct firebase/storage SDK imports in higher layers.
 */
export class StorageAdapter implements IFileStore {
  async upload(path: string, file: File | Blob, options?: UploadOptions): Promise<string> {
    return firebaseStorageAdapter.upload(path, file, options);
  }

  async getDownloadURL(path: string): Promise<string> {
    return firebaseStorageAdapter.getDownloadURL(path);
  }

  async deleteFile(path: string): Promise<void> {
    return firebaseStorageAdapter.deleteFile(path);
  }
}

export const storageAdapter: IFileStore = new StorageAdapter();
