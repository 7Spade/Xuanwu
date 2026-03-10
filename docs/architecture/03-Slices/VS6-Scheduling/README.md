# VS6-Scheduling

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
