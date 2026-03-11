# [索引 ID: @VS8-BUILD] VS8 SIMA — 實施計畫（Schema-First Approach）

> Status: **Active**
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 定義 VS8 語義智慧匹配架構的逐步落地計畫，以資料模型為起點，依序建構 Firestore 集合、向量索引、Genkit 工具與 Prompt Engineering。
> Related: `architecture.md`（架構定義與三大支柱）、`architecture-diagrams.md`（架構圖）

---

> ⚠️ **命名說明**：本文件使用「Stage 1/2/3/4」描述實作階段（Schema → Vector → Tools → Prompts），
> 以區別於 `Xuanwu-Semantic-Kernel-and-Matchmaking-Protocol.md` 定義的
> 「SSOT Phase 0/1/2/3」（Kernel Bootstrap → Write Chain → Intelligent Matching → Read Chain）。
> 實作 Stage 與 SSOT Phase 的對應關係：
> - Stage 1 (Schema) → 支援 SSOT Phase 0（標籤本體論建立）
> - Stage 2 (Vector Index) → 支援 SSOT Phase 1/2（FI-002 寫入 + E8 向量搜尋）
> - Stage 3 (Genkit Tools) → 支援 SSOT Phase 2（Tool-S/M/V + GT-2/E8 fail-closed）
> - Stage 4 (Prompt Engineering) → 支援 SSOT Phase 2（L10 推理品質 + BF-1 回饋）

## 前提條件


1. 閱讀並理解 `architecture.md`：三大支柱角色（邏輯大腦 / 記憶模塊 / 語言定義）。
2. 確認現有 TypeScript 無錯誤（`npm run typecheck`）。
3. 確認三個 Firestore 集合（employees / tasks / skills）的設計已通過業務審查。
4. 確認所選嵌入模型（Vector Embedding Model）：預設使用 `text-embedding-004`（768 維）。

---

## 實施策略

**原則**：先落地資料（Where does data come from？），再建工具，再建智慧層。

```
Phase 1: Schema 定義      → 三個 Firestore 集合 + TypeScript Interface
Phase 2: Vector Index 設定 → Firebase 控制台 / Terraform 向量索引
Phase 3: Genkit Tools 開發 → search_skills / match_candidates / verify_compliance
Phase 4: Prompt Engineering → 系統提示詞設計 + 分派流程規則
```

> **暫緩項目**：`projections/graph-selectors.ts` 和 `context-selectors.ts` 不在當前優先路徑內；向量匹配與合規驗證工具優先。

---

## Phase 1：Schema 定義（支柱三「語言定義」資料基礎）

**目標**：在 `src/features/semantic-graph.slice/` 下建立 Firestore 集合的 TypeScript Interface 定義。

### 1-1 建立 `_schema.ts`

```bash
# 在 slice 根層建立 schema 文件
touch src/features/semantic-graph.slice/_schema.ts
```

`_schema.ts` 內容（基於 `architecture.md` 的集合定義）：

```typescript
import type { Timestamp } from 'firebase/firestore';

// ─── skills 集合 (支柱三「語言定義」) ─────────────────────────────────────────

/**
 * Firestore collection: `skills`
 * SSOT for canonical skill terminology. Used by search_skills Genkit tool.
 */
export interface SkillDocument {
  readonly skillId: string;
  readonly name: string;
  readonly aliases: string[];
  readonly taxonomyPath: string[];
  readonly dimension: string;
  readonly description: string;
  /** Vector field: text-embedding-004, 768 dims. Requires Firestore Vector Index. */
  readonly embedding: number[];
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

// ─── employees 集合 (匹配候選人) ──────────────────────────────────────────────

/**
 * Firestore collection: `employees`
 * Candidate pool for match_candidates Genkit tool.
 */
export interface EmployeeDocument {
  readonly employeeId: string;
  readonly name: string;
  readonly skillSlugs: string[];
  readonly certifications: string[];
  readonly availabilityStatus: 'available' | 'busy' | 'on-leave';
  /** Vector field: skill combination embedding. Requires Firestore Vector Index. */
  readonly skillEmbedding: number[];
  readonly updatedAt: Timestamp;
}

// ─── tasks 集合 (分派請求) ─────────────────────────────────────────────────────

/**
 * Firestore collection: `tasks`
 * Task requirements source for AI dispatch flow.
 */
export interface TaskDocument {
  readonly taskId: string;
  readonly title: string;
  readonly requiredSkillSlugs: string[];
  readonly requiredCertifications: string[];
  readonly complexityLevel: 'basic' | 'intermediate' | 'expert';
  /** Vector field: requirements embedding. Requires Firestore Vector Index. */
  readonly requirementsEmbedding: number[];
  readonly status: 'open' | 'assigned' | 'completed';
  readonly createdAt: Timestamp;
}
```

