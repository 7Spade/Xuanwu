# [索引 ID: @VS8-ARCH] VS8 — 語義智慧匹配架構（Semantic Intelligent Matching Architecture）

> Status: **Current**
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 定義 VS8 設計目標、三大支柱架構、模組責任與 API 邊界。
> Related: `architecture-diagrams.md`（架構圖）、`architecture-build.md`（實施計畫）

---

## 定位與問題陳述

### 解決的核心問題

人力資源分派（HR Dispatch）面臨三個根本複雜度：

1. **語義差距（Semantic Gap）**：「資深工程師」與「senior engineer」代表同一概念，但系統無法自動識別。
2. **關係推理（Relational Reasoning）**：「團隊領導 REQUIRES 領導力」這類技能依賴關係必須被系統化建模。
3. **層次過濾（Hierarchical Filtering）**：「後端開發 IS_A 軟體工程」這類上下位關係需支援從粗粒度到細粒度的搜尋縮放。

### 設計答案：三大支柱

VS8 透過整合三大核心能力解決上述問題，定位為全系統「**語義智慧匹配架構（SIMA, Semantic Intelligent Matching Architecture）**」：

| 支柱 | 技術名稱 | 角色隱喻 | 核心功能 | 現行實作 |
|------|---------|---------|---------|---------|
| 支柱一 | **知識圖譜（Knowledge Graph）** | 🧠 **邏輯大腦** | 建模技能/角色/任務有向關係圖（IS_A、REQUIRES）；合規推理（證照驗證） | `SemanticEdge`、`SemanticRelationType` in `_types.ts` |
| 支柱二 | **向量數據庫（Vector Database）** | 💾 **記憶模塊** | 語義相似度索引，支援模糊語義查詢；Firestore Vector Index | `SemanticIndexEntry`、`_services.ts`（`indexEntity` / `querySemanticIndex`） |
| 支柱三 | **技能本體論/分類法（Skills Ontology / Taxonomy）** | 📖 **語言定義** | 技能術語標準化；層次化分類體系，支援維度過濾 | `TaxonomyTree`、`TAXONOMY_DIMENSIONS`、`_semantic-authority.ts`、`_aggregate.ts` |

---

## 架構目標

```
輸入：分派請求（角色需求 + 技能標籤 + 情境）
  │
  ├─ 技能本體論 ──→ 層次化過濾（維度 × 細粒度）
  ├─ 知識圖譜   ──→ 關係推理（依賴圖遍歷）
  └─ 向量索引   ──→ 語義相似度排序（模糊匹配）
  │
輸出：匹配候選集（SemanticSearchHit[]） + 推理鏈條（inferenceTrace）
```

匹配結果作為語義提示（semantic hint）輸出；**不執行分派副作用**（[B1]）。

---

## Firestore 領域資料集合（Data Source）

VS8 的三大支柱均以 Firestore 作為持久化後端（透過 SK_PORTS [D24]）。三個核心集合定義如下：

### `skills` 集合（支柱三「語言定義」的資料源）

```typescript
/** Firestore collection: skills */
interface SkillDocument {
  readonly skillId: string;           // 文件 ID，與 tagSlug 一致
  readonly name: string;              // 標準術語名稱 (e.g., "後端開發")
  readonly aliases: string[];         // 同義詞列表 (e.g., ["backend", "BE", "後端"])
  readonly taxonomyPath: string[];    // 本體論路徑 (e.g., ["software-engineering", "backend"])
  readonly dimension: string;         // 頂層維度 (e.g., "skill")
  readonly description: string;       // 技能定義描述
  /** Firestore 向量欄位: 技能描述的嵌入向量，用於語義相似度搜尋 */
  readonly embedding: number[];
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}
```

### `employees` 集合（匹配候選人資料源）

```typescript
/** Firestore collection: employees */
interface EmployeeDocument {
  readonly employeeId: string;
  readonly name: string;
  readonly skillSlugs: string[];       // 持有的技能 (tagSlug refs → skills 集合)
  readonly certifications: string[];   // 合約資質/證照 (e.g., ["ABB_ECAP", "SIEMENS_S7"])
  readonly availabilityStatus: 'available' | 'busy' | 'on-leave';
  /** Firestore 向量欄位: 員工技能組合的嵌入向量，用於 match_candidates 搜尋 */
  readonly skillEmbedding: number[];
  readonly updatedAt: Timestamp;
}
```

### `tasks` 集合（分派請求資料源）

