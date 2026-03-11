# Semantic Intelligent Matching Architecture

本文件以 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` 為唯一事實來源，整理 Xuanwu 語義智慧匹配架構的分層、流程與治理約束。

## 1. Architecture Principle

- 架構準則：`Architectural Correctness First`
- 核心分層：`L0/L0A/L0B/L2/L3/L4/L4A/L5/L6/L8/L10`
- 核心切片：`VS0` 與 `VS1-VS9`
- 核心工具：`Tool-S (search_skills)`、`Tool-M (match_candidates)`、`Tool-V (verify_compliance)`

## 2. Participants and Responsibilities

- `VS0`：核心內核，注入共用型別與枚舉。
- `VS8 Admin/Ontology`：定義技能本體論 Slug，建立語義權威。
- `L0`：外部入口（UI/Client/PM/User）。
- `L0A`：CQRS API Ingress。
- `L0B`：Server Action 串流橋接，回推推理軌跡。
- `L2`：命令管線（Write Pipeline）。
- `L3`：領域切片執行層（VS1-VS9）。
- `L10`：Genkit 編排器。
- `L4`：IER/LANE 事件路由。
- `L4A`：語義決策稽核切片。
- `L5`：Projection Bus。
- `L6`：Query Gateway。
- `L8`：資料持久層（Firebase/Vector DB）。

## 3. End-to-End Flow (Phase 0-3)

### 3.1 Phase 0: Semantic Foundation

1. `VS0 -> L3`：注入共用型別與枚舉。
2. `VS8 Admin -> L8`：定義技能本體論 Slug。
3. `L3 -> L8`：建立 VS8 標籤本體論。
4. `L3 -> L8`：更新 VS2 員工畫像與證照。
5. `L3 -> L8`：建立 VS5 任務需求。

### 3.2 Phase 1: Write Chain and Ingestion

1. `L0 -> L0A`：提交業務命令、履歷更新、任務發布。
2. `L0A -> L2`：路由與身份驗證（VS1）。
3. `L2 -> L3`：執行交易命令（D29）。
4. `L3 -> L8`：執行 Firestore 單一事務寫入（FI-002）。
5. `L3 -> L10`：請求語義提取。
6. `L10 -> L8`：存儲 Task/Profile 向量嵌入。
7. `L3 -> L4`：發布整合事件。
8. `L4 -> L5`：依 Lane 分流投影（Critical/Standard）。

註記：L3 在此階段包含跨切片業務效果。

- `VS3`：Ledger 記帳。
- `VS9`：進入 Staging Pool。
- `VS7`：透過 Port 發送通知。

### 3.3 Phase 2: Intelligent Matching Execution

1. `L0 -> L0A -> L2 -> L3`：提交並觸發匹配命令。
2. `L3 -> L10`：啟動 Genkit Matching Flow（E8 Tenant Isolation）。
3. `L10 -> Tool-S -> L8`：術語正規化，回傳 canonical slugs。
4. `L10 -> Tool-M -> L8`：向量近鄰搜尋，回傳候選與語義分數。
5. `L10 -> Tool-V -> L8`：合規與資格檢核，回傳判定與理由。
6. `L10 -> L0B -> L0`：串流中間推理軌跡到前端。
7. `L10 -> L3`：回傳最終排名與推理軌跡。
8. `L3 -> L4`：發布匹配決策事件（含 reasons/traceRef）。
9. `L4 -> L4A`：寫入稽核日誌（Who/Why/Evidence/Version/Tenant）。
10. `L4 -> L5`：發布投影事件。
11. `L3 -> L8`：回饋行為指紋，調整員工標籤權重。

### 3.4 Phase 3: Output and Read Chain

1. `L3 -> L5`：發布投影事件。
2. `L5 -> L0`：更新前端讀模型。
3. `L0 -> L0A -> L6`：提交並委派查詢。
4. `L6 -> L5`：讀取物化視圖。
5. `L5 -> L0`：回傳 UI 渲染資料（Streaming/Parallel）。

註記：L6 查詢重點包含 VS6 排班視圖與 VS5 物化任務清單。

## 4. Governance and Security Constraints

- `E8 Tenant Isolation`：`Tool-M` 必須以 `metadata.tenantId == request.tenantId` 強綁定過濾，缺 tenantId 時 `fail-closed`。
- `GT-2`：`Tool-V` 對證照/資格採硬過濾，資料不足或不通過即拒絕（`fail-closed`）。
- 稽核必備欄位：`Who/Why/Evidence/Version/Tenant`。
- 事件治理：匹配決策必須經 `IER/LANE` 路由後再進入投影。

## 5. Canonical Tool Sequence

匹配執行順序固定如下：

1. `search_skills`
2. `match_candidates`
3. `verify_compliance`

輸出必備三類資訊：

- 最終排名結果。
- 合規判定與理由。
- 可追溯推理軌跡（含中間串流與最終 trace）。

## 6. Acceptance Checklist

- 是否完整覆蓋 Phase 0/1/2/3 的鏈路與事件流。
- 是否正確落地 `L0-L10`、`VS0-VS9`、`Tool-S/M/V`、`IER/LANE` 名詞。
- 是否明確實施 `E8`、`GT-2`、稽核欄位與 `fail-closed`。
- 是否保證「先合規/資格檢核，再輸出匹配決策」。
- 是否可追溯到 `reasons/traceRef` 與前端串流回饋。