### 1-2 匯出至 `index.ts`

在 `index.ts` 中加入 Schema 型別的公開匯出（僅型別，非 runtime 程式碼）：

```typescript
export type { SkillDocument, EmployeeDocument, TaskDocument } from './_schema';
```

### 1-3 驗證

```bash
npm run typecheck
```

### 1-4 Commit

```bash
git add -A && git commit -m "feat(vs8/schema): add Firestore collection TypeScript interfaces [Phase 1]"
```

---

## Phase 2：Vector Index 設定（支柱二「記憶模塊」基礎設施）

**目標**：確保 Firestore 中三個集合的向量欄位建有索引，讓 `match_candidates` 工具可以執行語義搜尋。

### 2-1 Firebase 控制台設定（手動）

在 [Firebase Console](https://console.firebase.google.com) 的 Firestore 頁面：

1. 進入 `skills` 集合 → **Indexes** → **Add index**
   - Field: `embedding`
   - Type: `Vector`
   - Dimension: `768`（對應 `text-embedding-004`）

2. 進入 `employees` 集合 → **Indexes** → **Add index**
   - Field: `skillEmbedding`
   - Type: `Vector`
   - Dimension: `768`

3. 進入 `tasks` 集合 → **Indexes** → **Add index**
   - Field: `requirementsEmbedding`
   - Type: `Vector`
   - Dimension: `768`

### 2-2 更新 `_services.ts` 的向量搜尋實作

`_services.ts` 中的 `querySemanticIndex` 需支援 Firestore Vector Search（當前為記憶體實作）：

```typescript
// _services.ts — Firestore Vector Search 升級路徑
import { getFirestore, collection, query, findNearest, VectorQuery } from 'firebase/firestore';

export async function querySemanticIndex(
  queryText: string,
  opts: { domain?: 'skill' | 'employee' | 'task'; limit?: number }
): Promise<SemanticSearchHit[]> {
  const collectionMap: Record<string, string> = {
    skill: 'skills',
    employee: 'employees',
    task: 'tasks',
  };
  const collectionName = collectionMap[opts.domain ?? 'skill'];
  const fieldMap: Record<string, string> = {
    skills: 'embedding',
    employees: 'skillEmbedding',
    tasks: 'requirementsEmbedding',
  };

  // TODO: 替換為實際嵌入 API 呼叫（Vertex AI text-embedding-004）
  const queryEmbedding = await generateEmbedding(queryText);

  const db = getFirestore();
  const vectorQuery: VectorQuery = query(
    collection(db, collectionName),
    findNearest({
      vectorField: fieldMap[collectionName],
      queryVector: queryEmbedding,
      limit: opts.limit ?? 10,
      distanceMeasure: 'COSINE',
    })
  );
  // 轉換為 SemanticSearchHit[]
  // ...
}
```

### 2-3 驗證

```bash
npm run typecheck
# 確認 _services.ts 型別正確
```

### 2-4 Commit

```bash
git add -A && git commit -m "feat(vs8/vector-index): upgrade _services.ts for Firestore Vector Search [Phase 2]"
```

---

## Phase 3：Genkit Tools 開發（三工具分派引擎）

**目標**：建立三個 Genkit Tool，分別對應三大支柱。放置位置：`src/features/semantic-graph.slice/genkit-tools/`。

```bash
mkdir -p src/features/semantic-graph.slice/genkit-tools
```

### 3-1 `search_skills.ts`（支柱三「語言定義」）

```bash
touch src/features/semantic-graph.slice/genkit-tools/search-skills.tool.ts
```

詳細實作見 `architecture.md` → Genkit AI 工具整合 → 工具一：`search_skills`。

**關鍵設計**：
- 輸入：`{ query: string, limit?: number }`
- 輸出：`SkillDocument[]`（含 `taxonomyPath` 確認標準術語）
- 後端：`querySemanticIndex(query, { domain: 'skill' })`

### 3-2 `match_candidates.ts`（支柱二「記憶模塊」）

```bash
touch src/features/semantic-graph.slice/genkit-tools/match-candidates.tool.ts
```

詳細實作見 `architecture.md` → Genkit AI 工具整合 → 工具二：`match_candidates`。

**關鍵設計**：
- 輸入：`{ taskRequirementsText: string, limit?: number }`
- 輸出：`EmployeeDocument[]`（含 `similarityScore`）
- 後端：Firestore Vector Search on `employees.skillEmbedding`

### 3-3 `verify_compliance.ts`（支柱一「邏輯大腦」）

```bash
touch src/features/semantic-graph.slice/genkit-tools/verify-compliance.tool.ts
```

詳細實作見 `architecture.md` → Genkit AI 工具整合 → 工具三：`verify_compliance`。

**關鍵設計**：
- 輸入：`{ employeeId: string, requiredCertifications: string[] }`
- 輸出：`{ isCompliant: boolean, missingCertifications: string[], verificationTrace: string[] }`
- 後端：Firestore 讀取 `employees.certifications`，對比 `tasks.requiredCertifications`

### 3-4 建立工具匯出入口

```bash
touch src/features/semantic-graph.slice/genkit-tools/index.ts
```

```typescript
// genkit-tools/index.ts
export { searchSkillsTool } from './search-skills.tool';
export { matchCandidatesTool } from './match-candidates.tool';
export { verifyComplianceTool } from './verify-compliance.tool';
```

### 3-5 更新 `index.ts`

```typescript
export {
  searchSkillsTool,
  matchCandidatesTool,
  verifyComplianceTool,
} from './genkit-tools';
```

### 3-6 驗證

```bash
npm run typecheck
npx vitest run src/features/semantic-graph.slice/genkit-tools
```

### 3-7 Commit

```bash
git add -A && git commit -m "feat(vs8/genkit-tools): add search_skills, match_candidates, verify_compliance tools [Phase 3]"
```

---

## Phase 4：Prompt Engineering（AI 分派行為規則）

**目標**：設計 Genkit Flow 的系統提示詞，確保 AI 嚴格遵守「先過濾資質，再進行技能匹配」的規則。

### 4-1 建立 `_dispatch-flow.ts`

```bash
touch src/features/semantic-graph.slice/_dispatch-flow.ts
```

```typescript
import { defineFlow } from '@genkit-ai/core';
import { searchSkillsTool, matchCandidatesTool, verifyComplianceTool } from './genkit-tools';

export const dispatchFlow = defineFlow(
  {
    name: 'vs8-dispatch-flow',
    inputSchema: z.object({
      taskId: z.string(),
      taskDescription: z.string(),
      requiredCertifications: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      candidates: z.array(z.object({
        employeeId: z.string(),
        name: z.string(),
        similarityScore: z.number(),
        isCompliant: z.boolean(),
      })),
      inferenceTrace: z.array(z.string()),
    }),
  },
  async (input) => {
    // System Prompt 注入：規定工具調用順序
    // 詳細系統提示詞設計見 architecture.md → AI 分派流程規則
  }
);
```

### 4-2 系統提示詞規則（見 `architecture.md`）

詳細提示詞設計已記錄在 `architecture.md` → Genkit AI 工具整合 → AI 分派流程（Prompt Engineering 規則）。核心規則：
1. **合規優先**：有 `requiredCertifications` 時先呼叫 `verify_compliance`
2. **術語標準化**：不確定術語先呼叫 `search_skills`
3. **語義匹配**：使用標準化術語呼叫 `match_candidates`
4. **輸出限制 [B1]**：只輸出匹配結果，不執行分派

### 4-3 驗證

```bash
npm run typecheck
# 手動測試分派流程（需要 Firebase emulator）
```

### 4-4 Commit

```bash
git add -A && git commit -m "feat(vs8/dispatch-flow): add Genkit dispatch flow with compliance-first system prompt [Phase 4]"
```

---

## 驗證清單

| 驗證項目 | 命令 / 方式 |
|---------|------------|
| TypeScript 無錯誤 | `npm run typecheck` |
| Schema 型別正確 | `npx vitest run src/features/semantic-graph.slice/_schema.test.ts` |
| Firestore Vector Index 已建立 | Firebase Console 手動確認 |
| `querySemanticIndex` 可用 | 整合測試（需 Firebase emulator） |
| 三個 Genkit Tools 型別正確 | `npx vitest run src/features/semantic-graph.slice/genkit-tools` |
| `index.ts` 匯出包含三個工具 | 對照 `architecture.md` 公開 API 邊界表格 |
| ESLint [D24] 無直接 Firebase | `npm run lint` |

---

## 里程碑

| Phase | 完成條件 | 預估規模 |
|-------|---------|---------|
| Phase 1 | `_schema.ts` 建立、TypeScript 通過 | 1~2 天 |
| Phase 2 | `_services.ts` 升級、Firestore Vector Index 就緒 | 2~3 天 |
| Phase 3 | 三個 Genkit Tools 通過型別檢查 + 整合測試 | 3~5 天 |
| Phase 4 | `_dispatch-flow.ts` 通過手動 E2E 測試 | 2~3 天 |

---

## 暫緩項目

以下項目已存在於 codebase 但不在當前實作優先路徑內：

| 項目 | 說明 | 恢復條件 |
|------|------|---------|
| `projections/graph-selectors.ts` | 知識圖譜 N-hop 遍歷選擇器 | 當 Phase 3 `verify_compliance` 需要圖遍歷時啟動 |
| `projections/context-selectors.ts` | 語義情境選擇器 | 當 AI Flow 需要情境感知查詢時啟動 |
| `wiki-editor/relationship-visualizer.ts` | 知識圖譜視覺化 | 當 wiki-editor 需要互動式關係編輯時啟動 |

---

## 風險與緩解

| 風險 | 緩解措施 |
|------|---------|
| Firestore Vector Index 建立需時（數分鐘~小時） | Phase 2 前置作業，不阻塞 Phase 1 |
| 嵌入模型 API 配額限制 | 開發期使用 Firebase Emulator 的 mock embedding |
| `verify_compliance` 需要完整知識圖譜邊資料 | Phase 3 初期使用 `employees.certifications` 直接比對；圖遍歷為 Phase 3 後期增強 |
| 外部消費者 import 斷裂 | `index.ts` 維持向後相容；新增匯出不刪除現有匯出 |

## SSOT Phase 對齊摘要（Implementation to Protocol Mapping）

| 實作 Stage | SSOT Phase | 關鍵規則 | 驗證點 |
|-----------|------------|----------|--------|
| Stage 1: Schema | Phase 0 (0.1-0.4) | D21-A 語義唯一性, OT-2 分類法驗證 | Tag ontology slugs 建立完成 |
| Stage 2: Vector Index | Phase 1 (1.5-1.6) + Phase 2 (2.6) | FI-002 事務寫入, E8 tenantId 強綁定 | 768-dim embedding 存儲 + tenantId 過濾驗證 |
| Stage 3: Genkit Tools | Phase 2 (2.5-2.7) | GT-1 Tool宣告, E8 fail-closed, GT-2 fail-closed | Tool-S/M/V 各自單元測試 + 整合測試 |
| Stage 4: Prompt Engineering | Phase 2 (2.8-2.14) | R8 traceId, L4A 5-fields, BF-1 feedback | 推理軌跡完整性 + L4A 稽核欄位驗證 |
