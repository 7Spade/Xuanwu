---
name: ddd-progressive-layering
description: 'Progressively migrate an existing Xuanwu slice toward Layered Architecture in Domain-Driven Design with compatibility seams, boundary audits, and the smallest safe refactor sequence.'
agent: 'ddd-orchestrator'
argument-hint: 'Scope and goal, e.g.: src/features/workspace.slice/domain.tasks | extract TaskEntity + ITaskRepository without breaking callers'
---

# Progressive DDD Layering Workflow

Use this prompt for legacy or mixed-responsibility code that needs to move toward the Xuanwu 4-layer DDD structure without a big-bang rewrite.

## Objectives

1. Audit the current layer ownership of the target scope.
2. Choose the smallest migration unit that creates a cleaner boundary.
3. Move behavior in the order Domain -> Application -> Infrastructure -> Presentation.
4. Preserve working APIs and add compatibility seams where needed.

## Workflow

1. Classify touched files as Presentation, Application, Domain, Infrastructure, or mixed.
2. Identify the aggregate root, value objects, and invariants that should own business behavior.
3. Design the target port interfaces before moving concrete infrastructure.
4. Extract or create use cases, actions, and queries that depend on those ports.
5. Move Firebase or other SDK usage into adapters under the correct infrastructure location.
6. Thin components, routes, and public APIs so they depend only on Application outputs.
7. Keep caller-facing compatibility wrappers until downstream migrations are complete.
8. Verify import direction, tests, and public API stability.

## Output contract

- Current-state audit: mixed concerns, wrong-direction imports, and risk points.
- Target map: which files own which layers after the migration.
- Ordered migration plan: smallest safe steps with compatibility notes.
- Implementation or patch guidance that follows the ordered plan.
- Verification checklist: tests, import audit, and regression watchpoints.

## Guardrails

- Prefer incremental extractions over file moves that only reshuffle complexity.
- Do not introduce new shared abstractions unless reuse is already proven.
- Do not move infrastructure before the domain vocabulary and port boundary are clear.
- Follow `docs/architecture/README.md`, `.github/instructions/xuanwu-ddd-layers.instructions.md`, and `.github/instructions/xuanwu-ddd-progressive-migration.instructions.md`.

Scope: ${input:scope:e.g. src/features/workspace.slice/domain.tasks}
Goal: ${input:goal:e.g. isolate TaskEntity + TaskRepository port and remove Firebase from use cases}
Constraints: ${input:constraints:e.g. keep current exports stable, no route renames, keep tests green}