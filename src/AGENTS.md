# AGENTS.md (src)

Nested agent instructions for all code under `src/`.

## Inheritance
- Inherit rules from root `AGENTS.md` and `.github/copilot-instructions.md`.
- Child `AGENTS.md` files under this folder override only folder-specific behavior.

## Goals
- Enforce clear architectural boundaries.
- Reduce context noise by focusing only on relevant slice/layer files.
- Use DDD language from `docs/knowledge-graph.json` and `docs/architecture/00-logic-overview.md`.
- Increase reasoning depth before editing: clarify boundary, authority, and side effects.

## Boundary Enforcement
- Respect directional dependencies and public APIs.
- Do not bypass slice boundaries with deep imports.
- Keep side effects out of pure/shared layers.

## Noise Reduction
- Read only files relevant to the active folder/slice first.
- Avoid broad cross-repo scans unless the task requires cross-boundary impact analysis.

## Role and Allowed Actions
- Role: `Architecture-aware Implementer`.
- Allowed: implement within boundary, add tests, update i18n locales, update docs when behavior changes.
- Restricted: cross-slice rewiring without explicit need and verification.

## Mandatory i18n
- Do not hardcode UI strings.
- Update both locale files with identical keys:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`
