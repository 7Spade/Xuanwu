# [索引 ID: @VS8-BUILD] VS8 Semantic Brain — 詳細實施計畫

> Status: **Draft**
> Scope: `src/features/semantic-graph.slice/`
> Purpose: 逐步遷移現行目錄結構至 `architecture.md` 定義的十層 `centralized-*` 目標架構。
> Related: `architecture.md`（目標架構定義）

---

## 前提條件

1. 閱讀並理解 `architecture.md` 的十層結構與不變量。
2. 確認現行測試全部通過（`npx vitest run src/features/semantic-graph.slice`）。
3. 確認外部消費者清單無新增（詳見 `architecture.md` 外部消費者清單）。
4. 在獨立分支作業；每個階段結束後提交一次可回滾的 commit。

---

## 遷移策略

- **方向**：L10 → L1（由外圍至核心），確保核心依賴最晚動，風險最小。
- **原則**：`index.ts` 公開匯出清單不得中途破壞；每個階段結束後重跑 typecheck。
- **手法**：`git mv`（保留 git 歷史） + 同步更新 import 路徑。
- **驗證**：每個階段完成後執行 `npm run typecheck` 與 slice 單元測試。

---

## 遷移前：現行結構快照

```text
semantic-graph.slice/
├── core/tags/           → 目標: centralized-tag/
├── core/nodes/          → 目標: centralized-nodes/
├── core/embeddings/     → 目標: centralized-embeddings/
├── domain.graph/edges/  → 目標: centralized-edges/
├── domain.graph/neural-net/ + domain.reasoning/semantic-distance.ts
│                        → 目標: centralized-neural-net/
├── domain.reasoning/causality/ → 目標: centralized-causality/
├── domain.routing/ + domain.workflows/ → 目標: centralized-workflows/
├── gov.governance/guards/ → 目標: centralized-guards/
├── domain.learning/     → 目標: centralized-learning/
├── domain.output/projections/ → 目標: projections/
├── gov.governance/semantic-governance-portal/wiki-editor/ → 目標: wiki-editor/
├── gov.governance/semantic-governance-portal/proposal-stream/ → 目標: proposal-stream/
├── domain.output/subscribers/ → 目標: subscribers/
└── domain.output/outbox/ → 目標: outbox/
```

---

## 階段 0：準備工作

**目標**：建立回滾基準線，確認遷移範圍。

### 0-1 建立基準測試
```bash
# 確認現有測試全部通過
npx vitest run src/features/semantic-graph.slice
```

預期通過的測試檔：
- `_aggregate.test.ts`
- `_cost-classifier.test.ts`
- `_services.test.ts`
- `domain.graph/neural-net/neural-network.test.ts`
- `domain.reasoning/semantic-distance.test.ts`
- `domain.reasoning/causality/causality-tracer.test.ts`
- `gov.governance/guards/invariant-guard.test.ts`

### 0-2 確認 TypeScript 無錯誤
```bash
npm run typecheck
```

### 0-3 建立 Git 基準點
```bash
git add -A && git commit -m "chore(vs8): migration baseline – tests green, typecheck clean"
```

---

## 階段 1：遷移 L10（I/O 層）

**低風險先行**。I/O 層是最外圍的葉節點，無其他 VS8 內部模組依賴它。

### 1-1 遷移 `outbox/`
```bash
# 建立目標目錄
mkdir -p src/features/semantic-graph.slice/outbox

# 移動檔案
git mv src/features/semantic-graph.slice/domain.output/outbox/tag-outbox.ts \
       src/features/semantic-graph.slice/outbox/tag-outbox.ts
```

更新 import（若 `tag-outbox.ts` 有 `index.ts` 重新匯出）：
- 確認 `_actions.ts` 或 `index.ts` 是否直接 import `domain.output/outbox/...`
- 更新為 `./outbox/tag-outbox`

