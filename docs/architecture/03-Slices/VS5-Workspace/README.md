# VS5-Workspace

## Phase 0 角色：任務需求初始化（SSOT Step 0.4）

> SSOT 參考：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` Step 0.4

**VS5 在 Phase 0（Kernel Bootstrap & Tag Ontology）中的職責：**
- `D3->>L8: 0.4 建立任務需求 (VS5 Workspace/Task)` — VS5 Workspace Slice 在語義基石階段負責將任務需求（task requirements）寫入 L8（Firebase/Vector DB），為 Phase 2 向量匹配提供查詢目標
- 任務的 `requirementsEmbedding`（768-dim）由 L10 Genkit 異步填入（Phase 1 Step 1.5-1.6）
- 需求欄位標籤化需通過 VS8 `_cost-classifier.ts`（#A14/D27 Gates）確認為 EXECUTABLE 後方可物化

**Phase 0.4 前置條件：**
1. VS0 已注入共用型別
2. VS8 Tag Ontology 已建立（Step 0.1/0.2）
3. VS8 Cost Classifier 已可用（#A14 D27 Gate）

**Phase 1-2 銜接：**
- Phase 1（Step 1.4）: 任務實體寫入 L8 [FI-002]
- Phase 1（Step 1.5-1.6）: L10 Genkit 異步提取 `requirementsEmbedding`
- Phase 2（Step 2.3-2.4）: L3（VS5）觸發匹配指令 → L10 Genkit Matching Flow

## 一眼摘要

- 用途：承接工作空間內文件、任務、流程與協作操作，是業務執行面的主工作台切片。
- 核心功能：workspace item/task/workflow lifecycle、document parser + semantic classification bridge（`#A14` `D27`）、finance stage gate 與 request lifecycle 對接（`#A15` `#A21` `#A22`）。
- 解決痛點：
	1. 工作項目（檔案/任務/流程）狀態分散，難以維持單一真實來源。
	2. 文件解析與語義判斷未串接時，任務產生與成本語義容易失真。
	3. 任務與財務生命週期耦合過深，導致責任邊界不清與回寫風險。

- Workspace item/task/workflow lifecycle
- Document parser + semantic classification bridge (`#A14` `D27`)
- Finance stage gate and request lifecycle (`#A15` `#A21` `#A22`)

## Code-backed Capability Map

以下能力由 `src/features/workspace.slice/index.ts` 對外匯出，可直接對應實作模組：

1. Core workspace
- workspace 建立/更新/刪除與 capability/location 管理。
- workspace provider、shell、列表/卡片/表格/狀態列 UI。

2. Eventing
- `core.event-bus`: workspace 事件總線、funnel 註冊、projection replay。
- `core.event-store`: append-only domain event 存取（replay/audit）。

3. Application boundary
- command 執行、scope guard、policy engine、transaction runner、outbox 建立。

4. Governance
- `gov.role`: workspace role assign/revoke/query。
- `gov.audit`: audit log write/query 與 timeline UI。
- `gov.members`: member grants 與成員面板。

5. Domain capabilities
- `domain.files`: 檔案建立、版本管理、復原、上傳（daily/task/profile/raw）。
- `domain.document-parser`: ParsingIntent 建立/導入狀態追蹤/訂閱。
- `domain.tasks`: task CRUD、批次導入、sourceIntent 對應查詢。
- `domain.workflow`: stage transition、blockedBy(issue) 處理、workflow 持久化。
- `domain.daily`: 日誌建立/聚合與互動。
- `domain.quality-assurance` / `domain.acceptance`: QA 與驗收能力入口。
- `domain.issues`: issue 建立/留言/解決。

6. Finance migration note
- VS5 的 finance capability 已遷移到 `@/features/finance.slice`（VS9）。
- `workspace.slice` 目前僅保留 backward-compatible re-export。

## Detailed Container Map

- `03-logical-containers.md`: `workspace.slice` 邏輯容器、責任與主要匯出能力總表。

## Core Rules 摘要（Phase 對齊）

- `FI-002`: 任務聚合寫入必須使用 Firestore 單一事務。
- `D29`: 任務命令（CreateTask/PublishTask）必須攜帶 TransactionalCommand 標記。
- `LANE`: 驗收確認（AcceptanceConfirmed）走 CRITICAL_LANE；任務創建（TaskCreated）走 STANDARD_LANE。
