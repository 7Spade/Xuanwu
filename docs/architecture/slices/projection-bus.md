# L5 · Projection Bus（SSOT Aligned）

## 責任

唯一投影寫入路徑（event funnel），維護所有 read models。

## 主要投影

- `workspace-view`
- `account-view`
- `organization-view`
- `org-eligible-member-view`
- `wallet-balance`
- `global-audit-view`
- `tag-snapshot`

## Mandatory Rules

- `S2`：所有投影寫入前必須 Version Guard
- `S4`：critical / standard staleness SLA 必須引用契約常數
- `#9`：投影需可事件重建
- `D24`：透過 `IFirestoreRepo`，不可直連 Firebase SDK

## Parsing Projection Contract

解析事件投影必須保留：
- `costItemType`
- `semanticTagSlug`
- `sourceIntentIndex`
