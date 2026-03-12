# shared-kernel / ontologys

**層級**：L1 · VS0-Kernel  
**性質**：跨切片領域概念本體（Domain Ontology — Conceptual Vocabulary）

---

## 職責

放置系統的 **領域本體（Ontology）** 定義——即「系統使用哪些概念、概念之間的關係是什麼」的規範性聲明：

- **概念詞彙（Conceptual Vocabulary）**：系統中的核心概念名詞及其語義邊界。
- **概念關係（Concept Relations）**：概念之間的分類、繼承、關聯關係定義（型別層級而非資料層級）。
- **語義常數（Semantic Constants）**：概念層面的不變量（如 Tag Category Namespace、Cost Item 語義類型）。
- **領域詞彙字典（Domain Glossary Types）**：對應 VS8 Everything-as-a-Tag 的概念分類型別定義。

---

## 放置什麼程式碼

| 類型 | 範例 |
|------|------|
| 概念分類聯合型別 | `TaxonomyDimension`（技術 / 安全 / 施工 / 管理）|
| 語義命名空間常數 | `TAG_NAMESPACE`、`COST_ITEM_NAMESPACE` |
| 跨切片概念 enum 替代 | `OrgSemanticNamespace`（`'task-type' \| 'skill-type'`）|
| 領域語義標記型別 | `TagSlugBrand`、`DomainConcept` |
| 概念繼承 / 組合關係型別 | `IsA<T, U>`、`PartOf<Parent, Child>` |
| 領域詞彙常數表 | 跨切片共用的概念詞彙對照（中文概念 ↔ 系統識別碼）|

---

## 禁止放入什麼

- ❌ 含任何業務邏輯（流程決策、路由規則）
- ❌ 含 I/O 或副作用
- ❌ 只有單一切片使用的概念詞彙（留在各切片的 `_contract.ts` 或 `core/types.ts`）
- ❌ 具體業務規則（排班優先順序、成本分類邏輯）→ 留在 VS6/VS8

---

## 與其他目錄的界線

| 目錄 | 放置內容 |
|------|----------|
| `types/` | 實體型別（Entity Shapes、Value Objects）——「資料長什麼樣子」|
| `schemas/` | 運行時驗證 Schema（Zod）——「資料是否合法」|
| `ontologys/` | 概念本體定義——「概念是什麼 / 概念關係是什麼」|
| `enums/` | 可迭代的字串聯合值陣列——「概念的所有可能值」|

---

## 檔案命名規則

```
src/shared-kernel/ontologys/
├── <domain>-concepts.ts      # 概念詞彙（e.g. tag-taxonomy-concepts.ts）
├── <domain>-relations.ts     # 概念關係（e.g. workspace-relations.ts）
├── namespaces.ts             # 全域語義命名空間常數
└── index.ts                  # 統一 barrel 出口
```

- 檔名使用 `kebab-case`，後綴 `-concepts.ts` 或 `-relations.ts`。
- 概念常數使用 `SCREAMING_SNAKE_CASE`；概念型別使用 `PascalCase`。

---

## 範例

```ts
// src/shared-kernel/ontologys/tag-taxonomy-concepts.ts

/**
 * Tag Taxonomy Dimensions — governed by VS8 SemanticBrain.
 * Per D21: New tag categories only defined in VS8.
 * Placed in shared-kernel as a conceptual vocabulary constant (not logic, not data).
 */
export const TAG_TAXONOMY_DIMENSIONS = [
  'technical',
  'safety',
  'construction',
  'management',
  'finance',
] as const;

export type TagTaxonomyDimension = typeof TAG_TAXONOMY_DIMENSIONS[number];
```

---

> **架構對齊**：`src/shared-kernel/ontologys/` = VS0-Kernel 領域本體層（L1）。  
> 語義治理權威：VS8 SemanticBrain（`src/features/semantic-graph.slice`）。  
> 規則依據：`docs/architecture/README.md`（D21：新 Tag 類別定義在 VS8；此層放可跨切片引用的概念契約）。
