# [索引 ID: @VS6-Timeline] VS6 Scheduling - Timeline Rules

## Order Invariant

- MUST: `WorkspaceItem -> WorkspaceTask -> WorkspaceSchedule` (`D27-Order`)。
- FORBIDDEN: 未有 task 直接建 schedule。

## Projection Boundary

- MUST: overlap/grouping 計算在 L5 完成。
- MUST: UI 只經 L6 Query Gateway 讀取 calendar/timeline views。
- FORBIDDEN: UI 直讀 VS6 aggregate 或 Firebase。

## Consistency

- Projection 更新需 `applyVersionGuard()` (`S2`)。
- 日期與資源視圖屬 read-side materialization，不承載寫側決策。

## SSOT Phase 對齊規則（Phase Alignment）

| 規則 | 類型 | 說明 |
|------|------|------|
| `D29` | MUST | 排班時間線命令（CreateSchedule/UpdateSchedule）必須攜帶 TransactionalCommand 標記 |
| `FI-002` | MUST | 排班時間線寫入必須使用 Firestore 單一事務 |
| `LANE-S` | MUST | ScheduleProposed 事件走 STANDARD_LANE |
| `LANE-C` | MUST | ScheduleConfirmed / ConflictDetected 事件走 CRITICAL_LANE（#A5 Saga 補償觸發） |
| `E8-VS6` | MUST | 排班查詢必須帶 tenantId；跨組織排班查詢一律 fail-closed |