### 1-2 遷移 `subscribers/`
```bash
mkdir -p src/features/semantic-graph.slice/subscribers

git mv src/features/semantic-graph.slice/domain.output/subscribers/lifecycle-subscriber.ts \
       src/features/semantic-graph.slice/subscribers/lifecycle-subscriber.ts
```

### 1-3 清理空目錄
```bash
rmdir src/features/semantic-graph.slice/domain.output/outbox
rmdir src/features/semantic-graph.slice/domain.output/subscribers
```

### 1-4 驗證
```bash
npm run typecheck
```

### 1-5 Commit
```bash
git add -A && git commit -m "refactor(vs8/L10): move outbox + subscribers to top-level [architecture-build P1]"
```

---

## 階段 2：遷移 L7（投影讀取層）

### 2-1 遷移 `projections/`
```bash
mkdir -p src/features/semantic-graph.slice/projections

git mv src/features/semantic-graph.slice/domain.output/projections/graph-selectors.ts \
       src/features/semantic-graph.slice/projections/graph-selectors.ts

git mv src/features/semantic-graph.slice/domain.output/projections/context-selectors.ts \
       src/features/semantic-graph.slice/projections/context-selectors.ts

git mv src/features/semantic-graph.slice/domain.output/projections/tag-snapshot.slice.ts \
       src/features/semantic-graph.slice/projections/tag-snapshot.slice.ts
```

### 2-2 更新 `index.ts` import 路徑
```typescript
// 舊
import { getTagSnapshotPresentation, ... } from './domain.output/projections/tag-snapshot.slice';
// 新
import { getTagSnapshotPresentation, ... } from './projections/tag-snapshot.slice';
```

同樣更新 `_queries.ts` 中對 `domain.output/projections/...` 的引用。

### 2-3 清理
```bash
rmdir src/features/semantic-graph.slice/domain.output/projections
# 若 domain.output 已空，也可移除
rmdir src/features/semantic-graph.slice/domain.output 2>/dev/null || true
```

### 2-4 驗證
```bash
npm run typecheck
```

### 2-5 Commit
```bash
git add -A && git commit -m "refactor(vs8/L7): move projections to top-level [architecture-build P2]"
```

---

## 階段 3：遷移 L8（Wiki 治理層）

### 3-1 遷移 `wiki-editor/` 和 `proposal-stream/`
```bash
mkdir -p src/features/semantic-graph.slice/wiki-editor
mkdir -p src/features/semantic-graph.slice/proposal-stream

git mv src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/wiki-editor/index.ts \
       src/features/semantic-graph.slice/wiki-editor/index.ts

git mv src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/proposal-stream/index.ts \
       src/features/semantic-graph.slice/proposal-stream/index.ts
```

### 3-2 更新 `index.ts` import 路徑（若有引用）

### 3-3 清理空目錄
```bash
rmdir src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/wiki-editor
rmdir src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/proposal-stream
```

> **備注**：`relationship-visualizer/` 和 `consensus-engine/` 留在 Phase 後續處理（consensus-engine 最終移至 `centralized-guards/` 或獨立保留）。

### 3-4 驗證 + Commit
```bash
npm run typecheck
git add -A && git commit -m "refactor(vs8/L8): move wiki-editor + proposal-stream to top-level [architecture-build P3]"
```

---

## 階段 4：遷移 L6（學習層）

### 4-1 遷移 `centralized-learning/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-learning

git mv src/features/semantic-graph.slice/domain.learning/learning-engine.ts \
       src/features/semantic-graph.slice/centralized-learning/learning-engine.ts

git mv src/features/semantic-graph.slice/domain.learning/decay-service.ts \
       src/features/semantic-graph.slice/centralized-learning/decay-service.ts

