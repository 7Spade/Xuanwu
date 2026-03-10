# VS9-Finance

- Finance staging pool as canonical intake (`A20`)
- Finance_Request independent lifecycle (`A21`)
- Task finance label projection as read-side contract (`A22`)
- Collaboration with VS5 only via events/projections, never direct aggregate mutation

## Implemented Capabilities (from code)

- UI: `WorkspaceFinance` finance view。
- Action: `saveFinanceAggregateState`。
- Query: `getFinanceAggregateState`。
- Types: `FinanceAggregateState`、`FinanceLifecycleStage`、claim line item 與 strong-read snapshot contract。
