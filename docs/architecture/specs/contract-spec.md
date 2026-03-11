# L7 合約規格 — Command / Event Type Registry

> **層級定位**：本文件為 L7 合約層，定義系統所有 Command、Event 的型別名稱、Payload、不變式，以及 Command → Event 的輸出映射。
> 來源：[L5 Sub-Behavior](../use-cases/use-case-diagram-sub-behavior.md)、[L6 Domain Model](../models/domain-model.md)

---

## Command / Event ID 命名規約（跨圖追溯）

為避免多張 Mermaid 圖間命名漂移，Command 與 Event 採雙層識別：

1. **語義名稱**：`PublishPostCommand`、`PostPublished`
2. **圖面識別 ID**：`CMD.PublishPost`、`EVT.PostPublished`

### 命名規則

- Command ID：`CMD.{Verb}{Noun}`
- Event ID：`EVT.{Noun}{PastParticiple}`
- Guard ID：`GRD.{GuardName}`（例如 `GRD.Scope`、`GRD.Threshold`）

### 使用規則

- 所有 sequence/state/flow Mermaid 圖，至少標示一個 `CMD.*` 與其對應 `EVT.*`。
- L8 Saga 圖中，事件傳遞箭頭旁優先使用 `EVT.*`。
- 文件內表格仍保留完整型別名稱（`PublishPostCommand`），圖中可用短 ID，但需能一對一映射。

### 映射範例

| Type | Full Name | Diagram ID |
|------|-----------|------------|
| Command | `PublishPostCommand` | `CMD.PublishPost` |
| Event | `PostPublished` | `EVT.PostPublished` |
| Guard | `ScopeGuard` | `GRD.Scope` |

---

## Command Registry（指令清單）

### TC — TaskItem Commands

| Command 名稱 | 觸發 UC | Payload 必填欄位 | 前置守衛 | 成功輸出 Event |
|-------------|---------|----------------|---------|--------------|
| `CreateTaskItemCommand` | SB01 | `workspaceId`, `sub_type`, `title`, `parent_id?` | ScopeGuard | `TaskItemCreated` |
| `StartTaskCommand` | SB04 | `taskId`, `actorId` | ScopeGuard, IdempotencyGuard | `TaskStarted` |
| `BlockTaskCommand` | SB08 | `taskId`, `actorId`, `reason` | ScopeGuard | `TaskBlocked` |
| `CompleteTaskCommand` | SB09 | `taskId`, `actorId` | ScopeGuard, OptimisticLockGuard | `TaskCompleted` |
| `ArchiveTaskCommand` | SB10 | `taskId`, `actorId` | ScopeGuard | `TaskArchived` |
| `CancelTaskCommand` | SB11 | `taskId`, `actorId`, `reason` | ScopeGuard | `TaskCancelled` |
| `CopyTaskTreeCommand` | SB12 | `sourceTaskId`, `targetParentId`, `actorId` | ScopeGuard, IdempotencyGuard | `TaskTreeCopied` |
| `AddDependencyCommand` | SB14 | `fromTaskId`, `toTaskId`, `actorId` | ScopeGuard, **DFSCycleGuard** | `DependencyAdded` \| `CyclicDependencyDetected` |
| `RemoveDependencyCommand` | SB15 | `fromTaskId`, `toTaskId`, `actorId` | ScopeGuard | `DependencyRemoved` |
| `UpdateTaskStatusCommand` | SB01-SB11 | `taskId`, `newStatus`, `actorId`, `version` | ScopeGuard, OptimisticLockGuard | `TaskStatusUpdated` |

---

### PC — Post Commands

| Command 名稱 | 觸發 UC | Payload 必填欄位 | 前置守衛 | 成功輸出 Event |
|-------------|---------|----------------|---------|--------------|
| `CreatePostCommand` | SB20 | `workspaceId`, `content`, `actorId` | ScopeGuard | `PostCreated` |
| `AttachMediaCommand` | SB21 | `postId`, `mediaType`, `url`, `sortOrder`, `actorId` | ScopeGuard, OptimisticLockGuard | `MediaAttached` |
| `PublishPostCommand` | SB22 | `postId`, `actorId` | ScopeGuard, IdempotencyGuard | `PostPublished` |
| `ArchivePostCommand` | SB23 | `postId`, `actorId` | ScopeGuard | `PostArchived` |

