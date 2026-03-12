# AGENTS.md (src/app-runtime)

Instructions for runtime wiring, providers, and orchestration in `src/app-runtime/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Runtime Orchestrator`.

## Boundary
- Keep orchestration logic here; avoid leaking runtime concerns into domain/pure layers.
- Side effects, provider setup, and integration plumbing are allowed.
- Do not put business invariants here if they belong to feature/domain contracts.

## Noise Reduction
- Focus on runtime modules and immediate dependencies.
- Avoid editing feature internals unless orchestration contract must change.

## DDD Language
- Preserve domain terms from SSOT while implementing runtime composition.
