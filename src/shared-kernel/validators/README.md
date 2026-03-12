# shared-kernel / validators

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用驗證器（Pure Validation Rules）

---

## 職責

放置可被 **兩個以上功能切片共用** 的純驗證規則與 guard 函式，包含：

- 輸入格式驗證（id、slug、traceId、email 等）。
- 值域驗證（數值上下限、集合包含）。
- 組合驗證（欄位間一致性）。
- 型別守衛（type guard）。

> **注意**：此目錄不取代 `schemas/`。  
> `schemas/` 側重 Zod 契約；`validators/` 側重可重用的純規則函式與 guard。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 格式驗證 | `isValidTraceId(value)` |
| ID 安全驗證 | `isSafeFirestoreDocId(id)` |
| 值域檢查 | `isPositiveAmount(amount)` |
| 轉移合法性 | `isAllowedTransition(from, to)` |
| 型別守衛 | `isNonEmptyString(value): value is string` |

---

## 禁止放入什麼

- ❌ async 驗證（查 DB、打 API）
- ❌ 與框架耦合的表單邏輯
- ❌ 切片私有驗證（不具共用價值）
- ❌ 錯誤訊息 i18n 渲染（留在應用層）

---

## 與 `schemas/`、`directives/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `validators/` | **純驗證函式與 guard** |
| `schemas/` | **結構化 Schema（Zod）** |
| `directives/` | **執行規範/策略指令**（例如 rate-limit、trace policy） |

> 判斷準則：若核心是「判定合法/不合法」→ `validators/`。

---

## 檔案命名規則

```text
src/shared-kernel/validators/
├── <domain>.validator.ts       # e.g. trace.validator.ts
├── <domain>.guard.ts           # e.g. firestore-id.guard.ts
└── index.ts                    # 統一 barrel 出口
```

- 檔名後綴建議 `.validator.ts` 或 `.guard.ts`。
- 函式命名建議 `isXxx`、`assertXxx`、`validateXxx`。

---

## 範例

```ts
// src/shared-kernel/validators/trace.validator.ts

export function isValidTraceId(input: unknown): input is string {
  return typeof input === 'string' && /^[0-9a-f-]{36}$/.test(input);
}

export function assertValidTraceId(input: unknown): asserts input is string {
  if (!isValidTraceId(input)) throw new Error('INVALID_TRACE_ID');
}
```

---

> **架構對齊**：`src/shared-kernel/validators/` = VS0-Kernel 驗證規則層（L1）。  
> 規則依據：`docs/architecture/README.md`（邊界校驗前置、L1 無副作用）。
