sequenceDiagram
    autonumber
    
    participant UI as L0: Client UI
    participant GW as L0A: API Gateway (CMD/QRY)
    participant CBG as L2: Command Gateway (Auth/Route)
    participant AI as L10: Genkit Orchestrator
    participant ToolS as Tool: search_skills (Ontology)
    participant ToolM as Tool: match_candidates (Vector)
    participant ToolV as Tool: verify_compliance (Rule)
    participant D3 as L3: Semantic/Finance Slice
    participant L8 as L8: Firebase / Vector DB
    participant L5 as L5: Projection Bus (Read Models)

    Note over UI, L8: 遵循 Xuanwu 寫鏈 (L0->L0A->L2->L3->L4->L5) 與讀鏈 (L0->L0A->L6->L5)

    %% Step 1: 觸發匹配請求
    UI->>GW: 提交任務匹配需求 (Task Requirement)
    GW->>CBG: 路由寫入請求 + traceId
    CBG->>D3: 初始化匹配任務 (Create Task Aggregate)
    
    %% Step 2: AI 編排工作流 (L10)
    D3->>AI: 觸發匹配流 (Invoke Genkit Flow)
    
    rect rgb(240, 248, 255)
        Note right of AI: AI 決策路徑 (Governed by Prompt Policy)
        
        %% Step 2.1: 語義標準化
        AI->>ToolS: search_skills (raw terms)
        ToolS->>L8: 查詢技能本體論 (Ontology Lookup)
        L8-->>ToolS: canonical skill slugs
        ToolS-->>AI: 標準化技能 (slugs + confidence)

        %% Step 2.2: 向量召回
        AI->>ToolM: match_candidates (taskEmbedding)
        ToolM->>L8: 向量相似度搜尋 (Vector Similarity)
        L8-->>ToolM: TopK 候選人名單
        ToolM-->>AI: 召回結果 (scores + coverage)

        %% Step 2.3: 合規硬過濾 (Fail-closed)
        AI->>ToolV: verify_compliance (Hard Filters)
        ToolV->>L8: 檢查證照與可用性
        L8-->>ToolV: 資格狀態
        ToolV-->>AI: 通過/拒絕判定 + 理由
    end

    %% Step 3: 結果持久化與投影
    AI->>D3: 整合最終排名與推理軌跡
    D3->>L5: 發布匹配事件 (Integration Events)
    L5-->>GW: 更新可查詢讀模型 (Read Model)
    
    %% Step 4: 返回 UI
    GW-->>UI: 回傳候選名單 + 可解釋性理由 (Ranked List + Reasons)