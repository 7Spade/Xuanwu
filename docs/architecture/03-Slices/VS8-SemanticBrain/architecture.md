# [索引 ID: @VS8-ARCH] VS8 Semantic Brain — Target Architecture

> Status: **Target** (migration pending)
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 定義 VS8 目標目錄結構、層位責任與模組對應關係。
> Related: `architecture-build.md`（實施計畫）

---

## 概覽

VS8 Semantic Brain 是全系統語義權威，採用十層「Engine Room」架構，以 `centralized-*` 目錄前綴為命名慣例。
每一層有明確責任邊界，上層只可消費下層輸出，嚴禁反向依賴。

---

## 十層 Engine Room 結構

| 層   | 代碼 ID    | 目錄                       | 角色               | 主要責任                                                         |
|------|-----------|----------------------------|--------------------|------------------------------------------------------------------|
| L1   | `VS8_CL`  | `centralized-tag/`         | 靈魂 (Tag Aggregate) | 標籤生命週期 Draft→Active→Stale→Deprecated；是唯一真相 Aggregate。 |
| L1   | `VS8_CL`  | `centralized-nodes/`       | 骨骼 (Node Types)  | TE1~TE6 實體定義；確保 `tag::category` 嚴格一致性。              |
| L1   | `VS8_CL`  | `centralized-embeddings/`  | 直覺 (Vector Store)| 向量化引擎；禁止直連 SDK，必須走 `FIREBASE_ACL [D24]`。           |
| L2   | `VS8_SL`  | `centralized-edges/`       | 神經 (Synapse)     | IS_A（繼承）、REQUIRES（依賴）等語義關係；`weight ∈ (0, 1]`。    |
| L3   | `VS8_NG`  | `centralized-neural-net/`  | 計算核 (Neural)    | Dijkstra 最短路徑、語義距離矩陣、孤立節點偵測。                   |
| L3   | `VS8_NG`  | `centralized-causality/`   | 因果追蹤           | CausalityTracer：traceAffectedNodes / buildCausalityChain。      |
| L4   | `VS8_ROUT`| `centralized-workflows/`   | 脈搏 (Reflection)  | PolicyMapper + DispatchBridge：將 L3 輸出映射為業務調度策略。     |
| L5   | `VS8_GUARD`| `centralized-guards/`     | 血腦屏障 (BBB)     | SemanticGuard 最高否決：拒絕自迴圈、IS_A 循環、無效權重、重複邊。 |
| L6   | `VS8_PLAST`| `centralized-learning/`   | 可塑性 (Plasticity)| learning-engine.ts 權重回饋；decay-service.ts 自然衰減。         |
| L7   | `VS8_PROJ`| `projections/`             | 投影讀取           | graph-selectors.ts、context-selectors.ts；唯一合法讀出口 `[D4]`。|
| L8   | `VS8_WIKI`| `wiki-editor/`             | 維基治理           | 提案審查、共識驗證、關係視覺化。                                  |
| L8   | `VS8_WIKI`| `proposal-stream/`         | 提案流             | 提案串流；通過後轉至 L5 BBB 驗證再進邊存儲。                      |
| L9   | `VS8_RL`  | `_cost-classifier.ts`      | 決策輸出           | 純函式成本分類器；無副作用、無非同步 `[D8]`。                    |
| L10  | `VS8_IO`  | `subscribers/`             | 訂閱廣播 (Input)   | lifecycle-subscriber.ts：接收上游 TagLifecycleEvent。             |
| L10  | `VS8_IO`  | `outbox/`                  | 外送廣播 (Output)  | tag-outbox.ts：SK_OUTBOX SAFE_AUTO 廣播拓撲異動事件。            |

---

## 目標目錄結構

