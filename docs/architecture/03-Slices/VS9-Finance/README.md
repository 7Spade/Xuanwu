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
