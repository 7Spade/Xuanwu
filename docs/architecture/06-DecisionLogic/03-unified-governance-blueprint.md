# [索引 ID: @ARCH-06] 統一架構編排與治理藍圖（Unified Architecture Orchestration and Governance Blueprint）

> Status: **Reference Blueprint**
> Scope: 全系統 (VS0~VS9 + L0~L10 + AI Layer)
> Purpose: 定義系統四階段生命週期（語義基石 → 數據攝取 → 智慧匹配 → 讀模型物化），作為 00/01/02/03 治理文件的對齊基礎。
> Cross-reference: `00-logic-overview.md`（拓撲 SSOT）、`02-governance-rules.md`（規則正文）、`docs/architecture/03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md`（VS8 細節）
> SSOT: `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`（Phase 1/2/3 參與者與流程定義）
>
> 核心原則：**架構正確性優先** ｜ **Everything as a Tag** ｜ **語義權威治理**

```mermaid
sequenceDiagram
    autonumber
    
    %% 參與者定義（對齊 Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md SSOT）
    participant Admin as VS8: 語義管理 (Admin/Ontology)
    participant VS0 as VS0: 核心內核 (Kernel/SDK)
    participant UI as L0: 外部入口 (UI/Client/PM/User)
    participant SA as L0B: Server Action 串流橋接 (Trace Stream)
    participant GW as L0A: CQRS 閘道 (API Ingress)
    participant CBG as L2: 命令管線 (Write Pipeline)
    participant D3 as L3: 領域切片 (VS1-VS9 Slices)
    participant AI as L10: Genkit 編排器 (AI Orchestrator)
    participant ToolS as Tool-S: 技能檢索 (search_skills)
    participant ToolM as Tool-M: 候選匹配 (match_candidates)
    participant ToolV as Tool-V: 合規驗證 (verify_compliance)
    participant IER as L4: 事件路由器 (IER/LANE)
    participant Audit as L4A: 稽核切片 (Semantic Decision Audit)
    participant P5 as L5: 投影總線 (Projection/Bus)
    participant Q6 as L6: 查詢閘道 (Query Gateway)
    participant L8 as L8: 數據持久層 (Firebase/Vector DB)

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
        Note over UI, L8: 【Phase 1】寫入鏈：UI → L0A → L2 → L3 → L8(FI-002) → L10(embedding) → L4 → L5(LANE routing)
        UI->>GW: 1.1 更新履歷/發布任務 (Update Profile / Post Task)
        GW->>CBG: 1.2 路由寫入請求 (Route Write Request via L0A)
        CBG->>D3: 1.3 執行領域寫入 [D29 TransactionalCommand]
        D3->>L8: 1.4 存儲業務實體 + 自動標籤化 [FI-002 Firestore 單交易]
        D3->>IER: 1.5 發布數據變更事件 (Integration Events)
        IER-->>AI: 1.6 非同步觸發 Embedding 提取 [E8-I BACKGROUND lane]
        AI->>L8: 1.7 存儲向量特徵 (Store Embeddings)
        IER->>P5: 1.8 LANE routing → L5 投影物化
    end

    %% --- 階段 2：智慧匹配編排鏈 (The Orchestration Chain) ---
    rect rgb(230, 245, 255)
        Note over UI, Audit: 【Phase 2】智慧匹配：UI → L0A → L2 → L3 → L10 → Tool-S → Tool-M(E8 fail-closed) → Tool-V(GT-2) → L0B → L3 → L4 → L4A → L5 → L3→L8(BF-1)
        UI->>GW: 2.1 請求匹配建議 (Submit Matching Request)
        GW->>CBG: 2.2 路由寫入請求 (Route Write Request via L0A)
        CBG->>D3: 2.3 觸發匹配指令 (VS5 Domain Command)
        D3->>AI: 2.4 啟動 Genkit Matching Flow [E8 Tool ACL]

        rect rgb(200, 230, 255)
            Note right of AI: AI 決策路徑（遵循 GT-1 Tool 宣告）
            AI->>ToolS: 2.5 術語正規化 (Normalize via search_skills) [OT-2 GT-3]
            ToolS->>L8: 查詢 VS8 本體論映射
            ToolS-->>AI: 標準化技能組 (Canonical Skill Slugs)
            AI->>ToolM: 2.6 向量召回 (match_candidates) [VD-2]
            Note right of ToolM: E8 Fail-closed：metadata filter 必須 tenantId 強綁定；未帶入即 fail-closed
            ToolM->>L8: 語義相似度搜尋 tenantId enforced (Vector Search)
            ToolM-->>AI: Top-K 候選名單 (Candidate List)
            AI->>ToolV: 2.7 合規驗證 (verify_compliance) [GT-2]
            Note right of ToolV: GT-2 Fail-closed：證照/資格硬過濾；未通過即排除，禁止降級輸出
            ToolV->>L8: 驗證證照/可用性 (Verify Certs/Availability)
            ToolV-->>AI: 通過判定與推理軌跡 (Decisions & inferenceTrace[])
        end

        AI->>SA: 2.8 排名名單 + inferenceTrace → L0B 串流橋接 (Stream via Server Action)
        SA-->>D3: 2.9 串流回 L3 領域切片 (Stream back to Domain Slice)
        D3->>IER: 2.10 發布匹配完成事件 (MatchingConfirmed)
        IER->>Audit: 2.11 路由至 L4A 稽核切片 (Route to Semantic Decision Audit)
        Note right of Audit: L4A 稽核欄位：Who（操作者）/ Why（觸發原因）/ Evidence（inferenceTrace[]）/ Version（modelId）/ Tenant（tenantId）
        Audit->>P5: 2.12 寫入稽核投影 (Write Audit Projection)
        IER->>P5: 2.13 寫入匹配推薦視圖 (Materialize Recommendation View)
    end

    %% --- 階段 3：投影與查詢 (The Read Chain) ---
    rect rgb(255, 250, 240)
        Note over P5, UI: 【Phase 3】讀取鏈：L3 → L5 → UI / UI → L0A → L6 → L5 → UI
        P5-->>UI: 3.1 投影更新推送 (Projection Update Push)
        UI->>GW: 3.2 發起查詢請求 (QRY via L0A)
        GW->>Q6: 3.3 L6 查詢閘道 (Query Gateway)
        Q6->>P5: 3.4 讀取物化視圖 (Read Materialized Model)
        P5-->>UI: 3.5 渲染智慧推薦列表 (UI Rendering)
        D3->>IER: 3.6 [BF-1] 業務指紋回饋事件 (TaskCompleted/TaskRated)
        IER-->>AI: 3.7 VS8 調整 employees.skillEmbedding 權重 [BF-1]
        AI->>L8: 3.8 更新向量嵌入權重 (Update Skill Embedding Weights)
    end
```
