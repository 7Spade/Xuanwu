/**
 * Module: notification.ts
 * Purpose: Centralized notification hub domain type definitions.
 * Responsibilities: Tag-aware routing, notification dispatch, and hub state types for VS7.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { NotificationChannel, NotificationPriority } from '@/shared-kernel/data-contracts/semantic/semantic-contracts';
import type { TagSlugRef } from '@/shared-kernel/data-contracts/tag-authority';

export type { NotificationChannel, NotificationPriority };

// ─── Tag-Aware Routing ───────────────────────────────────────────────────────

/**
 * Tag-based routing rule: maps a set of tag slugs to a delivery channel
 * and priority. Evaluated by the notification hub's event subscriber.
 *
 * Per 00-logic-overview.md (VS7):
 *   Notification Hub routes events via VS8 tag semantics —
 *   tag slugs determine which channels fire and at what priority.
 */
export interface TagRoutingRule {
  readonly ruleId: string;
  readonly name: string;
  /** Tag slugs that trigger this rule (AND semantics — all must match). */
  readonly tagSlugs: readonly TagSlugRef[];
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  /** Optional template ID for message formatting. */
  readonly templateId?: string;
  readonly enabled: boolean;
}

/**
 * Result of evaluating tag routing rules against an event's tags.
 */
export interface TagRoutingDecision {
  readonly matchedRules: readonly TagRoutingRule[];
  readonly channels: readonly NotificationChannel[];
  readonly highestPriority: NotificationPriority;
}

// ─── Notification Event Types ────────────────────────────────────────────────

/**
 * Source event that the notification hub subscribes to.
 */
export interface NotificationSourceEvent {
  readonly eventKey: string;
  readonly payload: Record<string, unknown>;
  readonly tags: readonly TagSlugRef[];
  readonly orgId: string;
  readonly workspaceId?: string;
  readonly targetAccountIds?: readonly string[];
  /** [R8] TraceID propagated from the originating command. */
  readonly traceId?: string;
  readonly occurredAt: string;
}

/**
 * Enriched notification ready for delivery (after tag-aware routing).
 */
export interface NotificationDispatch {
  readonly sourceEventKey: string;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly targetAccountIds: readonly string[];
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly tags: readonly TagSlugRef[];
  readonly traceId?: string;
  readonly dispatchedAt: string;
}

// ─── Notification Dispatch Result ───────────────────────────────────────────

/**
 * Result of a notification dispatch attempt.
 */
export interface NotificationDispatchResult {
  readonly dispatchId: string;
  readonly channel: NotificationChannel;
  readonly targetCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly errors: readonly NotificationDispatchError[];
}

/**
 * Individual delivery error within a dispatch batch.
 */
export interface NotificationDispatchError {
  readonly accountId: string;
  readonly channel: NotificationChannel;
  readonly reason: string;
}

// ─── Event Subscription Types ────────────────────────────────────────────────

/**
 * Subscription registration for the notification hub's event listener.
 */
export interface NotificationSubscription {
  readonly eventKey: string;
  readonly description: string;
  readonly useTagRouting: boolean;
  readonly enabled: boolean;
}

// ─── Hub State (Observability) ───────────────────────────────────────────────

/**
 * Notification hub operational statistics.
 */
export interface NotificationHubStats {
  readonly totalDispatched: number;
  readonly dispatchedByChannel: Record<NotificationChannel, number>;
  readonly totalErrors: number;
  readonly activeSubscriptions: number;
  readonly activeRoutingRules: number;
  readonly lastDispatchedAt: string;
}
