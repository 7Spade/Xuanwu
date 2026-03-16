/**
 * Server-side Firebase Storage helpers.
 *
 * Provides privileged file operations via the firebase-admin Storage
 * service for use in Server Actions and Route Handlers.
 *
 * Use cases:
 *   - Generate signed URLs for client downloads (avoids exposing bucket paths)
 *   - Process or compress uploaded files server-side before serving
 *   - Delete files in response to domain events (e.g. user deletion)
 *   - Move / copy files between paths atomically
 *
 * Only use this module in Server Actions or Route Handlers.
 */

import { getStorage } from "firebase-admin/storage";
import { getAdminApp } from "../index";

/**
 * Returns the firebase-admin Storage bucket.
 * Uses the default bucket configured in the Firebase project.
 */
export function getAdminBucket() {
  const storage = getStorage(getAdminApp());
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  return bucketName ? storage.bucket(bucketName) : storage.bucket();
}

/**
 * Generates a signed download URL for a Storage object.
 * The URL expires after `expiresInMs` milliseconds (default: 1 hour).
 */
export async function generateSignedUrl(
  filePath: string,
  expiresInMs = 60 * 60 * 1000,
): Promise<string> {
  const file = getAdminBucket().file(filePath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  });
  return url;
}

/**
 * Deletes a file from Firebase Storage.
 * Silently ignores errors when the file does not exist.
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await getAdminBucket().file(filePath).delete();
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code !== 404) throw err;
  }
}

/**
 * Copies a file from `sourcePath` to `destPath` within the same bucket.
 */
export async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  await getAdminBucket()
    .file(sourcePath)
    .copy(getAdminBucket().file(destPath));
}
