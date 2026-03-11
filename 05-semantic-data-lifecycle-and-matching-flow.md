sequenceDiagram
    autonumber
    
    %% 參與者定義
    participant Admin as 管理員/本體論 (Admin/Ontology)
    participant UI as L0: 外部 UI (External UI/PM/User)
    participant CBG as L2: 命令閘道 (Command Gateway)
    participant AI as L10: Genkit 編排器 (AI Orchestrator)
    participant ToolS as Tool: 技能檢索 (search_skills)
    participant ToolM as Tool: 候選匹配 (match_candidates)
    participant ToolV as Tool: 合規驗證 (verify_compliance)
    participant D3 as L3: 領域切片 (Domain Slice)
    participant L8 as L8: 語義與數據層 (Semantic/Vector/DB)
    participant L5 as L5: 投影匯流排 (Projection Bus)

    %% 第一階段：數據來源生命週期 (Phase 1: Data Source Lifecycle)
    Note over Admin, L8: 第一階段：數據來源生成 (Phase 1: Data Ingestion & Governance)
    
    rect rgb(245, 245, 245)
        Admin->>L8: 1.1 定義技能本體論 (Define Skill Ontology Slugs)
        Note right of L8: 確立語義權威 (Standardized Tag Authority)
        
        UI->>CBG: 1.2 發布任務/更新履歷 (Post Task / Update Profile)
        CBG->>D3: 1.3 執行領域聚合寫入 (Execute Aggregate Write)
        D3->>AI: 1.4 請求語義提取 (Request Semantic Extraction)
        AI->>L8: 1.5 存儲向量嵌入 (Store Task/Profile Embeddings)
    end

    %% 第二階段：智慧匹配執行 (Phase 2: Intelligent Matching Execution)
    Note over UI, L8: 第二階段：智慧匹配執行 (Phase 2: Execution Flow)

    UI->>CBG: 2.1 提交匹配請求 (Submit Matching Request)
    CBG->>D3: 2.2 觸發匹配指令 (Trigger Match Command)
    D3->>AI: 2.3 啟動 Genkit Matching Flow
    
    rect rgb(230, 245, 255)
        Note right of AI: AI 決策路徑 (AI Decision Reasoning)
        
        %% 步驟 2.1: 語義標準化
        AI->>ToolS: 2.4 術語正規化 (Normalize Terms)
        ToolS->>L8: 查詢本體論映射 (Ontology Lookup)
        L8-->>ToolS: 返回標準 Slug (Canonical Slugs)
        ToolS-->>AI: 標準化技能組 (Normalized Skill Set)

        %% 步驟 2.2: 向量召回
        AI->>ToolM: 2.5 執行向量匹配 (Execute Vector Match)
        ToolM->>L8: 語義近鄰搜尋 (Vector Similarity Search)
        L8-->>ToolM: Top-K 候選名單 (Candidate List)
        ToolM-->>AI: 語義匹配得分 (Semantic Scores)

        %% 步驟 2.3: 合規性檢查 (Fail-closed)
        AI->>ToolV: 2.6 合規與資格檢核 (Compliance & Cert Check)
        ToolV->>L8: 驗證證照/可用性 (Verify Certs/Availability)
        L8-->>ToolV: 原始數據 (Raw Qualifications)
        ToolV-->>AI: 通過判定與理由 (Decisions & Reasons)
    end

    %% 第三階段：結果輸出與反饋 (Phase 3: Output & Feedback)
    Note over AI, L5: 第三階段：結果持久化與反饋 (Phase 3: Output & Feedback Loop)

    AI->>D3: 3.1 回傳排名名單與推理軌跡 (Ranked List & Trace)
    D3->>L5: 3.2 發布投影事件 (Emit Projection Event)
    L5-->>UI: 3.3 更新前端讀模型 (Update Read Model / UI)
    
    %% Everything as a Tag 反饋
    D3->>L8: 3.4 業務指紋自動回饋 (Behavioral Fingerprint Update)
    Note right of L8: 根據任務結果調整 Employee 標籤權重