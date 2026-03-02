/**
 * @test ParsingIntentContract pure functions — [#A4] Digital Twin Protocol
 *
 * Verifies that the domain contract for ParsingIntent behaves correctly:
 *  - createParsingIntentContract  sets initial pending status and SkillRequirement[]
 *  - markParsingIntentImported    transitions status to 'imported'
 *  - supersedeParsingIntent       transitions status to 'superseded' and records successor
 *
 * [#A4] Digital Twin: ParsingIntent is a domain event containing SourcePointer
 * (sourceFileId + sourceVersionId) and skillRequirements for VS6 eligibility.
 * [S2] aggregateVersion is managed in WorkspaceTask (not in ParsingIntentContract itself).
 */
import { describe, it, expect } from 'vitest';
import {
  createParsingIntentContract,
  markParsingIntentImported,
  supersedeParsingIntent,
} from './_contract';

describe('[#A4] ParsingIntentContract — pure domain functions', () => {
  const baseInput = {
    intentId: 'intent-001',
    workspaceId: 'ws-abc',
    sourceFileId: 'file-xyz',
    sourceVersionId: 'v1',
    taskDraftCount: 3,
  };

  describe('createParsingIntentContract', () => {
    it('creates a pending contract with required SourcePointer fields', () => {
      const contract = createParsingIntentContract(baseInput);

      expect(contract.intentId).toBe('intent-001');
      expect(contract.workspaceId).toBe('ws-abc');
      // SourcePointer [#A4]: source file location anchor
      expect(contract.sourceFileId).toBe('file-xyz');
      expect(contract.sourceVersionId).toBe('v1');
      expect(contract.taskDraftCount).toBe(3);
      expect(contract.status).toBe('pending');
    });

    it('defaults skillRequirements to empty array when not provided', () => {
      const contract = createParsingIntentContract(baseInput);
      // [TE_SK] skillRequirements must always be an array (never undefined)
      expect(Array.isArray(contract.skillRequirements)).toBe(true);
      expect(contract.skillRequirements).toHaveLength(0);
    });

    it('preserves SkillRequirement[] when provided [TE_SK]', () => {
      const requirements = [
        { tagSlug: 'civil-structural:concrete', minimumTier: 'journeyman' as const, quantity: 1 },
        { tagSlug: 'site-management:safety', minimumTier: 'expert' as const, quantity: 1 },
      ];
      const contract = createParsingIntentContract({
        ...baseInput,
        skillRequirements: requirements,
      });
      // [TE_SK] skill requirements must propagate from document parser through to tasks
      expect(contract.skillRequirements).toHaveLength(2);
      expect(contract.skillRequirements[0].tagSlug).toBe('civil-structural:concrete');
      expect(contract.skillRequirements[0].minimumTier).toBe('journeyman');
      expect(contract.skillRequirements[1].tagSlug).toBe('site-management:safety');
    });

    it('sets createdAt and updatedAt timestamps', () => {
      const before = Date.now();
      const contract = createParsingIntentContract(baseInput);
      const after = Date.now();

      expect(contract.createdAt).toBeGreaterThanOrEqual(before);
      expect(contract.createdAt).toBeLessThanOrEqual(after);
      expect(contract.updatedAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('markParsingIntentImported', () => {
    it('transitions status from pending to imported', () => {
      const pending = createParsingIntentContract(baseInput);
      expect(pending.status).toBe('pending');

      const imported = markParsingIntentImported(pending);
      expect(imported.status).toBe('imported');
    });

    it('preserves all other fields when marking imported', () => {
      const pending = createParsingIntentContract({
        ...baseInput,
        skillRequirements: [{ tagSlug: 'bim:revit', minimumTier: 'expert' as const, quantity: 1 }],
      });
      const imported = markParsingIntentImported(pending);

      expect(imported.intentId).toBe(pending.intentId);
      expect(imported.workspaceId).toBe(pending.workspaceId);
      expect(imported.sourceFileId).toBe(pending.sourceFileId);
      expect(imported.skillRequirements).toHaveLength(1);
    });

    it('updates updatedAt when marking imported', () => {
      const pending = createParsingIntentContract(baseInput);
      const before = Date.now();
      const imported = markParsingIntentImported(pending);
      const after = Date.now();

      expect(imported.updatedAt).toBeGreaterThanOrEqual(before);
      expect(imported.updatedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('supersedeParsingIntent', () => {
    it('transitions status from pending to superseded and records successor', () => {
      const pending = createParsingIntentContract(baseInput);
      const superseded = supersedeParsingIntent(pending, 'intent-002');

      expect(superseded.status).toBe('superseded');
      expect(superseded.supersedesIntentId).toBe('intent-002');
    });

    it('preserves all other fields when superseding', () => {
      const pending = createParsingIntentContract(baseInput);
      const superseded = supersedeParsingIntent(pending, 'intent-002');

      expect(superseded.intentId).toBe(pending.intentId);
      expect(superseded.workspaceId).toBe(pending.workspaceId);
    });

    it('allows chaining: imported → superseded (Digital Twin version chain [#A4])', () => {
      const v1 = createParsingIntentContract(baseInput);
      const v1imported = markParsingIntentImported(v1);
      const v1superseded = supersedeParsingIntent(v1imported, 'intent-v2');

      expect(v1superseded.status).toBe('superseded');
      expect(v1superseded.supersedesIntentId).toBe('intent-v2');
    });
  });
});