# 建立 index.ts 重新匯出
cat > src/features/semantic-graph.slice/centralized-learning/index.ts << 'EOF'
export * from './learning-engine';
export * from './decay-service';
EOF
```

### 4-2 清理 + 驗證 + Commit
```bash
rmdir src/features/semantic-graph.slice/domain.learning
npm run typecheck
git add -A && git commit -m "refactor(vs8/L6): move domain.learning → centralized-learning [architecture-build P4]"
```

---

## 階段 5：遷移 L5（血腦屏障層）

### 5-1 遷移 `centralized-guards/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-guards

git mv src/features/semantic-graph.slice/gov.governance/guards/invariant-guard.ts \
       src/features/semantic-graph.slice/centralized-guards/invariant-guard.ts

git mv src/features/semantic-graph.slice/gov.governance/guards/invariant-guard.test.ts \
       src/features/semantic-graph.slice/centralized-guards/invariant-guard.test.ts

git mv src/features/semantic-graph.slice/gov.governance/guards/semantic-guard.ts \
       src/features/semantic-graph.slice/centralized-guards/semantic-guard.ts

git mv src/features/semantic-graph.slice/gov.governance/guards/staleness-monitor.ts \
       src/features/semantic-graph.slice/centralized-guards/staleness-monitor.ts
```

### 5-2 更新 `index.ts` import 路徑
```typescript
// 舊
export { validateEdgeProposal } from './gov.governance/guards/invariant-guard';
// 新
export { validateEdgeProposal } from './centralized-guards/invariant-guard';
```

### 5-3 遷移 `consensus-engine/`（L8 → `centralized-guards/`）
```bash
# consensus-engine 驗證後轉至 BBB，歸入 centralized-guards
git mv src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/consensus-engine/index.ts \
       src/features/semantic-graph.slice/centralized-guards/consensus-engine.ts
```

更新 `index.ts`：
```typescript
// 舊
export { validateConsensus } from './gov.governance/semantic-governance-portal/consensus-engine';
// 新
export { validateConsensus } from './centralized-guards/consensus-engine';
```

### 5-4 清理空目錄
```bash
rmdir src/features/semantic-graph.slice/gov.governance/guards
rmdir src/features/semantic-graph.slice/gov.governance/semantic-governance-portal/consensus-engine
```

### 5-5 驗證 + Commit
```bash
npx vitest run src/features/semantic-graph.slice/centralized-guards
npm run typecheck
git add -A && git commit -m "refactor(vs8/L5): move guards → centralized-guards; merge consensus-engine [architecture-build P5]"
```

---

## 階段 6：遷移 L4（路由與工作流層）

### 6-1 遷移 `centralized-workflows/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-workflows

git mv src/features/semantic-graph.slice/domain.routing/policy-mapper/index.ts \
       src/features/semantic-graph.slice/centralized-workflows/policy-mapper/index.ts

git mv src/features/semantic-graph.slice/domain.routing/dispatch-bridge/index.ts \
       src/features/semantic-graph.slice/centralized-workflows/dispatch-bridge/index.ts

git mv src/features/semantic-graph.slice/domain.routing/tag-lifecycle.workflow.ts \
       src/features/semantic-graph.slice/centralized-workflows/tag-lifecycle.workflow.ts

git mv src/features/semantic-graph.slice/domain.workflows/tag-promotion-flow.ts \
       src/features/semantic-graph.slice/centralized-workflows/tag-promotion-flow.ts

git mv src/features/semantic-graph.slice/domain.workflows/alert-routing-flow.ts \
       src/features/semantic-graph.slice/centralized-workflows/alert-routing-flow.ts
```

### 6-2 清理
```bash
rmdir src/features/semantic-graph.slice/domain.routing/policy-mapper
rmdir src/features/semantic-graph.slice/domain.routing/dispatch-bridge
rmdir src/features/semantic-graph.slice/domain.routing
rmdir src/features/semantic-graph.slice/domain.workflows
```

### 6-3 驗證 + Commit
```bash
npm run typecheck
git add -A && git commit -m "refactor(vs8/L4): merge domain.routing + domain.workflows → centralized-workflows [architecture-build P6]"
```

---

## 階段 7：遷移 L3（神經計算層）

### 7-1 遷移 `centralized-neural-net/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-neural-net

