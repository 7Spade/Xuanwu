/**
 * Module: workforce-scheduling-query
 * Purpose: VS6 scheduling read adapters behind the L6 query gateway boundary.
 * Responsibilities: Centralize Firebase/projection reads for schedule and timeline views.
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  getOrgMemberEligibilityWithTier,
  getOrgEligibleMembersWithTier,
  type OrgEligibleMemberView,
  type OrgMemberSkillWithTier,
} from '@/shared-infra/projection.bus';
import { db } from '@/shared-infra/frontend-firebase';
import { fetchScheduleItems } from '@/shared-infra/frontend-firebase/firestore/firestore.facade';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';
import { getDocument } from '@/shared-infra/frontend-firebase/firestore/firestore.read.adapter';
import type { ScheduleItem, ScheduleStatus } from '@/shared-kernel';

export async function getScheduleItemsFromGateway(
  accountId: string,
  workspaceId?: string,
): Promise<ScheduleItem[]> {
  return fetchScheduleItems(accountId, workspaceId);
}

export async function getOrgScheduleItemFromGateway(
  orgId: string,
  scheduleItemId: string,
): Promise<ScheduleItem | null> {
  return getDocument<ScheduleItem>(`accounts/${orgId}/schedule_items/${scheduleItemId}`);
}

export async function getDocumentByPathFromGateway<TData>(path: string): Promise<TData | null> {
  return getDocument<TData>(path);
}

export function subscribeToOrgScheduleProposalsFromGateway(
  orgId: string,
  onUpdate: (items: ScheduleItem[]) => void,
  opts?: { status?: ScheduleStatus; maxItems?: number },
): Unsubscribe {
  const ref = collection(db, `accounts/${orgId}/schedule_items`);
  const constraints: Parameters<typeof query>[1][] = [orderBy('createdAt', 'desc')];
  if (opts?.status) constraints.push(where('status', '==', opts.status));
  if (opts?.maxItems) constraints.push(limit(opts.maxItems));
  const q = query(ref, ...constraints);
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ScheduleItem)));
  });
}

export async function getAccountScheduleProjectionRawFromGateway(
  accountId: string,
): Promise<Record<string, unknown> | null> {
  return getDocument<Record<string, unknown>>(`scheduleProjection/${accountId}`);
}

export async function getEligibleMemberForScheduleFromGateway(
  orgId: string,
  accountId: string,
): Promise<OrgEligibleMemberView | null> {
  return getOrgMemberEligibilityWithTier(orgId, accountId);
}

export async function getEligibleMembersForScheduleFromGateway(
  orgId: string,
): Promise<OrgEligibleMemberView[]> {
  return getOrgEligibleMembersWithTier(orgId);
}

export function subscribeToWorkspaceScheduleItemsFromGateway(
  dimensionId: string,
  workspaceId: string,
  onUpdate: (items: ScheduleItem[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'accounts', dimensionId, 'schedule_items'),
    where('workspaceId', '==', workspaceId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ScheduleItem)),
    (err) => onError?.(err),
  );
}

export function subscribeToWorkspaceTimelineItemsFromGateway(
  accountId: string,
  workspaceId: string,
  onUpdate: (items: ScheduleItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'accounts', accountId, 'schedule_items'),
    where('workspaceId', '==', workspaceId),
    orderBy('startDate', 'asc'),
  );

  return onSnapshot(
    q,
    (snapshot) =>
      onUpdate(
        snapshot.docs.map((doc) => ({ ...(doc.data() as Omit<ScheduleItem, 'id'>), id: doc.id } as ScheduleItem)),
      ),
    (error) => onError?.(error as Error),
  );
}

export type { OrgEligibleMemberView, OrgMemberSkillWithTier };
