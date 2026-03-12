# shared-kernel / directives

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用行為指令（Cross-BC Behavioral Directives）

---

## 職責

放置系統層面的 **行為指令（Directives）**——在邊界點（Gateway、Event Handler、Server Action）執行的橫切面規則（Cross-cutting Rules），包括：

- **守衛指令（Guard Directives）**：在執行之前驗證前置條件（Pre-condition Checks）。
- **限流指令（Rate-limit Directives）**：跨切片一致的請求速率控制規格。
- **冪等指令（Idempotency Directives）**：冪等鍵格式生成與驗證。
- **可觀測指令（Observability Directives）**：注入 TraceID、設定 hopCount 邊界。
- **安全指令（Security Directives）**：輸入清洗、CSRF Token 格式驗證、資料遮罩規格。

> **注意**：Directive 是「行為規格的純定義」，不是具體的 middleware 實作。  
> 具體的 Next.js `middleware.ts`、Firebase Function 攔截器屬於 L0/L2/L7；此層只放「規格常數與純評估函式」。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 冪等鍵格式規格 | `buildIdempotencyKey(aggId, version): string`（純函式） |
| hopCount 邊界常數 | `MAX_HOP_COUNT = 4`（[D30] 轉發 ≥ 4 觸發 CircularDependencyDetected）|
| TraceID 格式守衛 | `isValidTraceId(id: string): boolean` |
| 輸入遮罩規格（純） | `maskSensitiveField(value: string, type: 'phone' \| 'email'): string` |
| 安全邊界常數 | `MAX_BATCH_SIZE`、`MAX_INTENT_LINE_ITEMS` |
| Rate-limit 規格常數 | `RATE_LIMIT_DEFAULTS`（供 L0/L2 Adapter 讀取） |
| 命令結果斷言規格 | `assertCommandResult(result: CommandResult): void`（非 async）|

---

## 禁止放入什麼

- ❌ 具體 Middleware 實作（`next/server`、`express` 型 middleware function）→ 留在 L0/L2
- ❌ Firebase Rules / Cloud Function 攔截器 → 留在 L7/L8
- ❌ 含 I/O 或 async（如查 DB 驗證黑名單）
- ❌ 只有單一切片使用的守衛規則

---

## 與 `infra-contracts/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `infra-contracts/` | **基礎設施行為不變量**（S1~S6 Outbox/VersionGuard/Consistency SLA 常數）|
| `directives/` | **橫切行為指令**（守衛評估、冪等鍵、TraceID 格式、安全遮罩規格）|

> 判斷準則：若關注「基礎設施的 SLA 邊界」→ `infra-contracts/`；若關注「進入/執行時的行為規格」→ `directives/`。

---

## 檔案命名規則

```
src/shared-kernel/directives/
├── idempotency.directive.ts      # 冪等鍵生成與驗證
├── trace.directive.ts            # TraceID 格式守衛與 hopCount 常數
├── security.directive.ts         # 輸入遮罩、安全邊界常數
├── rate-limit.directive.ts       # 速率限制規格常數
└── index.ts                      # 統一 barrel 出口
```

- 檔名後綴使用 `.directive.ts` 明確語意。
- 純函式以 `camelCase` 動詞命名；常數以 `SCREAMING_SNAKE_CASE` 命名。

---

## 範例

```ts
// src/shared-kernel/directives/trace.directive.ts

/**
 * Maximum hop count before a circular dependency is detected.
 * [D30] hopCount ≥ MAX_HOP_COUNT → throw CircularDependencyDetected + SECURITY_BLOCK alert.
 */
export const MAX_HOP_COUNT = 4;

/**
 * Validates that a traceId is a non-empty string (UUID v4 format).
 * Pure — no I/O, deterministic.
 */
export function isValidTraceId(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id);
}
```

```ts
// src/shared-kernel/directives/idempotency.directive.ts

/**
 * Builds a deterministic idempotency key for a command or event.
 * Format: <aggId>::<eventId>::<version>
 * Pure — no I/O, deterministic.
 */
export function buildIdempotencyKey(aggId: string, eventId: string, version: number): string {
  return `${aggId}::${eventId}::${version}`;
}
```

---

> **架構對齊**：`src/shared-kernel/directives/` = VS0-Kernel 橫切行為指令層（L1）。  
> 規則依據：`docs/architecture/README.md`（D30 hopCount 守衛、R8 traceId 整鏈共享、S1 Idempotency）。
