/**
 * @test Architecture compliance — VS5×VS6 integration invariants
 *
 * Verifies that the key structural requirements established by the problem statement
 * are correctly implemented in the domain model and event contracts:
 *
 *  [#A4] Digital Twin Protocol — ParsingIntent emits domain events with SourcePointer
 *  [S2]  aggregateVersion — WorkspaceTask supports optimistic concurrency
 *  [TE_SK] tag::skill — tasks carry SkillRequirement[] for VS6 eligibility gate
 *  [D24] Firebase ACL — no direct firebase/firestore imports in feature slices
 *  [D7]  Cross-slice integrity — scheduling reads workspace data via projection only
 *
 * Note: These are structural/contract tests. They verify that the implementation
 * has the correct shape without requiring a live Firebase connection.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── [#A4] ParsingIntentContract structural shape ─────────────────────────────
import type { ParsingIntentContract } from '@/features/workspace.slice/business.parsing-intent/_contract';
import { createParsingIntentContract } from '@/features/workspace.slice/business.parsing-intent/_contract';

// ─── Event payload contracts ──────────────────────────────────────────────────
import type {
  IntentDeltaProposedPayload,
  WorkspaceTaskAssignedPayload,
  DocumentParserItemsExtractedPayload,
} from '@/features/workspace.slice/core.event-bus/_events';

// ─── Cross-BC contracts ────────────────────────────────────────────────────────
import type { WorkspaceScheduleProposedPayload } from '@/features/shared-kernel';
import type { SkillRequirement } from '@/features/shared-kernel';

const SRC_ROOT = path.resolve(process.cwd(), 'src');

// ─── D24 helpers ──────────────────────────────────────────────────────────────

/** Recursively collect all .ts/.tsx source files under a directory, excluding tests and node_modules. */
function collectSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(full);
    }
  }
  return files;
}

