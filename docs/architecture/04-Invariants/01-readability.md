# [索引 ID: @INV-R] Readability & Traceability Invariants (R)

本檔聚焦「可讀、可追、可審」不變量。

## 1. R1 relay-lag-metrics

- MUST: IF outbox-relay 掃描延遲上升 THEN 必須上報 `DOMAIN_METRICS`。
- MUST: relay lag 指標可追到 lane 與 slice 來源。

## 2. R5 DLQ-failure-rule

- MUST: IF IER 轉拋失敗達 3 次 THEN 事件必須進 DLQ。
- FORBIDDEN: 失敗達閾值後仍在主線靜默重試。

## 3. R6 workflow-state-rule

- MUST: workflow 狀態遷移只能沿既定狀態機前進。
- FORBIDDEN: 任意跨越未定義節點或逆向跳轉。

## 4. R7 aggVersion-relay

- MUST: Domain Event 必帶 `aggregateVersion`。
- MUST: 投影端依 `aggregateVersion` 檢查單調遞增。

## 5. R8 traceId-readonly

- MUST: `traceId` 僅能由 `L2 CBG_ENTRY` 注入。
- MUST: L3~L9 只能傳遞，不得重寫。
- FORBIDDEN: adapter / worker / notifier 生成新的 traceId 取代上游值。

## 6. 審查信號

- 事件 envelope 缺少 `traceId` 或 `aggregateVersion` 應視為違規。
- 監控缺少 relay lag / lane latency / DLQ 分級統計應視為觀測缺口。
- AI 推理路徑中任意節點靜默丟失 traceId（違反不變量 7）應視為嚴重違規。

## 7. Phase 2 推理軌跡傳播不變量（Trace Propagation Invariant）

- MUST: traceId 由 L2 (CBG_ENTRY) 注入後，必須在 Phase 2 完整鏈路中保持（L3 → L10 → L0B → L4 → L4A）
- MUST: L0B Server Action 串流橋接（Step 2.8-2.9）必須攜帶 traceId 回傳 UI
- MUST: L4 IER 路由決策事件時（Step 2.11）必須保留 traceId
- MUST: L4A 稽核切片（Step 2.12）的 Evidence 欄位必須包含 inferenceTrace（含 traceId）
- FORBIDDEN: AI 推理路徑（L10 → Tool-S → Tool-M → Tool-V）不得靜默丟失 traceId
