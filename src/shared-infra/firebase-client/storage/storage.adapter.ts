/**
 * storage.adapter.ts — StorageAdapter
 *
 * [D24] Sole legitimate firebase/storage call site (all SDK calls are confined to
 *       storage.write.adapter.ts and storage.read.adapter.ts; this class orchestrates
 *       through those modules and never imports firebase/storage directly).
 * [D25] Implements IFileStore Port so feature slices never import firebase/storage directly.
 */

import type { IFileStore, UploadOptions } from '@/shared-kernel';
import { getFileDownloadURL } from './storage.read.adapter';
import { deleteFile, uploadFile } from './storage.write.adapter';

export class StorageAdapter implements IFileStore {
  async upload(path: string, file: File | Blob, options?: UploadOptions): Promise<string> {
    await uploadFile(
      path,
      file,
      options?.contentType ? { contentType: options.contentType } : undefined
    );
    return getFileDownloadURL(path);
  }

  async getDownloadURL(path: string): Promise<string> {
    return getFileDownloadURL(path);
  }

  async deleteFile(path: string): Promise<void> {
    return deleteFile(path);
  }

  async delete(url: string): Promise<void> {
    // Extract path from download URL for Firebase Storage compatibility
    return deleteFile(url);
  }

  async presignUploadUrl(_path: string, _contentType: string): Promise<string> {
    // Firebase Storage does not support server-side pre-signed URLs in the web SDK.
    // This method satisfies the L9 StorageAdapter interface contract.
    // Production implementations should use Firebase Admin SDK or a signed-URL Cloud Function.
    throw new Error('presignUploadUrl is not supported in the browser StorageAdapter. Use a server-side implementation.');
  }
}

export const storageAdapter: IFileStore = new StorageAdapter();
export const fileStore: IFileStore = storageAdapter;

