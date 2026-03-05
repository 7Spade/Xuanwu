# VS2 · Account（SSOT Aligned）

## 責任

管理帳號主體、錢包強一致、帳號治理（role/policy）。

## 聚合與子域

- `user-account.aggregate`
- `wallet.aggregate`（金融強一致，`S3 STRONG_READ`）
- `organization-account.aggregate`
- `account-governance.role`（對齊 `TE5 tag::role`）
- `account-governance.policy`

## 事件

- `AccountCreated`
- `WalletDeducted | WalletCredited`
- `RoleChanged | PolicyChanged`

## Outbox / DLQ（S1）

- Wallet / Role / Policy：`CRITICAL_LANE`
- `RoleChanged | PolicyChanged` 失敗：`SECURITY_BLOCK`
- Wallet 失敗：`REVIEW_REQUIRED`

## Mandatory Rules

- `A8`：1 command 只改 1 aggregate
- `S3`：金融查詢必須 `STRONG_READ`
- `D24`：不直連 Firebase
- `D21-G`：只能用 VS2/VS3 事實事件驅動 VS8 學習

## 依賴

- 入：VS1 identity link
- 出：L4 IER、L5 account projection、VS8 learning facts