> **注意**：`FeedProjection` 不可由 Command 直接寫入，只能由 `PostPublished` 事件管線觸發（ADR-0003）。

---

### AC — Assignment Commands

| Command 名稱 | 觸發 UC | Payload 必填欄位 | 前置守衛 | 成功輸出 Event |
|-------------|---------|----------------|---------|--------------|
| `CreateAssignmentCommand` | SB30 | `scheduleItemId`, `assigneeId`, `startTime`, `endTime`, `actorId` | ScopeGuard, **AvailabilityConflictGuard**, **ThresholdGuard** | `AssignmentCreated` \| `AvailabilityConflictDetected` \| `ThresholdNotMet` |
| `ConfirmAssignmentCommand` | SB32 | `assignmentId`, `actorId` | ScopeGuard, IdempotencyGuard | `AssignmentConfirmed` |
| `CompleteAssignmentCommand` | SB33 | `assignmentId`, `actorId` | ScopeGuard, OptimisticLockGuard | `AssignmentCompleted` |
| `CancelAssignmentCommand` | SB34 (rejection path) | `assignmentId`, `actorId`, `reason` | ScopeGuard | `AssignmentCancelled` |

---

### SC — SkillAsset Commands

| Command 名稱 | 觸發 UC | Payload 必填欄位 | 前置守衛 | 成功輸出 Event |
|-------------|---------|----------------|---------|--------------|
| `DeclareSkillMintCommand` | SB40 | `taskId`, `skillId`, `actorId` | ScopeGuard, IdempotencyGuard | `SkillMintDeclared` |
| `SubmitPracticingEvidenceCommand` | SB41 | `skillMintLogId`, `evidence`, `actorId` | ScopeGuard | `PracticingEvidenceSubmitted` |
| `SubmitForValidationCommand` | SB42 | `skillMintLogId`, `actorId` | ScopeGuard | `UnderValidationSubmitted` |
| `ApproveValidationCommand` | SB43 | `skillMintLogId`, `validatorId`, `xpProposal` | ScopeGuard | `ValidationApproved` |
| `RejectValidationCommand` | SB44 | `skillMintLogId`, `validatorId`, `reason` | ScopeGuard | `ValidationRejected` |
| `RecalculateXpCommand` | SB46 | `userId`, `skillId`, `actorId` | ScopeGuard | `XpRecalculated` |

> `SettleSkillMintCommand` 由 L8 Settlement Saga 在 `ValidationApproved` 後自動發出，非外部呼叫。

---

## Event Registry（事件清單）

### TaskItem Events

| Event 名稱 | 來源 Command | Key Payload | 消費方 |
|-----------|-------------|------------|-------|
| `TaskItemCreated` | CreateTaskItemCommand | `taskId`, `sub_type`, `workspaceId` | Notification Pipeline |
| `TaskStarted` | StartTaskCommand | `taskId`, `actorId`, `timestamp` | — |
| `TaskBlocked` | BlockTaskCommand | `taskId`, `reason` | Notification Pipeline |
| `TaskCompleted` | CompleteTaskCommand | `taskId`, `actorId`, `timestamp` | **XP Settlement Saga** |
| `TaskArchived` | ArchiveTaskCommand | `taskId` | — |
| `TaskCancelled` | CancelTaskCommand | `taskId`, `reason` | — |
| `TaskTreeCopied` | CopyTaskTreeCommand | `newRootTaskId`, `sourceTaskId` | — |
| `DependencyAdded` | AddDependencyCommand | `fromTaskId`, `toTaskId` | — |
| `DependencyRemoved` | RemoveDependencyCommand | `fromTaskId`, `toTaskId` | — |
| `CyclicDependencyDetected` | AddDependencyCommand (DFS fail) | `fromTaskId`, `toTaskId`, `cycle_path[]` | AI Alert Pipeline |

