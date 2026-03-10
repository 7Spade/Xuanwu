/**
 * Module: staleness-monitor
 * Purpose: L5 BBB ??Staleness monitoring for tag lifecycle [S4 D21-8]
 * Responsibilities: Detect stale tags that have exceeded their valid window;
 *   emit StaleTagWarning records consumed by _queries.queryStaleTagWarnings()
 * Constraints: deterministic logic, ZERO infrastructure imports, respect module boundaries
 *
 * semantic-graph.slice/centralized-guards ??Staleness Monitor [S4 D21-8]
 *
 * Monitors the temporal freshness of tag-lifecycle records inside the
 * semantic graph.  When a tag's last-active timestamp exceeds the configured
 * staleness threshold the monitor marks it as stale and surfaces a warning
 * so consumers can take remediation action (e.g., prompt for review or
 * automatic deprecation).
 *
 * Rules enforced:
 *   [S4]    Staleness Sentinel ??any tag whose lifecycle was last updated
 *           more than STALENESS_THRESHOLD_MS ago is considered stale.
 *   [D21-8] Topology observability ??stale tags are observable via
 *           queryStaleTagWarnings() without requiring infrastructure queries.
 *
 * Dependency rule: reads from centralized-types only.
 * ZERO infrastructure imports (no Firebase, no React, no I/O).
 */

import { StalenessMs } from '@/shared-kernel';

import type { StaleTagWarning, TagLifecycleRecord } from '../core/types';

// ??? Threshold ????????????????????????????????????????????????????????????????

/** Default staleness window from SK_STALENESS_CONTRACT [S4]. */
export const DEFAULT_STALENESS_THRESHOLD_MS = StalenessMs.TAG_MAX_STALENESS;

// ??? Internal registry ????????????????????????????????????????????????????????

const _lifecycleRecords = new Map<string, TagLifecycleRecord>();

// ??? Mutation API (called from _actions.ts) ???????????????????????????????????

/**
 * Register or update a tag's lifecycle record in the staleness monitor.
 * Called from registerTagLifecycle / transitionTagLifecycle command handlers.
 */
export function upsertLifecycleRecord(record: TagLifecycleRecord): void {
  _lifecycleRecords.set(record.tagSlug, record);
}

/**
 * Remove a lifecycle record (called when a tag is deleted).
 */
export function removeLifecycleRecord(tagSlug: string): boolean {
  return _lifecycleRecords.delete(tagSlug);
}

// ??? Query API ????????????????????????????????????????????????????????????????

/**
 * Scan all registered lifecycle records and return warnings for those whose
 * `lastTransitionedAt` timestamp exceeds `thresholdMs` from `now`.
 *
 * [S4] Staleness Sentinel.
 * [D21-8] Topology observability ??queryable without I/O.
 *
 * @param now         - Current timestamp in milliseconds (defaults to Date.now()).
 * @param thresholdMs - Staleness window in ms (defaults to 90 days).
 */
export function detectStaleTagWarnings(
  now: number = Date.now(),
  thresholdMs: number = DEFAULT_STALENESS_THRESHOLD_MS
): readonly StaleTagWarning[] {
  const warnings: StaleTagWarning[] = [];

  for (const record of _lifecycleRecords.values()) {
    const lastTransitioned = new Date(record.lastTransitionedAt).getTime();
    const ageMs = now - lastTransitioned;

    if (ageMs > thresholdMs) {
      warnings.push({
        tagSlug: record.tagSlug,
        stalenessMs: ageMs,
        detectedAt: new Date(now).toISOString(),
      });
    }
  }

  return warnings;
}

/**
 * Return all currently registered lifecycle records (read-only snapshot).
 * Useful for debugging and test assertions.
 */
export function getAllLifecycleRecords(): readonly TagLifecycleRecord[] {
  return Array.from(_lifecycleRecords.values());
}

/** Clear all lifecycle records (used in tests). */
export function _clearLifecycleRecordsForTest(): void {
  _lifecycleRecords.clear();
}

