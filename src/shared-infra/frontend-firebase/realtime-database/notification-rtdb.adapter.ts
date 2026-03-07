/**
 * Module: notification-rtdb.adapter.ts
 * Purpose: Provide RTDB-backed notification read/write operations
 * Responsibilities: subscribe notifications, create notification, mark read
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set,
  update,
  type DataSnapshot,
  type Unsubscribe,
} from 'firebase/database';

import type { Notification } from '@/shared-kernel';

import { rtdb } from './realtime-database.client';

export interface NotificationRecordInput {
  title: string;
  message: string;
  type: Notification['type'];
  sourceEvent: string;
  sourceId: string;
  workspaceId: string;
  traceId?: string;
  category?: 'system' | 'task' | 'permission';
  semanticType?: 'ACTION_REQUIRED' | 'INFO_ONLY';
}

interface NotificationStoredRecord extends NotificationRecordInput {
  read: boolean;
  timestamp: number;
  readAt?: number;
}

export interface NotificationViewModel extends Notification {
  category?: 'system' | 'task' | 'permission';
  semanticType?: 'ACTION_REQUIRED' | 'INFO_ONLY';
}

const notificationsPath = (accountId: string): string => `user-notifications/${accountId}`;

export function subscribeAccountNotifications(
  accountId: string,
  maxCount: number,
  onUpdate: (notifications: NotificationViewModel[]) => void,
): Unsubscribe {
  const q = query(
    ref(rtdb, notificationsPath(accountId)),
    orderByChild('timestamp'),
    limitToLast(maxCount),
  );

  return onValue(q, (snapshot: DataSnapshot) => {
    const payload = snapshot.val() as Record<string, NotificationStoredRecord> | null;
    if (!payload) {
      onUpdate([]);
      return;
    }

    const notifications = Object.entries(payload)
      .map(([id, item]) => ({
        id,
        title: item.title,
        message: item.message,
        type: item.type ?? 'info',
        read: item.read ?? false,
        timestamp: Number(item.timestamp ?? Date.now()),
        category: item.category,
        semanticType: item.semanticType,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    onUpdate(notifications);
  });
}

export async function createAccountNotification(
  accountId: string,
  input: NotificationRecordInput,
): Promise<string> {
  const listRef = ref(rtdb, notificationsPath(accountId));
  const entryRef = push(listRef);
  if (!entryRef.key) {
    throw new Error('RTDB_NOTIFICATION_KEY_MISSING');
  }

  await set(entryRef, {
    ...input,
    read: false,
    timestamp: serverTimestamp(),
  });

  return entryRef.key;
}

export async function setAccountNotificationRead(
  accountId: string,
  notificationId: string,
): Promise<void> {
  const notificationRef = ref(rtdb, `${notificationsPath(accountId)}/${notificationId}`);
  await update(notificationRef, {
    read: true,
    readAt: serverTimestamp(),
  });
}
