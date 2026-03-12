/**
 * Module: i-file-store.ts
 * Purpose: define SK_PORTS file storage interface in shared-kernel
 * Responsibilities: abstract file upload, retrieval, and deletion operations
 * Constraints: deterministic logic, respect module boundaries
 */

export interface UploadOptions {
  readonly contentType?: string;
}

export interface IFileStore {
  upload(path: string, file: File | Blob, options?: UploadOptions): Promise<string>;
  getDownloadURL(path: string): Promise<string>;
  /** @deprecated Use delete(url) to align with L9 StorageAdapter spec. */
  deleteFile(path: string): Promise<void>;
  /**
   * Delete a file by its download URL (L9 StorageAdapter alignment).
   * Per docs/architecture/guidelines/infrastructure-spec.md §6 StorageAdapter.
   */
  delete(url: string): Promise<void>;
  /**
   * Generate a short-lived pre-signed upload URL for direct client-side upload.
   * TTL: 15 minutes. Per docs/architecture/guidelines/infrastructure-spec.md §6.
   *
   * @param path - Storage path for the uploaded file.
   * @param contentType - MIME type of the file to be uploaded.
   * @returns A time-limited pre-signed URL the client can PUT to directly.
   */
  presignUploadUrl(path: string, contentType: string): Promise<string>;
}