```typescript
/** Firestore collection: tasks */
interface TaskDocument {
  readonly taskId: string;
  readonly title: string;
  readonly requiredSkillSlugs: string[];     // 所需技能 (tagSlug refs)
  readonly requiredCertifications: string[]; // 強制合規資質 (驗證來源)
  readonly complexityLevel: 'basic' | 'intermediate' | 'expert';
  /** Firestore 向量欄位: 任務需求描述的嵌入向量，用於 match_candidates 搜尋 */
  readonly requirementsEmbedding: number[];
  readonly status: 'open' | 'assigned' | 'completed';
  readonly createdAt: Timestamp;
}
```

> **Vector Index 設定**：`employees.skillEmbedding`、`skills.embedding`、`tasks.requirementsEmbedding` 三個欄位均需在 Firebase 控制台（或 Terraform）建立 Firestore 向量索引，維度數（dimension）需與所選嵌入模型（e.g., `text-embedding-004`，768 維）一致。

---

## Genkit AI 工具整合（三工具分派引擎）

AI 代理（Genkit Flow）透過以下三個工具執行分派判斷，每個工具對應一個支柱：

### 工具一：`search_skills`（基於支柱三「語言定義」）

**觸發時機**：AI 不確定某個技能術語的標準寫法時，查詢 `skills` 集合確保術語標準化。

```typescript
import { defineTool } from '@genkit-ai/core';

export const searchSkillsTool = defineTool(
  {
    name: 'search_skills',
    description:
      'Search the canonical skills ontology. Use this when you are unsure of the exact skill slug or want to find standard terminology.',
    inputSchema: z.object({
      query: z.string().describe('Skill term or description to search for'),
      limit: z.number().optional().default(5),
    }),
    outputSchema: z.array(z.object({
      skillId: z.string(),
      name: z.string(),
      taxonomyPath: z.array(z.string()),
      aliases: z.array(z.string()),
    })),
  },
  async ({ query, limit }) => {
    // 查詢 skills 集合（全文搜尋 + 向量相似度）
    return querySemanticIndex(query, { domain: 'skill', limit });
  }
);
```

### 工具二：`match_candidates`（基於支柱二「記憶模塊」）

**觸發時機**：AI 已確定技能術語後，將任務需求向量化，在 `employees` Firestore 向量索引中搜尋匹配候選人。

```typescript
export const matchCandidatesTool = defineTool(
  {
    name: 'match_candidates',
    description:
      'Find matching employee candidates based on task skill requirements using vector similarity search.',
    inputSchema: z.object({
      taskRequirementsText: z.string().describe('Task description or skill requirements'),
      limit: z.number().optional().default(10),
    }),
    outputSchema: z.array(z.object({
      employeeId: z.string(),
      name: z.string(),
      skillSlugs: z.array(z.string()),
      certifications: z.array(z.string()),
      similarityScore: z.number(),
    })),
  },
  async ({ taskRequirementsText, limit }) => {
    // 向量化任務需求，在 employees 集合搜尋
    return querySemanticIndex(taskRequirementsText, { domain: 'employee', limit });
  }
);
```

### 工具三：`verify_compliance`（基於支柱一「邏輯大腦」）

**觸發時機**：AI 取得候選人清單後，透過知識圖譜邏輯驗證候選人是否具備任務合約要求的特定證照（e.g., ABB ECAP、SIEMENS S7）。

```typescript
export const verifyComplianceTool = defineTool(
  {
    name: 'verify_compliance',
    description:
      'Verify that a candidate has all required certifications for the task contract. ' +
      'Use this after match_candidates to filter non-compliant candidates.',
    inputSchema: z.object({
      employeeId: z.string(),
      requiredCertifications: z.array(z.string()).describe(
        'List of required certification IDs (e.g., ["ABB_ECAP", "SIEMENS_S7"])'
      ),
    }),
    outputSchema: z.object({
      isCompliant: z.boolean(),
      missingCertifications: z.array(z.string()),
      verificationTrace: z.array(z.string()),
    }),
  },
  async ({ employeeId, requiredCertifications }) => {
    // 查詢知識圖譜邊：employee → certification IS_A requirement
    // 對比 employees.certifications vs requiredCertifications
    const employee = await getEmployeeById(employeeId);
    const missing = requiredCertifications.filter(
      cert => !employee.certifications.includes(cert)
    );
    return {
      isCompliant: missing.length === 0,
      missingCertifications: missing,
      verificationTrace: [`Checked ${requiredCertifications.length} required certifications`],
    };
  }
);
```

### AI 分派流程（Prompt Engineering 規則）

