# [索引 ID: @VS2-ACC] VS2 Account - Core Rules

## Scope

VS2 管理帳號主體、組織綁定、角色與政策快照。

## Core Aggregates

- `user-account.aggregate`
- `organization-account.aggregate`
- `wallet.aggregate` (強一致帳務)
- `account.profile` (弱一致展示與通知用途)

## Invariants

- `#A1`: wallet 強一致，profile 弱一致。
- `#A2`: org-account.binding 只做 ACL/projection 防腐對接。
- `#1/#2`: 不跨 slice 直接 mutate。

## Event & Outbox

- MUST: 帳號異動事件進 outbox (`S1`)。
- 建議 lane:
	- CRITICAL: RoleChanged / PolicyChanged / Wallet*
	- STANDARD: AccountCreated

## Forbidden

- 直接操作 notification side effects（應交 VS7）。
- 直接調用 Firebase SDK（應經 D24 ACL 路徑）。

## Phase 0.3 對齊規則（Alignment with SSOT Step 0.3）

| 規則 | 類型 | 說明 |
|------|------|------|
| `FI-002` | MUST | 帳戶聚合（UserAccount/OrgAccount）寫入必須使用 Firestore 單一事務（atomic write） |
| `D29` | MUST | 所有寫入帳戶狀態的命令必須攜帶 TransactionalCommand 標記；禁止 ad-hoc 直接寫入 |
| `LANE-R` | MUST | RoleChanged / PolicyChanged 事件 → CRITICAL_LANE（SLA ≤ 500ms） |
| `LANE-S` | MUST | AccountCreated / ProfileUpdated 事件 → STANDARD_LANE（SLA ≤ 10s） |
| `Phase 0.3` | MUST | 員工畫像（Profile）與證照（Certifications）初始化必須在 Phase 0 完成；作為 Phase 2 Tool-M 向量匹配的候選人資料 |
| `E8-VS2` | MUST | 帳戶查詢必須帶 tenantId；禁止跨租戶讀取帳戶或錢包資料 |
