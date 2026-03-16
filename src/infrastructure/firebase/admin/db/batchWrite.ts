/**
 * Server-side Firestore batch writer.
 *
 * Aggregates writes and flushes them as a single atomic Firestore batch
 * (or a sequence of batches when the 500-operation limit is reached).
 *
 * Cost strategy:
 *   - Buffer writes in memory instead of writing each document individually.
 *   - Flush explicitly via `flush()` or after a configurable delay via
 *     `scheduleFlush()`.
 *   - This pattern reduces the total number of Firestore write operations,
 *     which directly reduces cost and avoids per-document write contention.
 *
 * Only use this module in Server Actions or Route Handlers.
 */

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { WriteBatch, DocumentReference } from "firebase-admin/firestore";
import { getAdminApp } from "../index";

/** Maximum operations per Firestore batch (hard limit: 500). */
const BATCH_SIZE_LIMIT = 490;

export type WriteOperation =
  | { type: "set"; ref: DocumentReference; data: Record<string, unknown>; merge?: boolean }
  | { type: "update"; ref: DocumentReference; data: Record<string, unknown> }
  | { type: "delete"; ref: DocumentReference };

/**
 * Returns the server-side Firestore Admin client.
 */
export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

/**
 * Commits an array of write operations as one or more Firestore batches.
 * Automatically splits operations into chunks of `BATCH_SIZE_LIMIT` to
 * stay within the 500-operation limit.
 *
 * @returns The number of batches committed.
 */
export async function commitBatch(operations: WriteOperation[]): Promise<number> {
  const db = getAdminFirestore();
  const chunks: WriteOperation[][] = [];

  for (let i = 0; i < operations.length; i += BATCH_SIZE_LIMIT) {
    chunks.push(operations.slice(i, i + BATCH_SIZE_LIMIT));
  }

  for (const chunk of chunks) {
    const batch: WriteBatch = db.batch();
    for (const op of chunk) {
      if (op.type === "set") {
        batch.set(op.ref, op.data, op.merge ? { merge: true } : {});
      } else if (op.type === "update") {
        batch.update(op.ref, op.data);
      } else {
        batch.delete(op.ref);
      }
    }
    await batch.commit();
  }

  return chunks.length;
}

// Re-export FieldValue so callers don't need a direct firebase-admin import.
export { FieldValue };
