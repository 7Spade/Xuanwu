# AGENTS.md — src/lib-ui/pdnd

Folder-specific rules for drag-and-drop implementation under `src/lib-ui/pdnd`.

## Ownership

- This folder is owned by `@atlaskit/pragmatic-drag-and-drop*`.
- Canonical dependencies: `@atlaskit/pragmatic-drag-and-drop`, `@atlaskit/pragmatic-drag-and-drop-hitbox`, `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator`.

## Hard Rules

- Do not introduce `@dnd-kit/*` imports in this folder.
- Keep `Pdnd*` components and types in this folder.
- New pragmatic-dnd behavior must be implemented here, not in `src/lib-ui/dnd`.

## Boundary Contract

- `src/lib-ui/dnd` is for dnd-kit only.
- `src/lib-ui/pdnd` is for pragmatic-dnd only.
- If compatibility shims are needed, keep them in `dnd/` as thin re-exports.
