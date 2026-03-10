# src/lib-ui/pdnd — Pragmatic Drag and Drop Building Blocks

封裝 `@atlaskit/pragmatic-drag-and-drop*` 系列依賴，提供與專案風格一致的可重用拖放基礎元件。

## 設計原則

- 每個組件對應一個核心拖放職責（可拖曳、放置區、可排序列表項）。
- 組件僅含 UI 邏輯與狀態接入，不包含業務邏輯或 Firestore 呼叫。
- 所有可視文字透過 props 注入（禁止硬編碼 UI 字串）。

## 目錄結構

```
src/lib-ui/pdnd/
├── draggable.tsx      # @atlaskit/pragmatic-drag-and-drop — 可拖曳元素
├── drop-zone.tsx      # @atlaskit/pragmatic-drag-and-drop — 放置區
├── sortable-item.tsx  # @atlaskit/pragmatic-drag-and-drop + hitbox + drop-indicator — 可排序列表項
├── index.ts           # 子模組 barrel
└── README.md          # 本文件
```

## 依賴對照

| 檔案 | 依賴套件 |
|------|---------|
| `draggable.tsx` | `@atlaskit/pragmatic-drag-and-drop` |
| `drop-zone.tsx` | `@atlaskit/pragmatic-drag-and-drop` |
| `sortable-item.tsx` | `@atlaskit/pragmatic-drag-and-drop`, `@atlaskit/pragmatic-drag-and-drop-hitbox`, `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` |

## Import Paths

```ts
// 依賴子目錄直接匯入
import { PdndDraggable, PdndDropZone, PdndSortableItem } from "@/lib-ui/pdnd"

// 或使用頂層 barrel 匯入
import { PdndDraggable, PdndSortableItem } from "@/lib-ui"
```

## 組件摘要

### `PdndDraggable`

將任意子元素登記為可拖曳來源。拖曳時套用 `draggingClassName`（預設 `opacity-40`）。

```tsx
<PdndDraggable data={{ id: item.id }}>
  <MyCard />
</PdndDraggable>
```

### `PdndDropZone`

將任意子元素登記為放置目標。放置時呼叫 `onDrop` 並傳入來源資料。

```tsx
<PdndDropZone onDrop={(sourceData) => handleDrop(sourceData)}>
  <ColumnContent />
</PdndDropZone>
```

### `PdndSortableItem`

同時作為可拖曳來源與放置目標，透過 `@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge` 偵測最近邊緣，並以 `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box` 的 `<DropIndicator>` 呈現視覺落點線。

```tsx
<PdndSortableItem
  data={{ id: item.id }}
  onDrop={({ sourceData, closestEdge }) =>
    reorder(sourceData.id, item.id, closestEdge)
  }
  gap="8px"
>
  <MyCard item={item} />
</PdndSortableItem>
```

## 擴充方式

新增組件時請遵循以下步驟：
1. 在此目錄新增 `.tsx` 或 `.ts` 檔案，加上模組標頭註解（`Module: pdnd-*`）。
2. 在 `index.ts` 新增 named export。
3. 在頂層 `src/lib-ui/index.ts` 重新匯出（若為廣泛使用的公開 API）。
4. 更新本 README 的目錄結構與依賴對照表。
