# 🏗 Technical Debt Archive

> **憲法依據 / Constitutional Basis**: `docs/architecture/00-logic-overview.md`
> **說明**: 本文件存檔所有已解決的技術債條目（狀態為 RESOLVED / ACCEPTED / SUPERSEDED）。
> 活躍技術債請見 `technical-debt.md`。

---

## 歸檔流程 / Archival Process

當一個技術債條目滿足以下任一條件時，從 `technical-debt.md` 移入本文件：

- **RESOLVED**: 對應的 stub / 缺失模組已完整實作並通過代碼審查
- **ACCEPTED**: 評估後決定長期接受此技術債（需附理由與風險說明）
- **SUPERSEDED**: 被新的架構決策取代（需附對應的 ADR 或文件連結）

歸檔時保留原始條目格式，並在頂部加入關閉記錄：

```
**關閉日期**: YYYY-MM-DD
**關閉原因**: RESOLVED / ACCEPTED / SUPERSEDED
**關閉備注**: (說明實作 commit 或架構決策參考)
```

---

## 已歸檔條目 / Archived Entries

---

## TD-001 · VS8 L6 VS8_PLAST — `centralized-learning/` 純 Stub，無學習反饋迴路

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `learning-engine.ts` 已完整實作 `onAccountCreated()`、`onSkillXpChanged()`、`getCachedWeight()` 及內部權重快取；`decay-service.ts` 已實作 `computeDecayedWeight()`、`applyDecay()`、`scheduleDecayRun()` 符合 [D21-G][D21-9][D24]。

**嚴重程度**: HIGH · **狀態**: RESOLVED · **關聯規則**: D21-G

### 背景

VS8 第 6 層 Plasticity（神經可塑性層）負責根據系統事實事件（VS3 完工、VS2 財務結算）
動態調整語義邊的權重，實現語義圖的自我學習與演化能力。

### 技術債務

- **邊權重靜態化**: 所有語義邊從創建後權重不變，不反映業務使用頻率
- **D21-G 約束虛設**: 學習反饋迴路（Hebbian learning / decay）無法執行

### 驗證來源

- `src/features/semantic-graph.slice/learning/learning-engine.ts`
- `src/features/semantic-graph.slice/learning/decay-service.ts`

---

## TD-002 · VS8 L8 VS8_WIKI — `wiki-editor/` + `proposal-stream/` 純 Stub，語義治理層缺失

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `proposal-stream/index.ts` 實作完整提案狀態機（pending/approved/rejected）；`wiki-editor/index.ts` 實作 `submitProposal()`（含治理前置驗證：自環、權重、重複提案）、`getProposalHistory()`，符合 [D21-I][D21-S]。

**嚴重程度**: MEDIUM · **狀態**: RESOLVED · **關聯規則**: D21-I, D21-S

### 驗證來源

- `src/features/semantic-graph.slice/governance/semantic-governance-portal/wiki-editor/index.ts`
- `src/features/semantic-graph.slice/governance/semantic-governance-portal/proposal-stream/index.ts`

---

## TD-003 · VS8 L10 VS8_IO — `subscribers/` + `outbox/` 純 Stub，I/O 廣播層缺失

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `tag-outbox.ts` 實作 `emitTagLifecycleEvent()`（冪等去重）、`emitSemanticTopologyChanged()`、`emitNeuralWeightUpdated()`、`drainPendingEntries()`，符合 [D21-10][S1][D24]；`lifecycle-subscriber.ts` 實作 `createLifecycleSubscriber()` 與 `onLifecycleEvent()` 訂閱機制。

**嚴重程度**: MEDIUM · **狀態**: RESOLVED · **關聯規則**: D21-S（I/O broadcast）

### 驗證來源

- `src/features/semantic-graph.slice/output/outbox/tag-outbox.ts`
- `src/features/semantic-graph.slice/output/subscribers/lifecycle-subscriber.ts`

---

## TD-004 · D21-C — `hierarchy-manager.ts` 缺失（關聯 ISSUE-002）

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `hierarchy-manager.ts` 已從缺失狀態完整實作，提供 `mountToParent()`、`validateNotIsolated()`、`getParent()`，符合 [D21-C][D24]。ISSUE-002 對應的孤立節點問題現有前置驗證能力。

**嚴重程度**: HIGH · **狀態**: RESOLVED · **關聯規則**: D21-C

### 驗證來源

- `src/features/semantic-graph.slice/core/nodes/hierarchy-manager.ts`

---

## TD-005 · D21-E — `weight-calculator.ts` 缺失（關聯 ISSUE-004）

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `weight-calculator.ts` 已實作 `calculateSimilarityWeight()`（含跨類別懲罰）與 `adjustWeight()`（學習引擎回調），符合 [D21-E][D21-9][D24]。已移至 `graph/edges/` per 架構對齊。

**嚴重程度**: HIGH · **狀態**: RESOLVED · **關聯規則**: D21-E

### 驗證來源

- `src/features/semantic-graph.slice/graph/edges/weight-calculator.ts`

---

## TD-006 · D21-F — `context-attention.ts` 缺失（關聯 ISSUE-005）

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `context-attention.ts` 已完整實作 `filterTagsByWorkspaceContext()`，依 `ws:<id>:` 前綴規則過濾本地與全局共享標籤，符合 [D21-F][D24]。已依架構對齊移至 `graph/edges/`（Synapse Layer，非 Neural Computation Layer）。

**嚴重程度**: HIGH · **狀態**: RESOLVED · **關聯規則**: D21-F

### 驗證來源

- `src/features/semantic-graph.slice/graph/edges/context-attention.ts`

---

## TD-007 · D21-D — `vector-store.ts` 缺失（關聯 ISSUE-006）

**關閉日期**: 2026-03-09
**關閉原因**: RESOLVED
**關閉備注**: `vector-store.ts` 實作完整 `VectorStore` 類別，提供 `storeEmbedding()`、`getEmbedding()`、`hasEmbedding()`、`computeCosineSimilarity()`、`getAll()`、`deleteEmbedding()`，並導出 `vectorStore` 模組單例，符合 [D21-D][D24]。已移至 `core/embeddings/`。

**嚴重程度**: MEDIUM · **狀態**: RESOLVED · **關聯規則**: D21-D

### 驗證來源

- `src/features/semantic-graph.slice/core/embeddings/vector-store.ts`

---

*最後更新: 2026-03-09 | 維護者: Copilot（TD-001~007 批次解決後歸檔）*
