# shared-kernel / utils

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用純工具函式（Pure Utility Helpers）

---

## 職責

放置可被 **兩個以上功能切片共用** 的低耦合純工具函式，通常不承載明確領域語意，但可提升可讀性與一致性：

- 字串處理（trim、slugify、safe join）。
- 陣列/物件處理（groupBy、dedupe、pick）。
- 日期/數字輔助（純計算，不碰時鐘來源）。
- 不依賴框架的通用 helper。

> **注意**：若函式已具領域語意（例如金融狀態推進），應優先放 `logics/` 或 `state-machines/`，不要放 `utils/`。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 集合工具 | `dedupeBy(items, keySelector)` |
| 字串工具 | `safeSlug(input)` |
| 映射工具 | `toRecord(list, keySelector)` |
| 不可變更新 | `replaceAt(array, index, next)` |
| 一般型別輔助 | `isDefined(value)` |

---

## 禁止放入什麼

- ❌ 業務規則（請放 `logics/` 或 `state-machines/`）
- ❌ I/O、SDK 相依、async
- ❌ UI / framework 相依程式碼
- ❌ 僅單一檔案使用且無重用價值的函式

---

## 與 `logics/`、`pipes/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `utils/` | **通用工具函式**（低語意、可重用） |
| `logics/` | **領域推導邏輯**（有明確業務語意） |
| `pipes/` | **資料形狀轉換管道** |

> 判斷準則：若是「泛用 helper」→ `utils/`；若含明確領域語意，請勿放 `utils/`。

---

## 檔案命名規則

```text
src/shared-kernel/utils/
├── array.utils.ts
├── object.utils.ts
├── string.utils.ts
├── type.utils.ts
└── index.ts
```

- 檔名後綴建議 `.utils.ts`。
- 函式命名使用 `camelCase`。
- 需保持副作用為 0。

---

## 範例

```ts
// src/shared-kernel/utils/array.utils.ts

export function dedupeBy<T, K>(
  items: readonly T[],
  keySelector: (item: T) => K,
): T[] {
  const seen = new Set<K>();
  const next: T[] = [];
  for (const item of items) {
    const key = keySelector(item);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }
  return next;
}
```

---

> **架構對齊**：`src/shared-kernel/utils/` = VS0-Kernel 通用工具層（L1）。  
> 規則依據：`docs/architecture/00-logic-overview.md`（L1 純函式區域，禁止副作用）。
