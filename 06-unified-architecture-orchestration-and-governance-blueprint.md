sequenceDiagram
    autonumber
    
    %% 參與者定義
    participant UI as L0: 外部入口 (UI/Client)
    participant GW as L0A: CQRS 閘道 (API Ingress)
    participant CBG as L2: 命令管線 (Write Pipeline)
    participant VS0 as VS0: 核心內核 (Kernel/SDK)
    participant D3 as L3: 領域切片 (VS1-VS9 Slices)
    participant AI as L10: Genkit 編排器 (AI Runtime)
    participant IER as L4: 事件路由器 (IER/LANE)
    participant P5 as L5: 投影總線 (Projection/Bus)
    participant Q6 as L6: 查詢閘道 (Query Gateway)
    participant L8 as L8: 數據持久層 (Firebase/Vector DB)

    Note over UI, L8: 架構準則：架構正確性優先 [Architectural Correctness First]

    %% --- 階段一：數據來源與治理 (Source & Ingestion) ---
    rect rgb(245, 245, 245)
        Note over VS0, L8: 【階段一】數據生命週期與語義來源 (Data Lifecycle)
        VS0->>D3: 注入共用型別與枚舉 (Inject Kernal Types) [VS0]
        D3->>L8: 1.1 定義標籤本體論 (Define VS8 Tag Ontology)
        D3->>L8: 1.2 更新員工畫像與證照 (VS2 Account/Profile)
        D3->>L8: 1.3 建立任務需求 (VS5 Workspace/Task)
    end

    %% --- 階段二：寫鏈路 (The Write Chain) ---
    rect rgb(240, 240, 240)
        Note over UI, L8: 【階段二】寫鏈路：事務與治理 (Command Chain)
        UI->>GW: 2.1 提交業務命令 (Submit CMD)
        GW->>CBG: 2.2 路由與身份驗證 (VS1 Identity/Auth)
        CBG->>D3: 2.3 執行領域命令 [D29 TransactionalCommand]
        
        Note right of D3: VS3: Ledger 記帳 [#13]<br/>VS9: 進入 Staging Pool<br/>VS7: 透過 Port 發送通知 [A13]
        
        D3->>L8: 2.4 執行 Firestore 單一事務寫入 [FI-002]
        D3->>IER: 2.5 發布整合事件 (Integration Events)
        IER->>P5: 2.6 按 Lane 分流 (Critical/Standard) [LANE]
    end

    %% --- 階段三：AI 語義匹配執行序 (AI Orchestration) ---
    rect rgb(230, 245, 255)
        Note over D3, AI: 【階段三】語義智慧匹配 (Intelligent Matching)
        D3->>AI: 3.1 觸發 Genkit Flow (E8 Tenant Isolation)
        
        par AI 調度工具鏈 (Tool Calling)
            AI->>L8: 3.2 術語標準化 (Normalize via VS8 Tag)
            AI->>L8: 3.3 向量相似度召回 (Vector Retrieval)
            AI->>L8: 3.4 合規性硬過濾 (Verify via VS1/VS6)
        end
        
        AI-->>D3: 3.5 返回推理軌跡與排名 (Trace & Rank)
        D3->>L8: 3.6 自動回饋業務指紋 (Behavioral Fingerprint)
    end

    %% --- 階段四：讀鏈路 (The Read Chain) ---
    rect rgb(255, 250, 240)
        Note over UI, Q6: 【階段四】讀鏈路：解耦查詢 (Query Chain)
        UI->>GW: 4.1 請求數據 (Submit QRY)
        GW->>Q6: 4.2 委派查詢 (Delegate to QGWAY)
        Note right of Q6: VS6: 讀取排班視圖 [D27]<br/>VS5: 讀取物化任務清單
        Q6->>P5: 4.3 讀取物化視圖 (Read Materialized Model)
        P5-->>UI: 4.4 回傳 UI 渲染數據 (Streaming/Parallel)
    end