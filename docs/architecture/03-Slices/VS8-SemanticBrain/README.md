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

## SSOT Phase 2 整合（Intelligent Matching Execution）

> 參考 SSOT：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md`

VS8 橫跨 SSOT 三個 Phase，各自提供不同能力：

### Phase 0：標籤本體論初始化（Bootstrap）

VS8 在 Phase 0 建立系統運行所需的語義基礎：

| 步驟 | 說明 |
|------|------|
| **Step 0.1** `Admin→L8` | VS8 Admin 定義 Skill Ontology Slugs（建立標籤權威） |
| **Step 0.2** `D3→L8` | D3 Domain 建構 VS8 Tag Ontology（啟動全切片標籤主權） |

> Tag authority **必須**在 Step 0.1–0.2 完成後，Phase 1 寫入才可使用語義標籤。

### Phase 1：非同步嵌入提取（Write Chain）

VS8 在 Phase 1 支援語義嵌入的非同步寫入：

| 步驟 | 說明 |
|------|------|
| **Step 1.5** `L8→AI` | 觸發非同步嵌入提取（FI-002 事務寫入） |
| **Step 1.6** `AI→L8` | 嵌入向量寫回（768-dim，`skillEmbedding` / `embedding`） |

### Phase 2：智慧匹配執行（Intelligent Matching Execution）

VS8 的核心場景：**L10 Genkit Orchestrator** 主導 Step 2.4–2.14 完整鏈路。

| 步驟範圍 | VS8 角色 | 關鍵規則 |
|---------|----------|---------|
| **2.5** `AI→Tool-S` | `search_skills` 術語正規化，返回 canonical slugs | GT-3, OT-2 |
| **2.6** `Tool-M→L8` | `match_candidates` 向量相似度搜尋，**tenantId 強綁定** | E8 fail-closed |
| **2.7** `Tool-V→L8` | `verify_compliance` 證照/資格硬過濾，**未通過即排除** | GT-2 fail-closed |
| **2.8–2.9** `AI→SA→UI` | 串流中間推理軌跡至前端（Server Action 橋接） | R8 traceId |
| **2.10** `AI→D3` | 返回最終推理軌跡與排名候選集 | GT-2 完成後方可執行 |
| **2.11** `D3→IER` | 發布匹配決策事件（含 reasons/traceRef） | D29 事件攜帶 |
| **2.12** `IER→L4A` | 寫入稽核日誌（五大欄位） | **Who/Why/Evidence/Version/Tenant** |
| **2.13** `IER→P5/L5` | 按 Lane 分流投影事件（CRITICAL/STANDARD） | LANE 路由 |
| **2.14** `D3→L8` | 自動回饋業務指紋（BF-1：Employee 標籤權重調整） | BF-1，僅 D3 觸發 |

**關鍵規則摘要：**
- **E8 fail-closed**：Step 2.6 `Tool-M` 必須帶 `tenantId`；metadata 不符即拒絕
- **GT-2 fail-closed**：Step 2.7 `Tool-V` 硬過濾，未通過的候選人不進入 Step 2.10
- **L4A Audit 五大欄位**：Who / Why / Evidence / Version / Tenant，缺一禁止進入 L5 Projection
- **BF-1 feedback**：業務指紋更新僅由 D3 (L3 Domain) 觸發；L10/L4A/L5 不可直接寫入 `skillEmbedding`
