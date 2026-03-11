# [索引 ID: @VS5-Item] VS5 Workspace - Item Lifecycle

## A-Track

`workspace.items -> tasks -> QA -> acceptance -> finance-stage-gateway`

## B-Track

`issues` 作為阻塞支線，透過 `blockedBy` 與主流程同步 (`#A3`)。

## Implemented Capabilities (from code)

1. Task domain
- `createTask` / `updateTask` / `deleteTask`
- `batchImportTasks`
- task 查詢：`getWorkspaceTasks`、`getWorkspaceTask`、`hasTasksForSourceIntent`、`getTasksBySourceIntentId`

2. Workflow domain
- stage order 與 transition：`WORKFLOW_STAGE_ORDER`、`advanceWorkflowStage`、`advanceWorkflowToStage`
- 阻塞/解除阻塞：`blockWorkflow`、`isWorkflowUnblocked`
- issue handler：`handleIssueCreatedForWorkflow`、`handleIssueResolvedForWorkflow`
- workflow state persistence：`loadWorkflowState`、`saveWorkflowState`、`updateWorkflowState`

3. Issue domain
- `createIssue`、`addCommentToIssue`、`resolveIssue`

4. QA / Acceptance entry
- `WorkspaceQualityAssurance`
- `WorkspaceAcceptance`

## Invariants

- `D27-Order`: `WorkspaceItem -> WorkspaceTask -> WorkspaceSchedule` 禁止跳級。
- `#A15`: `Acceptance=OK` 前不得進入 Finance。
- `#A21`: outstanding amount > 0 時不得 completed。

## Finance Boundary Note

- Finance aggregate capability 已遷移至 VS9（`finance.slice`）。
- VS5 僅負責 gate 與事件輸出，不直接管理 Finance_Request 狀態機。

## Event Discipline

- 主流程與異常流程交互必須事件化。
- 跨 slice 協作走 IER，不直接 mutate 他 BC 狀態。

## Phase 對齊（SSOT Phase Alignment）

| Phase | 步驟 | VS5 Item Lifecycle 角色 |
|-------|------|------------------------|
| Phase 0 (Step 0.4) | 建立任務需求 | WorkspaceItem 初始化後，需完成標籤化（VS8 authority）以建立任務向量基礎 |
| Phase 1 (Step 1.3) | D29 TransactionalCommand | Workspace 命令（CreateItem/UpdateItem/PublishTask）必須攜帶 TransactionalCommand 標記 |
| Phase 1 (Step 1.4) | FI-002 Firestore 單交易 | 業務實體（WorkspaceItem/Task）寫入必須使用單一 Firestore 事務 |
| Phase 1 (Step 1.7-1.8) | 發布整合事件 + LANE 分流 | AcceptanceConfirmed → CRITICAL_LANE；TaskCreated → STANDARD_LANE |
| Phase 2 (Step 2.3-2.4) | 觸發匹配指令 | VS5 L3 Domain Slice 觸發 Matching Command → L10 Genkit Flow（E8 Tenant Isolation） |
| Phase 3 (Step 3.1) | 發布投影事件 | 匹配結果確認後，VS5 發布投影事件 → L5 → UI 更新讀模型 |

**BF-1 銜接**：  
任務完成（AcceptanceConfirmed）後，VS5 Domain Slice 透過 L4 IER 事件觸發 VS8 更新 `employees.skillEmbedding`（BF-1 業務指紋回饋），
調整員工標籤權重（對齊 Step 2.14）。
