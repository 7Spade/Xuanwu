---
name: x-arch-remediation
description: 'Architecture drift remediation, iterative alignment refactor, and legacy decoupling. Repairs layer violations, boundary intrusions, and naming drift through phased, priority-ordered execution.'
agent: 'agent'
tools: ['search/codebase', 'repomix/*', 'sequentialthinking/*', 'software-planning/*', 'edit/editFiles']
argument-hint: 'Target scope, e.g.: src/features/workspace.slice or src/ for full remediation'
---

# Architecture Remediation — Drift Repair · Iterative Alignment · Legacy Decoupling

## Source of Truth

- [docs/architecture/00-logic-overview.md](../../docs/architecture/00-logic-overview.md)
- [docs/domain-glossary.md](../../docs/domain-glossary.md)

## Phase 1: Drift Inventory

1. Use #tool:repomix to scan the target directory (or `src/` for full scope).
2. Use #tool:sequential-thinking to enumerate **all** non-compliant items — not samples.
3. Identify coupling hotspots, anti-corruption seam gaps, and responsibility misplacements.

## Phase 2: Priority Classification

| Priority | Type | Examples |
|----------|------|---------|
| P0 | Security / authority boundary violation | Direct `firebase/*` import from feature slice |
| P1 | BC boundary intrusion | Direct cross-BC Aggregate write |
| P2 | Layer violation | Application Layer calling Infrastructure directly |
| P3 | Naming drift | Identifiers inconsistent with `domain-glossary.md` |

Use #tool:software-planning to produce the full prioritized remediation plan.

## Phase 3: Remediation Execution

Execute **P0 first**, then P1, P2, P3. For each item:

1. State the target boundary and target file structure.
2. Apply the smallest safe change that restores compliance.
3. Re-check compliance after each fix iteration before proceeding.

### Remediation Patterns

| Violation | Pattern |
|-----------|---------|
| D24 — firebase direct import | Move to L7 Firebase ACL Adapter |
| D2 — cross-BC private reference | Use `@/features/{slice}/index` public API |
| D3 — write outside `_actions.ts` | Move mutation logic into `_actions.ts` |
| D6 — `use client` in layout | Split into separate Client Component leaf node |
| Legacy coupling hotspot | Define anti-corruption seam → phased migration |

## Legacy Decoupling Strategy

When scope includes legacy or monolithic code:

1. Analyze coupling hotspots with #tool:repomix.
2. Define target boundaries and anti-corruption seams.
3. Plan phased migration — **small, safe batches** that preserve behavior while relocating responsibilities.
4. For each batch: move → verify behavior → advance.

## Iteration Loop (for incremental alignment)

Repeat until fully compliant:

1. Read authoritative docs and current code state.
2. Detect drifts (naming, structure, dependency, logic).
3. Propose and apply minimal safe fixes.
4. Re-check compliance after each pass.
5. Document residual risks if full remediation requires future PRs.

## Completion Criteria

Re-run `/x-arch-audit` after all P0–P1 items are resolved and confirm the audit report is clean.

## Output

- Migration phases with target file map
- Risk and rollback notes per batch
- Drift report per iteration
- Final compliance summary

Remediation target: ${input:target:Enter directory or slice to remediate}
