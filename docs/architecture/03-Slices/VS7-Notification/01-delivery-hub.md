# [索引 ID: @VS7-NOTIF] VS7 Notification - Delivery Hub

## Scope

VS7 是唯一副作用出口，負責通知路由與交付。

## Authority

- `#A13`, `D26`: 所有通知副作用必須經 `notification-hub.slice`。
- `#A10`: notification router 無狀態，只做路由決策。

## Routing

- 消費 IER STANDARD_LANE 事件（如 ScheduleAssigned）。
- 可結合 VS8 語義標籤做 channel policy 決策。

## Forbidden

- 其他 slice 直接呼叫 email/push/sms provider。
- 在 VS7 生成新 traceId（只能沿用 envelope.traceId，`R8`）。

## SSOT Phase 對齊規則（Phase Alignment）

| 規則 | 類型 | 說明 |
|------|------|------|
| `LANE-S` | MUST | VS7 消費 STANDARD_LANE 的整合事件進行通知路由（#A13 唯一副作用出口） |
| `E8-VS7` | MUST | 通知發送必須帶 tenantId；跨租戶通知路由一律 fail-closed |
| `FI-002` | SHOULD | 通知記錄（DeliveryLog）寫入建議使用 Firestore 單一事務以保障 at-least-once 語義 |
| `R8` | MUST | 通知訊息必須攜帶 traceId（繼承自 IER 事件 payload），確保通知可回溯至原始業務事件 |
| `L4A-VS7` | SHOULD | 重要通知決策（如緊急排班通知、任務驗收通知）應觸發 L4A 稽核記錄（Who/Why/Evidence/Version/Tenant） |

**L0B vs VS7 區分**（常見混淆）：
- L0B = AI 推理軌跡即時串流（Phase 2, Step 2.8-2.9）→ 不是通知
- VS7 = 業務事件異步通知（Phase 1/2/3）→ 透過 IER STANDARD_LANE 消費
