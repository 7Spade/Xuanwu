# shared-kernel / events

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用事件契約（Domain Event Contracts）

---

## 職責

放置可被 **兩個以上功能切片共用** 的事件模型與事件語意契約，包含：

- 事件名稱與事件鍵（Event Key / Event Name）。
- 事件 payload 形狀（Payload Contract）。
- 事件版本欄位規格（Versioning Strategy）。
- envelope 對接規則（traceId / causationId / correlationId）。

> **注意**：此目錄只放「事件契約與型別」，不放實際 publish/subscribe 邏輯。  
> 事件路由、重試、DLQ、投遞順序屬於 L4 `event-router` / `outbox-relay`。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 事件鍵聯合型別 | `type WorkspaceEventKey = 'workspace:created' | 'workspace:archived'` |
| Payload Map | `interface WorkspaceEventPayloadMap { ... }` |
| Envelope 擴充型別 | `interface WorkspaceEventEnvelope extends EventEnvelope { ... }` |
| 事件版本欄位 | `eventVersion: 1` |
| 事件相容映射 | `upcastV1ToV2(payload)`（純函式） |

---

## 禁止放入什麼

- ❌ 實際事件發佈器/訂閱器（publish / onSnapshot / queue consumer）
- ❌ I/O 或 async（讀寫 Firestore、呼叫外部服務）
- ❌ 切片內私有事件（只在單一切片使用）
- ❌ 事件處理副作用（寫投影、寫 outbox）

---

## 與 `data-contracts/`、`types/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `events/` | **事件語意與 payload 契約**（發生了什麼） |
| `data-contracts/` | **跨層基礎契約**（envelope、command-result、read-consistency） |
| `types/` | **實體與值型別**（資料本體長相） |

> 判斷準則：若型別表示「事件訊號」→ `events/`；若表示「資料本體」→ `types/`。

---

## 檔案命名規則

```text
src/shared-kernel/events/
├── <domain>.events.ts            # 事件鍵與 payload map
├── <domain>.event-envelope.ts    # 專屬 envelope（可選）
├── <domain>.upcasters.ts         # 向後相容轉換（可選）
└── index.ts                      # 統一 barrel 出口
```

- 檔名使用 `kebab-case`。
- 事件鍵常數使用 `SCREAMING_SNAKE_CASE` 或字串聯合型別。
- payload 介面命名建議 `XxxEventPayload`。

---

## 範例

```ts
// src/shared-kernel/events/workspace.events.ts

export type WorkspaceEventKey =
  | 'workspace:created'
  | 'workspace:archived';

export interface WorkspaceCreatedPayload {
  workspaceId: string;
  orgId: string;
}

export interface WorkspaceArchivedPayload {
  workspaceId: string;
  archivedBy: string;
}
```

---

> **架構對齊**：`src/shared-kernel/events/` = VS0-Kernel 事件契約層（L1）。  
> 規則依據：`docs/architecture/00-logic-overview.md`（R8 traceId、L4 IER 路由分離）。
