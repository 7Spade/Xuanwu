---
name: compliance-audit
description: 'Systematic project-wide compliance audit. Validates code, naming, and architectural decisions against core governance documents and Hard Invariants.'
---

# Compliance Audit

## Pre-Audit: Load Context

```
MANDATORY: Before proceeding, invoke tool-repomix to load all architecture documents.
```

## Audit Matrix

| Dimension | Standard Source | Tool |
|-----------|----------------|------|
| Architecture | `docs/architecture/00-LogicOverview.md` | `tool-thinking` |
| Naming | `docs/domain-glossary.md` | `tool-repomix` |
| Data Model | `docs/persistence-model-overview.md` | `tool-thinking` |
| File Structure | `docs/project-structure.md` | `tool-repomix` |
| Tech Stack | `docs/tech-stack.md` | `tool-repomix` |

## Hard Invariant Checklist

- **D1:** Events only dispatched via `infra.outbox-relay` ✓
- **D2:** Cross-slice refs only via `@/features/{slice}/index` ✓
- **D3:** All mutations only in `_actions.ts` ✓
- **D5:** `src/app/` and UI must not import `src/shared/infra/firestore` ✓
- **D6:** `'use client'` only in `_components/` or `_hooks/` leaf nodes ✓
- **D13:** New OUTBOX must declare DLQ tier ✓
- **D24:** Feature slices/shared/types/app must not import `firebase/*` directly ✓

## Report Format

```markdown
## Compliance Audit Report

### Passed ✅
- [List of compliant items]

### Violations ❌
- **[Rule ID]** `[File Path:Line]` — [Description] → [Recommended Fix]

### Recommendations
- [Improvement suggestions not constituting violations]
```
