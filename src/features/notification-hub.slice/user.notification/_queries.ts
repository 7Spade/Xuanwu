/**
 * Module: _queries.ts
 * Purpose: Query-side adapters for user notifications in notification-hub slice
 * Responsibilities: subscribe user notifications and mark as read via ACL adapters
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  setAccountNotificationRead,
  subscribeAccountNotifications,
  trackAnalyticsEvent,
} from '@/shared-infra/frontend-firebase';
import type { Notification } from '@/shared-kernel';

type Unsubscribe = () => void;

/**
 * Subscribes to the latest notifications for a user.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  accountId: string,
  maxCount: number,
  onUpdate: (notifications: Notification[]) => void
): Unsubscribe {
  return subscribeAccountNotifications(accountId, maxCount, onUpdate);
}

/**
 * Marks a notification as read.
 */
export async function markNotificationRead(
  accountId: string,
  notificationId: string
): Promise<void> {
  await setAccountNotificationRead(accountId, notificationId);
  trackAnalyticsEvent('notification_mark_read', {
    accountId,
    notificationId,
  });
}
