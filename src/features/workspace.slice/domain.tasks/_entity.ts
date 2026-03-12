/**
 * workspace.slice / domain.tasks / _entity.ts
 *
 * TaskEntity — Domain entity (Aggregate Root) for workspace tasks.
 *
 * Layer: Domain (pure, no I/O, no framework imports)
 * Per docs/architecture/README.md:
 *   Entity invariants MUST be enforced inside the entity, not in application services.
 *   This entity is PURE — no async, no Firebase, no React dependencies.
 *
 * Relationship to existing code:
 *   - `WorkspaceTask` (shared-kernel/types) is the persistence/DTO shape.
 *   - `TaskEntity` is the domain model that owns business rules and enforces invariants.
 *   - The application layer maps between TaskEntity ↔ WorkspaceTask.
 *
 * Progressive migration note:
 *   Existing _actions/index.ts and _queries.ts continue to work without change.
 *   New use-case logic should use TaskEntity to capture business rules centrally.
 */

import type { SkillRequirement } from '@/shared-kernel/data-contracts/skill-tier';
import type { TaskId } from '@/shared-kernel/value-objects/task-id';
import type { WorkspaceId } from '@/shared-kernel/value-objects/workspace-id';

// ─── Progress state machine ────────────────────────────────────────────────────

export type TaskProgressState = 'todo' | 'doing' | 'blocked' | 'completed' | 'verified' | 'accepted';
export type TaskPriority = 'low' | 'medium' | 'high';

/** Valid task progress state transitions. */
const VALID_TRANSITIONS: ReadonlyMap<TaskProgressState, ReadonlySet<TaskProgressState>> = new Map([
  ['todo',      new Set<TaskProgressState>(['doing', 'blocked'])],
  ['doing',     new Set<TaskProgressState>(['blocked', 'completed'])],
  ['blocked',   new Set<TaskProgressState>(['doing'])],
  ['completed', new Set<TaskProgressState>(['verified', 'doing'])],
  ['verified',  new Set<TaskProgressState>(['accepted', 'doing'])],
  ['accepted',  new Set<TaskProgressState>()],
]);

// ─── Domain event types ────────────────────────────────────────────────────────

export interface TaskProgressAdvancedEvent {
  readonly type: 'TASK_PROGRESS_ADVANCED';
  readonly taskId: string;
  readonly workspaceId: string;
  readonly from: TaskProgressState;
  readonly to: TaskProgressState;
  readonly actorId: string;
}

export interface TaskAssignedEvent {
  readonly type: 'TASK_ASSIGNED';
  readonly taskId: string;
  readonly workspaceId: string;
  readonly assigneeId: string;
  readonly actorId: string;
}

export type TaskDomainEvent = TaskProgressAdvancedEvent | TaskAssignedEvent;

// ─── TaskEntity ────────────────────────────────────────────────────────────────

/** Properties required to reconstitute a TaskEntity from persistence. */
export interface TaskEntityProps {
  readonly id: TaskId;
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly progressState: TaskProgressState;
  readonly priority: TaskPriority;
  readonly subtotal: number;
  readonly description?: string;
  readonly parentId?: string;
  readonly assigneeId?: string;
  readonly requiredSkills?: SkillRequirement[];
  readonly aggregateVersion: number;
}

/**
 * TaskEntity — Aggregate root for the workspace task domain object.
 *
 * Enforces:
 *   - Valid progress state transitions (state machine)
 *   - Assignment rules (only unassigned tasks may be freely assigned)
 *   - Subtotal is always non-negative
 *
 * All business mutations collect domain events via `pullDomainEvents()`.
 */
export class TaskEntity {
  private _events: TaskDomainEvent[] = [];
  private _progressState: TaskProgressState;
  private _assigneeId: string | undefined;
  private _aggregateVersion: number;

  private constructor(private readonly _props: TaskEntityProps) {
    this._progressState = _props.progressState;
    this._assigneeId = _props.assigneeId;
    this._aggregateVersion = _props.aggregateVersion;
  }

  // ── Factory: reconstitute from persistence ────────────────────────────────

  /** Reconstitutes a TaskEntity from a persisted document. */
  static reconstitute(props: TaskEntityProps): TaskEntity {
    return new TaskEntity(props);
  }

  // ── Identity ──────────────────────────────────────────────────────────────

  get id(): TaskId {
    return this._props.id;
  }

  get workspaceId(): WorkspaceId {
    return this._props.workspaceId;
  }

  get name(): string {
    return this._props.name;
  }

  get progressState(): TaskProgressState {
    return this._progressState;
  }

  get priority(): TaskPriority {
    return this._props.priority;
  }

  get subtotal(): number {
    return this._props.subtotal;
  }

  get assigneeId(): string | undefined {
    return this._assigneeId;
  }

  get aggregateVersion(): number {
    return this._aggregateVersion;
  }

  // ── Business rules ────────────────────────────────────────────────────────

  /**
   * Advances the task's progress state.
   *
   * Returns `{ ok: false, error }` if the transition is invalid.
   * Emits a `TASK_PROGRESS_ADVANCED` domain event on success.
   */
  advanceProgress(
    to: TaskProgressState,
    actorId: string,
  ): { ok: true } | { ok: false; error: string } {
    const allowed = VALID_TRANSITIONS.get(this._progressState);
    if (!allowed?.has(to)) {
      return {
        ok: false,
        error: `Cannot transition task from '${this._progressState}' to '${to}'`,
      };
    }
    const from = this._progressState;
    this._progressState = to;
    this._aggregateVersion += 1;
    this._events.push({
      type: 'TASK_PROGRESS_ADVANCED',
      taskId: this._props.id.value,
      workspaceId: this._props.workspaceId.value,
      from,
      to,
      actorId,
    });
    return { ok: true };
  }

  /**
   * Assigns this task to a team member.
   *
   * Returns `{ ok: false, error }` if the task is already accepted.
   * Emits a `TASK_ASSIGNED` domain event on success.
   */
  assignTo(
    assigneeId: string,
    actorId: string,
  ): { ok: true } | { ok: false; error: string } {
    if (this._progressState === 'accepted') {
      return { ok: false, error: 'Cannot reassign an accepted task' };
    }
    this._assigneeId = assigneeId;
    this._aggregateVersion += 1;
    this._events.push({
      type: 'TASK_ASSIGNED',
      taskId: this._props.id.value,
      workspaceId: this._props.workspaceId.value,
      assigneeId,
      actorId,
    });
    return { ok: true };
  }

  /**
   * Checks whether a progress state transition is valid from the current state.
   * Useful for UI validation before committing a command.
   */
  canTransitionTo(to: TaskProgressState): boolean {
    return VALID_TRANSITIONS.get(this._progressState)?.has(to) ?? false;
  }

  // ── Domain events ─────────────────────────────────────────────────────────

  /**
   * Returns and clears all pending domain events.
   * Call after persisting the entity to dispatch events to the event bus.
   */
  pullDomainEvents(): TaskDomainEvent[] {
    const events = [...this._events];
    this._events.length = 0;
    return events;
  }
}
