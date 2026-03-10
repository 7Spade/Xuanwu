# VS8：語義智慧匹配架構（Semantic Intelligent Matching Architecture）

VS8 是全系統語義權威，定位為「**基於語義的智慧匹配架構（SIMA）**」，透過整合三大核心支柱解決人力資源中的複雜分派問題：

| 支柱 | 技術 | 核心功能 |
|------|------|---------|
| **支柱一** | 知識圖譜（Knowledge Graph） | 技能/角色/任務有向關係圖（IS_A、REQUIRES）；支援依賴推理與繼承展開 |
| **支柱二** | 向量數據庫（Vector Database） | 語義相似度索引；支援模糊語義查詢（跨域 `querySemanticIndex`） |
| **支柱三** | 技能本體論/分類法（Skills Ontology） | 層次化技能分類體系（`TAXONOMY_DIMENSIONS`）；支援粗細粒度搜尋縮放 |

> 架構詳情請見：
> - [`docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md`](../../../docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md) — 三大支柱設計、模組責任、API 邊界
> - [`docs/architecture/03-Slices/VS8-SemanticBrain/architecture-diagrams.md`](../../../docs/architecture/03-Slices/VS8-SemanticBrain/architecture-diagrams.md) — HR 分派流程圖、知識圖譜圖、向量匹配流程圖

## 目錄結構

```
semantic-graph.slice/
├── index.ts               公開 API 唯一出口 [D7]
├── _semantic-authority.ts [支柱三] TAXONOMY_DIMENSIONS / SEARCH_DOMAINS
├── _aggregate.ts          [支柱三] validateTaxonomyAssignment + 時序衝突偵測
├── _services.ts           [支柱二] 語義向量索引：indexEntity / querySemanticIndex
├── _queries.ts            [D4] 查詢出口（包裝 _services.ts）[VD-2]
├── _types.ts              領域型別（含 SemanticEdge / SemanticRelationType 等）
├── _actions.ts            [D3] Tag / 圖譜邊寫入命令入口 [KG-1]
├── _bus.ts                Tag 生命週期事件匯流排 [T1]
├── _cost-classifier.ts    [D27] 純函式成本語義分類器
├── projections/
│   ├── context-selectors.ts   語義情境選擇器（支柱一輸出，待實作）
│   ├── graph-selectors.ts     知識圖譜選擇器（支柱一 N-hop 遍歷，待實作）
│   └── tag-snapshot.slice.ts  Tag 快照展示 API
├── wiki-editor/           分類法維基治理視圖（支柱三管理入口）
│   ├── index.ts
│   └── relationship-visualizer.ts  知識圖譜視覺化（待接入 edge store）
├── proposal-stream/       技能/標籤修訂提案串流
│   └── index.ts
├── subscribers/           訂閱外部事件（TagLifecycleEvent）
│   └── lifecycle-subscriber.ts
└── outbox/                外送語義事件
    └── tag-outbox.ts
```

## 架構規則

| 規則 | 說明 |
|------|------|
| [D3] | 所有 Tag / 圖譜邊寫入必須透過 `_actions.ts`，嚴禁直接寫 Firestore |
| [D4] | 所有讀取透過 `_queries.ts` 出口 |
| [D7] | 公開 API 僅暴露 `index.ts`；內部模組隱藏 |
| [D8] | Tag 業務邏輯在此 slice，不下放至 shared-kernel |
| [D21] | 新 Tag 分類只能在 VS8 定義 |
| [D24] | 禁止直接 import Firebase；必須走 SK_PORTS 接口 |
| [D27] | 成本語義決策在此 slice；VS5 不可自判 |
| [B1] | VS8 只輸出語義提示；嚴禁直接觸發跨切片副作用 |
| [KG-1] | 知識圖譜邊只能透過 `_actions.ts` 寫入 |
| [VD-1] | 向量索引由 `_services.ts` 獨家管理 |
| [VD-2] | 外部切片透過 `_queries.ts` 查詢語義索引；嚴禁直調 `_services.ts` |
| [OT-1] | 新分類法維度只能在 `_semantic-authority.ts` 定義 |
| [OT-2] | Tag 路徑必須通過 `validateTaxonomyAssignment` 驗證 |
| [T1] | 外部切片訂閱 `onTagEvent()`；嚴禁自行維護 Tag 資料 |

## 公開 API 摘要

| 類型 | 主要匯出 | 對應支柱 |
|------|---------|---------|
| 分類法（本體論） | `TAXONOMY_DIMENSIONS`、`validateTaxonomyAssignment` | 支柱三 |
| 語義索引（向量） | `indexEntity`、`querySemanticIndex`、`getIndexStats` | 支柱二 |
| 知識圖譜型別 | `SemanticEdge`、`SemanticRelationType` | 支柱一 |
| Tag 命令 | `upsertTagWithConflictCheck`、`assignSemanticTag`、`removeTag` | 三大支柱 |
| Tag 事件匯流排 | `onTagEvent`、`publishTagEvent` | 生命週期 |
| 成本語義分類 | `classifyCostItem`、`classifyParserLineItem` | D27 |
| Tag 快照展示 | `getTagSnapshotPresentationMap` | 投影輸出 |

## 絕對禁止項

- **禁止私設標籤 [D21]**：嚴禁在業務切片中直接寫死語義分類；必須在 VS8 定義標準 Tag。
- **禁止繞過 ACL [D24]**：禁止直接 import Firebase；必須透過 SK_PORTS 接口。
- **禁止修改 TraceID [R8]**：語義推論鏈條必須完整保留 `traceId`，嚴禁覆蓋。
- **禁止跨切片副作用 [B1]**：VS8 只輸出語義提示；嚴禁直接觸發其他切片副作用。
- **禁止外部定義分類法維度 [OT-1]**：新維度只能在 `_semantic-authority.ts` 定義。
- **禁止直接建立圖譜邊 [KG-1]**：圖譜邊只能透過 `_actions.ts` 寫入。
