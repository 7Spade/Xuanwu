# [索引 ID: @VS8-DIAG] VS8 — 語義智慧匹配架構圖

> Status: **Current**
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 視覺化呈現 VS8 三大支柱架構、HR 分派流程、知識圖譜關係與向量匹配流向。
> Related: `architecture.md`（架構定義）

---

## 一、VS8 三大支柱全覽

```mermaid
flowchart TB
  subgraph VS8["VS8 語義智慧匹配架構（SIMA）"]
    direction TB

    subgraph P3["支柱三：技能本體論 / 分類法"]
      AUTH["_semantic-authority.ts\nTAXONOMY_DIMENSIONS\nSEARCH_DOMAINS"]
      AGG["_aggregate.ts\nvalidateTaxonomyAssignment\n時序衝突偵測"]
    end

    subgraph P2["支柱二：向量數據庫（語義索引）"]
      SVC["_services.ts\nindexEntity / querySemanticIndex\ngetIndexStats"]
      QRY["_queries.ts\n[D4 讀出埠]"]
    end

    subgraph P1["支柱一：知識圖譜"]
      TYPES["_types.ts\nSemanticEdge\nSemanticRelationType (IS_A / REQUIRES)"]
      PROJ["projections/\ngraph-selectors.ts（待實作）\ncontext-selectors.ts（待實作）"]
    end

    subgraph LifeCycle["Tag 生命週期管理"]
      ACT["_actions.ts\n[D3 寫入命令入口]"]
      BUS["_bus.ts\nonTagEvent / publishTagEvent [T1]"]
      COST["_cost-classifier.ts\n[D27 成本語義分類]"]
    end

    IDX["index.ts\n[D7 唯一公開出口]"]
  end

  IDX --> P3
  IDX --> P2
  IDX --> P1
  IDX --> LifeCycle

  P3 --> P2
  P3 --> P1
  ACT --> P3
  ACT --> P1
  QRY --> SVC
```

---

## 二、HR 分派匹配流程

```mermaid
sequenceDiagram
  participant REQ as 分派請求方\n(workforce-scheduling / workspace)
  participant GS as global-search.slice
  participant VS8 as VS8 / index.ts
  participant OT as 支柱三：分類法\n(_semantic-authority.ts / _aggregate.ts)
  participant VD as 支柱二：向量索引\n(_services.ts)
  participant KG as 支柱一：知識圖譜\n(projections/graph-selectors)

  REQ->>GS: search(roleRequirements, skillTags)
  GS->>VS8: querySemanticIndex(query, { domain })
  VS8->>OT: validateTaxonomyAssignment(tagSlug, path)
  OT-->>VS8: TaxonomyValidationResult
  VS8->>VD: querySemanticIndex(normalizedQuery)
  VD-->>VS8: SemanticSearchHit[] (語義相似度排序)
  VS8->>KG: graph-selectors.expandByRelations(hits)
  KG-->>VS8: expanded candidates (IS_A / REQUIRES 展開)
  VS8-->>GS: SemanticSearchHit[] + inferenceTrace
  GS-->>REQ: 匹配候選集（語義提示，非最終決策）

  Note over VS8: VS8 只輸出語義提示 [B1]
  Note over VS8: 分派決策由呼叫方負責
```

---

## 三、知識圖譜關係圖（技能依賴範例）

```mermaid
graph LR
  TL["skill:team-lead"]
  SE["skill:senior-engineer"]
  LD["skill:leadership"]
  PM["skill:project-management"]
  BE["skill:backend"]
  SW["skill:software-engineering"]

  TL -->|REQUIRES| LD
  TL -->|REQUIRES| PM
  SE -->|IS_A| BE
  BE -->|IS_A| SW
  TL -->|REQUIRES| SE

  style TL fill:#4a9eff,color:#fff
  style SE fill:#4a9eff,color:#fff
  style LD fill:#ff9f43,color:#fff
  style PM fill:#ff9f43,color:#fff
  style BE fill:#48dbfb,color:#333
  style SW fill:#48dbfb,color:#333
```