```text
src/features/semantic-graph.slice/
├── index.ts                          # 公開 API 唯一出口 [D7]
├── _types.ts                         # 本地型別別名（指向 shared-kernel）
├── _actions.ts                       # Slice 級 Server Actions [D3]
├── _aggregate.ts                     # 時序衝突偵測 + 分類驗證
├── _queries.ts                       # [D4] QGWAY_SEARCH 讀出埠
├── _services.ts                      # 語義索引服務（全記憶體）
├── _semantic-authority.ts            # SEARCH_DOMAINS / TAXONOMY_DIMENSIONS 常數
├── _cost-classifier.ts               # [L9] 純函式成本分類器 [D8]
│
├── centralized-tag/                  # [L1-A] 標籤生命週期 Aggregate
│   ├── index.ts
│   ├── _actions.ts                   # createTag / updateTag / deprecateTag / deleteTag / getTag
│   ├── _bus.ts                       # onTagEvent / publishTagEvent
│   └── _events.ts                   # TagLifecycleEvent 型別定義
│
├── centralized-nodes/                # [L1-B] TE1~TE6 節點型別與工廠
│   ├── index.ts
│   ├── tag-entity.factory.ts         # buildTagEntity（TE1~TE6 工廠）
│   └── hierarchy-manager.ts         # 層級管理輔助
│
├── centralized-embeddings/           # [L1-C] 向量化引擎 [D24]
│   ├── index.ts
│   ├── embedding-port.ts            # IEmbeddingPort 介面 + injectEmbeddingPort
│   └── vector-store.ts              # 向量存儲輔助
│
├── centralized-edges/                # [L2] 語義邊 Synapse Layer
│   ├── index.ts
│   ├── semantic-edge-store.ts       # 邊存儲 + CRUD
│   ├── adjacency-list.ts            # 鄰接表實作
│   ├── weight-calculator.ts         # 邊權重計算
│   └── context-attention.ts         # 上下文注意力調整
│
├── centralized-neural-net/           # [L3-A] Dijkstra 計算核
│   ├── index.ts
│   ├── neural-network.ts            # 最短路徑 / 距離矩陣 / 孤立節點偵測
│   └── semantic-distance.ts         # 語義距離計算
│
├── centralized-causality/            # [L3-B] 因果追蹤
│   ├── index.ts
│   └── causality-tracer.ts          # traceAffectedNodes / buildCausalityChain
│
├── centralized-workflows/            # [L4] PolicyMapper + DispatchBridge
│   ├── index.ts
│   ├── policy-mapper/               # 路由策略映射
│   ├── dispatch-bridge/             # 業務調度橋接
│   ├── tag-lifecycle.workflow.ts    # 標籤生命週期工作流
│   ├── tag-promotion-flow.ts        # 標籤晉升流
│   └── alert-routing-flow.ts        # 警報路由流
│
├── centralized-guards/               # [L5] 血腦屏障 BBB
│   ├── index.ts
│   ├── invariant-guard.ts           # validateEdgeProposal（最高否決）
│   ├── semantic-guard.ts            # 語義規則衛兵
│   └── staleness-monitor.ts         # 標籤過期監控
│
├── centralized-learning/             # [L6] 可塑性引擎
│   ├── index.ts
│   ├── learning-engine.ts           # 權重回饋學習
│   └── decay-service.ts             # 自然衰減服務
│
├── projections/                      # [L7] 唯一合法讀出口 [D4]
│   ├── index.ts
│   ├── graph-selectors.ts           # 圖選擇器
│   ├── context-selectors.ts         # 上下文選擇器
│   └── tag-snapshot.slice.ts        # 標籤快照投影
│
├── wiki-editor/                      # [L8-A] 維基治理視圖
│   └── index.ts
│
├── proposal-stream/                  # [L8-B] 提案流
│   └── index.ts
│
├── subscribers/                      # [L10-A] 訂閱廣播輸入
│   └── lifecycle-subscriber.ts
│
└── outbox/                           # [L10-B] 外送廣播輸出
    └── tag-outbox.ts
```

---

## 層位依賴規則

```
L10 → (消費外部 IER 事件，廣播拓撲事件)
L9  → 純函式，零依賴
L8  → 消費 L5 BBB 驗證，調用 L2 邊存儲
L7  → 只讀 L1/L2 狀態；不得觸發寫操作
L6  → 消費 L2 邊的 weight；不得直接寫 L1 aggregate
L5  → 消費 L1/L2 狀態進行驗證；不得自行修改
L4  → 消費 L3 輸出映射策略；通過 L5 BBB 後寫 L2
L3  → 消費 L2 adjacency list；只讀計算
L2  → 消費 L1 節點；管理邊存儲
L1  → 核心 Aggregate；不依賴 L2~L10
```

**絕對禁止反向依賴（高層不得 import 低層以下）：**
- L1 不得 import L2~L10
- L2 不得 import L3~L10
- L3 不得 import L4~L10（可讀 L2）
- 以此類推

---

## 架構不變量

| ID       | 規則                                                                      |
|----------|---------------------------------------------------------------------------|
| `D21-A`  | 全域語義唯一註冊律：新概念必須先在 L1 `centralized-tag` 中註冊再使用。     |
| `D21-B`  | Schema 鎖定：已發布標籤的 `tagSlug` 永久穩定，不可重命名。                |
| `D21-C`  | 無孤立節點：每個節點必須有父節點；L3 定期偵測孤立節點。                   |
| `D21-E`  | 權重透明化：所有邊的 `weight ∈ (0, 1]`，必須可審計。                     |
| `D21-G`  | 學習只接受事實事件驅動：L6 learning-engine 只可被已確認的事件觸發。       |
| `D21-H`  | 血腦屏障：L5 `invariant-guard` 是寫入 L2 前的最終驗證關卡。              |
| `D21-K`  | 衝突裁決：重複語義標籤必須提示，不可靜默建立。                            |
| `D24`    | 禁止直連 Firebase：向量運算必須透過 `centralized-embeddings/embedding-port`。 |
| `T5`     | 讀走快照：業務端不得直讀 adjacency list；必須透過 `projections/` 的快照。 |
| `R8`     | TraceID 完整性：語義推論鏈條的 `traceId` 不可覆蓋。                      |

