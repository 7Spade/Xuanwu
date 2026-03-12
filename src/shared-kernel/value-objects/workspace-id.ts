/**
 * shared-kernel/value-objects/workspace-id.ts
 *
 * WorkspaceId — Immutable value object for workspace identifiers.
 *
 * Layer: VS0 Shared Kernel — Domain (pure, no I/O)
 * Per docs/architecture/README.md: Value Objects must be immutable and self-validating.
 */

/** Error codes for WorkspaceId validation failures. */
export const WORKSPACE_ID_ERRORS = {
  EMPTY: 'WORKSPACE_ID_EMPTY',
} as const;

export type WorkspaceIdError = (typeof WORKSPACE_ID_ERRORS)[keyof typeof WORKSPACE_ID_ERRORS];

/**
 * WorkspaceId — Branded value object that wraps a workspace Firestore document ID.
 *
 * Invariants enforced at construction:
 *   - Must be a non-empty string
 *   - Must be at least 1 character long
 *
 * Usage:
 *   const id = WorkspaceId.from('ws-abc123')
 *   if (id.ok) { ... id.value.value ... }
 */
export class WorkspaceId {
  private constructor(readonly value: string) {}

  /**
   * Creates a WorkspaceId from a raw string.
   * Returns `{ ok: true, value }` on success or `{ ok: false, error }` on failure.
   */
  static from(raw: string): { ok: true; value: WorkspaceId } | { ok: false; error: WorkspaceIdError } {
    if (!raw || raw.trim().length === 0) {
      return { ok: false, error: WORKSPACE_ID_ERRORS.EMPTY };
    }
    return { ok: true, value: new WorkspaceId(raw.trim()) };
  }

  /** Returns true if this WorkspaceId equals another by value. */
  equals(other: WorkspaceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
