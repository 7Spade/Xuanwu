---
name: ddd-domain-model
description: 'Design or implement Domain Layer elements: Entities, Value Objects, Aggregates, Domain Services, and invariant rules for a Xuanwu bounded context.'
agent: 'ddd-domain-modeler'
argument-hint: 'Bounded context and entity to model, e.g.: workspace.slice TaskEntity | skill-xp.slice SkillLevelVO'
---

# DDD Domain Model Workflow

This prompt drives Step 1 of the DDD cycle: design pure domain objects with no I/O.

## Task Types

1. **New Entity** — Design an Aggregate Root with identity, mutable state, and invariants.
2. **New Value Object** — Design an immutable, self-validating VO (e.g., `Money`, `TaskId`, `SkillLevel`).
3. **Domain Service** — Design a service for logic spanning multiple entities.
4. **Invariant Audit** — Check existing domain objects for leaked business rules.

## Workflow

1. Read the domain glossary from `docs/architecture/models/domain-model.md`.
2. Identify the Aggregate Root and its consistency boundary.
3. List Value Objects that the entity owns.
4. Define domain events emitted by this entity.
5. Code the entity with factory method, behavior methods, and `pullDomainEvents()`.
6. Code Value Objects as immutable with factory validation.
7. Write unit tests for each invariant case.

## Guardrails

- No `import` from `firebase`, `next`, `react`, or infrastructure in domain files.
- Factory methods return `Result<Entity>`, never throw.
- Business invariants live inside the entity — not in application services.

## Output Contract

- `_entity.ts` — Aggregate root with behavior methods.
- `_value-objects.ts` — All VOs for the context.
- `_events.ts` — Domain events emitted.
- Unit tests alongside each domain object.

Context / slice: ${input:context:e.g. workspace.slice}
Entity or VO to design: ${input:entity:e.g. TaskEntity}
