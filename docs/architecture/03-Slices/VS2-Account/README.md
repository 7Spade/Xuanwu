# VS2-Account

## 一眼摘要

- 用途：維護帳號聚合（Account Aggregate）與錢包一致性，承接個人層級治理策略。
- 核心功能：account aggregate、wallet consistency、org binding、governance policy event、outbox lane discipline（`S1`）。
- 解決痛點：
	1. 帳號主資料與錢包交易分離，容易出現餘額與事件紀錄不一致。
	2. 權限/政策異動缺少事件化，難以追溯誰在何時改動治理設定。
	3. 個人帳號與組織綁定規則不清，造成跨域行為審計困難。

- Account aggregates and wallet consistency
- Org binding and governance policy events
- Outbox lane discipline (`S1`)

## Implemented Capabilities (from code)

- Profile domain: user profile create/update/query + settings/security/preferences UI.
- Wallet domain: credit/debit、balance query、transactions subscription、wallet hook。
- Governance role: assign/revoke/query account role，並觸發 claims refresh（`S6`）。
- Governance policy: create/update/delete/query account policies。
- Account event bus: `publishAccountEvent` / `onAccountEvent`。

## Boundary Note

- Organization 子域能力（members/partners/policy/teams/core/event-bus）已遷移至 VS4 `organization.slice`。
