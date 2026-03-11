# 架構總覽（Architecture SSOT）

本文件是架構裁決層（Topology SSOT）。

- 規則正文 SSOT：`02-governance-rules.md`
- 路徑/Adapter SSOT：`03-infra-mapping.md`
- 流程可讀視圖：`01-logical-flow.md`
- 統一治理藍圖：[`06-DecisionLogic/03-unified-governance-blueprint.md`](06-DecisionLogic/03-unified-governance-blueprint.md)

衝突裁決順序：`00 > 02 > 03 > 01`。

## 三大核心原則（North Star）

> 源自統一架構編排藍圖（`06-unified-governance-blueprint`）

| 原則 | 說明 |
|------|------|
| **架構正確性優先** | 先守層級、邊界、權威出口，再談實作成本。任何「為了方便」的繞道均視為違規。 |
| **Everything as a Tag** | 系統中的能力、資格、角色、偏好均以語義標籤（Tag Slug）表示；禁止裸字串傳遞語義。業務結果回饋自動更新標籤權重 [BF-1]。 |
| **語義權威治理** | VS8（`src/features/semantic-graph.slice`）是全系統唯一語義 SSOT；所有切片不得自行維護語義標籤定義；跨切片語義訊號必須帶 `semanticTagSlugs` [G7]。 |

## 四階段系統生命週期（System Lifecycle Phases）

> 來源藍圖：[`06-DecisionLogic/03-unified-governance-blueprint.md`](06-DecisionLogic/03-unified-governance-blueprint.md) · VS8 細節：[`03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md`](03-Slices/VS8-SemanticBrain/05-semantic-data-lifecycle.md)

```mermaid
sequenceDiagram
    autonumber

    participant Admin as VS8: 語義管理 (Admin/Ontology)
    participant UI as L0: 外部入口 (PM/User)
    participant GW as L0A: API 閘道 (CQRS Ingress)
    participant VS0 as VS0: 內核契約 (Kernel/SK)
    participant D3 as L3: 領域切片 (VS2/VS3/VS5/VS9)
    participant AI as L10: Genkit 編排器
    participant Tool as L10-Tools: AI 工具集 (S/M/V)
    participant IER as L4: 事件路由器 (IER/LANE)
    participant P5 as L5: 投影總線 (Projection Bus)
    participant L8 as L8: 數據持久層 (Firebase/Vector)

    Note over Admin,L8: 架構正確性優先 | Everything as a Tag | 語義權威治理

    rect rgb(250, 250, 250)
        Note over Admin,L8: Phase 0 語義基石
        Admin->>L8: 0.1 定義全域 Tag 本體 (Ontology Slugs)
        VS0->>D3: 0.2 注入 SharedKernel 契約與 Tag 型別 [FI-003]
    end

    rect rgb(245, 245, 245)
        Note over UI,L8: Phase 1 數據攝取與語義化
        UI->>GW: 1.1 更新履歷/發布任務
        GW->>D3: 1.2 執行領域寫入
        D3->>L8: 1.3 存儲業務實體 + 自動標籤化
        D3->>IER: 1.4 發布數據變更事件
        IER-->>AI: 1.5 非同步觸發 Embedding 提取 [E8-I]
        AI->>L8: 1.6 存儲向量特徵
    end

    rect rgb(230, 245, 255)
        Note over UI,AI: Phase 2 智慧匹配執行
        UI->>GW: 2.1 請求匹配建議
        GW->>D3: 2.2 觸發匹配指令
        D3->>AI: 2.3 啟動 Genkit Matching Flow [E8 Tool ACL]
        AI->>Tool: 2.4 search_skills 術語正規化
        AI->>Tool: 2.5 match_candidates 向量召回
        AI->>Tool: 2.6 verify_compliance 合規驗證 [GT-2 Fail-closed]
        AI-->>D3: 2.7 回傳推理軌跡與排名結果
        D3->>IER: 2.8 發布 MatchingConfirmed 事件
    end

    rect rgb(255, 250, 240)
        Note over IER,UI: Phase 3 投影物化與業務指紋反饋
        IER->>P5: 3.1 物化 Recommendation View
        GW->>P5: 3.2 讀取物化視圖 (QRY)
        P5-->>UI: 3.3 渲染智慧推薦列表
        D3->>IER: 3.4 [BF-1] 業務指紋回饋 (TaskCompleted)
        IER-->>AI: 3.5 VS8 調整 employees.skillEmbedding 權重
    end
```

