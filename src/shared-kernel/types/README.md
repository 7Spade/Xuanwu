# 🛡️ Shared Kernel Types (集中化型別管理)

這個目錄是全專案的**核心領域模型 (Domain Models)** 與**通用型別定義**的集中管理地。

## 📌 目錄定位
為了確保大型專案中資料結構的一致性，我們遵循以下原則：
1. **單一事實來源**：所有跨 Feature 或跨層級使用的型別，必須定義在此處。
2. **墊片機制 (Shim)**：原本分散在各處的型別定義已遷移至此，原位置僅保留匯出（Re-export）並標註 `@deprecated`，以確保向後相容性。

---

## 📂 目錄結構
- `/models`: 核心業務實體 (如 `User.ts`, `Product.ts`, `Order.ts`)。
- `/api`: 與後端對接的 Request/Response 通用格式。
- `/enums`: 全域使用的列舉類型。
- `/utils`: TypeScript 工具型別 (如 `Nullable.ts`, `DeepPartial.ts`)。

---

## 🔄 遷移與墊片規範 (Shim Policy)

當你將舊型別遷移至此處時，請務必在**原始位置**留下墊片，格式如下：

### 1. 墊片撰寫範例
在原始檔案 (如 `src/features/user/types.ts`) 中：

```typescript
/** * @deprecated 🛑 此型別定義已集中管理。
 * 請優先從 `@/shared-kernel/types` 引用。
 * 定義位置：src/shared-kernel/types/models/user.ts
 */
export type { User, UserProfile } from '@/shared-kernel/types/models/user';