git mv src/features/semantic-graph.slice/domain.graph/neural-net/neural-network.ts \
       src/features/semantic-graph.slice/centralized-neural-net/neural-network.ts

git mv src/features/semantic-graph.slice/domain.graph/neural-net/neural-network.test.ts \
       src/features/semantic-graph.slice/centralized-neural-net/neural-network.test.ts

# semantic-distance 從 domain.reasoning 合併至此
git mv src/features/semantic-graph.slice/domain.reasoning/semantic-distance.ts \
       src/features/semantic-graph.slice/centralized-neural-net/semantic-distance.ts

git mv src/features/semantic-graph.slice/domain.reasoning/semantic-distance.test.ts \
       src/features/semantic-graph.slice/centralized-neural-net/semantic-distance.test.ts
```

### 7-2 遷移 `centralized-causality/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-causality

git mv src/features/semantic-graph.slice/domain.reasoning/causality/causality-tracer.ts \
       src/features/semantic-graph.slice/centralized-causality/causality-tracer.ts

git mv src/features/semantic-graph.slice/domain.reasoning/causality/causality-tracer.test.ts \
       src/features/semantic-graph.slice/centralized-causality/causality-tracer.test.ts
```

### 7-3 更新 `_queries.ts` import 路徑
```typescript
// 舊
import { traceAffectedNodes, ... } from './domain.reasoning/causality/causality-tracer';
import { computeSemanticDistance, ... } from './domain.graph/neural-net/neural-network';
// 新
import { traceAffectedNodes, ... } from './centralized-causality/causality-tracer';
import { computeSemanticDistance, ... } from './centralized-neural-net/neural-network';
```

### 7-4 清理
```bash
rmdir src/features/semantic-graph.slice/domain.graph/neural-net
rmdir src/features/semantic-graph.slice/domain.reasoning/causality
rmdir src/features/semantic-graph.slice/domain.reasoning
```

### 7-5 驗證 + Commit
```bash
npx vitest run src/features/semantic-graph.slice/centralized-neural-net
npx vitest run src/features/semantic-graph.slice/centralized-causality
npm run typecheck
git add -A && git commit -m "refactor(vs8/L3): merge neural-net + semantic-distance + causality into centralized-* [architecture-build P7]"
```

---

## 階段 8：遷移 L2（語義邊 Synapse 層）

### 8-1 遷移 `centralized-edges/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-edges

git mv src/features/semantic-graph.slice/domain.graph/edges/semantic-edge-store.ts \
       src/features/semantic-graph.slice/centralized-edges/semantic-edge-store.ts

git mv src/features/semantic-graph.slice/domain.graph/edges/adjacency-list.ts \
       src/features/semantic-graph.slice/centralized-edges/adjacency-list.ts

git mv src/features/semantic-graph.slice/domain.graph/edges/weight-calculator.ts \
       src/features/semantic-graph.slice/centralized-edges/weight-calculator.ts

git mv src/features/semantic-graph.slice/domain.graph/edges/context-attention.ts \
       src/features/semantic-graph.slice/centralized-edges/context-attention.ts
```

### 8-2 更新 import 路徑
- `_queries.ts`：`./domain.graph/edges/...` → `./centralized-edges/...`
- `_aggregate.ts`（若有引用）
- `centralized-neural-net/neural-network.ts`（依賴 adjacency-list）

### 8-3 清理
```bash
rmdir src/features/semantic-graph.slice/domain.graph/edges
rmdir src/features/semantic-graph.slice/domain.graph
```

### 8-4 驗證 + Commit
```bash
npm run typecheck
git add -A && git commit -m "refactor(vs8/L2): move domain.graph/edges → centralized-edges [architecture-build P8]"
```

---

## 階段 9：遷移 L1（核心 Aggregate 層）

### 9-1 遷移 `centralized-tag/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-tag

