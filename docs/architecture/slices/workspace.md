# VS5 · Workspace（SSOT Aligned）

## 責任

管理工作區核心業務：文件解析、任務、流程狀態機、財務請款循環。

## 三層文件語義閉環（D27 / A14）

1. Layer-1：`document-parser` 產生 raw line items
2. Layer-2：呼叫 VS8 `classifyCostItem(name)` → `(costItemType, semanticTagSlug)`
3. Layer-3：僅 `shouldMaterializeAsTask(type)=true`（EXECUTABLE）可物化為 task

## ParsingIntent 必備欄位

- `costItemType`
- `semanticTagSlug`
- `sourceIntentIndex`（維持排序不變量）

## Workflow / Finance（A15/A16）

- 主流程：Draft → InProgress → QA → Acceptance(OK) → Finance → Completed
- Finance 每輪固定：Claim Preparation → Claim Submitted → Claim Approved → Invoice Requested → Payment Term → Payment Received
- `outstandingClaimableAmount > 0` 不可 Completed

## Mandatory Rules

- `A8`：TX Runner = 1cmd/1agg
- `A15`：Acceptance=OK 才能進 Finance
- `A16`：不得跳過 Claim/Invoice/PaymentTerm
- `D26`：搜尋必走 Global Search；通知必走 Notification Hub
- `T5`：UI 視覺屬性必須讀 `tag-snapshot`，不可讀 adjacency internals