| 階段 | 核心規則 |
|------|---------|
| Phase 0 語義基石 | `FI-003` |
| Phase 1 數據攝取 | `E8-I` |
| Phase 2 智慧匹配 | `GT-2` / `E8` |
| Phase 3 投影反饋 | `BF-1` / `S2` |

## 三條主鏈（Canonical Chains）

| 鏈路 | 流向 |
|---|---|
| 寫鏈 | `L0 -> L0A(CMD_API_GW) -> L2 -> L3 -> L4 -> L5` |
| 讀鏈 | `L0/UI -> L0A(QRY_API_GW) -> L6 -> L5` |
| Infra 鏈 A | `L3/L5/L6 -> L1(SK_PORTS) -> L7-A(firebase-client) -> L8` |
| Infra 鏈 B | `L0/L2 -> L7-B(functions + firebase-admin) -> L8` |

## VS 與 Layer 快速對照

### Vertical（VS0~VS9）

- `VS0`: Foundation（`VS0-Kernel` + `VS0-Infra`）
- `VS1~VS9`: 業務切片（Identity / Account / Skill XP / Organization / Workspace / Scheduling / Notification / Semantic Cognition / Finance）

### Auxiliary Feature Slices（現況補充）

- `global-search.slice`：跨切片搜尋權威出口（D26）。
- `portal.slice`：門戶殼層狀態橋接，承載 portal state 公開 hook。

### Horizontal（L0~L10）

- `L0`: External Triggers
- `L0A`: API Gateway Ingress（Command/Query 分流）
- `L1`: Shared Kernel（contracts/constants/pure）
- `L2`: Command Gateway
- `L3`: Domain Slices
- `L4`: IER
- `L5`: Projection Bus
- `L6`: Query Gateway
- `L7`: Firebase ACL Boundary（A=client, B=functions/admin）
- `L8`: Firebase Runtime（external）
- `L9`: Observability
- `L10`: AI Runtime & Orchestration

## 最小架構圖（VS0~VS9 × 八層架構）

```mermaid
flowchart LR
  subgraph IDL["① Identity Layer"]
    EXT[L0 External]
    VS1[VS1 Identity]
  end

  subgraph GOV["② Governance Layer"]
    VS0[VS0 SK]
    CMDGW[L0A CMD_GW]
    QRYGW[L0A QRY_GW]
    L2[L2]
    L6[L6]
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
    L10[L10 AI]
  end

  subgraph INF["⑦ Infrastructure Layer"]
    L1[L1 SK_PORTS]
    L7A[L7-A client]
    L7B[L7-B admin]
    L8[L8 Firebase]
  end

  subgraph OBS["⑧ Observability Layer"]
    L9[L9]
  end

  EXT & VS1 --> CMDGW & QRYGW
  VS0 -->|FI-003| DOM
  CMDGW --> L2
  L2 --> DOM --> IER --> PB
  L2 --> VS8
  QRYGW --> L6 --> PB
  DOM & PB & L6 & VS8 --> L1
  L1 --> L7A & L7B
  L7A & L7B --> L8
  IER -->|E8-I| L10 --> VS8
  L2 -. trace .-> L9
  IER -. lag .-> L9
```

## 🧠 VS8 · Semantic Cognition Engine（src/features/semantic-graph.slice）[#A6 #17]

