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
