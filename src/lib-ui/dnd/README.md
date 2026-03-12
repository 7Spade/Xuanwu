# src/lib-ui/dnd — dnd-kit Drag and Drop Building Blocks

本目錄只負責 `@dnd-kit/*` 家族。

## Canonical Mapping

- `src/lib-ui/dnd` = `@dnd-kit/core` + `@dnd-kit/sortable`
- `src/lib-ui/pdnd` = `@atlaskit/pragmatic-drag-and-drop*`

## Scope

- 只放 dnd-kit 相關元件與型別。
- 不得在此目錄新增 `@atlaskit/pragmatic-drag-and-drop*` 依賴。
- 不得把 `Pdnd*` 元件實作放進 `dnd/`。

## Current Files

- `sortable-list.tsx`: dnd-kit sortable list behavior
- `drag-handle.tsx`: dnd-kit drag handle UI
- `index.ts`: public exports for dnd-kit layer

## Import Guidance

```ts
// dnd-kit only
import { SortableList, DragHandle } from "@/lib-ui/dnd"

// pragmatic-dnd should come from pdnd
import { PdndDraggable, PdndDropZone, PdndSortableItem } from "@/lib-ui/pdnd"
```
