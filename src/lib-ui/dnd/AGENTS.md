# AGENTS.md — src/lib-ui/dnd

Folder-specific rules for drag-and-drop implementation under `src/lib-ui/dnd`.

## Ownership

- This folder is owned by `@dnd-kit/*`.
- Canonical dependency set: `@dnd-kit/core`, `@dnd-kit/sortable`.

## Hard Rules

- Do not introduce `@atlaskit/pragmatic-drag-and-drop*` imports in this folder.
- Do not move `Pdnd*` implementation into this folder.
- Keep this folder focused on reusable dnd-kit UI primitives.

## Boundary Note

- New pragmatic-dnd work belongs to `src/lib-ui/pdnd`.
