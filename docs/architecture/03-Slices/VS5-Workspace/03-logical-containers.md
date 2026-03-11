# [Index ID: @VS5-Containers] VS5 Workspace - Logical Containers

## Scope

This file maps `src/features/workspace.slice` logical containers to their responsibilities and exported capabilities.
Source of truth for capability names is `src/features/workspace.slice/index.ts`.

## Container Map

| Container | Responsibility | Key exported capabilities |
|---|---|---|
| `core` | Workspace aggregate-facing UI and orchestration entry | `handleCreateWorkspace`, `handleUpdateWorkspaceSettings`, `handleDeleteWorkspace`, `createWorkspaceWithCapabilities`, `createWorkspaceLocation`, `updateWorkspaceLocation`, `deleteWorkspaceLocation` |
| `core.event-bus` | In-process event bus and funnel hooks | `WorkspaceEventBus`, `registerWorkspaceFunnel`, `registerOrganizationFunnel`, `replayWorkspaceProjections` |
| `core.event-store` | Append-only event storage for replay/audit | `appendDomainEvent`, `getDomainEvents` |
| `domain.application` | Command boundary, policy/scope checks, tx/outbox coordination | `executeCommand`, `checkWorkspaceAccess`, `evaluatePolicy`, `runTransaction`, `createOutbox` |
| `gov.role` | Workspace role governance | `assignWorkspaceRole`, `revokeWorkspaceRole`, `getWorkspaceGrant`, `getWorkspaceGrants` |
| `gov.audit` | Workspace/account audit write/read and UI timeline | `writeAuditLog`, `getAuditLogs`, `useWorkspaceAudit`, `WorkspaceAudit`, `AuditTimeline` |
| `gov.audit-convergence` | Audit projection bridge/query adapter | `toAuditProjectionQuery`, `DEFAULT_AUDIT_QUERY_LIMIT` |
| `gov.members` | Workspace member panel and grants exposure | `WorkspaceMembers` |
| `domain.files` | File CRUD/versioning/upload and subscriptions | `createWorkspaceFile`, `addWorkspaceFileVersion`, `restoreWorkspaceFileVersion`, `deregisterWorkspaceFile`, `uploadDailyPhoto`, `uploadTaskAttachment`, `uploadProfilePicture`, `uploadRawFile`, `subscribeToWorkspaceFiles` |
| `domain.document-parser` | ParsingIntent creation/import workflow and subscriptions | `saveParsingIntent`, `markParsingIntentImported`, `subscribeToParsingIntents`, `WorkspaceDocumentParser` |
| `domain.parsing-intent` | ParsingIntent digital twin contract helpers | `createParsingIntentContract`, `markParsingIntentContract`, `supersedeParsingIntent` |
| `domain.tasks` | Task CRUD/import and task query read API | `createTask`, `updateTask`, `deleteTask`, `batchImportTasks`, `getWorkspaceTasks`, `getWorkspaceTask` |
| `domain.daily` | Daily log creation/aggregation and UI actions | `useWorkspaceDailyLog`, `useAggregatedLogs`, `useDailyActions`, `useBookmarkActions`, `useDailyUpload`, `getDailyLogs` |
| `domain.workflow` | Workflow state machine, blockedBy handling, persistence | `advanceWorkflowStage`, `blockWorkflow`, `isWorkflowUnblocked`, `loadWorkflowState`, `saveWorkflowState`, `updateWorkflowState`, `findWorkflowsBlockedByIssue` |
| `domain.quality-assurance` | QA capability entry | `WorkspaceQualityAssurance` |
| `domain.acceptance` | Acceptance capability entry | `WorkspaceAcceptance` |
| `domain.issues` | Issue creation/comment/resolve (B-track) | `createIssue`, `addCommentToIssue`, `resolveIssue`, `WorkspaceIssues` |
| `domain.finance` | Backward-compatible facade to VS9 | re-export from `@/features/finance.slice`: `WorkspaceFinance`, `getFinanceAggregateState`, `saveFinanceAggregateState` |
| `_workspace.rules` / `_task.rules` | Pure predicates/builders | `filterVisibleWorkspaces`, `hasWorkspaceAccess`, `isWorkspaceVisibleToUser`, `buildTaskTree` |

## Boundary Notes

- VS5 owns workspace lifecycle and parser/task/workflow issue orchestration.
- Finance aggregate lifecycle is owned by VS9 (`finance.slice`); VS5 keeps compatibility re-exports only.
- Cross-slice collaboration must stay event/projection based; no direct aggregate mutation across slices.

## SSOT Phase 對齊（Phase Alignment）

| Container | Phase | 說明 |
|-----------|-------|------|
| WorkspaceItem | Phase 0.4 | WorkspaceItem 初始化時建立任務向量基礎（`requirementsEmbedding` placeholder，由 Phase 1 Step 1.5-1.6 填入） |
| TaskRequirement | Phase 1 (1.3-1.6) | Task 需求命令走 D29 TransactionalCommand + FI-002；語義提取由 L10 Genkit 異步完成 |
| MatchingSession | Phase 2 (2.3-2.14) | 匹配 Session 觸發 L10 Genkit Flow，消費 Tool-S/M/V 結果，寫入 L4A 稽核記錄 |
| AcceptanceResult | Phase 2/3 | 驗收確認（AcceptanceConfirmed）是 Phase 2→3 轉換觸發點；同時觸發 BF-1 業務指紋回饋（Step 2.14） |
| FinanceLabel | Phase 3 (3.5-3.6) | Finance label 投影（#A22）透過 L5→L6 讀取；不可直接讀取 Finance Aggregate |

**E8**：Workspace 查詢必須帶 tenantId；跨租戶 workspace 讀寫一律 fail-closed。

**BF-1 觸發點**：`AcceptanceResult`（AcceptanceConfirmed 事件）是觸發 VS8 業務指紋更新的唯一入口（透過 L4 IER 路由，對齊 Step 2.14）。
