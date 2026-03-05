# VS6 · Scheduling（SSOT Aligned）

## 責任

負責排班聚合、指派協作、補償式 saga。

## 核心模型

- `org.schedule`
- `scheduling-saga`
- `sched-outbox`

## 語義路由

- 排班需求使用 `skill-requirement(tagSlug × minXp)`
- 指派前需檢查 `TAG_STALE_GUARD`（`S4`）
- 路由策略必須經 VS8 `policy-mapper`（`D27-A`）

## 事件

- `ScheduleAssigned`（帶 `aggregateVersion`）
- `ScheduleAssignRejected`
- `ScheduleProposalCancelled`

## Mandatory Rules

- `#14`：只讀 `ORG_ELIGIBLE_MEMBER_VIEW`
- `A5`：跨 BC 以 saga + compensating event
- `R7`：relay 需保留 aggregateVersion
- `D24`：不直連 Firebase
