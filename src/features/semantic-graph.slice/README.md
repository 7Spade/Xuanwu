# VS8: Semantic Graph (The Brain) — 全域語義中樞

VS8 是所有領域概念的「語義憲法」。所有業務切片以 Semantic Tag 為統一語言，透過 VS8 進行語義治理與語義索引。

> 架構詳情請見：
> - [`docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md`](../../../docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md) — 現行架構定義
> - [`docs/architecture/03-Slices/VS8-SemanticBrain/architecture-diagrams.md`](../../../docs/architecture/03-Slices/VS8-SemanticBrain/architecture-diagrams.md) — 架構圖

## 目錄結構

```
semantic-graph.slice/
├── _actions.ts               命令入口 [D3] — 所有 Tag 寫入必須經由此處
├── _aggregate.ts             聚合根 — 時序衝突偵測 + 分類法驗證
├── _bus.ts                   Tag 事件匯流排 [T1] — onTagEvent / publishTagEvent
├── _cost-classifier.ts       成本分類器 [D8] — 純函式，無副作用
├── _queries.ts               查詢出口 [D4] — QGWAY_SEARCH read-out port
├── _semantic-authority.ts    語義權威 — SEARCH_DOMAINS / TAXONOMY_DIMENSIONS
├── _services.ts              語義索引服務 — indexEntity / querySemanticIndex
├── _types.ts                 領域型別 — 公開型別 + 內部領域型別
├── index.ts                  公開 API (Public API) [D7]
├── outbox/
│   └── tag-outbox.ts         外送廣播 [L10 VS8_IO] — 拓撲異動事件出口
├── projections/
│   ├── context-selectors.ts  語義情境投影 (待實作)
│   ├── graph-selectors.ts    圖譜選擇器 (待實作)
│   └── tag-snapshot.slice.ts Tag 快照展示 API
├── proposal-stream/
│   └── index.ts              提案串流
├── subscribers/
│   └── lifecycle-subscriber.ts 訂閱廣播 [L10 VS8_IO] — 接收 TagLifecycleEvent
└── wiki-editor/
    ├── index.ts              維基治理入口
    └── relationship-visualizer.ts 關係視覺化 (待接入 edge store)
```

## 架構規則

| 規則 | 說明 |
|------|------|
| [D3] | 所有 Tag 寫入必須透過 `_actions.ts`，嚴禁直接寫 Firestore |
| [D4] | 所有讀取透過 `_queries.ts` 出口 |
| [D7] | 公開 API 僅暴露 `index.ts` 中的選擇器與命令；內部模組隱藏 |
| [D8] | Tag 業務邏輯在此 slice，不下放至 shared-kernel |
| [D21]| 新 Tag 分類只能在 VS8 定義 |
| [D24]| 禁止直接 import Firebase；必須走 SK_PORTS 接口 |
| [D26]| VS8 擁有 `_actions.ts` / `_services.ts`；不寄生 shared-kernel |
| [T1] | 外部切片訂閱 `onTagEvent()`；嚴禁自行維護 Tag 資料 |

## 外部消費者公開 API

| 匯出項 | 來源 | 用途 |
|--------|------|------|
| `onTagEvent` / `publishTagEvent` | `_bus.ts` | Tag 事件訂閱與發布 |
| `querySemanticIndex` | `_services.ts` | Global Search 語義索引查詢 |
| `indexEntity` / `removeFromIndex` | `_services.ts` | 語義索引管理 |
| `SEARCH_DOMAINS` / `TAXONOMY_DIMENSIONS` | `_semantic-authority.ts` | 搜尋域與分類法常數 |
| `classifyCostItem` / `classifyParserLineItem` | `_cost-classifier.ts` | 成本項目語義分類 |
| `getTagSnapshotPresentationMap` | `projections/tag-snapshot.slice.ts` | UI Tag 快照展示 |
| `SemanticIndexEntry` | `_types.ts` | 語義索引型別 |

## 絕對禁止項

- **禁止私設標籤 [D21]**：嚴禁在業務切片中直接寫死 `status: "done"`；必須在 VS8 定義語義標籤。
- **禁止繞過 ACL [D24]**：禁止直接 import Firebase；必須透過 SK_PORTS 接口。
- **禁止修改 TraceID [R8]**：語義推論鏈條必須完整保留 `traceId`，嚴禁覆蓋。
- **禁止跨切片副作用 [B1]**：VS8 只輸出語義提示/事件；嚴禁直接觸發其他切片副作用。
