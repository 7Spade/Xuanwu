/**
 * workspace.slice / domain.tasks / _entity.test.ts
 *
 * Unit tests for TaskEntity domain aggregate.
 *
 * Layer: Domain (pure, no I/O)
 * Per docs/architecture/README.md: Entity invariants are enforced inside the entity.
 */
import { describe, expect, it } from 'vitest';

import { TaskId } from '@/shared-kernel/value-objects/task-id';
import { WorkspaceId } from '@/shared-kernel/value-objects/workspace-id';

import { type TaskEntityProps, TaskEntity } from './_entity';

// ─── Test helpers ──────────────────────────────────────────────────────────────

function makeTaskId(raw = 'task-1'): TaskId {
  const result = TaskId.from(raw);
  if (!result.ok) throw new Error(`Invalid TaskId: ${raw}`);
  return result.value;
}

function makeWorkspaceId(raw = 'ws-1'): WorkspaceId {
  const result = WorkspaceId.from(raw);
  if (!result.ok) throw new Error(`Invalid WorkspaceId: ${raw}`);
  return result.value;
}

function makeProps(overrides: Partial<TaskEntityProps> = {}): TaskEntityProps {
  return {
    id: makeTaskId(),
    workspaceId: makeWorkspaceId(),
    name: 'Test Task',
    progressState: 'todo',
    priority: 'medium',
    subtotal: 0,
    aggregateVersion: 1,
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('TaskEntity', () => {
  describe('reconstitute()', () => {
    it('creates a TaskEntity from valid props', () => {
      const entity = TaskEntity.reconstitute(makeProps());
      expect(entity.progressState).toBe('todo');
      expect(entity.name).toBe('Test Task');
      expect(entity.aggregateVersion).toBe(1);
    });
  });

  describe('advanceProgress()', () => {
    it('advances from todo → doing and emits a domain event', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));
      const result = entity.advanceProgress('doing', 'actor-1');

      expect(result.ok).toBe(true);
      expect(entity.progressState).toBe('doing');
      expect(entity.aggregateVersion).toBe(2);

      const events = entity.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TASK_PROGRESS_ADVANCED');
      if (events[0].type === 'TASK_PROGRESS_ADVANCED') {
        expect(events[0].from).toBe('todo');
        expect(events[0].to).toBe('doing');
        expect(events[0].actorId).toBe('actor-1');
      }
    });

    it('advances through the full happy path: todo → doing → completed → verified → accepted', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));

      expect(entity.advanceProgress('doing', 'actor').ok).toBe(true);
      expect(entity.advanceProgress('completed', 'actor').ok).toBe(true);
      expect(entity.advanceProgress('verified', 'actor').ok).toBe(true);
      expect(entity.advanceProgress('accepted', 'actor').ok).toBe(true);

      expect(entity.progressState).toBe('accepted');
    });

    it('returns an error for an invalid transition (todo → completed)', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));
      const result = entity.advanceProgress('completed', 'actor-1');

      expect(result.ok).toBe(false);
      expect(entity.progressState).toBe('todo');
    });

    it('clears domain events after pullDomainEvents()', () => {
      const entity = TaskEntity.reconstitute(makeProps());
      entity.advanceProgress('doing', 'actor');
      entity.pullDomainEvents();

      expect(entity.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('assignTo()', () => {
    it('assigns the task to a team member and emits TASK_ASSIGNED event', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));
      const result = entity.assignTo('member-99', 'actor-1');

      expect(result.ok).toBe(true);
      expect(entity.assigneeId).toBe('member-99');

      const events = entity.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TASK_ASSIGNED');
      if (events[0].type === 'TASK_ASSIGNED') {
        expect(events[0].assigneeId).toBe('member-99');
        expect(events[0].actorId).toBe('actor-1');
      }
    });

    it('returns an error when trying to reassign an accepted task', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'accepted' }));
      const result = entity.assignTo('member-99', 'actor-1');

      expect(result.ok).toBe(false);
      expect(entity.assigneeId).toBeUndefined();
    });

    it('allows reassigning a task in non-accepted states', () => {
      for (const state of ['todo', 'doing', 'blocked', 'completed', 'verified'] as const) {
        const entity = TaskEntity.reconstitute(makeProps({ progressState: state }));
        expect(entity.assignTo('member-1', 'actor').ok).toBe(true);
      }
    });
  });

  describe('canTransitionTo()', () => {
    it('returns true for a valid next state', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));
      expect(entity.canTransitionTo('doing')).toBe(true);
    });

    it('returns false for an invalid next state', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'todo' }));
      expect(entity.canTransitionTo('accepted')).toBe(false);
    });

    it('returns false for all transitions from accepted (terminal state)', () => {
      const entity = TaskEntity.reconstitute(makeProps({ progressState: 'accepted' }));
      const states = ['todo', 'doing', 'blocked', 'completed', 'verified', 'accepted'] as const;
      for (const s of states) {
        expect(entity.canTransitionTo(s)).toBe(false);
      }
    });
  });

  describe('aggregateVersion', () => {
    it('increments on each mutation', () => {
      const entity = TaskEntity.reconstitute(makeProps({ aggregateVersion: 5 }));
      entity.advanceProgress('doing', 'actor');
      expect(entity.aggregateVersion).toBe(6);
      entity.assignTo('member-1', 'actor');
      expect(entity.aggregateVersion).toBe(7);
    });
  });
});
