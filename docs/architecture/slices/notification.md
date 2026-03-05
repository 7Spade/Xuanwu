# VS7 · Notification（SSOT Aligned）

## 責任

管理通知讀模型與用戶查詢；不承擔副作用分發決策。

## 核心模型

- `account-user.notification`
- `notification preferences`
- `notification query views`

## 資料流

- 入：notification-hub 交付結果
- 出：Query Gateway 讀取、前端通知列表

## Mandatory Rules

- `#6`：Notification 只讀 projection
- `#A13`：不做策略分發，策略在 notification-hub
- `D24`：不直連 Firebase SDK
