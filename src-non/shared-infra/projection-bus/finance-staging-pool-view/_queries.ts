/**
 * Module: finance-staging-pool/_queries.ts
 * Purpose: Read queries for the finance staging pool [#A20]
 * Responsibilities: Retrieve accepted-but-unbilled tasks for finance processing
 * Constraints: deterministic logic, respect module boundaries
 */

import { db } from '@/shared-infra/firebase-client';
import {
  collection,
  getDocs,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from '@/shared-infra/firebase-client/firestore/firestore.read.adapter';

import type { FinanceStagingEntry, FinanceStagingStatus } from './_projector';

/**
 * Get all tasks in the finance staging pool for an org [#A20].
 */
export async function getFinanceStagingPool(orgId: string): Promise<FinanceStagingEntry[]> {
  const q = query(collection(db, `financeStagingPool/${orgId}/items`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as FinanceStagingEntry);
}

/**
 * Get staging pool items filtered by status.
 */
export async function getFinanceStagingByStatus(
  orgId: string,
  status: FinanceStagingStatus
): Promise<FinanceStagingEntry[]> {
  const all = await getFinanceStagingPool(orgId);
  return all.filter((e) => e.status === status);
}

/**
 * Get only PENDING items (not yet claimed by a Finance_Request).
 */
export async function getPendingFinanceStagingItems(orgId: string): Promise<FinanceStagingEntry[]> {
  return getFinanceStagingByStatus(orgId, 'PENDING');
}
