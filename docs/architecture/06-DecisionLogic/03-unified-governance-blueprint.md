# [索引 ID: @ARCH-06] 統一架構編排與治理藍圖（Unified Architecture Orchestration and Governance Blueprint）

> Status: **Reference Blueprint**
> Scope: 全系統 (VS0~VS9 + L0~L10 + AI Layer)
> Purpose: 定義系統四階段生命週期（語義基石 → 數據攝取 → 智慧匹配 → 讀模型物化），作為 00/01/02/03 治理文件的對齊基礎。
> Cross-reference: `00-logic-overview.md`（拓撲 SSOT）、`02-governance-rules.md`（規則正文）、`docs/architecture/03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md`（VS8 細節）
>
> 核心原則：**架構正確性優先** ｜ **Everything as a Tag** ｜ **語義權威治理**

```mermaid
sequenceDiagram
    autonumber
    
    %% 參與者定義
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

    Note over Admin, L8: 核心原則：架構正確性優先 | Everything as a Tag | 語義權威治理

    %% --- 階段 0：語義基石 (The Ontology Phase) ---
    rect rgb(250, 250, 250)
        Note over Admin, L8: 【階段 0】語義本體論定義 (Standardizing the World)
        Admin->>L8: 0.1 定義全域標籤本體 (Define Tag Ontology Slugs)
        L8-->>L8: 建立語義關聯圖譜 (Build Semantic Graph)
        VS0->>D3: 0.2 注入 SharedKernel 契約與 Tag 型別 [FI-003]
    end

    %% --- 階段 1：數據來源生命週期 (The Ingestion Phase) ---
    rect rgb(245, 245, 245)
        Note over UI, L8: 【階段 1】數據來源與語義化 (Data Ingestion & Tagging)
        UI->>GW: 1.1 更新履歷/發布任務 (Update Profile / Post Task)
        GW->>D3: 1.2 執行領域寫入 (VS2 Account / VS5 Workspace)
        D3->>L8: 1.3 存儲業務實體 + 自動標籤化 [VS8 Authority]
        D3->>IER: 1.4 發布數據變更事件 (Integration Events)
        IER-->>AI: 1.5 非同步觸發 Embedding 提取 [E8-I]
        AI->>L8: 1.6 存儲向量特徵 (Store Embeddings)
    end

    %% --- 階段 2：智慧匹配編排鏈 (The Orchestration Chain) ---
    rect rgb(230, 245, 255)
        Note over UI, AI: 【階段 2】智慧匹配執行 (Intelligent Matching Execution)
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

    %% --- 階段 3：投影與查詢 (The Read Chain) ---
    rect rgb(255, 250, 240)
        Note over IER, UI: 【階段 3】結果物化與展示 (Query Chain + Feedback)
        IER->>P5: 3.1 寫入投影模型 (Materialize Recommendation View)
        UI->>GW: 3.2 發起查詢請求 (QRY)
        GW->>P5: 3.3 讀取物化視圖 (Read Materialized Model)
        P5-->>UI: 3.4 渲染智慧推薦列表 (UI Rendering)
        D3->>IER: 3.5 [BF-1] 業務指紋回饋事件 (TaskCompleted/TaskRated)
        IER-->>AI: 3.6 VS8 調整 employees.skillEmbedding 權重
    end
```
