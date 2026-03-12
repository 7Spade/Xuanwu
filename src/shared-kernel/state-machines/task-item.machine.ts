/**
 * Module: task-item.machine.ts
 * Purpose: L6 TaskItem aggregate state machine specification (shared-kernel)
 * Responsibilities: define status enum, transition table, and pure transition guard
 * Constraints: NO I/O, NO async, NO side effects — pure state transition rules only
 *
 * Per docs/architecture/models/domain-model.md §Aggregate 1 TaskItem.
 * Status values are the L6 canonical set; any code using old values must migrate.
 */

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * L6 canonical status values for the TaskItem aggregate.
 * Maps directly to docs/architecture/models/domain-model.md §Aggregate 1.
 */
export type TaskItemStatus =
  | 'draft'       // Created but not yet validated for assignment
  | 'ready'       // Validated; can be picked up or assigned
  | 'in_progress' // Work has started
  | 'blocked'     // Work cannot proceed; blocker recorded
  | 'review'      // Work done; pending acceptance / QA sign-off
  | 'done'        // Accepted; task is complete
  | 'archived'    // Retained for record; not actionable
  | 'cancelled';  // Governance withdrawal; terminal

// ─── Event ────────────────────────────────────────────────────────────────────

export type TaskItemEvent =
  | 'SUBMIT'    // draft → ready
  | 'START'     // ready → in_progress
  | 'BLOCK'     // in_progress → blocked
  | 'UNBLOCK'   // blocked → in_progress
  | 'SUBMIT_REVIEW' // in_progress → review
  | 'APPROVE'   // review → done
  | 'REJECT'    // review → in_progress
  | 'ARCHIVE'   // done → archived
  | 'CANCEL';   // any non-terminal → cancelled

// ─── Transition table ─────────────────────────────────────────────────────────

const TASK_ITEM_TRANSITIONS: Record<TaskItemStatus, readonly TaskItemStatus[]> = {
  draft:       ['ready', 'cancelled'],
  ready:       ['in_progress', 'cancelled'],
  in_progress: ['blocked', 'review', 'cancelled'],
  blocked:     ['in_progress', 'cancelled'],
  review:      ['done', 'in_progress', 'cancelled'],
  done:        ['archived'],
  archived:    [],
  cancelled:   [],
};

// ─── Guard ────────────────────────────────────────────────────────────────────

/** Error code for an illegal transition attempt. */
export const TASK_ITEM_INVALID_TRANSITION = 'TASK_ITEM_INVALID_TRANSITION' as const;

export interface TaskItemTransitionResult {
  readonly ok: boolean;
  readonly next?: TaskItemStatus;
  readonly error?: typeof TASK_ITEM_INVALID_TRANSITION;
}

/**
 * Pure guard: can the TaskItem transition from `current` to `target`?
 * Returns a typed result object; never throws.
 */
export function transitionTaskItem(
  current: TaskItemStatus,
  target: TaskItemStatus,
): TaskItemTransitionResult {
  const allowed = TASK_ITEM_TRANSITIONS[current];
  if (allowed.includes(target)) {
    return { ok: true, next: target };
  }
  return { ok: false, error: TASK_ITEM_INVALID_TRANSITION };
}

export function canTransitionTaskItem(
  current: TaskItemStatus,
  target: TaskItemStatus,
): boolean {
  return TASK_ITEM_TRANSITIONS[current].includes(target);
}
