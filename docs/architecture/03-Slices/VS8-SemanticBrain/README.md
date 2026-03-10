# VS8 — 語義智慧匹配架構（Semantic Intelligent Matching Architecture）

## 定位

VS8 是全系統語義權威，定位為「**基於語義的智慧匹配架構（SIMA）**」，透過整合三大核心支柱解決人力資源中的複雜分派問題：

| 支柱 | 技術 | 解決的問題 |
|------|------|---------|
| **支柱一** | 知識圖譜（Knowledge Graph） | 技能依賴推理：「A REQUIRES B」、「X IS_A Y」的關係圖建模 |
| **支柱二** | 向量數據庫（Vector Database） | 語義差距：「資深工程師」≈ 「senior engineer」的模糊匹配 |
| **支柱三** | 技能本體論/分類法（Skills Ontology） | 層次過濾：從「軟體工程」縮放到「後端開發 > 資深工程師」 |

VS8 只輸出語義提示/匹配結果；**不執行分派副作用** [B1]。

## 核心功能

- **Tag 生命週期治理**：`upsertTagWithConflictCheck`、`assignSemanticTag`、`removeTag`、Tag 事件匯流排（`onTagEvent`/`publishTagEvent` [T1]）。
- **分類法驗證**（支柱三）：`validateTaxonomyAssignment`、`TAXONOMY_DIMENSIONS`。
- **語義向量索引**（支柱二）：`indexEntity`、`querySemanticIndex`、`getIndexStats`。
- **知識圖譜型別**（支柱一）：`SemanticEdge`、`SemanticRelationType`（IS_A / REQUIRES）。
- **成本語義分類**：`classifyCostItem*`、`shouldMaterializeAsTask` [D27]。
- **Tag 快照展示**：`getTagSnapshotPresentationMap`。

## 文件索引

| 文件 | 用途 |
|------|------|
| `README.md` | VS8 願景摘要與實作能力清單（本文件）。 |
| `architecture.md` | **三大支柱設計**：支柱定義、模組責任表、公開 API 邊界、架構不變量清單。 |
| `architecture-diagrams.md` | **架構圖**：三大支柱全覽、HR 分派流程圖、知識圖譜關係圖、向量匹配流程圖、分類法層次圖（Mermaid）。 |
| `architecture-build.md` | 詳細實施計畫：下一階段向量 DB 持久化、圖譜遍歷引擎建構步驟。 |
| `01-d21-body-8layers.md` | D21 四層核心不變量。 |
| `02-semantic-router.md` | 語義路由規則。 |
| `03-tag-authority.md` | 標籤權威規則（分類法 + 生命週期）。 |
