---
name: create-vertical-slice
description: 'Design a new vertical slice OR perform architecture-first logic design/refactoring on existing code. Covers both new slice scaffolding (boundary, file tree, public API) and the full Review→Fix→Verify lifecycle for existing slices.'
agent: 'agent'
tools: ['search/codebase', 'edit/editFiles', 'read', 'sequentialthinking/*', 'software-planning/*', 'memory/*']
argument-hint: 'Name, purpose, or refactor scope, e.g.: VS10-Reporting — analytics slice | refactor VS0/VS7 event exit model'
---

# Vertical Slice Design — Implementation · Logic Design · Architecture-First

## First Principle

**Architecture correctness takes precedence over minimal-change or fastest-delivery.** Execute the full `Review → Fix → Verify` lifecycle; never stop at analysis.

## Source of Truth

- [docs/architecture/00-logic-overview.md](../../docs/architecture/00-logic-overview.md)
- [.memory/knowledge-graph.json](../../.memory/knowledge-graph.json)
- [skills/SKILL.md](../../skills/SKILL.md)

---

## Phase A — Architecture Review

1. Restate requirement; define In-Scope / Out-of-Scope.
2. Read target files and SSOT documents.
3. Produce Findings (Critical → Low):
   - Logic errors (data flow / event flow / control flow contradictions)
   - Boundary violations (cross-layer direct calls, authority bypass)
   - Contract drift (ports / invariants)
   - Operational risks (observability gaps, DLQ missing, error classification)
4. Apply P0–P3 priority ordering to all findings.

## Phase B — Design or Implementation

### For a new slice:
1. Define public API and slice scope.
2. Place code by layer responsibility:
   - `_actions.ts` — writes/mutations only
   - `_queries.ts` — reads only
   - `_services.ts` — domain logic
   - `domain.*/` — aggregates, policies, events
3. Validate dependency direction: Presentation → Application → Domain → Infrastructure.
4. Validate cross-slice access: only via `@/features/{slice}/index`.

### For refactoring existing code:
1. Propose minimal fix strategy per finding (P0 first).
2. Modify files directly; ensure boundary and dependency direction are correct.
3. Do not use "minimal change" to justify preserving incorrect semantics.

## Phase C — Verification

1. Run syntax/type/render checks.
2. Verify each fix eliminates the corresponding finding.
3. Document residual risks if any remain.

## Mandatory Rules

1. Define responsibility boundary **before** discussing implementation details.
2. Guarantee single authority exit and correct dependency direction.
3. Explicitly mark forbidden paths and bypass risks.
4. UI text must use i18n keys; sync `public/localized-files/en.json` and `public/localized-files/zh-TW.json`.
5. No unauthorized cross-layer calls or side effects.
6. Default to implementing fixes; only audit-without-change if user explicitly requests it.
7. Every conclusion must cite file evidence (`path:line`).
8. Domain must not depend on infra SDK/adapter directly.
9. One canonical path per capability (no duplicate strategies).
10. Abstract layers without governance value are debt — remove or merge.

## Priority Framework

| Priority | Type |
|----------|------|
| P0 | Architecture collapse risk: single exit bypassed, cross-layer direct, auth/security boundary failure |
| P1 | Critical path risk: affects main data flow, event flow, or query trunk |
| P2 | Consistency/governance risk: contract drift, semantic inconsistency |
| P3 | Readability/maintainability: naming, diagram legibility, doc polish |

P0/P1 must be resolved before declaring completion.

## Output

```
## Findings (Critical → Low)
## Priority Order (P0 → P3)
## Evidence (file:line)
## Fix Plan
## Implemented Changes
## Verification Results
## Residual Risks

(For new slice also include:)
## Proposed File Tree
## Boundary Risk Checklist
## Minimal Implementation Sequence
```

Task: ${input:task:Describe the slice to create or the logic to design/refactor}