系統提示詞（System Prompt）必須明確規定 AI 的工具調用順序：

```
# 分派流程規則（必須嚴格遵守）

1. **先過濾資質（合規優先）**：
   - 在進行技能匹配之前，若任務包含 requiredCertifications，必須先呼叫 verify_compliance
   - 不合規的候選人直接排除，不進行後續匹配評分

2. **術語標準化**：
   - 若任務描述中出現不確定的技能術語，先呼叫 search_skills 查詢標準術語
   - 使用 search_skills 返回的 skillId 作為後續查詢的標準依據

3. **語義匹配**：
   - 使用 match_candidates 基於標準化術語進行向量匹配
   - 返回按相似度排序的候選人清單

4. **輸出限制 [B1]**：
   - 只輸出匹配結果和推理說明；不執行分派動作
   - 分派決策由系統外部負責
```

---

## SSOT Phase 2 完整執行鏈（Steps 2.5-2.14）

> 參考：`Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` Phase 2 Intelligent Matching Execution

VS8 L10 Genkit Orchestrator 在 Phase 2 執行以下完整步驟：

| Step | 路徑 | 說明 | 規則 |
|------|------|------|------|
| 2.5 | AI → Tool-S (search_skills) | 術語正規化；返回 canonical skill slugs | GT-3, OT-2 |
| 2.6 | Tool-M → L8 (vector search) | 語義近鄰搜尋；**tenantId 強綁定** | E8 fail-closed |
| 2.7 | Tool-V → L8 (verify certs) | 證照/資格硬過濾；**未通過即排除** | GT-2 fail-closed |
| 2.8 | AI → L0B (SA stream) | 串流中間推理軌跡至 Server Action 橋接 | R8 traceId |
| 2.9 | L0B → UI | 即時回推前端進度/理由片段 | R8 traceId |
| 2.10 | AI → D3 | 返回最終推理軌跡與排名 | GT-2 完成後方可執行 |
| 2.11 | D3 → IER (L4) | 發布匹配決策事件（含 reasons/traceRef） | D29 事件攜帶 |
| 2.12 | IER → L4A (Audit) | 寫入稽核日誌 | L4A 五大欄位：Who/Why/Evidence/Version/Tenant |
| 2.13 | IER → P5 (L5) | 按 Lane 分流投影事件 | LANE (Critical/Standard) |
| 2.14 | D3 → L8 | 自動回饋業務指紋（Employee 標籤權重調整） | BF-1 |

**執行約束：**
- Tool-S → Tool-M → Tool-V 順序不可調換（GT-2 合規要求）
- Step 2.6 (Tool-M) 必須帶 tenantId：`metadata.tenantId == request.tenantId`（E8 fail-closed）
- Step 2.7 (Tool-V) 是候選人輸出的最後防線：硬過濾後方可進入 Step 2.10
- Step 2.12 (L4A) 五大欄位缺失任一，禁止進入 Step 2.13 (L5 Projection)
- Step 2.14 (BF-1) 僅由 D3 (L3 Domain) 觸發；L10/L4A/L5 不可直接寫入 `skillEmbedding`

---

## 現行目錄結構

```text
src/features/semantic-graph.slice/
├── index.ts                          # 公開 API 唯一出口 [D7]
│
├── _types.ts                         # 領域型別
│   ├── (公開) TaxonomyTree, SemanticIndexEntry, SemanticSearchHit …
│   └── (內部) SemanticEdge, SemanticRelationType, TagLifecycleEvent …
│
├── _semantic-authority.ts            # [支柱三] TAXONOMY_DIMENSIONS, SEARCH_DOMAINS
├── _aggregate.ts                     # [支柱三] TaxonomyValidation + 時序衝突偵測
├── _services.ts                      # [支柱二] 語義向量索引：indexEntity / querySemanticIndex
├── _queries.ts                       # [D4] 查詢出口（包裝 _services.ts）
├── _actions.ts                       # [D3] Tag 寫入命令入口
├── _bus.ts                           # Tag 生命週期事件匯流排 [T1]
├── _cost-classifier.ts               # [D27] 純函式成本語義分類器
│
├── projections/
│   ├── context-selectors.ts          # 【暫緩】語義情境選擇器（非當前實作優先項）
│   ├── graph-selectors.ts            # 【暫緩】知識圖譜選擇器（非當前實作優先項）
│   └── tag-snapshot.slice.ts         # Tag 快照展示 API
│
├── wiki-editor/                      # 分類法維基治理視圖（支柱三管理入口）
│   ├── index.ts
│   └── relationship-visualizer.ts   # 知識圖譜視覺化（支柱一，待接入 edge store）
│
├── proposal-stream/                  # 技能/標籤修訂提案串流
│   └── index.ts
│
├── subscribers/                      # 訂閱其他切片事件（接收 TagLifecycleEvent）
│   └── lifecycle-subscriber.ts
│
└── outbox/                           # 外送語義事件（拓撲異動輸出）
    └── tag-outbox.ts
```

