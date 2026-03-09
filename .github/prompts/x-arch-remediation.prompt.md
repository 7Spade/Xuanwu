---
name: x-arch-remediation
description: 'Architecture drift remediation. Systematically repairs layer violations and boundary intrusions in the codebase to restore compliance.'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'software-planning/*', 'edit/editFiles']
argument-hint: 'Target scope for remediation, e.g.: src/features/workspace.slice or full src/'
---

# Architecture Drift Remediation Specialist

## Remediation Workflow

### Phase 1: Drift Inventory

1. Use #tool:repomix to scan the full `src/` directory.
2. Use #tool:sequential-thinking to enumerate all non-compliant items — not merely samples.

### Phase 2: Priority Classification

| Priority | Type | Examples |
|----------|------|---------|
| P0 | Security boundary violation | Direct firebase/* import from feature slice |
| P1 | BC boundary intrusion | Direct cross-BC Aggregate write |
| P2 | Layer violation | Application Layer calling Infrastructure directly |
| P3 | Naming drift | Variables inconsistent with `domain-glossary.md` |

### Phase 3: Remediation Execution

Use #tool:software-planning to generate a prioritized remediation plan; execute P0 items first.

## Remediation Patterns

- **D24 Violation (firebase direct import):** Move to L7 Firebase ACL Adapter.
- **D2 Violation (cross-BC private reference):** Use `@/features/{slice}/index` public API.
- **D3 Violation (write outside _actions.ts):** Move mutation logic into `_actions.ts`.
- **D6 Violation (`use client` in layout):** Split into a separate Client Component leaf node.

## Completion Criteria

Re-run the x-arch-auditor after all P0–P1 items are resolved, confirming the audit report is clean.
