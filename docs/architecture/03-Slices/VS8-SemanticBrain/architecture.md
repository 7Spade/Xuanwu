# [索引 ID: @VS8-ARCH] VS8 Semantic Brain — 現行架構

> Status: **Current** (post-cleanup)
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 定義 VS8 現行目錄結構、層位責任與模組對應關係。
> Related: `architecture-diagrams.md`（架構圖）、`architecture-build.md`（下一階段實施計畫）

---

## 概覽

VS8 Semantic Brain 是全系統語義權威，負責標籤分類法治理、語義索引、時序衝突偵測與成本分類。
`centralized-*` 子系統已清理；目前由根層精簡檔案直接承載核心責任。

---

## 現行目錄結構

```text
src/features/semantic-graph.slice/
├── index.ts                          # 公開 API 唯一出口 [D7]
├── _types.ts                         # 領域型別（公開型別 + 內部型別）
├── _actions.ts                       # Slice 級 Server Actions [D3]
├── _aggregate.ts                     # 時序衝突偵測 + 分類法驗證
├── _bus.ts                           # Tag 事件匯流排：onTagEvent / publishTagEvent [T1]
├── _queries.ts                       # [D4] QGWAY_SEARCH 讀出埠
├── _services.ts                      # 語義索引服務（全記憶體）
├── _semantic-authority.ts            # SEARCH_DOMAINS / TAXONOMY_DIMENSIONS 常數
├── _cost-classifier.ts               # 純函式成本分類器 [D8]
│
├── projections/                      # 讀取投影 [D4]
│   ├── context-selectors.ts          # 語義情境選擇器（待實作）
│   ├── graph-selectors.ts            # 圖譜選擇器（待實作）
│   └── tag-snapshot.slice.ts         # 標籤快照展示 API
│
├── wiki-editor/                      # 維基治理視圖
│   ├── index.ts
│   └── relationship-visualizer.ts   # 關係視覺化（待接入 edge store）
│
├── proposal-stream/                  # 提案串流
│   └── index.ts
│
├── subscribers/                      # 訂閱廣播輸入
│   └── lifecycle-subscriber.ts
│
└── outbox/                           # 外送廣播輸出
    └── tag-outbox.ts
```

---

## 根層模組責任

| 模組                    | 責任                                                       | 架構規則         |
|-------------------------|------------------------------------------------------------|-----------------|
| `_actions.ts`           | 所有 Tag 寫入命令入口（upsertTagWithConflictCheck 等）     | [D3]            |
| `_aggregate.ts`         | 時序衝突偵測 + 分類法驗證                                  | 純函式          |
| `_bus.ts`               | Tag 事件匯流排：`onTagEvent` / `publishTagEvent`           | [T1]            |
| `_cost-classifier.ts`   | 純函式成本分類器；無副作用、無非同步                        | [D8]            |
| `_queries.ts`           | QGWAY_SEARCH 讀出埠：`querySemanticIndex` / `getIndexStats`| [D4]            |
| `_semantic-authority.ts`| `SEARCH_DOMAINS` / `TAXONOMY_DIMENSIONS` 常數              | 語義權威        |
| `_services.ts`          | 全記憶體語義索引：`indexEntity` / `removeFromIndex`        |                 |
| `_types.ts`             | 領域型別（含 `SemanticEdge`、`TagLifecycleEvent` 等）      | [D7]            |
| `index.ts`              | 唯一對外出口；所有公開匯出在此定義                          | [D7]            |

---

## 公開 API 邊界（index.ts 匯出清單）

| 分類                   | 主要匯出項目                                                              |
|------------------------|--------------------------------------------------------------------------|
| Domain Types           | `TemporalTagAssignment`、`TaxonomyTree`、`SemanticIndexEntry` 等          |
| Aggregate              | `detectTemporalConflicts`、`validateTaxonomyAssignment`                   |
| Server Actions         | `upsertTagWithConflictCheck`、`assignSemanticTag`、`removeTag`            |
| Semantic Index         | `indexEntity`、`removeFromIndex`、`querySemanticIndex`、`getIndexStats`   |
| Semantic Authority     | `SEARCH_DOMAINS`、`TAXONOMY_DIMENSIONS`                                   |
| Tag Event Bus          | `onTagEvent`、`publishTagEvent`                                           |
| Cost Classifier        | `classifyCostItem`、`classifyParserLineItem`、`CostItemType` 等            |
| Tag Snapshot           | `getTagSnapshotPresentation`、`getTagSnapshotPresentationMap`             |
| Shared Types (re-export)| `CentralizedTagEntry`、`CentralizedTagDeleteRule` 等（from shared-kernel）|

---

## 架構不變量

| ID     | 規則                                                             |
|--------|------------------------------------------------------------------|
| `D3`   | 所有 Tag 寫入必須透過 `_actions.ts`；嚴禁直接寫 Firestore。      |
| `D4`   | 所有讀取透過 `_queries.ts` 出口；內部 store 不得直接對外。        |
| `D7`   | 唯一公開 API 出口為 `index.ts`；內部模組一律隱藏。               |
| `D8`   | Tag 業務邏輯在此 slice；不下放至 shared-kernel。                  |
| `D21`  | 新 Tag 分類只能在 VS8 定義。                                      |
| `D24`  | 禁止直接 import Firebase；必須透過 SK_PORTS 接口。                |
| `D26`  | VS8 擁有 `_actions.ts` / `_services.ts`；不寄生 shared-kernel。  |
| `T1`   | 外部切片訂閱 `onTagEvent()`；嚴禁自行維護 Tag 資料。              |
| `R8`   | 語義推論鏈條的 `traceId` 不可覆蓋。                               |

---

## 外部消費者清單

| 消費者                                                       | 主要使用項目                                    |
|--------------------------------------------------------------|-------------------------------------------------|
| `src/features/global-search.slice/`                         | `querySemanticIndex`、`SEARCH_DOMAINS`          |
| `src/features/workspace.slice/domain.document-parser/`      | `classifyCostItem`、`ParsingIntent` 相關型別    |
| `src/features/finance.slice/`                               | 成本分類器型別、`FinanceAggregateState`          |
| `src/shared-kernel/data-contracts/tag-authority/`           | `TAXONOMY_DIMENSIONS`、標籤型別                  |
| `src/shared-infra/projection-bus/_tag-funnel.ts`            | 標籤快照投影                                     |

> **約束**：所有外部消費者僅透過 `index.ts` 匯入；不得直接 import 內部模組。

---

## 參考文件

- `architecture-diagrams.md`：架構圖（流程圖、層位圖、依賴圖）。
- `architecture-build.md`：下一階段詳細實施計畫。
- `README.md`：VS8 願景摘要與實作能力清單。
- `01-d21-body-8layers.md`：D21 四層核心不變量。
- `02-semantic-router.md`：語義路由規則。
- `03-tag-authority.md`：標籤權威規則。
- `docs/architecture/00-logic-overview.md`：全域架構 SSOT。
