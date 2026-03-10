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
