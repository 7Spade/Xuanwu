/**
 * notification-hub.slice/gov.notification-router — _router.ts
 *
 * FCM Layer 2: Notification Router
 * Routes organization events to the correct target account notification slice
 * based on TargetAccountID.
 *
 * Per 00-logic-overview.md [E3]:
 *   IER →|ScheduleAssigned| ACCOUNT_NOTIFICATION_ROUTER
 *   ACCOUNT_NOTIFICATION_ROUTER →|路由至目標帳號| ACCOUNT_USER_NOTIFICATION
 *
 * Current implementation: subscribes directly to the org event bus.
 * This is the consumer side — when a dedicated IER layer is introduced,
 * it will be the IER (not the org event bus) that calls this router.
 *
 * Does NOT generate content — only routes from event source to delivery slice.
 */

import { registerSubscriber } from '@/shared-infra/event-router';

import { deliverNotification } from '../domain.notification';

export interface RouterRegistration {
  unsubscribe: () => void;
}

/**
 * Registers the notification router on the organization event bus.
 * Should be called once at app startup (e.g., in the root layout or app-provider).
 *
 * Returns an unsubscribe function to clean up on unmount.
 *
 * @deprecated Use `initTagChangedSubscriber` from `@/features/notification-hub.slice` instead.
 * The notification-hub.slice is the D26-compliant sole side-effect outlet.
 * This function remains for backwards compatibility during the D26 migration.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' ? value : null;
}

function resolveTraceId(
  envelopeTraceId: string | undefined,
  payload: Record<string, unknown>,
): string | undefined {
  if (typeof envelopeTraceId === 'string') return envelopeTraceId;
  const payloadTraceId = payload.traceId;
  return typeof payloadTraceId === 'string' ? payloadTraceId : undefined;
}

export function registerNotificationRouter(): RouterRegistration {
  const unsubscribers: Array<() => void> = [];

  // Route ScheduleAssigned events to the target account's notification layer.
  unsubscribers.push(
    registerSubscriber('organization:schedule:assigned', async (envelope) => {
      if (!isRecord(envelope.payload)) return;
      const targetAccountId = getStringField(envelope.payload, 'targetAccountId');
      const title = getStringField(envelope.payload, 'title');
      const startDate = getStringField(envelope.payload, 'startDate');
      const endDate = getStringField(envelope.payload, 'endDate');
      const scheduleItemId = getStringField(envelope.payload, 'scheduleItemId');
      const workspaceId = getStringField(envelope.payload, 'workspaceId');
      if (!targetAccountId || !title || !startDate || !endDate || !scheduleItemId || !workspaceId) return;
      await deliverNotification(targetAccountId, {
        title: '排程指派通知',
        message: `您已被指派至排程：「${title}」（${startDate} ~ ${endDate}）`,
        type: 'info',
        sourceEvent: 'organization:schedule:assigned',
        sourceId: scheduleItemId,
        workspaceId,
        // [R8] forward traceId from the originating event envelope
        traceId: resolveTraceId(envelope.traceId, envelope.payload),
      });
    }, 'STANDARD_LANE')
  );

  // Route policy change events to org members (broadcast via member list)
  unsubscribers.push(
    registerSubscriber('organization:policy:changed', async (envelope) => {
      if (!isRecord(envelope.payload)) return;
      const changedBy = getStringField(envelope.payload, 'changedBy');
      const policyId = getStringField(envelope.payload, 'policyId');
      const changeType = getStringField(envelope.payload, 'changeType');
      const orgId = getStringField(envelope.payload, 'orgId');
      if (!changedBy || !policyId || !changeType || !orgId) return;
      const actionLabel = changeType === 'created' ? '建立' : changeType === 'updated' ? '更新' : '刪除';
      // Policy changes are org-wide; notification delivery targets the org owner
      await deliverNotification(changedBy, {
        title: '組織政策已更新',
        message: `組織政策 ${policyId} 已${actionLabel}`,
        type: 'info',
        sourceEvent: 'organization:policy:changed',
        sourceId: policyId,
        workspaceId: orgId,
        // [R8] forward traceId from the originating event envelope
        traceId: resolveTraceId(envelope.traceId, envelope.payload),
      });
    }, 'STANDARD_LANE')
  );

  // Route assignment-cancelled events to the target member (FR-N3)
  unsubscribers.push(
    registerSubscriber('organization:schedule:assignmentCancelled', async (envelope) => {
      if (!isRecord(envelope.payload)) return;
      const targetAccountId = getStringField(envelope.payload, 'targetAccountId');
      const scheduleItemId = getStringField(envelope.payload, 'scheduleItemId');
      const workspaceId = getStringField(envelope.payload, 'workspaceId');
      if (!targetAccountId || !scheduleItemId || !workspaceId) return;
      const reason = getStringField(envelope.payload, 'reason');
      await deliverNotification(targetAccountId, {
        title: '排程取消通知',
        message: `您的排程指派已被取消${reason ? `：${reason}` : ''}`,
        type: 'alert',
        sourceEvent: 'organization:schedule:assignmentCancelled',
        sourceId: scheduleItemId,
        workspaceId,
        // [R8] forward traceId from the originating event envelope
        traceId: resolveTraceId(envelope.traceId, envelope.payload),
      });
    }, 'STANDARD_LANE')
  );

  // Route member joined events to the new member
  unsubscribers.push(
    registerSubscriber('organization:member:joined', async (envelope) => {
      if (!isRecord(envelope.payload)) return;
      const accountId = getStringField(envelope.payload, 'accountId');
      const role = getStringField(envelope.payload, 'role');
      const orgId = getStringField(envelope.payload, 'orgId');
      if (!accountId || !role || !orgId) return;
      await deliverNotification(accountId, {
        title: '已加入組織',
        message: `您已成功加入組織，角色：${role}`,
        type: 'success',
        sourceEvent: 'organization:member:joined',
        sourceId: orgId,
        workspaceId: orgId,
        // [R8] forward traceId from the originating event envelope
        traceId: resolveTraceId(envelope.traceId, envelope.payload),
      });
    }, 'STANDARD_LANE')
  );

  return {
    unsubscribe: () => unsubscribers.forEach((u) => u()),
  };
}
