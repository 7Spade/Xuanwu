# [索引 ID: @VS6-Mat] VS6 Scheduling - Materialization Gate

## Rule

- MUST: 任務物化一律經 `shouldMaterializeAsTask(costItemType)`。
- MUST: 只有 `EXECUTABLE` 可物化成 task (`D27-Gate`)。
- FORBIDDEN: 非 EXECUTABLE 項目直接進排程主鏈。

## Inputs

- `costItemType`
- `semanticTagSlug`
- `sourceIntentIndex`

## Outputs

- 可物化: 進 A-track task pipeline
- 不可物化: 保留為非任務資料並提示使用者

## SSOT Phase 對齊（Phase Alignment）

排班物化（Schedule Materialization）對應 SSOT Phase 3（讀取鏈）：

| Phase | 步驟 | 說明 |
|-------|------|------|
| Phase 1 (1.8) | LANE 分流 → L5 Projection | 排班事件按 LANE（CRITICAL/STANDARD）分流後，由 L5 Projection Bus 物化排班視圖 |
| Phase 3 (3.3-3.6) | L6 Query Gateway 讀取 | `ScheduleView [D27]` 透過 L0A → L6 Query Gateway → L5 Projection 讀取；禁止直接讀 L3 Aggregate |

**D27 Gate**：只有通過 `D27-Gate`（`shouldMaterializeAsTask()` 返回 EXECUTABLE）的 WorkspaceItem 才會觸發排班物化。

**S2 版本守衛**：排班視圖讀取必須執行版本守衛（S2：projection version guard），確保讀取到最新物化結果。
