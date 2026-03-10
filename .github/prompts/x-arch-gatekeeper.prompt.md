---
name: x-arch-gatekeeper
description: >
  Pre-commit architecture compliance check for Hard Invariants (D1–D20),
  DDD boundaries, and CI gates. Supports boundary-only mode.
triggers:
  - pre-commit check
  - gate check
  - hard invariants
  - mode=boundary-only
  - boundary-check
  - ddd boundary
  - aggregate write guard
  - domain isolation
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'search/codebase', 'changes']
argument-hint: 'Optional target path or mode, e.g.: src/features/workspace.slice OR mode=boundary-only'
---

# Pre-Commit Architecture Gatekeeper

## Gatekeeper Mission

Validate the current code changes against all Hard Invariants, DDD boundary rules, and CI gates before merge. If any violation is detected, **halt the merge** and output a detailed remediation guide.

## Execution Steps

1. **Diff Analysis:** Use `#tool:repomix` to generate a change summary of modified files.
2. **Rule Verification:** Use `#tool:sequential-thinking` to check each item in **Hard Invariants**, **DDD Boundary Rules**, and **CI Gates**.

### Boundary-only mode

If input argument is exactly `mode=boundary-only`, run boundary-only checks.
Also treat natural-language requests containing these phrases as boundary-only:

**Mode triggers**
- `boundary-check`
- `ddd boundary`
- `aggregate write guard`
- `domain isolation`

**Checks to execute in boundary-only mode**
- **Aggregate write-protection (D3)**: no writes outside `_actions.ts`
  - Find direct Firestore writes (`setDoc`, `updateDoc`, `deleteDoc`, `addDoc`) outside `_actions.ts`
- **Domain isolation**: no infrastructure dependency leakage into domain layer
  - Domain layer must not import infrastructure SDK/adapter modules
  - No direct cross-BC writes; cross-BC access must use Query Gateway or published events
- **Application orchestration correctness**: application coordinates, domain decides
- **Terminology alignment**: identifiers align with `docs/domain-glossary.md`

Boundary-only findings format:

```
Violation: <path:line>
Type: [D3 | Domain-Isolation | Orchestration | Terminology]
Why: <brief reason>
Fix: <minimal actionable correction>
```

### Hard Invariants (D1–D20)

| Rule | Content | Check Method |
|------|---------|--------------|
| D1 | Events only via `infra.outbox-relay` | Check OUTBOX usage |
| D2 | Cross-slice refs via `@/features/{slice}/index` only | Scan import paths |
| D3 | All mutations in `_actions.ts` only | Check write call locations |
| D6 | `'use client'` only in `_components/` or `_hooks/` leaf nodes | Scan directive positions |
| D13 | New OUTBOX must declare DLQ tier | Check OUTBOX contracts |
| D25 | `firebase-admin` only in `backend-firebase/functions/` | Scan admin import paths |

### DDD Boundary Rules

Use `#tool:search/codebase` to verify:

1. **Aggregate Write Protection (D3):**
   - Find any Firestore write calls (`setDoc`, `updateDoc`, `deleteDoc`, `addDoc`) outside `_actions.ts`
   - Output format: `Violation: <path:line>` | `Rule: D3` | `Fix: move to _actions.ts`

2. **Domain Layer Independence:**
   - Domain layer must not depend on infrastructure (no direct SDK imports in domain slices)
   - Application layer coordinates; domain layer decides (no coordination logic in domain)

3. **Terminology Consistency:**
   - Identifiers in changed files must match `docs/domain-glossary.md`
   - Flag any new terms not registered in the glossary

4. **Bounded Context Isolation:**
   - No BC may directly write another BC's aggregate
   - Cross-BC data access must use Query Gateway or published events

### CI Gates

- TypeScript compilation: zero type errors
- ESLint: no new warnings
- Test coverage: no regression

## Output

```markdown
## Gatekeeper Result — [date / commit]

### ✅ PASS / 🚫 BLOCK

### Violations Found
| Rule | Location (path:line) | Description | Fix |
|------|----------------------|-------------|-----|

### Remediation Required Before Merge
[Ordered list of fixes]
```
