# shared-kernel / logics

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用純函式邏輯（Pure Cross-BC Logic）

---

## 職責

放置可被 **兩個以上功能切片（Feature Slices）共用** 的無副作用純函式。這些函式滿足：

- **確定性（Deterministic）**：相同輸入永遠回傳相同輸出。
- **無 I/O（No I/O）**：不呼叫 Firebase、網路、時鐘、隨機數等外部資源。
- **無狀態（Stateless）**：不依賴模組層級可變狀態。
- **跨切片可重用（Cross-BC）**：被 2 個以上切片引用才移入此層；否則留在各自切片。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 領域推導函式 | `getTierFromXp(xp: number): SkillTier`（Tier 永遠是推導值，禁止持久化） |
| 數值計算 | `calcSubtotal(qty, unitPrice, discount)` |
| 日期工具 | `isDateInRange(date, start, end)` |
| 狀態機轉換（純） | `nextLifecycleState(current, event)` |
| 跨切片比較 / 排序輔助 | `compareByPriority(a, b)` |
| 文字格式化 | `formatWBSCode(depth, index)` |

---

## 禁止放入什麼

- ❌ 含副作用的函式（`async/await`、Firebase 呼叫、`console.log` 非測試場景）
- ❌ 只有單一切片使用的邏輯（留在各自切片的 `_utils.ts`）
- ❌ 業務決策函式（排班路由、成本分類）→ 放在對應領域切片 VS6/VS8
- ❌ 依賴注入容器 / 框架特定 API（React hooks、Next.js API）

---

## 檔案命名規則

```
src/shared-kernel/logics/
├── <domain>-<verb>.ts        # 領域動詞對（e.g. skill-tier.ts、task-subtotal.ts）
└── index.ts                  # 統一 barrel 出口（供 shared-kernel/index.ts re-export）
```

- 檔名使用 `kebab-case`。
- 每個檔案職責單一，不超過 150 行。
- 新增函式後，請同步由 `index.ts` 顯式匯出。

---

## 依賴規則

```rules
IF 函式使用 shared-kernel/types、data-contracts、enums 的型別
THEN 允許直接 import（同層 L1 內部引用）

IF 函式需要 feature slice 的型別或邏輯
THEN 必須重新設計（不得 import L3 feature slices）

IF 函式需要 I/O 或 async
THEN 不得放入此目錄
```

---

## 範例

```ts
// src/shared-kernel/logics/skill-tier.ts
import type { SkillTier } from '@/shared-kernel/data-contracts/skill-tier';

/**
 * Derives the skill tier from accumulated experience points.
 * [Invariant #12] Tier is ALWAYS derived on-demand — NEVER persisted.
 */
export function getTierFromXp(xp: number): SkillTier { ... }
```

---

> **架構對齊**：`src/shared-kernel/logics/` = VS0-Kernel 共享純函式層（L1）。  
> 規則依據：`docs/architecture/00-logic-overview.md`（Allowed in L1 / VS0 → 共享純函式邏輯）。
