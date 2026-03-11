# 邏輯流視圖 (Logical Flow View)

此檔是流程可讀性視圖，非規則正文。  
規則正文請見 `02-governance-rules.md`；路徑映射請見 `03-infra-mapping.md`；拓撲裁決請見 `00-logic-overview.md`。

> 統一架構治理藍圖：[`06-DecisionLogic/03-unified-governance-blueprint.md`](06-DecisionLogic/03-unified-governance-blueprint.md)

## 讀法

1. 先看四條主鏈（系統流向概覽）。
2. 再看四階段系統生命週期序列圖（06 藍圖）。
3. 最後看 VS8 語義認知生命週期序列圖（05 藍圖）。
4. 對照 `02` 的規則 ID 做審查。

## 四條主鏈（最小版）

| 鏈路 | 流向 | 主要約束 |
|---|---|---|
| 寫鏈 | `L0 → L0A(CMD) → L2 → L3 → L4 → L5` | `D29` / `S2` / `R8` |
| 讀鏈 | `L0/UI → L0A(QRY) → L6 → L5` | `S3` / `D31` |
| Infra 鏈 | A: `L3/L5/L6 → L1 → L7-A → L8`；B: `L0/L2 → L7-B → L8` | `D24` / `D25` / `E7/E8` |
| AI 嵌入鏈 | `L3 → L4(IER) → L10(AI) → L8` | `E8-I`（非同步隔離）|

## Firebase 路由決策（A/B）

- A 路（`L7-A`）：使用者會話內、Rules 可封閉、低延遲互動。
- B 路（`L7-B`）：Admin 權限、跨租戶、排程/Webhook、高扇出協調。
- `firebase-admin` 僅允許在 `functions` 容器內使用（`D25`）。

---

## 四階段系統生命週期（源自統一治理藍圖 @ARCH-06）

> 完整藍圖：[`06-DecisionLogic/03-unified-governance-blueprint.md`](06-DecisionLogic/03-unified-governance-blueprint.md)

```mermaid
sequenceDiagram
    autonumber

    participant Admin as VS8: 語義管理 (Admin/Ontology)
    participant UI as L0: 外部入口 (PM/User)
    participant GW as L0A: API 閘道 (CQRS Ingress)
    participant VS0 as VS0: 內核契約 (Kernel/SK)
    participant D3 as L3: 領域切片 (VS2/VS3/VS5/VS9)
    participant AI as L10: Genkit 編排器 (AI Orchestrator)
    participant Tool as L10-Tools: AI 工具集 (S/M/V)
    participant IER as L4: 事件路由器 (IER/LANE)
    participant P5 as L5: 投影總線 (Projection Bus)
    participant L8 as L8: 數據持久層 (Firebase/Vector/Semantic)

    Note over Admin,L8: 核心原則：架構正確性優先 | Everything as a Tag | 語義權威治理

    rect rgb(250, 250, 250)
        Note over Admin,L8: 【階段 0】語義本體論定義 (Standardizing the World)
        Admin->>L8: 0.1 定義全域標籤本體 (Define Tag Ontology Slugs)
        L8-->>L8: 建立語義關聯圖譜 (Build Semantic Graph)
        VS0->>D3: 0.2 注入 SharedKernel 契約與 Tag 型別 [FI-003]
    end

    rect rgb(245, 245, 245)
        Note over UI,L8: 【階段 1】數據來源與語義化 (Data Ingestion & Tagging)
        UI->>GW: 1.1 更新履歷/發布任務 (Update Profile / Post Task)
        GW->>D3: 1.2 執行領域寫入 (VS2 Account / VS5 Workspace)
        D3->>L8: 1.3 存儲業務實體 + 自動標籤化 [VS8 Authority]
        D3->>IER: 1.4 發布數據變更事件 (Integration Events)
        IER-->>AI: 1.5 非同步觸發 Embedding 提取 [E8-I]
        AI->>L8: 1.6 存儲向量特徵 (Store Embeddings)
    end

    rect rgb(230, 245, 255)
        Note over UI,AI: 【階段 2】智慧匹配執行 (Intelligent Matching Execution)
        UI->>GW: 2.1 請求匹配建議 (Submit Matching Request)
        GW->>D3: 2.2 觸發匹配指令 (VS5 Domain Command)
        D3->>AI: 2.3 啟動 Genkit Matching Flow [E8 Tool ACL]

        rect rgb(200, 230, 255)
            Note right of AI: AI 決策路徑 (遵循 05 號細節)
            AI->>Tool: 2.4 術語正規化 (Normalize via search_skills)
            Tool->>L8: 查詢 VS8 本體論映射
            AI->>Tool: 2.5 向量召回 (match_candidates)
            Tool->>L8: 語義相似度搜尋 (Vector Search)
            AI->>Tool: 2.6 合規驗證 (verify_compliance)
            Note right of Tool: Fail-closed：證照/資格硬過濾 [GT-2]
        end

        AI-->>D3: 2.7 回傳推理軌跡與排名結果
        D3->>IER: 2.8 發布匹配完成事件 (MatchingConfirmed)
    end

    rect rgb(255, 250, 240)
        Note over IER,UI: 【階段 3】結果物化與展示 (Query Chain + Feedback)
        IER->>P5: 3.1 寫入投影模型 (Materialize Recommendation View)
        UI->>GW: 3.2 發起查詢請求 (QRY)
        GW->>P5: 3.3 讀取物化視圖 (Read Materialized Model)
        P5-->>UI: 3.4 渲染智慧推薦列表 (UI Rendering)
        D3->>IER: 3.5 [BF-1] 業務指紋回饋事件 (TaskCompleted/TaskRated)
        IER-->>AI: 3.6 VS8 調整 employees.skillEmbedding 權重
    end
```

