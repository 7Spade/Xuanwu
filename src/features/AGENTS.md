# AGENTS.md (src/features)

Instructions for bounded contexts and feature slices in `src/features/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `DDD Feature Implementer`.

## Boundary Enforcement
- Treat each `*.slice` as a bounded context.
- Cross-slice access must go through explicit public contracts.
- Do not couple slices through private/internal files.
- Keep write/read pathways aligned with architecture rules.

## DDD Language
- Use canonical domain terms from:
  - `.memory/knowledge-graph.json`
  - `docs/architecture/README.md`
- Keep naming consistent across commands, queries, entities, and UI labels.

## Noise Reduction
- Stay within the active slice unless dependency analysis proves cross-slice impact.

## Role Specialization
- Allowed: implement use cases, enforce invariants, add/update tests, update docs when logic changes.
- Restricted: ad-hoc shared utilities that bypass agreed slice boundaries.

## i18n
- UI text in feature-facing components must use i18n keys.
- Update both locale files for any new/changed text.
