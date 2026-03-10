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