**關鍵約束一覽**：
- Phase 0：`FI-003` — VS0 SK 必須在 Domain Slice 執行前完成注入
- Phase 1：`E8-I` — Domain Slice **不得同步呼叫** AI 做 Embedding（必須透過 IER 非同步）
- Phase 2：`GT-2` — `verify_compliance` 合規優先（Fail-closed），不通過的候選人排除後才能輸出
- Phase 3：`BF-1` — 業務指紋回饋使語義能力模型隨系統使用自動演進（Everything as a Tag 閉環）

---

## 🧠 VS8 · Semantic Cognition Engine（src/features/semantic-graph.slice）[#A6 #17]

> 完整細節：[`03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md`](03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md)
>
> 定位：VS8 是 L3 的語義權威切片；L10 只負責 AI 編排與 tool orchestration，VS8 則提供標準術語、分類法驗證、語義索引、Tag 生命週期與關係 / 合規語義基礎。`semantic-graph.slice = VS8`（注意：`VS9 = Finance`，與 VS8 的邊界不同）。

| 能力面 | 實際模組 | 在 05/06 藍圖中的角色 |
|------|------|-------------|
| 語義權威 / 分類法 | `index.ts` → `_semantic-authority.ts` / `_aggregate.ts` | 定義 canonical slugs，驗證 taxonomy assignment / path |
| 語義索引 | `index.ts` → `_queries.ts` → `_services.ts` | 提供 `search_skills` / `match_candidates` 所需的語義查詢與召回基礎 |
| 語義寫入 / 關係治理 | `index.ts` → `_actions.ts` | Tag 寫入 funnel；外部切片不得直接寫語義資料 |
| 生命週期與反饋 | `_bus.ts`、`subscribers/`、`outbox/` | 對接 L4/L5 事件鏈，承接 Tag lifecycle 與 BF-1 閉環 |

