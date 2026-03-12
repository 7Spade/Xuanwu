# shared-kernel / value-objects

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用值物件（Immutable Value Objects）

---

## 職責

放置可被 **兩個以上功能切片共用** 的不可變值物件（Value Object），用來封裝：

- 領域語意完整值（不是單純 primitive）。
- 建構時校驗與正規化。
- 相等性語意（Value Equality）。

典型例子：Money、DateRange、TagSlug、TenantScope、Phone、Email、AddressPart。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| VO 建構函式 | `createMoney(amount, currency)` |
| 值正規化 | `normalizeTagSlug(input)` |
| 相等判定 | `isSameDateRange(a, b)` |
| 純衍生函式 | `addMoney(a, b)`、`contains(range, date)` |
| 錯誤碼常數 | `INVALID_CURRENCY`、`INVALID_RANGE` |

---

## 禁止放入什麼

- ❌ 可變狀態（mutable fields）
- ❌ I/O、SDK 相依、async
- ❌ UI 呈現邏輯
- ❌ 切片專屬且不可重用的臨時型別

---

## 與 `types/`、`validators/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `value-objects/` | **語意值與行為**（不可變 + 封裝規則） |
| `types/` | **結構型型別**（shape/type alias/interface） |
| `validators/` | **通用驗證器**（可重用 validation functions） |

> 判斷準則：若是「有語意與操作行為的值」→ `value-objects/`。

---

## 檔案命名規則

```text
src/shared-kernel/value-objects/
├── <name>.vo.ts                # e.g. money.vo.ts, date-range.vo.ts
├── <name>.errors.ts            # 可選：VO 專屬錯誤碼
└── index.ts                    # 統一 barrel 出口
```

- 檔名後綴建議 `.vo.ts`。
- 工廠函式命名建議 `createXxx`。
- 盡量回傳 readonly 結構。

---

## 範例

```ts
// src/shared-kernel/value-objects/date-range.vo.ts

export interface DateRange {
  readonly startISO: string;
  readonly endISO: string;
}

export function createDateRange(startISO: string, endISO: string): DateRange {
  if (new Date(startISO).getTime() > new Date(endISO).getTime()) {
    throw new Error('INVALID_RANGE');
  }
  return { startISO, endISO };
}
```

---

> **架構對齊**：`src/shared-kernel/value-objects/` = VS0-Kernel 值物件層（L1）。  
> 規則依據：`docs/architecture/README.md`（L1 純函式/契約、禁止副作用）。
