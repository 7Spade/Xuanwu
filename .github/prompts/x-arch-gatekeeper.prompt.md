---
name: x-arch-gatekeeper
description: 'Pre-commit architecture compliance check. Validates code diffs against Hard Invariants and CI rules to ensure no governance violations enter the main branch.'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'changes']
---

# Pre-Commit Architecture Gatekeeper

## Gatekeeper Mission

Validate the current code changes against all Hard Invariants before merge, ensuring no governance violations enter the main branch.

## Execution Steps

1. **Diff Analysis:** Use #tool:repomix to generate a change summary of modified files.
2. **Rule Verification:** Use #tool:sequential-thinking to check each item:

### Hard Invariants (D1–D20)

| Rule | Content | Check Method |
|------|---------|--------------|
| D1 | Events only via infra.outbox-relay | Check OUTBOX usage |
| D2 | Cross-slice refs via `@/features/{slice}/index` only | Scan import paths |
| D3 | All mutations in `_actions.ts` only | Check write call locations |
| D6 | `'use client'` only in `_components/` or `_hooks/` leaf nodes | Scan directive positions |
| D13 | New OUTBOX must declare DLQ tier | Check OUTBOX contracts |

### CI Rules

- TypeScript compilation: zero type errors.
- ESLint: no new warnings.
- Test coverage: no regression.

## Output

If any violation is detected, **halt the merge** and output a detailed remediation guide.
