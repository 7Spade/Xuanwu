---
name: "Xuanwu DDD Layer Rules"
description: "Four-layer DDD enforcement rules: Presentation → Application → Domain → Infrastructure. Applied to all src/ TypeScript/JavaScript files."
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Xuanwu DDD Layer Rules

This project follows a strict 4-layer DDD architecture inside each feature slice.
All code in `src/` MUST respect the layer dependency direction defined below.

## Layer Diagram

```
┌──────────────────────────────┐
│ Presentation Layer           │  src/**/_components/, src/app/
│ (UI / API / Controller)      │
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Application Layer            │  src/**/core/_use-cases.ts
│ (Use Cases / ApplicationSvc) │  src/**/_actions.ts, _queries.ts
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Domain Layer                 │  src/**/domain.*/
│ (Entities / ValueObjects /   │  src/shared-kernel/value-objects/
│  Domain Services / Rules)    │  src/shared-kernel/data-contracts/
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Infrastructure Layer         │  src/shared-infra/
│ (DB / API / Queue / Storage) │  src/features/infra.*/
└──────────────────────────────┘
```

## Dependency Rules (MUST enforce)

### Presentation Layer
- MUST NOT import from Domain or Infrastructure directly.
- MUST call Application Layer (use cases, actions, queries) only.
- MUST NOT contain business logic or validation rules.
- React components use `'use client'` only when browser APIs or interactivity require it.

### Application Layer (Use Cases / Application Services)
- MUST NOT import from Presentation or Infrastructure directly.
- MUST call Domain objects (entities, value objects, domain services) for business logic.
- MUST call Infrastructure via **port interfaces** defined in `src/shared-kernel/ports/`.
- MUST NOT contain business rule logic — delegate to Domain layer.
- Orchestrates: load aggregate → apply domain logic → persist via port → emit event.

### Domain Layer (Entities / Value Objects / Domain Services / Rules)
- MUST be pure: no I/O, no side effects, no framework imports.
- MUST NOT import from Application, Presentation, or Infrastructure.
- Entity invariants MUST be enforced inside the entity, not in application services.
- Value Objects MUST be immutable and self-validating.
- Domain Services handle logic that doesn't belong to a single entity.

### Infrastructure Layer (Repositories / Adapters / Queue / Storage)
- MUST implement port interfaces defined in `src/shared-kernel/ports/`.
- MUST NOT contain business logic.
- MUST NOT be imported by Application or Domain layers directly (use ports).
- Adapter implementations live in `src/features/infra.*/` or `src/shared-infra/`.

## Forbidden Imports (violates layer direction)

```typescript
// ❌ Application layer calling Infrastructure directly (bypass port)
import { FirestoreAdapter } from '@/shared-infra/firebase-client'

// ❌ Domain layer importing Application logic
import { createTaskUseCase } from '@/features/workspace.slice/core/_use-cases'

// ❌ Presentation calling Domain directly (must go through Application)
import { TaskEntity } from '@/features/workspace.slice/domain.tasks/_entity'

// ✅ Correct: Presentation → Application
import { createTask } from '@/features/workspace.slice'

// ✅ Correct: Application → Domain (entity/VO)
import { TaskEntity } from './_entity'

// ✅ Correct: Application → Port interface (not adapter)
import type { IFirestoreRepo } from '@/shared-kernel'
```

## File Placement Rules per Layer

| Layer | Allowed paths in a slice |
|-------|--------------------------|
| Presentation | `_components/`, `index.ts` public API re-exports |
| Application | `core/_use-cases.ts`, `core/_actions.ts`, `_actions.ts`, `_queries.ts` |
| Domain | `domain.*/_entity.ts`, `domain.*/_value-objects.ts`, `domain.*/_service.ts` |
| Infrastructure | `infra.outbox/`, `core.event-store/`, `core.event-bus/` |

## Cross-Layer Communication Pattern

```
UI Action
  └─> Server Action / Route Handler  [Application]
        └─> Use Case
              ├─> Load Aggregate via IRepository port  [Domain]
              ├─> Apply business rule on Aggregate      [Domain]
              ├─> Persist via IRepository.save()        [Infrastructure]
              └─> Emit DomainEvent via IEventBus port   [Infrastructure]
```

## References
- Architecture SSOT: `docs/architecture/README.md`
- Domain model: `docs/architecture/models/domain-model.md`
- Application services: `docs/architecture/blueprints/application-service-spec.md`
- Infrastructure spec: `docs/architecture/guidelines/infrastructure-spec.md`
- Ports: `src/shared-kernel/ports/`
