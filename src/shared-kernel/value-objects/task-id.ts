/**
 * shared-kernel/value-objects/task-id.ts
 *
 * TaskId — Immutable value object for workspace task identifiers.
 *
 * Layer: VS0 Shared Kernel — Domain (pure, no I/O)
 * Per docs/architecture/README.md: Value Objects must be immutable and self-validating.
 */

/** Error codes for TaskId validation failures. */
export const TASK_ID_ERRORS = {
  EMPTY: 'TASK_ID_EMPTY',
} as const;

export type TaskIdError = (typeof TASK_ID_ERRORS)[keyof typeof TASK_ID_ERRORS];

/**
 * TaskId — Branded value object that wraps a workspace task Firestore document ID.
 *
 * Invariants enforced at construction:
 *   - Must be a non-empty string
 *
 * Usage:
 *   const id = TaskId.from('task-abc123')
 *   if (id.ok) { ... id.value.value ... }
 */
export class TaskId {
  private constructor(readonly value: string) {}

  /**
   * Creates a TaskId from a raw string.
   * Returns `{ ok: true, value }` on success or `{ ok: false, error }` on failure.
   */
  static from(raw: string): { ok: true; value: TaskId } | { ok: false; error: TaskIdError } {
    if (!raw || raw.trim().length === 0) {
      return { ok: false, error: TASK_ID_ERRORS.EMPTY };
    }
    return { ok: true, value: new TaskId(raw.trim()) };
  }

  /** Returns true if this TaskId equals another by value. */
  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
