# VS8：語義智慧匹配架構（Semantic Intelligent Matching Architecture）

VS8 是全系統語義權威，定位為「**基於語義的智慧匹配架構（SIMA）**」，透過整合三大核心支柱與三個 Genkit AI 工具解決人力資源中的複雜分派問題：

| 支柱 | 技術 | 角色隱喻 | Genkit 工具 | Firestore 集合 |
|------|------|---------|------------|---------------|
| **支柱一** | 知識圖譜（Knowledge Graph） | 🧠 **邏輯大腦** | `verify_compliance` | `employees.certifications` |
| **支柱二** | 向量數據庫（Vector Database） | 💾 **記憶模塊** | `match_candidates` | `employees.skillEmbedding`、`tasks` |
| **支柱三** | 技能本體論/分類法（Skills Ontology） | 📖 **語言定義** | `search_skills` | `skills.embedding` + `taxonomyPath` |

> 架構詳情請見：
> - [`docs/architecture/README.md`](../../../docs/architecture/README.md) — 三大支柱設計、Firestore Schema、Genkit 工具規格
> - [`docs/architecture/README.md`](../../../docs/architecture/README.md) — Genkit 工具整合圖、HR 分派序列圖、Firestore 集合關聯圖
> - [`docs/architecture/README.md`](../../../docs/architecture/README.md) — Phase 1-4 實施計畫（Schema → Vector Index → Genkit Tools → Prompt Engineering）

## 目錄結構

```
semantic-graph.slice/
├── index.ts               公開 API 唯一出口 [D7]
├── _schema.ts             [Phase 1] Firestore 集合 TypeScript Interface
│                          (SkillDocument / EmployeeDocument / TaskDocument)
├── _semantic-authority.ts [支柱三] TAXONOMY_DIMENSIONS / SEARCH_DOMAINS
├── _aggregate.ts          [支柱三] validateTaxonomyAssignment + 時序衝突偵測
├── _services.ts           [支柱二] 語義向量索引：indexEntity / querySemanticIndex
├── _queries.ts            [D4] 查詢出口（包裝 _services.ts）[VD-2]
├── _types.ts              領域型別（含 SemanticEdge / SemanticRelationType 等）
├── _actions.ts            [D3] Tag / 圖譜邊寫入命令入口 [KG-1]
├── _bus.ts                Tag 生命週期事件匯流排 [T1]
├── _cost-classifier.ts    [D27] 純函式成本語義分類器
├── _dispatch-flow.ts      [Phase 4] Genkit Flow（合規優先系統提示詞）
├── genkit-tools/          [Phase 3] 三工具分派引擎（via defineTool）[GT-1]
│   ├── search-skills.tool.ts      支柱三：術語標準化工具
│   ├── match-candidates.tool.ts   支柱二：向量候選人匹配工具
│   ├── verify-compliance.tool.ts  支柱一：合規邏輯驗證工具
│   └── index.ts
├── projections/
│   ├── context-selectors.ts   【暫緩】語義情境選擇器
│   ├── graph-selectors.ts     【暫緩】知識圖譜選擇器
│   └── tag-snapshot.slice.ts  Tag 快照展示 API
├── wiki-editor/           分類法維基治理視圖（支柱三管理入口）
│   ├── index.ts
│   └── relationship-visualizer.ts  【暫緩】知識圖譜視覺化
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
| [GT-1] | Genkit 工具必須透過 `defineTool` 宣告 |
| [GT-2] | AI 分派流程必須合規優先：`verify_compliance` 先於候選人輸出 |
| [GT-3] | `search_skills` 返回的 `skillId` 作為後續查詢標準術語 |
| [KG-1] | 知識圖譜邊只能透過 `_actions.ts` 寫入 |
| [VD-1] | 向量索引由 `_services.ts` 獨家管理 |
| [VD-2] | 外部切片透過 `_queries.ts` 查詢語義索引；嚴禁直調 `_services.ts` |
| [VD-4] | Firestore 向量索引欄位維度必須與嵌入模型一致（768 維） |
| [OT-1] | 新分類法維度只能在 `_semantic-authority.ts` 定義 |
| [OT-2] | Tag 路徑必須通過 `validateTaxonomyAssignment` 驗證 |
| [T1] | 外部切片訂閱 `onTagEvent()`；嚴禁自行維護 Tag 資料 |

## 公開 API 摘要

| 類型 | 主要匯出 | 對應支柱 |
|------|---------|---------|
| Schema 型別（Firestore 集合） | `SkillDocument`、`EmployeeDocument`、`TaskDocument` | 全三支柱 |
| Genkit 工具 | `searchSkillsTool`、`matchCandidatesTool`、`verifyComplianceTool` | 全三支柱 |
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
- **禁止跳過合規驗證 [GT-2]**：AI 分派必須先執行 `verify_compliance`，不合規候選人直接排除。
- **禁止使用未驗證術語 [GT-3]**：AI 必須先呼叫 `search_skills` 確認標準術語後再進行匹配。
