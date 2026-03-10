# [索引 ID: @VS8-DIAG] VS8 Semantic Brain — 架構圖

> Status: **Current**
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 視覺化呈現 VS8 層位結構、資料流向與外部整合邊界。
> Related: `architecture.md`（現行架構定義）

---

## VS8 全域定位圖

```mermaid
flowchart LR
  subgraph L3["L3 Domain Slices"]
    VS8["VS8\nsemantic-graph.slice"]
  end

  subgraph SK["L1 Shared Kernel"]
    SKC["shared-kernel\ndata-contracts"]
  end

  GS["global-search.slice\n(跨域搜尋權威)"]
  WS["workspace.slice\n(document-parser)"]
  FIN["finance.slice"]
  PBUS["shared-infra\nprojection-bus"]

  VS8 -->|"onTagEvent [T1]"| PBUS
  VS8 -->|"querySemanticIndex [D26]"| GS
  VS8 -->|"classifyCostItem [D27]"| WS
  VS8 -->|"cost types [D27]"| FIN
  VS8 <-->|"TAXONOMY_DIMENSIONS\nCentralizedTagEntry"| SKC
```

---

## 根層模組依賴圖

```mermaid
flowchart TB
  subgraph "semantic-graph.slice"
    IDX["index.ts\n[D7 唯一出口]"]
    ACT["_actions.ts\n[D3 命令入口]"]
    AGG["_aggregate.ts\n時序衝突偵測"]
    BUS["_bus.ts\n[T1 事件匯流排]"]
    QRY["_queries.ts\n[D4 讀出埠]"]
    SVC["_services.ts\n語義索引"]
    AUTH["_semantic-authority.ts\n常數"]
    COST["_cost-classifier.ts\n[D8 純函式]"]
    TYPES["_types.ts\n領域型別"]
    PROJ["projections/\n投影讀取"]
    OUTBOX["outbox/\n外送廣播"]
    SUBS["subscribers/\n訂閱廣播"]
    WIKI["wiki-editor/\n維基治理"]
    PROP["proposal-stream/\n提案串流"]
  end

  IDX --> ACT
  IDX --> AGG
  IDX --> BUS
  IDX --> QRY
  IDX --> SVC
  IDX --> AUTH
  IDX --> COST
  IDX --> PROJ
  ACT --> TYPES
  QRY --> SVC
  OUTBOX --> TYPES
  SUBS --> TYPES
  WIKI --> TYPES
  PROP --> TYPES
```

---

## 命令鏈（寫路徑）

```mermaid
sequenceDiagram
  participant UI as UI / Route Handler
  participant IDX as index.ts
  participant ACT as _actions.ts
  participant AGG as _aggregate.ts
  participant BUS as _bus.ts

  UI->>IDX: upsertTagWithConflictCheck(tag)
  IDX->>ACT: upsertTagWithConflictCheck
  ACT->>AGG: checkTemporalConflict
  AGG-->>ACT: ConflictCheckResult
  ACT-->>IDX: CommandResult
  IDX-->>UI: CommandResult
  ACT->>BUS: publishTagEvent(TagCreated)
  BUS-->>Subscribers: onTagEvent callbacks
```

---

## 查詢鏈（讀路徑）

```mermaid
sequenceDiagram
  participant GS as global-search.slice
  participant IDX as index.ts
  participant QRY as _queries.ts
  participant SVC as _services.ts

  GS->>IDX: querySemanticIndex(query, opts)
  IDX->>QRY: querySemanticIndex
  QRY->>SVC: querySemanticIndex
  SVC-->>QRY: SemanticSearchHit[]
  QRY-->>IDX: SemanticSearchHit[]
  IDX-->>GS: SemanticSearchHit[]
```

---

## 事件匯流排訂閱圖（Tag 生命週期）

```mermaid
flowchart LR
  PUB["publishTagEvent\n(_bus.ts)"]

  subgraph "訂閱者（外部切片透過 onTagEvent 訂閱）"
    PBUS["projection-bus\n_tag-funnel.ts"]
    CUSTOM["自訂訂閱者\n(未來可擴充)"]
  end

  PUB -->|"TagCreated\nTagUpdated\nTagDeprecated\nTagDeleted"| PBUS
  PUB --> CUSTOM
```

---

## 成本分類器定位（D27）

```mermaid
flowchart LR
  DP["workspace.slice\ndocument-parser"]
  CC["_cost-classifier.ts\n純函式 [D8]"]
  FIN["finance.slice"]

  DP -->|"classifyCostItem\nclassifyParserLineItem"| CC
  FIN -->|"cost types"| CC
  CC -->|"CostItemType\nParserLineItemType"| DP
```

---

## 架構邊界約束摘要

| 邊界                | 規則                                                         |
|--------------------|--------------------------------------------------------------|
| 寫入邊界            | 所有 Tag 寫入必須經由 `_actions.ts` [D3]；嚴禁直接寫 Firestore |
| 讀取邊界            | 所有讀取透過 `_queries.ts` [D4] 或 `projections/`            |
| 公開 API 邊界       | 唯一出口 `index.ts` [D7]；內部模組不對外                      |
| 事件邊界            | 外部切片透過 `onTagEvent()` 訂閱 [T1]                         |
| Firebase 邊界       | 禁止直連 Firebase SDK [D24]                                   |
| 副作用邊界          | VS8 禁止直接觸發跨切片副作用；只輸出語義提示/事件 [B1]         |
