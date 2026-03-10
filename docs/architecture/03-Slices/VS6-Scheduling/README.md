# VS6-Scheduling

## 一眼摘要

- 用途：負責提案排程、資源匹配與時程物化，確保排班決策可被追蹤、回滾與查詢。
- 核心功能：schedule materialization gate（`D27-Gate`）、resource eligibility + saga compensation（`#A5`）、timeline read model boundaries（L5/L6）。
- 解決痛點：
	1. 排班決策與最終日曆狀態脫節，造成提案與實際執行不一致。
	2. 資源匹配失敗時缺乏補償機制，容易留下半完成狀態。
	3. 讀模型邊界不清，前端查詢容易穿透寫模型造成資料污染。

- Schedule materialization gate (`D27-Gate`)
- Resource eligibility and saga compensation (`#A5`)
- Timeline read model boundaries (L5/L6)

## Implemented Capabilities (from code)

- Domain core: schedule proposal lifecycle（propose/approve/cancel/complete）與狀態轉移規則。
- Eligibility engine: candidate matching 與 requirements-driven candidate selection。
- Application commands: create/assign/unassign/approve、日期區間更新、manual assign、proposal cancel、complete action。
- Application queries: org/workspace/account schedule projections、pending/confirmed proposals、eligible members。
- Selectors: pending proposals、decision history、upcoming/present events。
- Saga: `startSchedulingSaga` 與 saga state 查詢。
- UI surfaces: governance、calendar、timeline、workspace/account 視圖與相關 hooks。
- Ports: command/query/event port contracts（邊界遷移用）。