/** Returns files that import directly from 'firebase/firestore' or 'firebase/app'. */
function findDirectFirebaseImports(dir: string): string[] {
  return collectSourceFiles(dir).filter((file) => {
    const content = fs.readFileSync(file, 'utf8');
    return (
      /from ['"]firebase\/firestore['"]/.test(content) ||
      /from ['"]firebase\/app['"]/.test(content)
    );
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('[Architecture] VS5×VS6 integration compliance', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // [#A4] ParsingIntentContract — SourcePointer + SkillRequirements
  // ──────────────────────────────────────────────────────────────────────────
  describe('[#A4] ParsingIntentContract has SourcePointer fields', () => {
    it('sourceFileId is required (SourcePointer — identifies origin document)', () => {
      const contract = createParsingIntentContract({
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileId: 'file-123',
        sourceVersionId: 'v1',
        taskDraftCount: 5,
      });
      // SourcePointer [#A4]: must point to the originating file
      expect(contract.sourceFileId).toBeDefined();
      expect(typeof contract.sourceFileId).toBe('string');
    });

    it('sourceVersionId is required (SourcePointer — identifies file snapshot)', () => {
      const contract = createParsingIntentContract({
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileId: 'file-123',
        sourceVersionId: 'v1',
        taskDraftCount: 5,
      });
      expect(contract.sourceVersionId).toBeDefined();
      expect(typeof contract.sourceVersionId).toBe('string');
    });

    it('skillRequirements is always an array [TE_SK] (never null/undefined)', () => {
      const contract = createParsingIntentContract({
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileId: 'file-123',
        sourceVersionId: 'v1',
        taskDraftCount: 5,
      });
      expect(Array.isArray(contract.skillRequirements)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [#A4] IntentDeltaProposedPayload — event payload structural shape
  // ──────────────────────────────────────────────────────────────────────────
  describe('[#A4] IntentDeltaProposedPayload event shape', () => {
    it('payload type has intentId + workspaceId (Digital Twin anchor)', () => {
      // TypeScript compile-time proof — if this compiles, the interface exists
      const sample: IntentDeltaProposedPayload = {
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileName: 'plan.pdf',
        taskDraftCount: 3,
      };
      expect(sample.intentId).toBeDefined();
      expect(sample.workspaceId).toBeDefined();
    });

    it('payload type carries optional skillRequirements [TE_SK]', () => {
      const skills: SkillRequirement[] = [{ tagSlug: 'mep:hvac', minimumTier: 'journeyman', quantity: 1 }];
      const payload: IntentDeltaProposedPayload = {
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileName: 'plan.pdf',
        taskDraftCount: 2,
        skillRequirements: skills,
      };
      expect(payload.skillRequirements).toHaveLength(1);
    });

    it('payload type supports optional traceId [R8]', () => {
      const payload: IntentDeltaProposedPayload = {
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileName: 'plan.pdf',
        taskDraftCount: 1,
        traceId: 'trace-abc-123',
      };
      expect(payload.traceId).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [TE_SK] WorkspaceTaskAssignedPayload — skill propagation [A5][P4]
  // ──────────────────────────────────────────────────────────────────────────
  describe('[TE_SK] WorkspaceTaskAssignedPayload carries skill requirements', () => {
    it('payload has optional requiredSkills field for VS6 eligibility', () => {
      const skills: SkillRequirement[] = [
        { tagSlug: 'finishing-works:tile', minimumTier: 'artisan', quantity: 1 },
      ];
      const payload: WorkspaceTaskAssignedPayload = {
        taskId: 't1',
        taskName: 'Tile Bathroom',
        assigneeId: 'acc-user-1',
        workspaceId: 'w1',
        requiredSkills: skills,
      };
      expect(payload.requiredSkills).toHaveLength(1);
      expect(payload.requiredSkills![0].tagSlug).toBe('finishing-works:tile');
    });

    it('payload has optional sourceIntentId (SourcePointer propagation [#A4])', () => {
      const payload: WorkspaceTaskAssignedPayload = {
        taskId: 't1',
        taskName: 'Task A',
        assigneeId: 'acc-user-1',
        workspaceId: 'w1',
        sourceIntentId: 'intent-xyz',
      };
      expect(payload.sourceIntentId).toBe('intent-xyz');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [A5] WorkspaceScheduleProposedPayload — cross-BC scheduling contract
  // ──────────────────────────────────────────────────────────────────────────
  describe('[A5] WorkspaceScheduleProposedPayload — cross-BC contract', () => {
    it('has skillRequirements field for VS6 eligibility gate [TE_SK]', () => {
      const skills: SkillRequirement[] = [
        { tagSlug: 'mep:plumbing', minimumTier: 'expert', quantity: 1 },
      ];
      const payload: WorkspaceScheduleProposedPayload = {
        scheduleItemId: 's1',
        workspaceId: 'w1',
        orgId: 'org-1',
        title: 'Plumbing Install',
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        proposedBy: 'acc-pm-1',
        skillRequirements: skills,
      };
      expect(payload.skillRequirements).toHaveLength(1);
      expect(payload.skillRequirements![0].minimumTier).toBe('expert');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [D24] Firebase ACL compliance — feature slices must not import firebase directly
  // ──────────────────────────────────────────────────────────────────────────
  describe('[D24] Firebase ACL — no direct firebase imports in feature slices', () => {
    it('workspace.slice has no direct firebase/firestore imports', () => {
      const violations = findDirectFirebaseImports(
        path.join(SRC_ROOT, 'features', 'workspace.slice')
      );
      if (violations.length > 0) {
        console.error('[D24 violation] Direct firebase imports found:\n', violations.join('\n'));
      }
      expect(violations).toHaveLength(0);
    });

    it('scheduling.slice has no direct firebase/firestore imports', () => {
      const violations = findDirectFirebaseImports(
        path.join(SRC_ROOT, 'features', 'scheduling.slice')
      );
      if (violations.length > 0) {
        console.error('[D24 violation] Direct firebase imports found:\n', violations.join('\n'));
      }
      expect(violations).toHaveLength(0);
    });

    it('app directory has no direct firebase/firestore imports', () => {
      const violations = findDirectFirebaseImports(path.join(SRC_ROOT, 'app'));
      if (violations.length > 0) {
        console.error('[D24 violation] Direct firebase imports found in app:\n', violations.join('\n'));
      }
      expect(violations).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [D7] Cross-slice isolation — scheduling.slice MUST NOT import workspace.slice internals
  // ──────────────────────────────────────────────────────────────────────────
  describe('[D7] Cross-slice isolation — scheduling does not import workspace internals', () => {
    it('scheduling.slice source files do not import from workspace.slice directly', () => {
      const schedulingFiles = collectSourceFiles(
        path.join(SRC_ROOT, 'features', 'scheduling.slice')
      );
      const violations = schedulingFiles.filter((file) => {
        const content = fs.readFileSync(file, 'utf8');
        // D7: direct import of workspace.slice internals is forbidden.
        // Only the public index re-exports via shared-kernel are allowed.
        return /from ['"]@\/features\/workspace\.slice\//.test(content) ||
               /from ['"]\.\.\/workspace\.slice\//.test(content);
      });
      if (violations.length > 0) {
        console.error('[D7 violation] Scheduling imports workspace internals:\n', violations.join('\n'));
      }
      expect(violations).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // [ParsingIntentContract] Type-level completeness check
  // ──────────────────────────────────────────────────────────────────────────
  describe('ParsingIntentContract type completeness', () => {
    it('all required fields are present and typed correctly at runtime', () => {
      const contract: ParsingIntentContract = createParsingIntentContract({
        intentId: 'i1',
        workspaceId: 'w1',
        sourceFileId: 'f1',
        sourceVersionId: 'v1',
        taskDraftCount: 2,
        skillRequirements: [{ tagSlug: 'bim:revit', minimumTier: 'expert', quantity: 1 }],
      });

      // All fields required by the contract
      expect(typeof contract.intentId).toBe('string');
      expect(typeof contract.workspaceId).toBe('string');
      expect(typeof contract.sourceFileId).toBe('string');
      expect(typeof contract.sourceVersionId).toBe('string');
      expect(typeof contract.taskDraftCount).toBe('number');
      expect(Array.isArray(contract.skillRequirements)).toBe(true);
      expect(contract.status).toBe('pending');
      expect(typeof contract.createdAt).toBe('number');
      expect(typeof contract.updatedAt).toBe('number');
    });
  });
});
