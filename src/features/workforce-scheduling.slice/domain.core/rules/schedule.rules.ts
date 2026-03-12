/**
 * @fileoverview entities/schedule ??Pure schedule domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { ScheduleStatus } from '@/shared-kernel'

// ---------------------------------------------------------------------------
// Valid status transitions
// ---------------------------------------------------------------------------

/**
 * Defines the allowed status transitions for a ScheduleItem.
 * Key: current status ??Value: allowed next statuses.
 */
export const VALID_STATUS_TRANSITIONS: Record<ScheduleStatus, ScheduleStatus[]> = {
  pending:      ['confirmed', 'cancelled'],
  confirmed:    ['in_execution', 'completed', 'cancelled'],
  in_execution: ['completed', 'cancelled'],
  completed:    [],
  cancelled:    [],
}

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

/**
 * Returns true if transitioning from `from` to `to` is a valid status change.
 */
export function canTransitionScheduleStatus(
  from: ScheduleStatus,
  to: ScheduleStatus
): boolean {
  return (VALID_STATUS_TRANSITIONS[from] ?? []).includes(to)
}
