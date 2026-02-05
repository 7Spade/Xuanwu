/**
 * Storage Adapter
 * Wrapper for Firebase Storage operations
 * 
 * @layer Infrastructure
 * @package @angular/fire/storage
 * @responsibility File upload, download, and management
 */
import { inject, Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadTask,
  UploadMetadata
} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';

/**
 * Storage Adapter
 * Provides file storage operations using Firebase Storage
 * 
 * @example
 * ```typescript
 * // Upload a file
 * this.storageAdapter.uploadFile('images/profile.jpg', file).subscribe(url => {
 *   console.log('File uploaded:', url);
 * });
 * 
 * // Download URL
 * this.storageAdapter.getDownloadURL('images/profile.jpg').subscribe(url => {
 *   console.log('Download URL:', url);
 * });
 * 
 * // Delete file
 * this.storageAdapter.deleteFile('images/profile.jpg').subscribe(() => {
 *   console.log('File deleted');
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class StorageAdapter {
  private readonly storage = inject(Storage);

  /**
   * Upload a file to Firebase Storage
   * @param path - Storage path (e.g., 'images/profile.jpg')
   * @param file - File or Blob to upload
   * @param metadata - Optional upload metadata
   * @returns Observable of download URL
   */
  uploadFile(
    path: string,
    file: File | Blob,
    metadata?: UploadMetadata
  ): Observable<string> {
    const storageRef = ref(this.storage, path);
    return from(
      uploadBytes(storageRef, file, metadata).then(() => getDownloadURL(storageRef))
    );
  }

  /**
   * Upload a file with progress tracking
   * Use this for large files to show upload progress
   * 
   * @param path - Storage path
   * @param file - File or Blob to upload
   * @param metadata - Optional upload metadata
   * @returns UploadTask for progress monitoring
   */
  uploadFileWithProgress(
    path: string,
    file: File | Blob,
    metadata?: UploadMetadata
  ): UploadTask {
    const storageRef = ref(this.storage, path);
    return uploadBytesResumable(storageRef, file, metadata);
  }

  /**
   * Get the download URL for a file
   * @param path - Storage path
   * @returns Observable of download URL
   */
  getDownloadURL(path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    return from(getDownloadURL(storageRef));
  }

  /**
   * Delete a file from storage
   * @param path - Storage path
   * @returns Observable of void
   */
  deleteFile(path: string): Observable<void> {
    const storageRef = ref(this.storage, path);
    return from(deleteObject(storageRef));
  }

  /**
   * List all files in a directory
   * @param path - Storage directory path
   * @returns Observable of storage references
   */
  listFiles(path: string): Observable<StorageReference[]> {
    const storageRef = ref(this.storage, path);
    return from(
      listAll(storageRef).then(result => result.items)
    );
  }

  /**
   * Get a storage reference
   * @param path - Storage path
   * @returns StorageReference
   */
  getStorageRef(path: string): StorageReference {
    return ref(this.storage, path);
  }
}
