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

---

## 八、Genkit AI 工具整合（三工具分派引擎）

```mermaid
flowchart TD
  subgraph "輸入"
    TASK["任務請求\n(TaskDocument)"]
  end

  subgraph "Genkit Flow: vs8-dispatch-flow"
    direction TB
    FLOW["dispatchFlow\n_dispatch-flow.ts"]

    subgraph "工具一：search_skills\n（支柱三 語言定義）"
      T1["search_skills\ngenkit-tools/"]
    end

    subgraph "工具二：match_candidates\n（支柱二 記憶模塊）"
      T2["match_candidates\ngenkit-tools/"]
    end

    subgraph "工具三：verify_compliance\n（支柱一 邏輯大腦）"
      T3["verify_compliance\ngenkit-tools/"]
    end
  end

  subgraph "Firestore 集合"
    FS_SKILLS[("skills\n(+ Vector Index)\n技能本體論")]
    FS_EMP[("employees\n(+ Vector Index)\n候選人池")]
    FS_TASKS[("tasks\n分派請求")]
  end

  subgraph "輸出"
    OUT["匹配候選集\nSemanticSearchHit[]\n+ inferenceTrace"]
  end

  TASK --> FLOW
  FLOW -- "1. 術語標準化" --> T1
  FLOW -- "2. 向量匹配" --> T2
  FLOW -- "3. 合規驗證（優先）" --> T3

  T1 -- "querySemanticIndex\n(domain: skill)" --> FS_SKILLS
  T2 -- "Vector Search\n(employees.skillEmbedding)" --> FS_EMP
  T3 -- "certifications 比對" --> FS_EMP

  T1 --> FLOW
  T2 --> FLOW
  T3 --> FLOW

  FLOW --> OUT

  style T1 fill:#6c5ce7,color:#fff
  style T2 fill:#0984e3,color:#fff
  style T3 fill:#00b894,color:#fff
  style FS_SKILLS fill:#fdcb6e,color:#2d3436
  style FS_EMP fill:#fdcb6e,color:#2d3436
```

---

## 九、Firestore 集合關聯圖（資料模型）

```mermaid
erDiagram
  TASKS {
    string taskId PK
    string title
    string[] requiredSkillSlugs
    string[] requiredCertifications
    string complexityLevel
    number[] requirementsEmbedding
    string status
  }

  EMPLOYEES {
    string employeeId PK
    string name
    string[] skillSlugs
    string[] certifications
    string availabilityStatus
    number[] skillEmbedding
  }

  SKILLS {
    string skillId PK
    string name
    string[] aliases
    string[] taxonomyPath
    string dimension
    number[] embedding
  }

  TASKS ||--o{ SKILLS : "requiredSkillSlugs (refs)"
  EMPLOYEES ||--o{ SKILLS : "skillSlugs (refs)"
  TASKS ||--o{ EMPLOYEES : "分派（系統外部）"
```

---

## 十、AI 分派調用序列圖（Prompt Engineering 強制順序）

```mermaid
sequenceDiagram
  participant AI as Genkit AI Agent
  participant T3 as verify_compliance<br/>(邏輯大腦)
  participant T1 as search_skills<br/>(語言定義)
  participant T2 as match_candidates<br/>(記憶模塊)
  participant FS as Firestore

  Note over AI: 接收 Task 請求

  AI->>T1: 不確定術語？→ search_skills(query)
  T1->>FS: querySemanticIndex(skills)
  FS-->>T1: SkillDocument[]
  T1-->>AI: 標準術語確認

  Note over AI: 使用標準術語進行匹配

  AI->>T2: match_candidates(taskRequirementsText)
  T2->>FS: Vector Search (employees)
  FS-->>T2: 候選人清單（按相似度排序）
  T2-->>AI: EmployeeDocument[] + similarityScore

  Note over AI: 合規驗證（必須先於輸出）

  loop 每位候選人
    AI->>T3: verify_compliance(employeeId, requiredCertifications)
    T3->>FS: employees.certifications 比對
    FS-->>T3: certifications 資料
    T3-->>AI: { isCompliant, missingCertifications }
  end

  Note over AI: 輸出合規候選集（B1：不執行分派）
  AI-->>AI: 輸出 SemanticSearchHit[] + inferenceTrace
```
