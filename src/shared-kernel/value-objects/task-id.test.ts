/**
 * shared-kernel/value-objects/task-id.test.ts
 *
 * Unit tests for TaskId value object.
 *
 * Layer: VS0 Shared Kernel — Domain (pure)
 */
import { describe, expect, it } from 'vitest';

import { TASK_ID_ERRORS, TaskId } from './task-id';

describe('TaskId', () => {
  describe('from()', () => {
    it('creates a TaskId from a valid non-empty string', () => {
      const result = TaskId.from('task-xyz789');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('task-xyz789');
      }
    });

    it('trims whitespace from the input', () => {
      const result = TaskId.from('  task-trimmed  ');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('task-trimmed');
      }
    });

    it('returns TASK_ID_EMPTY error for an empty string', () => {
      const result = TaskId.from('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(TASK_ID_ERRORS.EMPTY);
      }
    });

    it('returns TASK_ID_EMPTY error for a whitespace-only string', () => {
      const result = TaskId.from('   ');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(TASK_ID_ERRORS.EMPTY);
      }
    });
  });

  describe('equals()', () => {
    it('returns true for two TaskIds with the same value', () => {
      const a = TaskId.from('task-1');
      const b = TaskId.from('task-1');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(true);
      }
    });

    it('returns false for two TaskIds with different values', () => {
      const a = TaskId.from('task-1');
      const b = TaskId.from('task-2');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(false);
      }
    });
  });

  describe('toString()', () => {
    it('returns the raw string value', () => {
      const result = TaskId.from('task-abc');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('task-abc');
      }
    });
  });
});
