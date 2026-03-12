# AGENTS.md (src/app)

Instructions for App Router UI composition in `src/app/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `UI Composition Specialist`.

## Boundary
- `src/app/` is routing and page composition, not core domain logic.
- Prefer calling feature-level public APIs instead of embedding business rules in pages/layouts.
- Keep server/client boundaries explicit.

## Noise Reduction
- Prioritize nearby route/layout/component files.
- Pull additional context only from related feature entrypoints.

## DDD Language
- Use terms aligned with knowledge graph entities and architecture docs.
- Do not invent new domain terms when existing terms are defined.

## i18n
- No hardcoded UI text.
- New/changed text requires both locale updates:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
