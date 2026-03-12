/**
 * Module: schedule-item.machine.ts
 * Purpose: L6 ScheduleItem aggregate state machine specification (shared-kernel)
 * Responsibilities: define status enum, transition table, and pure transition guard
 * Constraints: NO I/O, NO async, NO side effects — pure state transition rules only
 *
 * Per docs/architecture/models/domain-model.md §Aggregate 3 ScheduleItem.
 * NOTE: The old PROPOSAL/OFFICIAL/REJECTED/COMPLETED values are superseded by the
 * L6 canonical set below. All code MUST migrate to these values.
 */

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * L6 canonical status values for the ScheduleItem aggregate.
 * Maps directly to docs/architecture/models/domain-model.md §Aggregate 3.
 *
 * Migration mapping from legacy values:
 *   PROPOSAL  → pending
 *   OFFICIAL  → confirmed
 *   REJECTED  → cancelled  (governance withdrawal; NOT skill-threshold failure)
 *   COMPLETED → completed
 *   (new)     → in_execution
 */
export type ScheduleItemStatus =
  | 'pending'      // Proposed; awaiting governance approval
  | 'confirmed'    // Approved; work can begin
  | 'in_execution' // Work is actively in progress
  | 'completed'    // Work finished successfully
  | 'cancelled';   // Governance withdrawal; terminal

// ─── Event ────────────────────────────────────────────────────────────────────

export type ScheduleItemEvent =
  | 'CONFIRM'    // pending → confirmed
  | 'START'      // confirmed → in_execution
  | 'COMPLETE'   // in_execution → completed
  | 'CANCEL';    // pending | confirmed → cancelled

// ─── Transition table ─────────────────────────────────────────────────────────

const SCHEDULE_ITEM_TRANSITIONS: Record<ScheduleItemStatus, readonly ScheduleItemStatus[]> = {
  pending:      ['confirmed', 'cancelled'],
  confirmed:    ['in_execution', 'cancelled'],
  in_execution: ['completed', 'cancelled'],
  completed:    [],
  cancelled:    [],
};

// ─── Guard ────────────────────────────────────────────────────────────────────

export const SCHEDULE_ITEM_INVALID_TRANSITION = 'SCHEDULE_ITEM_INVALID_TRANSITION' as const;

export interface ScheduleItemTransitionResult {
  readonly ok: boolean;
  readonly next?: ScheduleItemStatus;
  readonly error?: typeof SCHEDULE_ITEM_INVALID_TRANSITION;
}

export function transitionScheduleItem(
  current: ScheduleItemStatus,
  target: ScheduleItemStatus,
): ScheduleItemTransitionResult {
  const allowed = SCHEDULE_ITEM_TRANSITIONS[current];
  if (allowed.includes(target)) {
    return { ok: true, next: target };
  }
  return { ok: false, error: SCHEDULE_ITEM_INVALID_TRANSITION };
}

export function canTransitionScheduleItem(
  current: ScheduleItemStatus,
  target: ScheduleItemStatus,
): boolean {
  return SCHEDULE_ITEM_TRANSITIONS[current].includes(target);
}
