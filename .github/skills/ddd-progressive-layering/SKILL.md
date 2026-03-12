---
name: ddd-progressive-layering
description: 'Workflow for progressively migrating existing Xuanwu code to Layered Architecture in Domain-Driven Design. Use when refactoring mixed-responsibility slices, extracting domain invariants, introducing port interfaces, or reducing direct infrastructure coupling without a big-bang rewrite.'
argument-hint: 'Scope and migration goal, e.g.: workspace.slice tasks -> extract TaskEntity + ITaskRepository and isolate Firebase adapters'
---

# Progressive DDD Layering

This skill helps migrate existing Xuanwu code toward the repository's 4-layer DDD model in small, reviewable steps.

## When to use

- A feature slice mixes UI logic, use-case orchestration, domain rules, and Firebase calls.
- You need to introduce entities, value objects, or ports without breaking current callers.
- A greenfield scaffold is not the right tool because the code already exists.
- You want a migration plan that reduces coupling while keeping the system running.

## Outcomes

- Clear layer ownership for the touched scope.
- Business invariants moved closer to Domain.
- Use cases and queries depending on ports instead of concrete adapters.
- Firebase and other I/O isolated in Infrastructure.
- Presentation depending on Application-safe APIs only.

## Progressive migration loop

1. Audit the current scope.
   - Classify each touched file as Presentation, Application, Domain, Infrastructure, or mixed.
   - Identify wrong-direction imports and files that own too many responsibilities.

2. Pick the smallest migration unit.
   - Prefer one aggregate, one use case, one adapter seam, or one public API seam per change.
   - Avoid full-slice rewrites unless the code is already isolated and low-risk.

3. Stabilize the domain vocabulary.
   - Name the aggregate root, value objects, and invariants.
   - Extract pure domain behavior first so later layers can depend on a stable core.

4. Introduce the application seam.
   - Create or refine use cases, actions, and queries.
   - Depend on explicit ports rather than concrete adapters.

5. Move infrastructure behind ports.
   - Implement repositories, outbox writers, event buses, storage adapters, or transport adapters.
   - Keep mapping and I/O in adapters only.

6. Thin the presentation surface.
   - Components, routes, and public APIs should call Application only.
   - Preserve stable exports with wrappers or re-exports while callers catch up.

7. Verify each step.
   - Re-audit imports.
   - Add or update tests at the owning layer.
   - Confirm the migration reduced coupling and preserved behavior.

## Default deliverables

- Current-state audit.
- Target layer map.
- Ordered migration plan.
- Compatibility strategy.
- Verification checklist.

## Guardrails

- Do not move Firebase or SDK code into Domain or Application.
- Do not introduce new shared-kernel abstractions without proven cross-slice need.
- Do not export internal domain or infrastructure details from a slice public API.
- Do not let compatibility seams become new permanent architecture debt.

## Recommended entry points

- Use [ddd-progressive-layering](../../prompts/ddd-progressive-layering.prompt.md) when you want a guided migration workflow.
- Use [ddd-architecture](../ddd-architecture/SKILL.md) for the canonical 4-layer target patterns.
- Follow [xuanwu-ddd-progressive-migration.instructions.md](../../instructions/xuanwu-ddd-progressive-migration.instructions.md) and [xuanwu-ddd-layers.instructions.md](../../instructions/xuanwu-ddd-layers.instructions.md) during implementation.
- Ground decisions in [docs/architecture/README.md](../../../docs/architecture/README.md).