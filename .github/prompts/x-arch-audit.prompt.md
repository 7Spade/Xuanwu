---
name: x-arch-audit
description: 'Full architecture compliance audit. Cross-checks implementation against SSOT docs to detect layer violations, naming drift, boundary intrusions, event contract issues, and Firebase access violations. Use when: full compliance audit, pre-merge review, technical debt assessment. Triggers: "architecture audit", "compliance check", "arch review", "layer violation", "boundary check".'
agent: 'agent'
tools: ['repomix/*', 'sequentialthinking/*', 'software-planning/*', 'search/codebase']
argument-hint: 'Optional: target directory or slice, e.g.: src/features/workspace.slice. Defaults to full src/.'
---

# Architecture Compliance Auditor

## Required References (read first)

- [docs/architecture/00-logic-overview.md](../../docs/architecture/00-logic-overview.md) — SSOT: business logic, hard invariants, authority exits
- [docs/architecture/00-architecture-standards.md](../../docs/architecture/00-architecture-standards.md) — naming, structure, public API
- [docs/architecture/01-logical-flow.md](../../docs/architecture/01-logical-flow.md) — L0–L6 layers, CQRS chains, Track A/B
- [.memory/knowledge-graph.json](../../.memory/knowledge-graph.json)
- [docs/domain-glossary.md](../../docs/domain-glossary.md)

## Audit Workflow

1. **Load Truth:** Use `#tool:repomix` to load the target code alongside the SSOT docs.
2. **Run Analysis:** Use `#tool:sequential-thinking` to iterate through each check dimension below.
3. **Generate Report:** Use `#tool:software-planning` to produce the audit report and remediation plan.

## Check Matrix

| Dimension | Standard | Violation Examples |
|-----------|----------|--------------------|
| Layer Dependency | Presentation → Application → Domain → Infrastructure (L0–L6 unidirectional) | L3 slice importing L0 trigger directly |
| File Naming | `_actions.ts`, `_queries.ts`, `_services.ts` private convention | `*.actions.ts` still present |
| Cross-BC Reference | Must be via `@/features/{slice}/index` only | Direct import of `_services.ts` from another slice |
| Aggregate Write | Only `_actions.ts` may write (D3) | Firestore writes in `_queries.ts` or page components |
| Event Contract | OUTBOX events must declare DLQ tier [D13] | Missing `dlq` field in OUTBOX contract |
| Firebase Access | `firebase-admin` only in `backend-firebase/functions/` [D25] | `firebase-admin` in `src/app/` |
| Bounded Context | Terminology must match `domain-glossary.md` | Mismatched aggregate names |
| Server/Client Split | `'use client'` only in `_components/` or `_hooks/` leaf nodes [D6] | `'use client'` in layout files |
| Cross-cutting Authority | Only `global-search.slice` for search; only `notification-hub.slice` for notifications | Other slices implementing search logic |

## Output Format

```markdown
## Architecture Audit Report — [date / PR / commit]

### Passed Checks
- [list]

### Violations
| ID | Dimension | Location (path:line) | Rule | Fix |
|----|-----------|----------------------|------|-----|
| V1 | Layer Dependency | src/features/foo.slice/_actions.ts:42 | L3 must not import L0 | Move to SK_PORTS |

### Remediation Plan
[Priority-ordered list of minimal fixes, grouped by severity: Critical → High → Medium]

### Compliance Summary
- Critical violations: N (must fix before merge)
- High violations: N (must fix before merge)
- Medium violations: N (schedule for next sprint)
```
