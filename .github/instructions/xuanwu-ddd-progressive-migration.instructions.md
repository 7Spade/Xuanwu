---
name: 'Xuanwu DDD Progressive Migration'
description: 'Rules for progressively migrating existing Xuanwu slices to Layered Architecture in Domain-Driven Design without big-bang rewrites.'
applyTo: 'src/**/*.{ts,tsx,js,jsx}'
---

# Xuanwu DDD Progressive Migration Rules

Use these rules when refactoring existing `src/` code toward the 4-layer DDD model.

## Migration posture

- Migrate one bounded context, aggregate, or use case seam at a time.
- Prefer deterministic, reviewable refactors over broad rewrites.
- Preserve stable public APIs with compatibility wrappers when immediate caller migration is too expensive.
- Start by classifying each touched file as Presentation, Application, Domain, or Infrastructure.

## Required migration sequence

1. Identify the domain concepts, aggregate boundary, and invariants.
2. Extract or strengthen entities, value objects, and domain events.
3. Move orchestration into use cases, actions, and queries that depend on port interfaces.
4. Move concrete Firebase or external I/O into repository and adapter implementations.
5. Thin Presentation so components and routes call Application APIs only.

## Decision rules

- If a file mixes multiple layer responsibilities, split it by ownership before adding more behavior.
- Keep existing `index.ts` exports stable until downstream callers are migrated.
- Add new shared abstractions to `src/shared-kernel/` only when they are truly cross-slice or already reused.
- Keep slice-specific ports, entities, and DTO mapping close to the owning slice until reuse is proven.
- Prefer wrapper seams and re-export bridges over temporary direct imports that violate layer direction.

## Forbidden shortcuts

- Do not import Firebase, Firestore, or transport SDKs from Presentation, Application, or Domain code.
- Do not leave business invariants in server actions, route handlers, or repository adapters once a domain model exists.
- Do not inject concrete adapter classes into use cases; depend on port interfaces instead.
- Do not export entities, repository adapters, or internal domain helpers from a slice public API.
- Do not move JSX, hook logic, or request-specific concerns into Domain code.

## Verification expectations

- Audit wrong-direction imports after each migration step.
- Add or update tests at the layer that owns the behavior you moved.
- Validate that the refactor reduced, not increased, cross-layer leakage.

## Related references

- Follow `.github/instructions/xuanwu-ddd-layers.instructions.md` for the base layer rule set.
- Use `.github/skills/ddd-architecture/SKILL.md` for the standard 4-layer implementation patterns.
- Use `.github/skills/ddd-progressive-layering/SKILL.md` for the migration workflow.