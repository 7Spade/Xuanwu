# L4 · IER（SSOT Aligned）

## 責任

IER 是唯一跨切片事件路由出口；所有跨切片溝通只可透過 outbox → relay → IER。

## Lanes（P1）

- `CRITICAL_LANE`：Role/Policy/Wallet/OrgContext 等高優先
- `STANDARD_LANE`：一般領域事件
- `BACKGROUND_LANE`：TagLifecycle/Audit 等背景任務

## DLQ（R5/S1）

- `SAFE_AUTO`：可自動 replay
- `REVIEW_REQUIRED`：人工審核後 replay
- `SECURITY_BLOCK`：禁止自動 replay

## Mandatory Rules

- `S1`：每筆事件必帶 idempotency-key（`eventId+aggId+version`）
- `R8`：traceId 只讀傳遞
- `D1`：Domain slice 不可直接 import event-router
- `E6`：claims refresh 事件必走 `CRITICAL_LANE`
