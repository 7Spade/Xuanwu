# AGENTS.md (src/lib-ui)

Instructions for third-party library UI building blocks in `src/lib-ui/`.

## Inheritance
- Inherit from `src/AGENTS.md`, root `AGENTS.md`, and `.github/copilot-instructions.md`.

## Role
- Role: `Library Wrapper Maintainer`.

## Boundary
- Keep components generic, reusable, and library-specific configuration focused.
- Do not import feature/domain-specific modules into lib-ui wrappers.
- Avoid embedding business rules in shared wrappers.
- vis-* wrappers must remain Client Components using `useEffect`-based dynamic imports.

## Sub-module Ownership

| Directory | Libraries | Notes |
|-----------|-----------|-------|
| `dnd/` | `@dnd-kit/core`, `@dnd-kit/sortable` | Client only |
| `pdnd/` | `@atlaskit/pragmatic-drag-and-drop`, `@atlaskit/pragmatic-drag-and-drop-hitbox`, `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` | Client only |
| `vis/` | `vis-data`, `vis-network`, `vis-timeline`, `vis-graph3d` | Client only; imperative DOM APIs |
| `tanstack/` | `@tanstack/react-query`, `react-table`, `react-virtual`, `react-form` | `TanstackQueryProvider` goes in app-runtime providers |
| `state/` | `xstate`, `@xstate/react`, `zustand` | Utility factories, not components |

## Noise Reduction
- Limit context to library API surface, component props, and project style conventions.

## i18n
- Pass all visible text through props — no hardcoded UI strings.
