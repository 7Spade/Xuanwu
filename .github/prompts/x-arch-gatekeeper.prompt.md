---
name: x-arch-gatekeeper
description: 'Pre-commit architecture compliance check. Validates code diffs against Hard Invariants (D1–D20), DDD boundary rules, and CI gates to ensure no governance violations enter the main branch. Includes boundary-only mode for D3/domain isolation/orchestration checks. Triggers: "pre-commit check", "gate check", "hard invariants", "boundary guard", "ddd check", "aggregate write guard", "boundary-check".'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'search/codebase', 'changes']
argument-hint: 'Optional target path or mode, e.g.: src/features/workspace.slice OR mode=boundary-only'
---

# Pre-Commit Architecture Gatekeeper

## Gatekeeper Mission

Validate the current code changes against all Hard Invariants, DDD boundary rules, and CI gates before merge. If any violation is detected, **halt the merge** and output a detailed remediation guide.

## Execution Steps

1. **Diff Analysis:** Use `#tool:repomix` to generate a change summary of modified files.
2. **Rule Verification:** Use `#tool:sequential-thinking` to check each item:

### Boundary-only mode

If `mode=boundary-only` (or the input clearly asks for boundary checking), run only:
- **Aggregate write-protection (D3)**: no writes outside `_actions.ts`
- **Domain isolation**: no infrastructure dependency leakage into domain layer
- **Application orchestration correctness**: application coordinates, domain decides
- **Terminology alignment**: identifiers align with `docs/domain-glossary.md`

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
