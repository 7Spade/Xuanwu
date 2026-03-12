# shared-kernel / schemas

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用資料驗證 Schema（Zod / 結構定義）

---

## 職責

放置可被 **兩個以上功能切片共用** 的 **Zod 驗證 Schema** 及其衍生型別。Schema 在此層作為：

1. **資料邊界守衛（Boundary Guard）**：在 L0 外部輸入進入系統時（Route Handler、Server Action、Event Payload）執行結構驗證。
2. **單一真相來源（SSOT）**：透過 `z.infer<typeof schema>` 衍生 TypeScript 型別，避免手寫型別與驗證邏輯分離。
3. **跨切片契約（Cross-BC Contract）**：共用事件結構、API 請求/回應體、表單結構定義。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 跨切片事件 Payload Schema | `workspaceCreatedEventSchema`、`scheduleProposedEventSchema` |
| 共用 API 請求體 Schema | `paginationQuerySchema`、`dateRangeFilterSchema` |
| 共用表單欄位 Schema | `addressSchema`、`workspaceLocationSchema` |
| 原始型別守衛 Schema | `tagSlugRefSchema`、`timestampSchema`、`intentIDSchema` |
| 跨切片共用回應體 Schema | `commandResultSchema`、`searchHitSchema` |

---

## 禁止放入什麼

- ❌ 只有單一切片使用的表單 Schema（放在對應切片的 `schemas.ts`）
- ❌ 含副作用的驗證（如查詢 Firebase 進行 unique check）→ 留在 Server Action 層
- ❌ UI 專用驗證（含 React 依賴）

---

## 檔案命名規則

```
src/shared-kernel/schemas/
├── <domain>.schema.ts        # 領域 Schema（e.g. workspace.schema.ts、address.schema.ts）
├── primitives.schema.ts      # 基礎原始型別 Schema（tagSlugRef、timestamp、UUID 等）
└── index.ts                  # 統一 barrel 出口
```

- 檔名後綴統一為 `.schema.ts`。
- Schema 常數名稱使用 `camelCase`，後綴 `Schema`（e.g. `addressSchema`）。
- 衍生型別使用 `z.infer<typeof xyzSchema>` 並以 `type XyzInput` 等命名匯出。

---

## 依賴規則

```rules
IF Schema 所有欄位型別均可由 Zod 原始型別或 shared-kernel/types 衍生
THEN 放入此目錄

IF Schema 依賴 feature slice 的業務邏輯（如 enum 分類）
THEN 評估是否先將該 enum 移入 shared-kernel/enums，再建立 Schema

IF Schema 需要 async 驗證（如 DB unique check）
THEN 不得放入此目錄；留在 Server Action / Domain Layer
```

---

## 範例

```ts
// src/shared-kernel/schemas/address.schema.ts
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1),
  city:   z.string().min(1),
  state:  z.string().min(1),
  postalCode: z.string().regex(/^\d{3,6}$/),
  country:    z.string().min(2).max(2),
  details:    z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
```

---

> **架構對齊**：`src/shared-kernel/schemas/` = VS0-Kernel 跨切片資料驗證契約（L1）。  
> 規則依據：`docs/architecture/README.md`；Feature Slice 架構規則 § Validation and Types。
