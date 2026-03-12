---
name: ddd-application-service
description: 'Design or implement Application Layer: Use Cases, Command Handlers, Query Handlers, and Application Services for a Xuanwu bounded context.'
agent: 'ddd-application-layer'
argument-hint: 'Context and use case, e.g.: workspace.slice CreateTaskUseCase | skill-xp.slice GrantXpCommand'
---

# DDD Application Service Workflow

This prompt drives Step 2 of the DDD cycle: thin orchestration layer using domain + ports.

## Task Types

1. **Command Handler** — Implement a write operation (create, update, complete).
2. **Query Handler** — Implement a read operation from read-model projections.
3. **Application Service** — Coordinate multiple use cases or cross-context sagas.
4. **Thickness Audit** — Identify business logic that leaked into application services and move it to domain.

## Workflow

1. Identify the port interfaces needed (IRepository, IEventBus, etc.) from `src/shared-kernel/ports/`.
2. Write the use case function signature with explicit `deps` (port interfaces).
3. Implement: load aggregate → apply domain behavior → persist → emit event.
4. Keep all `if/else` business rules inside domain methods.
5. Write an integration test using mocked ports.

## Guardrails

- Use cases MUST be independently testable with mocked port implementations.
- No direct Firebase, Firestore, or SDK imports.
- No business rule logic (e.g., `if (status === 'approved')`) — delegate to domain.
- Queries use projection/read-model collections — not aggregates.

## Output Contract

- `core/_use-cases.ts` — Use case functions with typed deps.
- `_actions.ts` — Next.js Server Actions wrapping the use case.
- `_queries.ts` — Query handlers returning read-model DTOs.
- Integration tests with mocked ports.

Bounded context / slice: ${input:context:e.g. workspace.slice}
Use case to implement: ${input:usecase:e.g. CreateTaskUseCase}
