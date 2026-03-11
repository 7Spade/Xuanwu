sequenceDiagram
    autonumber
    
    %% 參與者定義 (Combined: 05 + 06)
    participant Admin as VS8: 語義管理 (Admin/Ontology)
    participant VS0 as VS0: 核心內核 (Kernel/SDK)
    participant UI as L0: 外部入口 (UI/Client/PM/User)
    participant GW as L0A: CQRS 閘道 (API Ingress)
    participant CBG as L2: 命令管線 (Write Pipeline)
    participant D3 as L3: 領域切片 (VS1-VS9 Slices)
    participant AI as L10: Genkit 編排器 (AI Orchestrator)
    participant ToolS as Tool-S: 技能檢索 (search_skills)
    participant ToolM as Tool-M: 候選匹配 (match_candidates)
    participant ToolV as Tool-V: 合規驗證 (verify_compliance)
    participant IER as L4: 事件路由器 (IER/LANE)
    participant P5 as L5: 投影總線 (Projection/Bus)
    participant Q6 as L6: 查詢閘道 (Query Gateway)
    participant L8 as L8: 數據持久層 (Firebase/Vector DB)

    Note over UI, L8: 架構準則：架構正確性優先 [Architectural Correctness First]

    %% --- 階段 0：語義基石與核心初始化 (Semantic Foundation) ---
    rect rgb(255, 245, 230)
        Note over VS0, L8: 【階段 0】語義基石：核心初始化 (Kernel Bootstrap & Tag Ontology)
        VS0->>D3: 注入共用型別與枚舉 (Inject Kernel Types) [VS0]
        Admin->>L8: 0.1 定義技能本體論 (Define Skill Ontology Slugs)
        Note right of L8: 確立語義權威 (Standardized Tag Authority)
        D3->>L8: 0.2 建立標籤本體論 (Define VS8 Tag Ontology)
        D3->>L8: 0.3 更新員工畫像與證照 (VS2 Account/Profile)
        D3->>L8: 0.4 建立任務需求 (VS5 Workspace/Task)
    end

    %% --- 階段 1：寫鏈路與數據攝取 (Write Chain & Data Ingestion) ---
    rect rgb(245, 245, 245)
        Note over UI, L8: 【階段 1】寫鏈路：數據攝取與治理 (Command Chain & Data Ingestion)
        UI->>GW: 1.1 提交業務命令/更新履歷/發布任務 (Submit CMD / Update Profile / Post Task)
        GW->>CBG: 1.2 路由與身份驗證 (VS1 Identity/Auth)
        CBG->>D3: 1.3 執行領域命令 [D29 TransactionalCommand]
        Note right of D3: VS3: Ledger 記帳 [#13]<br/>VS9: 進入 Staging Pool<br/>VS7: 透過 Port 發送通知 [A13]
        D3->>L8: 1.4 執行 Firestore 單一事務寫入 [FI-002]
        D3->>AI: 1.5 請求語義提取 (Request Semantic Extraction)
        AI->>L8: 1.6 存儲向量嵌入 (Store Task/Profile Embeddings)
        D3->>IER: 1.7 發布整合事件 (Integration Events)
        IER->>P5: 1.8 按 Lane 分流 (Critical/Standard) [LANE]
    end

    %% --- 階段 2：語義智慧匹配執行序 (Intelligent Matching Execution) ---
    rect rgb(230, 245, 255)
        Note over D3, AI: 【階段 2】語義智慧匹配執行 (Intelligent Matching Execution)
        UI->>GW: 2.1 提交匹配請求 (Submit Matching Request)
        GW->>CBG: 2.2 路由匹配命令 (Route Match CMD)
        CBG->>D3: 2.3 觸發匹配指令 (Trigger Match Command)
        D3->>AI: 2.4 啟動 Genkit Matching Flow [E8 Tenant Isolation]

        rect rgb(200, 230, 255)
            Note right of AI: AI 決策路徑 (AI Decision Reasoning)

            AI->>ToolS: 2.5 術語正規化 (Normalize Terms via search_skills)
            ToolS->>L8: 查詢本體論映射 (Ontology Lookup)
            L8-->>ToolS: 返回標準 Slug (Canonical Slugs)
            ToolS-->>AI: 標準化技能組 (Normalized Skill Set)

            AI->>ToolM: 2.6 執行向量匹配 (Execute Vector Match via match_candidates)
            ToolM->>L8: 語義近鄰搜尋 (Vector Similarity Search)
            L8-->>ToolM: Top-K 候選名單 (Candidate List)
            ToolM-->>AI: 語義匹配得分 (Semantic Scores)

            AI->>ToolV: 2.7 合規與資格檢核 (Compliance & Cert Check via verify_compliance)
            ToolV->>L8: 驗證證照/可用性 (Verify Certs/Availability)
            L8-->>ToolV: 原始數據 (Raw Qualifications)
            ToolV-->>AI: 通過判定與理由 (Decisions & Reasons)
            Note right of ToolV: Fail-closed：證照/資格硬過濾 [GT-2]
        end

        AI-->>D3: 2.8 返回推理軌跡與排名 (Ranked List & Trace)
        D3->>L8: 2.9 自動回饋業務指紋 (Behavioral Fingerprint Update)
        Note right of L8: 根據任務結果調整 Employee 標籤權重
    end

    %% --- 階段 3：結果物化與讀鏈路 (Output & Read Chain) ---
    rect rgb(255, 250, 240)
        Note over UI, Q6: 【階段 3】讀鏈路：結果輸出與解耦查詢 (Output & Query Chain)
        D3->>P5: 3.1 發布投影事件 (Emit Projection Event)
        P5-->>UI: 3.2 更新前端讀模型 (Update Read Model / UI)
        UI->>GW: 3.3 請求數據 (Submit QRY)
        GW->>Q6: 3.4 委派查詢 (Delegate to QGWAY)
        Note right of Q6: VS6: 讀取排班視圖 [D27]<br/>VS5: 讀取物化任務清單
        Q6->>P5: 3.5 讀取物化視圖 (Read Materialized Model)
        P5-->>UI: 3.6 回傳 UI 渲染數據 (Streaming/Parallel)
    end
