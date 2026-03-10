# VS2-Account

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