git mv src/features/semantic-graph.slice/core/tags/_actions.ts \
       src/features/semantic-graph.slice/centralized-tag/_actions.ts

git mv src/features/semantic-graph.slice/core/tags/_bus.ts \
       src/features/semantic-graph.slice/centralized-tag/_bus.ts

git mv src/features/semantic-graph.slice/core/tags/_events.ts \
       src/features/semantic-graph.slice/centralized-tag/_events.ts

git mv src/features/semantic-graph.slice/core/tags/index.ts \
       src/features/semantic-graph.slice/centralized-tag/index.ts
```

### 9-2 遷移 `centralized-nodes/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-nodes

git mv src/features/semantic-graph.slice/core/nodes/tag-entity.factory.ts \
       src/features/semantic-graph.slice/centralized-nodes/tag-entity.factory.ts

git mv src/features/semantic-graph.slice/core/nodes/hierarchy-manager.ts \
       src/features/semantic-graph.slice/centralized-nodes/hierarchy-manager.ts
```

### 9-3 遷移 `centralized-embeddings/`
```bash
mkdir -p src/features/semantic-graph.slice/centralized-embeddings

git mv src/features/semantic-graph.slice/core/embeddings/embedding-port.ts \
       src/features/semantic-graph.slice/centralized-embeddings/embedding-port.ts

git mv src/features/semantic-graph.slice/core/embeddings/vector-store.ts \
       src/features/semantic-graph.slice/centralized-embeddings/vector-store.ts
```

### 9-4 更新 `index.ts` import 路徑
```typescript
// 舊
export { buildTagEntity } from './core/nodes/tag-entity.factory';
export type { IEmbeddingPort } from './core/embeddings/embedding-port';
export { createTag, ... } from './core/tags/_actions';

// 新
export { buildTagEntity } from './centralized-nodes/tag-entity.factory';
export type { IEmbeddingPort } from './centralized-embeddings/embedding-port';
export { createTag, ... } from './centralized-tag/_actions';
```

### 9-5 更新 `core/utils/semantic-utils.ts`
如果 `core/utils/semantic-utils.ts` 內有邏輯，評估是否：
- 移至 `centralized-nodes/`
- 或保留為 `core/utils/` 工具模組（視內容決定）

### 9-6 清理
```bash
rmdir src/features/semantic-graph.slice/core/tags
rmdir src/features/semantic-graph.slice/core/nodes
rmdir src/features/semantic-graph.slice/core/embeddings
# 若 core/ 僅剩 types/ 和 utils/，視情況合併或保留
```

### 9-7 驗證 + Commit
```bash
npm run typecheck
npx vitest run src/features/semantic-graph.slice
git add -A && git commit -m "refactor(vs8/L1): move core/{tags,nodes,embeddings} → centralized-* [architecture-build P9]"
```

---

## 階段 10：整合 core/types 與根層 _types

### 10-1 評估 `core/types/index.ts`

`core/types/index.ts` 目前匯出神經網路與因果型別。遷移後這些型別已位於 `centralized-neural-net/` 和 `centralized-causality/`。

選項 A（推薦）：刪除 `core/types/index.ts`，直接從 centralized-* 目錄匯出型別。
選項 B：保留 `core/types/index.ts` 作為型別彙整的中繼層。

### 10-2 更新 `index.ts` 所有型別 import 路徑

確認 `index.ts` 中的型別匯出指向正確的 centralized-* 目錄：

```typescript
export type {
  SemanticDistanceEntry,
  AffectedNode,
  CausalityReason,
  DownstreamEvent,
  CausalityChain,
} from './centralized-neural-net';  // 或 centralized-causality
```

### 10-3 驗證 + Commit
```bash
npm run typecheck
npx vitest run src/features/semantic-graph.slice
git add -A && git commit -m "refactor(vs8): consolidate core/types; finalize centralized-* structure [architecture-build P10]"
```

---

## 階段 11：關係視覺化器處理

`gov.governance/semantic-governance-portal/relationship-visualizer/` 尚未在 target 架構中明確定位。

**選項 A**：移至 `wiki-editor/` 子目錄（治理視圖的一部分）。
**選項 B**：獨立保留為 `gov.governance/` 內的視覺化工具。
**選項 C**：若為純 UI 元件，移至 `src/lib-ui/` 或 slice 的 `_components/`。

**建議**：先評估 `relationship-visualizer/index.ts` 的實際內容，再決定歸屬。

---

## 階段 12：最終清理

### 12-1 移除已清空的舊目錄
```bash
# 確認 gov.governance 已清空
ls src/features/semantic-graph.slice/gov.governance/

