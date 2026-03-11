sequenceDiagram
    autonumber
    
    participant UI as L0: 外部 UI (External UI)
    participant GW as L0A: API 閘道 (API Gateway)
    participant CBG as L2: 命令閘道 (Command Gateway)
    participant AI as L10: Genkit 編排器 (Orchestrator)
    participant ToolS as Tool: 技能檢索 (search_skills)
    participant ToolM as Tool: 候選匹配 (match_candidates)
    participant ToolV as Tool: 合規驗證 (verify_compliance)
    participant D3 as L3: 領域切片 (Domain Slice)
    participant L8 as L8: 數據層 (Firebase/Vector DB)
    participant L5 as L5: 投影匯流排 (Projection Bus)

    Note over UI, L8: 遵循寫鏈與讀鏈治理規則 (Follow Write/Read Chain Governance)

    %% Step 1: 觸發匹配請求
    UI->>GW: 提交任務匹配需求 (Submit Task Requirement)
    GW->>CBG: 路由寫入請求 (Route Write Request)
    CBG->>D3: 執行領域命令 (Execute Domain Command)
    
    %% Step 2: AI 編排工作流 (L10)
    D3->>AI: 觸發匹配流 (Invoke Genkit Flow)
    
    rect rgb(240, 248, 255)
        Note right of AI: AI 決策路徑 (AI Decision Path)
        
        %% Step 2.1: 語義標準化
        AI->>ToolS: 術語映射 (Normalize Terms)
        ToolS->>L8: 查詢本體論 (Ontology Lookup)
        L8-->>ToolS: 標準化標籤 (Skill Slugs)
        ToolS-->>AI: 標準化結果 (Normalized Results)

        %% Step 2.2: 向量召回
        AI->>ToolM: 向量匹配 (Vector Match)
        ToolM->>L8: 語義近鄰召回 (Vector Retrieval)
        L8-->>ToolM: 候選人清單 (Candidate List)
        ToolM-->>AI: 匹配得分 (Vector Scores)

        %% Step 2.3: 合規硬過濾 (Fail-closed)
        AI->>ToolV: 資格檢核 (Compliance Check)
        ToolV->>L8: 驗證證照與可用性 (Verify Certs/Availability)
        L8-->>ToolV: 原始資格數據 (Raw Qualifications)
        ToolV-->>AI: 通過判定與理由 (Decisions & Reasons)
    end

    %% Step 3: 結果持久化與投影
    AI->>D3: 產生排名與推理軌跡 (Ranking & Trace)
    D3->>L5: 發布投影事件 (Emit Projection Event)
    L5-->>GW: 更新唯讀模型 (Update Read Model)
    
    %% Step 4: 返回 UI
    GW-->>UI: 回傳排名名單與解釋 (Ranked List & Explanation)