---

## 三大支柱詳細設計

### 支柱一：知識圖譜（Knowledge Graph）

**目的**：建模技能、角色、任務之間的有向語義關係，支援依賴圖遍歷與繼承推理。

**核心型別**（in `_types.ts`）：

```typescript
// 支援的關係類型
type SemanticRelationType = 'IS_A' | 'REQUIRES';

// 有向語義邊
interface SemanticEdge {
  edgeId: string;
  fromTagSlug: TagSlugRef;   // 源節點（e.g. "skill:team-lead"）
  toTagSlug: TagSlugRef;     // 目標節點（e.g. "skill:leadership"）
  relationType: SemanticRelationType;
  weight: number;            // 關係強度 0.0~1.0
  createdAt: string;
}
```

**治理規則**：
- `KG-1`：圖譜邊（SemanticEdge）只能透過 `_actions.ts` 寫入；嚴禁外部切片直接建立邊。
- `KG-2`：`weight` 在邊啟用後視為不可變；修改須走更新命令，不可直接覆寫。
- `KG-3`：禁止建立循環依賴圖（A→B→A）；寫入時必須通過 `_aggregate.ts` 循環偵測。

**待實作**（`TODO [VS8_PROJ]`）：
- `projections/graph-selectors.ts`：知識圖譜查詢選擇器（N-hop 遍歷）。
- `wiki-editor/relationship-visualizer.ts`：視覺化關係編輯器（接入 edge store）。

---

### 支柱二：向量數據庫（Vector Database / Semantic Index）

**目的**：為所有語義實體建立向量索引，支援跨域模糊語義查詢（無需完全符合）。

**核心服務**（in `_services.ts`）：

```typescript
// 建立/更新索引
function indexEntity(entry: SemanticIndexEntry): void

// 移除索引
function removeFromIndex(entityId: string): void

// 語義查詢（向量相似度搜尋）
function querySemanticIndex(
  query: string,
  opts: { domain?: SemanticSearchDomain; limit?: number }
): SemanticSearchHit[]

// 索引統計
function getIndexStats(): SemanticIndexStats
```

**治理規則**：
- `VD-1`：語義索引由 `_services.ts` 獨家管理；外部切片不可直接讀寫索引內部結構。
- `VD-2`：所有索引查詢必須透過 `_queries.ts` 出口（[D4]），不可繞過出口直調 `_services.ts`。
- `VD-3`：索引實體（`indexEntity`）須在 Tag 寫入成功後觸發，不可先行索引未確認的實體。

---

### 支柱三：技能本體論/分類法（Skills Ontology / Taxonomy）

**目的**：建立層次化技能分類體系，定義維度（Dimension）、節點（Node）與上下位（IS_A）關係，支援粗細粒度搜尋縮放。

**核心常數**（in `_semantic-authority.ts`）：

```typescript
// 搜尋域定義（控制向量索引的查詢範圍）
const SEARCH_DOMAINS: readonly SemanticSearchDomain[]

// 分類法維度定義（技能樹頂層節點）
const TAXONOMY_DIMENSIONS: readonly TaxonomyDimension[]
```

**驗證**（in `_aggregate.ts`）：

```typescript
// 驗證 Tag 是否符合現有分類法路徑
function validateTaxonomyAssignment(
  tagSlug: string,
  path: string[]
): TaxonomyValidationResult
```

**治理規則**：
- `OT-1`：新分類法維度（`TaxonomyDimension`）只能在 `_semantic-authority.ts` 定義；嚴禁其他切片自行添加維度。
- `OT-2`：Tag 分配路徑必須通過 `validateTaxonomyAssignment` 驗證後方可寫入 Firestore。
- `OT-3`：`TAXONOMY_DIMENSIONS` 為唯讀常數；修改須走架構審查流程（`99-checklist.md`）。

---

## 公開 API 邊界（index.ts 匯出清單）