### Post Events

| Event 名稱 | 來源 Command | Key Payload | 消費方 |
|-----------|-------------|------------|-------|
| `PostCreated` | CreatePostCommand | `postId`, `workspaceId` | — |
| `MediaAttached` | AttachMediaCommand | `postId`, `mediaId`, `mediaType` | — |
| `PostPublished` | PublishPostCommand | `postId`, `workspaceId`, `orgId` | **FeedProjection Pipeline** |
| `PostArchived` | ArchivePostCommand | `postId` | — |
| `FeedProjectionCreated` | (事件管線，非 Command) | `projectionId`, `sourcePostId`, `orgId` | Feed Read Model |

### Assignment Events

| Event 名稱 | 來源 Command | Key Payload | 消費方 |
|-----------|-------------|------------|-------|
| `AssignmentCreated` | CreateAssignmentCommand | `assignmentId`, `scheduleItemId`, `assigneeId` | Notification Pipeline |
| `AssignmentConfirmed` | ConfirmAssignmentCommand | `assignmentId` | — |
| `AssignmentCompleted` | CompleteAssignmentCommand | `assignmentId` | — |
| `AssignmentCancelled` | CancelAssignmentCommand | `assignmentId`, `reason` | — |
| `AvailabilityConflictDetected` | CreateAssignmentCommand (guard fail) | `assigneeId`, `conflictSlot` | 呼叫方拒絕回應 |
| `ThresholdNotMet` | CreateAssignmentCommand (guard fail) | `assigneeId`, `skillId`, `required_level` | 呼叫方拒絕回應 |

### SkillAsset Events

| Event 名稱 | 來源 Command | Key Payload | 消費方 |
|-----------|-------------|------------|-------|
| `SkillMintDeclared` | DeclareSkillMintCommand | `mintLogId`, `taskId`, `skillId` | — |
| `PracticingEvidenceSubmitted` | SubmitPracticingEvidenceCommand | `mintLogId` | — |
| `UnderValidationSubmitted` | SubmitForValidationCommand | `mintLogId` | Validation Pipeline |
| `ValidationApproved` | ApproveValidationCommand | `mintLogId`, `xpProposal` | **XP Settlement Saga** |
| `ValidationRejected` | RejectValidationCommand | `mintLogId`, `reason` | Notification Pipeline |
| `SkillMintSettled` | (Settlement Saga) | `mintLogId`, `xpGranted` | XP Update Saga |
| `XpGranted` | (XP Update Saga) | `userId`, `skillId`, `xpDelta`, `newLevel` | — |
| `XpRecalculated` | RecalculateXpCommand | `userId`, `skillId`, `newXpTotal` | — |
| `AuditLogCreated` | (任意 Command 觸發後) | `actorId`, `commandType`, `resourceId` | Audit Pipeline |

---

## 守衛（Guard）規格

| Guard 名稱 | 觸發時機 | 失敗行為 |
|-----------|---------|---------|
| `ScopeGuard` (SB51) | 每個 Command 入口 | 拋出 `ForbiddenScopeException`（HTTP 403） |
| `IdempotencyGuard` (SB52) | 帶有 `idempotencyKey` 的 Command | 回傳之前成功結果（不重複執行） |
| `OptimisticLockGuard` (SB53) | 帶有 `version` 的 Command | 拋出 `OptimisticLockException`（HTTP 409） |
| `DFSCycleGuard` (SB14) | AddDependencyCommand 專屬 | 發出 `CyclicDependencyDetected`；Command 失敗 |
| `AvailabilityConflictGuard` (SB34) | CreateAssignmentCommand | 發出 `AvailabilityConflictDetected`；Command 失敗 |
| `ThresholdGuard` (SB35) | CreateAssignmentCommand | 發出 `ThresholdNotMet`；Command 失敗 |