*圖示說明*：
- **藍色節點**：技能/角色節點（SemanticEdge 終點）
- **橙色節點**：依賴項（REQUIRES 目標）
- **青色節點**：父類別（IS_A 目標）

---

## 四、向量索引查詢流（支柱二）

```mermaid
sequenceDiagram
  participant EXT as 外部切片（global-search）
  participant QRY as _queries.ts [D4]
  participant SVC as _services.ts（語義索引）
  participant IDX as 全記憶體向量 store

  EXT->>QRY: querySemanticIndex(query, opts)
  QRY->>SVC: querySemanticIndex(query, opts)
  SVC->>IDX: full-text + semantic similarity scan
  IDX-->>SVC: raw hits (scored)
  SVC-->>QRY: SemanticSearchHit[] (sorted by score)
  QRY-->>EXT: SemanticSearchHit[]

  Note over SVC: indexEntity() 寫入路徑（由 _actions.ts 觸發）
  Note over QRY: 唯一讀出埠 [D4]；_services.ts 不對外暴露
```

---

## 五、分類法層次結構（支柱三）

```mermaid
flowchart TB
  ROOT["TaxonomyDimension 根層\n(TAXONOMY_DIMENSIONS)"]

  subgraph D1["Dimension: skill"]
    S1["skill:software-engineering"]
    S2["skill:backend\n(IS_A software-engineering)"]
    S3["skill:frontend\n(IS_A software-engineering)"]
    S4["skill:senior-engineer\n(IS_A backend)"]
  end

  subgraph D2["Dimension: role"]
    R1["role:engineer"]
    R2["role:team-lead\n(IS_A engineer)"]
    R3["role:tech-lead\n(IS_A team-lead)"]
  end

  subgraph D3["Dimension: domain"]
    DO1["domain:fintech"]
    DO2["domain:hr-management"]
  end

  ROOT --> D1
  ROOT --> D2
  ROOT --> D3
  S1 --> S2
  S1 --> S3
  S2 --> S4
  R1 --> R2
  R2 --> R3
```

---

## 六、Tag 生命週期事件匯流排（支柱整合）

```mermaid
flowchart LR
  ACT["_actions.ts\n[D3 寫入命令]"]
  BUS["_bus.ts\n[T1 事件匯流排]"]

  subgraph "外部訂閱者（透過 onTagEvent 訂閱）"
    PBUS["shared-infra/projection-bus\n_tag-funnel.ts"]
    IDX_SUB["_services.ts\n向量索引同步（VD-3）"]
  end

  ACT -->|"publishTagEvent"| BUS
  BUS -->|"TagCreated / TagUpdated\nTagDeprecated / TagDeleted"| PBUS
  BUS -->|"TagCreated"| IDX_SUB

  style BUS fill:#6c5ce7,color:#fff
  style ACT fill:#00b894,color:#fff
```

---

## 七、架構邊界約束摘要

| 邊界 | 規則 | 關鍵 ID |
|------|------|---------|
| **寫入邊界** | 所有 Tag / 圖譜邊寫入必須經由 `_actions.ts` | [D3] / [KG-1] |
| **讀取邊界** | 所有查詢透過 `_queries.ts` 出口 | [D4] / [VD-2] |
| **分類法邊界** | 新維度只能在 `_semantic-authority.ts` 定義 | [OT-1] |
| **公開 API 邊界** | 唯一出口 `index.ts`；內部模組不對外 | [D7] |
| **事件邊界** | 外部切片透過 `onTagEvent()` 訂閱 | [T1] |
| **Firebase 邊界** | 禁止直連 Firebase SDK | [D24] |
| **副作用邊界** | VS8 只輸出語義提示/匹配結果；不執行跨切片副作用 | [B1] |
| **分類法驗證邊界** | Tag 路徑必須通過 `validateTaxonomyAssignment` | [OT-2] |
