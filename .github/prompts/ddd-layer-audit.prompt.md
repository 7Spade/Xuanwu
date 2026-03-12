---
name: ddd-layer-audit
description: 'Audit a Xuanwu feature slice or the entire src/ for DDD layer dependency violations: wrong-direction imports, business logic leaks, and D24 Firebase violations.'
agent: 'ddd-orchestrator'
argument-hint: 'Scope to audit, e.g.: src/features/workspace.slice | src/features/skill-xp.slice/domain.tasks'
---

# DDD Layer Audit Workflow

This prompt audits compliance with the 4-layer DDD dependency direction rule.

## What is checked

### Layer Direction Violations
- Presentation imports from Domain directly (should go through Application).
- Application imports from Infrastructure directly (should use port interfaces).
- Domain imports from any upper layer or from infrastructure.
- Infrastructure contains business logic that belongs in Domain.

### Business Logic Leaks
- `if/else` domain rules in application services or infrastructure adapters.
- Validation logic duplicated in multiple layers instead of inside the entity.
- Domain invariants expressed as DTOs rather than as Value Objects.

### D24 Firebase Violations
- `import { Firestore } from 'firebase/firestore'` in feature slice files.
- Direct Firebase SDK usage outside `src/features/infra.*` and `src/shared-infra/`.

### Port Contract Gaps
- Application calling infrastructure adapters by concrete class name (not via port interface).
- Missing port interface for a dependency that crosses layer boundaries.

## Workflow

1. Scan `_actions.ts`, `_queries.ts`, `core/_use-cases.ts` for import violations.
2. Scan `domain.*/_entity.ts` and `domain.*/_value-objects.ts` for framework imports.
3. Scan `_components/` and `app/` for direct domain or infrastructure imports.
4. Check `src/shared-kernel/ports/` for completeness of port interfaces.
5. List violations by severity: BLOCKER (D24) / MAJOR (wrong-direction) / MINOR (thin layer breach).
6. Suggest remediation for each violation following DDD patterns.

## Output Contract

- Violation report: Layer → File → Import → Severity → Fix suggestion.
- Summary: BLOCKERS (must fix) / MAJORS (should fix) / MINORS (good to fix).
- Optional: initiate `ddd-domain-modeler` or `ddd-infrastructure` for fixes.

Audit scope: ${input:scope:e.g. src/features/workspace.slice or src/}