---

## 公開 API 邊界（index.ts 匯出清單）

`index.ts` 是唯一對外出口 `[D7]`。以下為目標匯出分類：

| 分類                   | 來源層  | 主要匯出項目                                                                        |
|------------------------|---------|-----------------------------------------------------------------------------------|
| Domain Types           | L1      | `TemporalTagAssignment`、`TaxonomyTree`、`SemanticIndexEntry` 等                  |
| Aggregate              | 根層    | `detectTemporalConflicts`、`validateTaxonomyAssignment`                            |
| Server Actions         | L1      | `upsertTagWithConflictCheck`、`addSemanticEdge`、`registerTagLifecycle` 等         |
| Semantic Index         | 根層    | `indexEntity`、`querySemanticIndex`、`getIndexStats`                               |
| Read Queries           | 根層    | `getEligibleTags`、`computeSemanticDistance`、`traceAffectedNodes` 等              |
| Node Factory           | L1-B    | `buildTagEntity`                                                                   |
| Embedding Port         | L1-C    | `IEmbeddingPort`、`injectEmbeddingPort`、`buildTagEmbedding`                       |
| Cost Classifier        | L9      | `classifyCostItem`、`shouldMaterializeAsTask`、`CostItemType` 等                   |
| Tag Snapshot           | L7      | `getTagSnapshotPresentation`、`TagSnapshotPresentation`                            |
| CTA Operations         | L1-A    | `createTag`、`updateTag`、`deprecateTag`、`onTagEvent`                             |
| BBB Guard              | L5      | `validateEdgeProposal`、`SemanticGuardResult`                                      |
| Consensus Engine       | L8      | `validateConsensus`、`ConsensusResult`                                             |

---

## 現行結構 vs 目標結構對應表

| 現行路徑                                      | 目標路徑                          | 層位  |
|-----------------------------------------------|-----------------------------------|-------|
| `core/tags/`                                  | `centralized-tag/`                | L1-A  |
| `core/nodes/`                                 | `centralized-nodes/`              | L1-B  |
| `core/embeddings/`                            | `centralized-embeddings/`         | L1-C  |
| `domain.graph/edges/`                         | `centralized-edges/`              | L2    |
| `domain.graph/neural-net/`                    | `centralized-neural-net/`         | L3-A  |
| `domain.reasoning/semantic-distance.ts`       | `centralized-neural-net/`         | L3-A  |
| `domain.reasoning/causality/`                 | `centralized-causality/`          | L3-B  |
| `domain.routing/` + `domain.workflows/`       | `centralized-workflows/`          | L4    |
| `gov.governance/guards/`                      | `centralized-guards/`             | L5    |
| `domain.learning/`                            | `centralized-learning/`           | L6    |
| `domain.output/projections/`                  | `projections/`                    | L7    |
| `gov.governance/semantic-governance-portal/wiki-editor/`     | `wiki-editor/`   | L8-A  |
| `gov.governance/semantic-governance-portal/proposal-stream/` | `proposal-stream/`| L8-B  |
| `_cost-classifier.ts`                         | `_cost-classifier.ts`（原地保留） | L9    |
| `domain.output/subscribers/`                  | `subscribers/`                    | L10-A |
| `domain.output/outbox/`                       | `outbox/`                         | L10-B |

---

## 外部消費者清單

下列模組從 `@/features/semantic-graph.slice` 公開 API 消費（截至文件撰寫時）：

| 消費者                                                                 | 主要使用項目                                           |
|------------------------------------------------------------------------|-------------------------------------------------------|
| `src/features/global-search.slice/`                                    | 語義索引查詢、SEARCH_DOMAINS                          |
| `src/features/workspace.slice/domain.document-parser/`                 | `classifyCostItem`、`ParsingIntent` 相關型別          |
| `src/features/finance.slice/`                                          | 成本分類器型別、`FinanceAggregateState`               |
| `src/shared-kernel/data-contracts/tag-authority/`                      | `TAXONOMY_DIMENSIONS`、標籤型別                       |
| `src/shared-infra/projection-bus/_tag-funnel.ts`                       | 標籤快照投影                                          |

> **重構約束**：所有外部消費者僅透過 `index.ts` 匯入；目錄遷移不影響外部 API，只要 `index.ts` 保持相同匯出。

---

## 參考文件

- `README.md`：VS8 願景與角色注入指令。
- `01-d21-body-8layers.md`：D21 四層核心不變量。
- `02-semantic-router.md`：語義路由規則。
- `03-tag-authority.md`：標籤權威規則。
- `architecture-build.md`：詳細實施計畫（目錄遷移步驟）。
- `docs/architecture/00-logic-overview.md`：全域架構 SSOT。
