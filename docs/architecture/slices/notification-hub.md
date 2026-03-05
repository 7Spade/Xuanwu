# notification-hub（SSOT Aligned）

## 責任

唯一副作用出口（`D26` / `#A13`）：通知策略決策與外部通道發送（push/email/SMS）。

## 輸入

- IER `STANDARD_LANE` / `CRITICAL_LANE` 事件
- 排班、流程、安全相關通知需求

## 輸出

- 通道分發（透過 ports）
- 交付結果投影到 VS7 notification records

## Mandatory Rules

- `#A13`：業務切片只產生事件，不決定通知策略
- `D26`：禁止業務切片直接呼叫 sendEmail/push/SMS
- `D24`：不直連 Firebase，必須走 `IMessaging` 等 ports
- `R8`：沿用 envelope.traceId，不可重建
