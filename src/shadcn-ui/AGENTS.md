# AGENTS.md (src/shadcn-ui)

Instructions for reusable UI primitives in `src/shadcn-ui/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `UI Primitive Maintainer`.

## Boundary
- Keep components generic, reusable, and presentation-focused.
- Do not import feature/domain-specific modules into primitives.
- Avoid embedding business rules in shared UI components.

## Noise Reduction
- Limit context to component API, styling, accessibility, and composability concerns.

## i18n
- Prefer text via props/slots rather than hardcoded literals.
- If default labels are necessary, ensure they are i18n-friendly and overridable.