> 定位：VS8 是全系統的語義權威與語義認知引擎（L3 Semantic Layer），以四階段語義生命週期驅動系統：Phase 0（語義基石）→ Phase 1（數據攝取）→ Phase 2（智慧匹配）→ Phase 3（結果輸出）。
> 四大子系統：`semantic-governance-portal`（wiki-editor / proposal-stream，Phase 0 本體論治理）｜`semantic-core-domain`（_types / _aggregate / _actions / _cost-classifier，純領域邏輯）｜`Semantic Compute Engine`（genkit-tools/ + _services.ts，三工具分派 search_skills → match_candidates → verify_compliance）｜`Semantic Output Layer`（projections / outbox / subscribers，Phase 3 輸出與反饋）。
> 公開邊界：`index.ts` 為唯一公開出口；`_actions.ts`（寫入命令 [KG-1]）、`_aggregate.ts`（純驗證 / 聚合）、`_queries.ts`（讀出口 [VD-2]）、`_services.ts`（向量索引 [VD-1]）、`_semantic-authority.ts`（語義權威常數 [OT-1]）。`VS8-SemanticBrain` 為歷史文件目錄，對應現行切片 `semantic-graph.slice`；`VS9 = Finance`。

## 關鍵不變量（索引）

- `FI-003`: VS0 SK 在 Domain Slice (L3) 執行前完成契約型別注入；D3 不得重複定義 SK 已定義型別。
- `R8`: traceId 只注入一次、全鏈唯讀。
- `S2`: Projection 必須過 version guard。
- `S4`: SLA 只能引用契約常數，不可硬寫。
- `D24/D25`: Firebase 邊界隔離（feature 不直連 SDK；admin 僅 functions）。
- `D26`: cross-cutting authority 出口唯一化（Search / Notification）。
- `D27`: 成本語義決策由 VS8 `_cost-classifier.ts` 提供；VS5 不可自判。
- `D29`: Aggregate + outbox 同交易。
- `D31`: 讀路徑權限投影一致性。
- `E7/E8`: Security/AppCheck/AI Tool ACL 閉環。
- `E8-I`: Embedding 提取管線必須透過 IER (L4) 非同步隔離，禁止 Domain Slice 同步呼叫 AI。
- `A19~A22`: 任務-金融生命週期封閉與逆向投影規則。
- `KG-1`: 知識圖譜邊只能透過 VS8 `_actions.ts` 寫入；嚴禁外部切片建立 SemanticEdge。
- `VD-1`: 語義向量索引由 VS8 `_services.ts` 獨家管理；外部切片透過 `_queries.ts` 出口查詢。
- `OT-1`: 新分類法維度只能在 VS8 `_semantic-authority.ts` 定義；嚴禁其他切片自行添加維度。
- `B1`: VS8 只輸出語義提示/匹配結果；嚴禁直接觸發跨切片副作用。
- `GT-1`: VS8 Genkit 工具（`search_skills` / `match_candidates` / `verify_compliance`）必須透過 `defineTool` 在 Genkit 中註冊；AI 呼叫合規驗證必須優先於候選人輸出。
- `BF-1`: 業務指紋回饋（Behavioral Fingerprint Update）—任務結果確認後，Domain Slice 必須透過 IER 事件觸發 VS8 更新 `employees.skillEmbedding` 權重；嚴禁其他切片直接寫入 `employees.skillEmbedding`。
- `G7`: 跨切片語義訊號必帶 `semanticTagSlugs`；嚴禁傳遞裸字串語義標籤。

完整正文請見 `02-governance-rules.md`。

## FORBIDDEN（最小集）

- 禁止跨切片直接寫他域 Aggregate。
- 禁止繞過 L2/L4/L5/L6 主鏈路。
- 禁止 feature slice 直連 `firebase/*` 或 `firebase-admin`。
- 禁止讀路徑回呼寫路徑形成反向環。
- 禁止 Domain Slice 同步呼叫 AI 進行 Embedding 提取（必須透過 IER 非同步 [E8-I]）。
- 禁止 VS8 直接執行跨切片副作用（僅輸出語義提示 [B1]）。

完整 Forbidden 清單請見 `02-governance-rules.md`。

## 變更協議（Doc Change Protocol）

1. 先改 `02-governance-rules.md` 的 canonical rule body。
2. 再更新 `00` 的索引與裁決語句。
3. 同步 `01`（流程視圖）與 `03`（路徑映射）。
4. 最後用 `99-checklist.md` 做審查。
