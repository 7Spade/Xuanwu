---
name: x-arch-remediation
description: 'Architecture drift remediation. Systematically repairs layer violations and boundary intrusions in the codebase to restore compliance. Supports single-pass repair and iterative alignment modes. Triggers: "arch remediation", "fix drift", "repair violations", "iterative alignment", "align to ssot", "fix architecture".'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'software-planning/*', 'search/codebase', 'edit/editFiles']
argument-hint: 'Target scope for remediation, e.g.: src/features/workspace.slice or full src/. Append "--iterate" for iterative alignment mode.'
---

# Architecture Drift Remediation Specialist

Repair code drift in a single pass (default) or through iterative alignment until implementation matches the SSOT.

## Remediation Workflow

### Phase 1: Drift Inventory

1. Use `#tool:repomix` to scan the target `src/` directory (or subdirectory).
2. Use `#tool:sequential-thinking` to enumerate **all** non-compliant items — not merely samples.
3. Detect drifts across: naming, structure, dependency direction, logic, terminology.

### Phase 2: Priority Classification

| Priority | Type | Examples |
|----------|------|---------|
| P0 | Security boundary violation | Direct `firebase-admin` import from feature slice [D25] |
| P1 | BC boundary intrusion | Direct cross-BC Aggregate write |
| P2 | Layer violation | Application Layer calling Infrastructure directly |
| P3 | Naming drift | Variables inconsistent with `domain-glossary.md` |

### Phase 3: Remediation Execution

Use `#tool:software-planning` to generate a prioritized remediation plan; execute P0 items first using `#tool:edit/editFiles`.

### Phase 4: Verification (Iterative Mode)

When `--iterate` flag is used, after each fix:
1. Re-read the target file from disk.
2. Re-detect remaining drifts.
3. Propose next minimal fix.
4. Re-check compliance after each pass.
5. Continue until the drift report is clean.

## Remediation Patterns

- **D25 Violation (firebase-admin in app layer):** Move to `src/shared-infra/backend-firebase/functions/`.
- **D2 Violation (cross-BC private reference):** Use `@/features/{slice}/index` public API.
- **D3 Violation (write outside _actions.ts):** Move mutation logic into `_actions.ts`.
- **D6 Violation (`use client` in layout):** Split into a separate Client Component leaf node.
- **Naming drift:** Apply `git mv` per `00-architecture-standards.md` §7 migration rules.

## Completion Criteria

Re-run `x-arch-audit` after all P0–P1 items are resolved, confirming the audit report shows zero Critical/High violations.