```mermaid
flowchart LR
    subgraph GOV["② Governance Layer"]
        Admin[Admin / Ontology]
        VS0[VS0 SharedKernel]
    end

    subgraph SEM["③ Semantic Layer"]
        API[VS8 index.ts]
        Auth[_semantic-authority.ts]
        Agg[_aggregate.ts]
        Act[_actions.ts]
        Qry[_queries.ts]
        Svc[_services.ts]
        Bus[_bus.ts]
    end

    subgraph DL["⑤ Data Lifecycle Layer"]
        IER[L4 IER]
        PB[L5 Projection Bus]
    end

    subgraph AI["⑥ Matching / AI Layer"]
        Flow[L10 Genkit Flow]
        ToolS[search_skills]
        ToolM[match_candidates]
        ToolV[verify_compliance]
    end

    Admin --> Auth
    VS0 --> Agg
    API --> Act
    API --> Qry
    Act --> Agg
    Qry --> Svc
    Flow --> ToolS --> Qry
    Flow --> ToolM --> Qry
    Flow --> ToolV --> API
    Act --> Bus --> IER --> PB
```

**讀路徑（語義查詢）**：`global-search.slice → VS8.index.ts → _queries.ts → _services.ts → SemanticSearchHit[]`

**分類法管理路徑**：`wiki-editor → VS8.index.ts → _actions.ts → _aggregate.ts(validateTaxonomyAssignment)`

詳細架構定義：[`03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md`](03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md)

---

## 系統架構圖（VS0~VS9 × 八層架構）

```mermaid
flowchart TD
    subgraph IDL["① Identity Layer"]
        EXT[L0 External]
        UI[L0 UI]
        VS1[VS1 Identity]
    end

    subgraph GOV["② Governance Layer"]
        VS0[VS0 SK]
        CMD[L0A CMD_GW]
        QRY[L0A QRY_GW]
        CBG[L2]
        QG[L6]
    end

    subgraph SEM["③ Semantic Layer"]
        VS8[VS8 Semantic Cognition]
    end

    subgraph TSL["④ Task / Skill Layer"]
        DOM[VS2/3/4/5\nVS6/7/9 Domain]
    end

    subgraph DL["⑤ Data Lifecycle Layer"]
        IER[L4 IER]
        PB[L5 PB]
    end

    subgraph MAI["⑥ Matching/AI Layer"]
        AI[L10 AI Runtime]
    end

    subgraph INF["⑦ Infrastructure Layer"]
        PORTS[L1 SK_PORTS]
        FA[L7-A client]
        FB[L7-B admin]
        L8[L8 Firebase]
    end

    subgraph OBS["⑧ Observability Layer"]
        L9[L9]
    end

    EXT & VS1 --> CMD --> CBG --> DOM --> IER --> PB
    UI --> QRY --> QG --> PB
    VS0 -->|FI-003| DOM
    CBG --> VS8
    DOM & PB & QG & VS8 --> PORTS
    PORTS --> FA & FB
    FA & FB --> L8
    IER -->|E8-I| AI --> VS8
    IER -. metrics .-> L9
    CBG -. trace .-> L9
```

---

## Auxiliary Slice 邊界（現況）

- `global-search.slice`：系統唯一跨域搜尋入口；查詢路徑對接 VS8 `index.ts → _queries.ts → _services.ts` 與 L6 讀取出口。
- `portal.slice`：門戶殼層 state 橋接；不取代 L2/L3 業務決策，不可繞過主鏈。

## VS9 Finance 流向索引

- 入口：`TaskAcceptedConfirmed` 經 L4 `CRITICAL_LANE` 進入 L5 `finance-staging-pool`（`A20`）。
- 主體：`Finance_Request` 維持獨立生命週期（`A21`）。
- 回饋：金融狀態經 L5 `task-finance-label-view` 回傳讀側（`A22`）。

---

## 圖後索引（精簡）

- 規則正文：`02-governance-rules.md`
- 路徑與 Adapter：`03-infra-mapping.md`
- 拓撲裁決：`00-logic-overview.md`
