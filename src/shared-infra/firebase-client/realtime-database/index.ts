/**
 * Module: index.ts
 * Purpose: RTDB export surface for firebase-client boundary
 * Responsibilities: expose RTDB client and notification adapter API
 * Constraints: deterministic logic, respect module boundaries
 */

export { rtdb } from './realtime-database.client';
export {
  subscribeAccountNotifications,
  createAccountNotification,
  setAccountNotificationRead,
  type NotificationRecordInput,
} from './notification-rtdb.adapter';
