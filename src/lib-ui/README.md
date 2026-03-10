# src/lib-ui — Third-Party Library UI Building Blocks

與 `src/shadcn-ui/custom-ui` 平行的全域組件層，負責封裝 dnd-kit、vis-*、TanStack 及 XState/Zustand 等第三方依賴，提供與專案風格一致的可重用基礎元件。

## 設計原則

- 每個子目錄對應一組相關依賴，各自維護獨立的 `index.ts` barrel。
- 組件僅含 UI 邏輯與狀態接入，不包含業務邏輯或 Firestore 呼叫。
- 所有可視文字透過 props 注入（禁止硬編碼 UI 字串）。
- 瀏覽器限定函式庫（vis-*）透過 `useEffect` 中的動態 `import()` 防止 SSR 評估。

## 目錄結構

```
src/lib-ui/
├── dnd/                   # @dnd-kit 拖放組件
│   ├── sortable-list.tsx  # @dnd-kit/sortable — 可排序清單
│   ├── drag-handle.tsx    # @dnd-kit — 拖曳把手按鈕
│   └── index.ts
├── pdnd/                  # @atlaskit/pragmatic-drag-and-drop 拖放組件
│   ├── draggable.tsx      # @atlaskit/pragmatic-drag-and-drop — 可拖曳元素
│   ├── drop-zone.tsx      # @atlaskit/pragmatic-drag-and-drop — 放置區
│   ├── sortable-item.tsx  # @atlaskit/pragmatic-drag-and-drop + hitbox + drop-indicator — 可排序列表項
│   ├── index.ts
│   └── README.md
├── vis/                   # 視覺化圖表組件
│   ├── vis-network-canvas.tsx   # vis-network — 節點連線圖
│   ├── vis-timeline-canvas.tsx  # vis-timeline — 時間軸
│   ├── vis-graph3d-canvas.tsx   # vis-graph3d — 3D 圖形
│   └── index.ts
├── tanstack/              # TanStack 系列
│   ├── query-client-provider.tsx  # @tanstack/react-query QueryClientProvider
│   ├── query-boundary.tsx         # Suspense + Error Boundary 組合
│   ├── data-table.tsx             # @tanstack/react-table 樣式化資料表格
│   ├── virtual-list.tsx           # @tanstack/react-virtual 虛擬清單
│   ├── tanstack-form-field.tsx    # @tanstack/react-form 欄位封裝
│   └── index.ts
├── state/                 # 狀態管理工具
│   ├── machine-provider.tsx  # @xstate/react Actor Context 工廠
│   ├── create-store.ts       # zustand 具名 Store 工廠（含 devtools）
│   └── index.ts
├── index.ts               # 頂層 barrel（全部子模組）
└── README.md              # 本文件
```

## Import Paths

```ts
// 依賴子目錄直接匯入
import { SortableList, DragHandle } from "@/lib-ui/dnd"
import { PdndDraggable, PdndDropZone, PdndSortableItem } from "@/lib-ui/pdnd"
import { VisNetworkCanvas } from "@/lib-ui/vis"
import { DataTable, TanstackQueryProvider } from "@/lib-ui/tanstack"
import { createMachineContext, createNamedStore } from "@/lib-ui/state"

// 或使用頂層 barrel 匯入
import { SortableList, PdndSortableItem, DataTable, VisNetworkCanvas } from "@/lib-ui"
```

## 依賴對照表

| 子目錄 | 對應依賴套件 |
|--------|-------------|
| `dnd/` | `@dnd-kit/core`, `@dnd-kit/sortable` |
| `pdnd/` | `@atlaskit/pragmatic-drag-and-drop`, `@atlaskit/pragmatic-drag-and-drop-hitbox`, `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` |
| `vis/` | `vis-data`, `vis-network`, `vis-timeline`, `vis-graph3d` |
| `tanstack/` | `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-virtual`, `@tanstack/react-form` |
| `state/` | `xstate`, `@xstate/react`, `zustand` |

## 擴充方式

新增組件時請遵循以下步驟：
1. 在對應子目錄新增 `.tsx` 或 `.ts` 檔案，加上模組標頭註解。
2. 在子目錄 `index.ts` 新增 named export。
3. 在頂層 `src/lib-ui/index.ts` 重新匯出（若為廣泛使用的公開 API）。
4. 更新本 README 的檔案對照表。

## Notes

- `vis-*` 組件設計為純 Client Component，透過 `useEffect` 動態 import 避免 SSR 問題。
- `TanstackQueryProvider` 應置於 `app-runtime/providers/` 的 provider 樹中。
- `createMachineContext` 回傳 `@xstate/react` 的 `createActorContext` 結果，包含 `Provider`、`useActorRef`、`useSelector`。
- `createNamedStore` 自動整合 Redux DevTools，store name 即為傳入的字串。
