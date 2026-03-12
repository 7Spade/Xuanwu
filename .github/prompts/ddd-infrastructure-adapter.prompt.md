---
name: ddd-infrastructure-adapter
description: 'Design or implement Infrastructure Layer adapters: Firestore Repository, Event Bus, Outbox writer, Storage adapter — fulfilling port interfaces for a Xuanwu bounded context.'
agent: 'ddd-infrastructure'
argument-hint: 'Context and adapter type, e.g.: workspace.slice FirestoreTaskRepository | skill-xp.slice XpOutboxWriter'
---

# DDD Infrastructure Adapter Workflow

This prompt drives Step 3 of the DDD cycle: implement port interfaces with concrete adapters.

## Task Types

1. **Repository Adapter** — Firestore implementation of IRepository for an aggregate.
2. **Outbox Writer** — Transactional event publishing via the outbox pattern [S1].
3. **Storage Adapter** — Firebase Storage upload/download operations.
4. **Queue Adapter** — Cloud Tasks or background job integration.
5. **D24 Remediation** — Move Firebase SDK calls from feature slices into proper adapters.

## Workflow

1. Identify the port interface to implement from `src/shared-kernel/ports/`.
2. Check infra contracts needed: `src/shared-kernel/infra-contracts/`.
3. Write the adapter class implementing the port interface.
4. Use Transactional Outbox [S1] for all `save()` operations.
5. Add Version Guard [S2] for optimistic locking.
6. Write adapter tests using Firestore emulator or jest mocks.

## Guardrails

- Adapter class MUST implement a port interface — no standalone concrete class.
- MUST use transactional outbox pattern [S1] for aggregate saves.
- NO business logic inside adapters — only data mapping and I/O.
- Firebase SDK calls MUST stay inside `src/features/infra.*` or `src/shared-infra/`.
- Feature slice `domain.*` and `core/` folders must never import from `firebase`.

## Output Contract

- Adapter class in `src/features/infra.*/` or `src/features/{slice}/infra.outbox/`.
- Port interface in `src/shared-kernel/ports/` (if new).
- Infra contract reference in `src/shared-kernel/infra-contracts/` (if applicable).
- Adapter tests using Firestore emulator or mocks.

Bounded context / slice: ${input:context:e.g. workspace.slice}
Adapter type and name: ${input:adapter:e.g. FirestoreTaskRepository}
