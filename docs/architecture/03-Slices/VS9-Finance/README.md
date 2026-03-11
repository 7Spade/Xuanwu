# VS9-Finance

## 一眼摘要

- 用途：管理財務請求與階段化聚合狀態，提供任務財務標籤的讀側權威輸出。
- 核心功能：finance staging canonical intake（`A20`）、Finance_Request independent lifecycle（`A21`）、task finance label projection contract（`A22`）、僅經事件/投影與 VS5 協作。
- 解決痛點：
	1. 財務資料若直接回寫任務聚合，會破壞任務域與財務域的責任分離。
	2. 請款流程與任務流程混用時，難以保證審批狀態可追溯。
	3. 前端顯示財務標籤缺乏單一讀側契約，容易出現不同頁面狀態不一致。

- Finance staging pool as canonical intake (`A20`)
- Finance_Request independent lifecycle (`A21`)
- Task finance label projection as read-side contract (`A22`)
- Collaboration with VS5 only via events/projections, never direct aggregate mutation

## Implemented Capabilities (from code)

- UI: `WorkspaceFinance` finance view。
- Action: `saveFinanceAggregateState`。
- Query: `getFinanceAggregateState`。
- Types: `FinanceAggregateState`、`FinanceLifecycleStage`、claim line item 與 strong-read snapshot contract。

## SSOT Phase 對齊（Phase Alignment）

| Phase | 步驟 | VS9 Finance 角色 |
|-------|------|----------------|
| Phase 0 (0.4 Note) | 任務需求建立 | VS9 Finance Staging Pool 的觸發前置條件：必須有 VS5 Task 通過驗收（#A15 Entry Gate） |
| Phase 1 (1.3 Note) | D29 + Staging Pool | VS9 Staging Pool 寫入必須攜帶 TransactionalCommand 標記（D29）+ FI-002 單交易 |
| Phase 1 (1.7-1.8) | LANE 分流 | InvoiceRequested / PaymentReceived → CRITICAL_LANE；FinanceDraftCreated → STANDARD_LANE |
| Phase 3 (3.5-3.6) | 讀取鏈 | 金融視圖（task-finance-label-view [#A22]）透過 L6 Query Gateway 讀取；禁止直接讀取 Finance Aggregate |

**E8 邊界**：Finance 查詢必須帶 tenantId；跨租戶金融資料讀寫一律 fail-closed。

**D29 + FI-002 說明**：Finance 狀態轉換（Draft → Submitted → Approved → Invoice Requested → Payment Term → Payment Received）每個轉換都是獨立的 TransactionalCommand + Firestore 單一事務，不可批次合併。
