---
name: ddd-slice-scaffold
description: 'Scaffold a complete DDD-structured feature slice with all four layers: Domain (entities/VOs), Application (use cases/actions), Infrastructure (repository/outbox), and Presentation (components/index).'
agent: 'ddd-orchestrator'
argument-hint: 'Slice name and main aggregate, e.g.: reporting.slice ReportEntity | billing.slice InvoiceEntity'
---

# DDD Slice Scaffold Workflow

This prompt drives the full DDD cycle for a new bounded context from scratch.

## What is scaffolded

```
src/features/{slice-name}/
├── index.ts                         ← Public API (Presentation exports only)
│
├── domain.{context}/                ← Step 1: Domain Layer
│   ├── _entity.ts                   ← Aggregate Root
│   ├── _value-objects.ts            ← Value Objects
│   ├── _service.ts                  ← Domain Service (if needed)
│   └── _events.ts                   ← Domain Events
│
├── core/                            ← Step 2: Application Layer
│   ├── _use-cases.ts                ← Use Case functions
│   ├── _actions.ts                  ← Server Actions (Next.js)
│   └── _queries.ts                  ← Read queries
│
├── infra.outbox/                    ← Step 3: Infrastructure Layer
│   ├── _outbox-writer.ts            ← Transactional Outbox [S1]
│   └── _repository.ts               ← Firestore Repository adapter
│
├── core.event-bus/                  ← Integration Event contracts
│   └── _events.ts
│
└── _components/                     ← Step 4: Presentation Layer
    ├── {SliceName}View.tsx           ← Main container component
    └── {SubComponent}.tsx
```

## Workflow

1. Read domain glossary from `docs/architecture/models/domain-model.md`.
2. **Domain Layer** (ddd-domain-modeler): Entity + VOs + Events.
3. **Application Layer** (ddd-application-layer): Use cases + Server Actions + Queries.
4. **Infrastructure Layer** (ddd-infrastructure): Repository + Outbox + EventBus adapters.
5. **Presentation Layer** (xuanwu-ui): Components calling server actions.
6. **Public API**: Wire `index.ts` to expose only Presentation exports.
7. **Register**: Add slice to `src/features/README.md`.

## Guardrails

- Domain objects MUST NOT have framework/SDK imports.
- Application layer MUST call only port interfaces.
- Infrastructure MUST implement port interfaces.
- `index.ts` MUST export only Presentation-safe APIs.
- Follow naming from `docs/architecture/README.md` and `.memory/knowledge-graph.json`.

## Output Contract

- Complete file tree matching the scaffold above.
- Each file with correct imports and layer boundary enforcement.
- Unit tests for all domain invariants.
- Integration tests for application use cases with mocked ports.
- Updated `src/features/README.md` slice table.

Slice name: ${input:sliceName:e.g. reporting.slice}
Main aggregate: ${input:aggregate:e.g. ReportEntity}
Primary use cases: ${input:usecases:e.g. CreateReport, ApproveReport, ArchiveReport}
