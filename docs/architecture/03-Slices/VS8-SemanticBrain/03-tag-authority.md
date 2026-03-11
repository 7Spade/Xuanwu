# [索引 ID: @VS8-TA] VS8 Tag Authority

## Scope

標籤主權由 `_semantic-authority.ts`（TAXONOMY_DIMENSIONS）與 `_aggregate.ts`（validateTaxonomyAssignment）維護，為全域語義術語定義的真相（支柱三 📖 語言定義）。

## Rules

- `D21-A`: 新概念必須先在 `skills` 集合中以標準術語（`skillId`）登記後再使用。
- `D21-T`: tagSlug 永久穩定，不可重命名。
- `D21-S`: 合併後舊標籤轉 alias，不可直接刪除。
- `D21-U`: 重複語義需即時提示，不可靜默建立。

## Graph Safety（知識圖譜 — 支柱一 🧠）

- `D21-C`: 每個標籤需掛載 parent（`taxonomyPath` 層次路徑）。
- `KG-3`: 定期檢測孤立節點（無入邊 SemanticEdge）並上報。
- `T5`: 業務端不得直讀 adjacency list，須讀 tag-snapshot。

## Phase 0 標籤初始化流程（SSOT Bootstrap Sequence）

> 參考 SSOT：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` Phase 0

Tag authority 的建立是整個系統語義能力的前提。SSOT Phase 0 按以下順序執行：

| 步驟 | 路徑 | 說明 | 對應規則 |
|------|------|------|---------|
| **Step 0** | `VS0 → D3` | Kernel 型別注入；提供標籤所需的型別合約（`tagSlug`、`TaxonomyDimension` 等） | D21-B schema 鎖定 |
| **Step 0.1** | `Admin → L8` | **VS8 Admin** 定義 Skill Ontology Slugs，寫入 `skills` 集合；建立標籤主權基礎 | **D21-A** 語義唯一性；**D21-G** 語義權威 |
| **Step 0.2** | `D3 → L8` | D3 Domain 建構 VS8 Tag Ontology；啟動全切片標籤主權，所有 slice 的語義標籤自此受 VS8 管轄 | **D21-C** 無孤立節點；**OT-2** 分類法驗證 |
| **Step 0.3** | `D3 → L8` | VS2 Account/Profile 寫入，套用標籤正規化（slug 必須引用已登記的 `skills.skillId`） | D21-A 唯一性驗證 |
| **Step 0.4** | `D3 → L8` | VS5 Workspace/Task 寫入，套用語義標籤（`requiredSkillSlugs` 引用 `skills` 集合） | D21-A 唯一性驗證；OT-2 路徑驗證 |

> ⚠️ **Tag authority must be established (Step 0.1–0.2) BEFORE any Phase 1 writes can use semantic tags.**
> Phase 1 的 FI-002 事務寫入與 Phase 2 的 Tool-S 術語正規化，均以 `skills` 集合中已登記的 slug 為合法性依據。
> 若 Step 0.1–0.2 尚未完成即執行 Phase 1 寫入，`validateTaxonomyAssignment` 將拒絕未登記的 tagSlug。
