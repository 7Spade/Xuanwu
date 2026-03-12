/**
 * shared-kernel/value-objects/workspace-id.test.ts
 *
 * Unit tests for WorkspaceId value object.
 *
 * Layer: VS0 Shared Kernel — Domain (pure)
 */
import { describe, expect, it } from 'vitest';

import { WORKSPACE_ID_ERRORS, WorkspaceId } from './workspace-id';

describe('WorkspaceId', () => {
  describe('from()', () => {
    it('creates a WorkspaceId from a valid non-empty string', () => {
      const result = WorkspaceId.from('ws-abc123');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('ws-abc123');
      }
    });

    it('trims whitespace from the input', () => {
      const result = WorkspaceId.from('  ws-trimmed  ');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe('ws-trimmed');
      }
    });

    it('returns WORKSPACE_ID_EMPTY error for an empty string', () => {
      const result = WorkspaceId.from('');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(WORKSPACE_ID_ERRORS.EMPTY);
      }
    });

    it('returns WORKSPACE_ID_EMPTY error for a whitespace-only string', () => {
      const result = WorkspaceId.from('   ');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(WORKSPACE_ID_ERRORS.EMPTY);
      }
    });
  });

  describe('equals()', () => {
    it('returns true for two WorkspaceIds with the same value', () => {
      const a = WorkspaceId.from('ws-1');
      const b = WorkspaceId.from('ws-1');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(true);
      }
    });

    it('returns false for two WorkspaceIds with different values', () => {
      const a = WorkspaceId.from('ws-1');
      const b = WorkspaceId.from('ws-2');
      expect(a.ok && b.ok).toBe(true);
      if (a.ok && b.ok) {
        expect(a.value.equals(b.value)).toBe(false);
      }
    });
  });

  describe('toString()', () => {
    it('returns the raw string value', () => {
      const result = WorkspaceId.from('ws-abc');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.toString()).toBe('ws-abc');
      }
    });
  });
});