# 若僅剩 relationship-visualizer，待 P11 決議後再移除
rmdir src/features/semantic-graph.slice/gov.governance/semantic-governance-portal 2>/dev/null || true
rmdir src/features/semantic-graph.slice/gov.governance 2>/dev/null || true

# 移除已清空的 core/（若 utils 也已處理）
rmdir src/features/semantic-graph.slice/core 2>/dev/null || true
```

### 12-2 全量驗證
```bash
npm run typecheck
npx vitest run src/features/semantic-graph.slice
npm run lint
```

### 12-3 更新 README.md
更新 `src/features/semantic-graph.slice/README.md` 中的目錄結構描述以反映新架構。

### 12-4 Final Commit
```bash
git add -A && git commit -m "refactor(vs8): complete centralized-* directory migration [architecture-build DONE]"
```

---

## 驗證清單

| 驗證項目                              | 命令 / 方式                                               |
|---------------------------------------|-----------------------------------------------------------|
| TypeScript 無型別錯誤                 | `npm run typecheck`                                       |
| 所有 VS8 單元測試通過                 | `npx vitest run src/features/semantic-graph.slice`        |
| 外部消費者 import 不受影響            | `npx vitest run src/features/global-search.slice`         |
| 外部消費者 typecheck 無錯誤           | `npm run typecheck`（全量）                               |
| `index.ts` 匯出清單無縮減            | 對照 `architecture.md` 公開 API 邊界表格                  |
| `git diff --stat`確認無意外刪除       | 確認移動前後行數相近                                      |
| ESLint D24 規則（無直接 Firebase）    | `npm run lint`                                            |

---

## 風險與回滾策略

| 風險                                    | 緩解措施                                                      |
|-----------------------------------------|---------------------------------------------------------------|
| Import 路徑更新遺漏造成 TS 錯誤         | 每個階段完成後立即執行 `npm run typecheck`；有錯誤不進下一階段 |
| 測試檔移動後路徑解析失敗               | `git mv` 保留歷史；vitest 的 `@/` alias 仍然有效             |
| 外部消費者 import 斷裂                  | `index.ts` 匯出清單在所有階段中維持完全相同                  |
| 階段間 merge conflict                   | 每階段獨立 commit；可用 `git revert <commit>` 回滾到任意基準  |
| `relationship-visualizer` 歸屬未決     | 保持現狀直到 P11 評估完成，不強制搬移                         |

---

## 完成標準

- [x] `architecture.md` 已建立並通過審查。
- [ ] 所有 `domain.*` 目錄已遷移至 `centralized-*` 對應目錄。
- [ ] `gov.governance/` 目錄已清理（`guards/` 和 `semantic-governance-portal/` 完成遷移）。
- [ ] `core/` 目錄僅保留 `utils/`（若有）或已完全清空。
- [ ] `index.ts` 公開 API 與 `architecture.md` 中的表格完全一致。
- [ ] `npm run typecheck` 0 errors。
- [ ] `npx vitest run src/features/semantic-graph.slice` 全數通過。
- [ ] `src/features/semantic-graph.slice/README.md` 目錄結構已更新。
