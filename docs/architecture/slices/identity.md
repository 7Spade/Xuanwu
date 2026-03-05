# VS1 · Identity（SSOT Aligned）

## 責任

管理身份、`account-identity-link`、`active-account-context`、claims refresh 生命週期。

## 主要元件

- `authenticated-identity`
- `account-identity-link`（`firebaseUserId ↔ accountId`）
- `context-lifecycle-manager`
- `claims-refresh-handler`（唯一刷新入口）
- `token-refresh-signal`

## 事件與流向

- Login → 建立 context
- `RoleChanged | PolicyChanged`（IER `CRITICAL_LANE`）→ claims refresh（`S6`）
- 成功後發 `TOKEN_REFRESH_SIGNAL`

## Mandatory Rules

- `R8`：traceId 只讀
- `S6`：只可透過 contract 流程刷新 claims
- `D24`：不直連 Firebase SDK
- `D7`：對外僅公開 `index.ts`

## 依賴

- 入：L0 Auth、L4 IER、VS0 contracts
- 出：L2 authority-interceptor、VS2 account mapping
