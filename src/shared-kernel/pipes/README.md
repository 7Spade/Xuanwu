# shared-kernel / pipes

**層級**：L1 · VS0-Kernel  
**性質**：跨切片共用資料轉換管道（Pure Data Transformation Pipelines）

---

## 職責

放置可被 **兩個以上功能切片共用** 的 **純粹資料轉換函式** 及其組合管道（Pipeline）。Pipe 的定義：

- 輸入一個資料結構，輸出另一個資料結構——零副作用。
- 支援函式組合（Function Composition）。
- 不依賴外部狀態、不執行 I/O、不觸發副作用。

典型用途：資料形狀轉換（Mapping）、正規化（Normalization）、序列化/反序列化（Serialization）、投影（Projection）、過濾（Filtering）。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 資料形狀轉換 | `toWorkspaceTask(raw: RawTaskDoc): WorkspaceTask` |
| 正規化管道 | `normalizeTagSlug(raw: string): TagSlugRef` |
| 序列化 | `serializeTimestamp(ts: Timestamp): string` |
| 反序列化 | `deserializeTimestamp(iso: string): Timestamp` |
| 投影（部分取值） | `projectToSearchHit(entry: SemanticIndexEntry): SemanticSearchHit` |
| 管道組合器 | `pipe(fn1, fn2, fn3)(input)` — 函式組合工具 |
| 跨切片資料適配 | `adaptScheduleToCalendarEntry(item: ScheduleItem): CalendarEntry` |
| 過濾輔助 | `filterActiveGrants(grants: WorkspaceGrant[]): WorkspaceGrant[]` |

---

## 禁止放入什麼

- ❌ 含 `async/await` 或 Promise（I/O 操作）
- ❌ 含副作用（Firebase 讀寫、事件發送、狀態突變）
- ❌ 只有單一切片使用的轉換（留在各切片的 `_utils.ts` 或 domain service）
- ❌ 含業務決策邏輯（如 `if costItemType === EXECUTABLE then ...`）→ 留在 VS8 分類器

---

## 與 `logics/` 的界線

| 目錄 | 關注點 |
|------|--------|
| `logics/` | **領域規則推導**（計算、判斷、狀態推導）— 「答案是什麼」|
| `pipes/` | **資料形狀轉換**（Mapping、Projection、Normalization）— 「形狀怎麼變」|

> 判斷準則：若函式主要在「做計算/判斷」→ `logics/`；若主要在「改資料形狀」→ `pipes/`。

---

## 檔案命名規則

```
src/shared-kernel/pipes/
├── <source>-to-<target>.pipe.ts    # 明確轉換方向（e.g. timestamp-to-iso.pipe.ts）
├── <domain>-normalize.pipe.ts      # 正規化管道（e.g. tag-normalize.pipe.ts）
├── compose.ts                      # 管道組合工具函式（pipe / compose）
└── index.ts                        # 統一 barrel 出口
```

- 檔名後綴使用 `.pipe.ts` 明確語意。
- 函式命名使用 `camelCase`，動詞開頭（`toXxx`、`normalizeXxx`、`serializeXxx`）。

---

## 範例

```ts
// src/shared-kernel/pipes/timestamp-to-iso.pipe.ts
import type { Timestamp } from '@/shared-kernel/ports';

/**
 * Converts a Firestore Timestamp to an ISO 8601 string.
 * Pure — no I/O, deterministic.
 */
export function timestampToISO(ts: Timestamp): string {
  return ts.toDate().toISOString();
}

/**
 * Converts an ISO 8601 string to milliseconds epoch.
 * Pure — no I/O, deterministic.
 */
export function isoToMillis(iso: string): number {
  return new Date(iso).getTime();
}
```

---

> **架構對齊**：`src/shared-kernel/pipes/` = VS0-Kernel 純粹資料轉換管道（L1）。  
> 規則依據：`docs/architecture/README.md`（Allowed in L1 → 共享純函式邏輯：跨切片通用轉換）。