| 分類 | 主要匯出 | 對應支柱 |
|------|---------|---------|
| Domain Types | `TaxonomyTree`、`SemanticIndexEntry`、`SemanticEdge`、`SemanticSearchHit` 等 | 三大支柱 |
| Ontology (支柱三) | `TAXONOMY_DIMENSIONS`、`SEARCH_DOMAINS` | 技能本體論 |
| Ontology Validation | `validateTaxonomyAssignment`、`validateTaxonomyPath` | 技能本體論 |
| Vector Index (支柱二) | `indexEntity`、`removeFromIndex`、`querySemanticIndex`、`getIndexStats` | 向量數據庫 |
| Tag Commands [D3] | `upsertTagWithConflictCheck`、`assignSemanticTag`、`removeTag` | 三大支柱 |
| Tag Event Bus [T1] | `onTagEvent`、`publishTagEvent` | 生命週期 |
| Cost Classifier [D27] | `classifyCostItem`、`classifyParserLineItem`、`shouldMaterializeAsTask` | 成本語義 |
| Tag Snapshot | `getTagSnapshotPresentation`、`getTagSnapshotPresentationMap` | 投影輸出 |

---

## 架構不變量

| ID | 類型 | 規則 |
|----|------|------|
| `D3` | MUST | 所有 Tag 寫入透過 `_actions.ts`；嚴禁直接寫 Firestore |
| `D4` | MUST | 所有讀取透過 `_queries.ts` 出口；內部 store 不對外 |
| `D7` | MUST | 唯一公開出口 `index.ts`；內部模組一律隱藏 |
| `D8` | MUST | Tag 業務邏輯在此 slice；不下放 shared-kernel |
| `D21` | MUST | 新 Tag 分類只能在 VS8 定義 |
| `D24` | MUST | 禁止直接 import Firebase；必須透過 SK_PORTS |
| `D27` | MUST | 成本語義決策由 VS8 `_cost-classifier.ts` 提供；VS5 不可自判 |
| `B1` | MUST | VS8 只輸出語義提示/匹配結果；嚴禁直接觸發跨切片副作用 |
| `KG-1` | MUST | 知識圖譜邊只能透過 `_actions.ts` 寫入 |
| `KG-2` | MUST | 邊的 `weight` 啟用後不可變；修改須走更新命令 |
| `KG-3` | MUST | 寫入邊前必須通過循環依賴偵測 |
| `VD-1` | MUST | 向量索引由 `_services.ts` 獨家管理 |
| `VD-2` | MUST | 外部切片透過 `_queries.ts` 查詢語義索引；嚴禁直調 `_services.ts` |
| `VD-3` | MUST | 索引實體須在 Tag 寫入成功後觸發；不可先行索引未確認實體 |
| `OT-1` | MUST | 新分類法維度只能在 `_semantic-authority.ts` 定義 |
| `OT-2` | MUST | Tag 分配路徑必須通過 `validateTaxonomyAssignment` 驗證 |
| `OT-3` | MUST | `TAXONOMY_DIMENSIONS` 為唯讀常數；修改須走架構審查流程 |
| `T1` | MUST | 外部切片訂閱 `onTagEvent()`；嚴禁自行維護 Tag 資料 |

---

## 外部消費者清單

| 消費者 | 主要使用項目 | 對應支柱 |
|--------|------------|---------|
| `global-search.slice/` | `querySemanticIndex`、`SEARCH_DOMAINS` | 支柱二（向量索引） |
| `workspace.slice/domain.document-parser/` | `classifyCostItem`、`classifyParserLineItem` | 成本語義 [D27] |
| `finance.slice/` | 成本分類器型別、`FinanceAggregateState` | 成本語義 [D27] |
| `shared-kernel/data-contracts/tag-authority/` | `TAXONOMY_DIMENSIONS`、標籤型別 | 支柱三（分類法） |
| `shared-infra/projection-bus/_tag-funnel.ts` | 標籤快照投影、`onTagEvent` | Tag 生命週期 |

> **約束**：所有外部消費者僅透過 `index.ts` 匯入；嚴禁直接 import 內部模組。

---

## 參考文件

- `architecture-diagrams.md`：三大支柱架構圖、HR 分派流程圖、知識圖譜關係圖、向量匹配流程圖。
- `architecture-build.md`：下一階段詳細實施計畫（向量數據庫持久化、圖譜遍歷引擎）。
- `README.md`：VS8 願景摘要與實作能力清單。
- `01-d21-body-8layers.md`：D21 四層核心不變量。
- `02-semantic-router.md`：語義路由規則。
- `03-tag-authority.md`：標籤權威規則（分類法 + 生命週期）。
- `docs/architecture/00-logic-overview.md`：全域架構 SSOT（含 VS8 不變量索引）。
