# 基礎設施映射（Infrastructure Mapping）

本檔是路徑與 Adapter 對照 SSOT。  
流程看 `01`，規則正文看 `02`，拓撲裁決看 `00`。

## VS 對照

| VS | 名稱 | 目標路徑 |
|---|---|---|
| `VS0-Kernel` | Foundation Contracts | `src/shared-kernel/*` |
| `VS0-Infra` | Foundation Execution | `src/shared-infra/*` |
| `VS1` | Identity | `src/features/identity.slice` |
| `VS2` | Account | `src/features/account.slice` |
| `VS3` | Skill XP | `src/features/skill-xp.slice` |
| `VS4` | Organization | `src/features/organization.slice` |
| `VS5` | Workspace | `src/features/workspace.slice` |
| `VS6` | Scheduling | `src/features/workforce-scheduling.slice` |
| `VS7` | Notification Hub | `src/features/notification-hub.slice` |
| `VS8` | 語義智慧匹配架構（SIMA） | `src/features/semantic-graph.slice` — 架構：[`architecture.md`](03-Slices/VS8-SemanticBrain/architecture.md) · [架構圖](03-Slices/VS8-SemanticBrain/architecture-diagrams.md) |
| `VS9` | Finance | `src/features/finance.slice` |

Auxiliary slices（非 VS 編號）：

| Slice | 角色 | 目標路徑 |
|---|---|---|
| `global-search.slice` | Cross-domain search authority | `src/features/global-search.slice` |
| `portal.slice` | Portal shell state bridge | `src/features/portal.slice` |

## Layer 對照

| Layer | 職責 | 路徑 |
|---|---|---|
| `L0` | External triggers | `src/shared-infra/external-triggers/` |
| `L0A` | API ingress | `src/shared-infra/api-gateway/` |
| `L1` | contracts/constants/pure | `src/shared-kernel/` |
| `L2` | command gateway | `src/shared-infra/gateway-command/` |
| `L3` | domain slices | `src/features/*` |
| `L4` | IER + relay + DLQ | `src/shared-infra/{event-router,outbox-relay,dlq-manager}/` |
| `L5` | projection bus | `src/shared-infra/projection-bus/` |
| `L6` | query gateway | `src/shared-infra/gateway-query/` |
| `L7-A` | firebase-client adapters | `src/shared-infra/firebase-client/` |
| `L7-B` | functions/admin adapters | `src/shared-infra/firebase-admin/functions/` |
| `L8` | firebase runtime | external platform |
| `L9` | observability | `src/shared-infra/observability/` |
| `L10` | AI runtime | `src/shared-infra/ai-orchestration/` |

## 標準結構（最小）

- `src/shared-kernel/`
- `src/shared-infra/api-gateway/`
- `src/shared-infra/gateway-command/`
- `src/shared-infra/event-router/`
- `src/shared-infra/projection-bus/`
- `src/shared-infra/gateway-query/`
- `src/shared-infra/firebase-client/`
- `src/shared-infra/firebase-admin/{functions,dataconnect}/`
- `src/shared-infra/{observability,ai-orchestration}/`

## L4/L5/L6 重點清單

### L4（IER）

- Lane：`CRITICAL` / `STANDARD` / `BACKGROUND`
- DLQ：`SAFE_AUTO` / `REVIEW_REQUIRED` / `SECURITY_BLOCK`
- `D30`：hop-limit 防循環，SECURITY_BLOCK 禁止自動 replay

### L5（Projection）

- Critical：`workspace-scope-guard-view`、`org-eligible-member-view`、`acl-projection`
- Standard：`workspace-view`、`tasks-view`、`tag-snapshot`、`task-semantic-view`
- Memory/Feedback：`memory-snippet-view`、`feedback-pattern-view`、`memory-quality-view`
- Finance：`finance-staging-pool`、`task-finance-label-view`

### L6（Query）

- 只暴露 read models，不直接查 Aggregate。
- `D31`：所有讀權限過濾依賴 `acl-projection`。

## L7 Firebase Adapter 索引（精簡）

### L7-A（client）

- `AuthAdapter`
- `FirestoreAdapter`
- `FCMAdapter`
- `StorageAdapter`
- `RTDBAdapter`
- `AnalyticsAdapter`
- `AppCheckAdapter`
- `VisDataAdapter`

### L7-B（functions/admin）

- `FunctionsGateway`
- `AdminAuthAdapter`
- `AdminFirestoreAdapter`
- `AdminMessagingAdapter`
- `AdminStorageAdapter`
- `AdminAppCheckAdapter`
- `DataConnectGatewayAdapter`

約束：`firebase-admin` 只允許於 functions 容器（`D25`）。

## AI 控制面（L10）

- Flow Gateway
- Prompt Policy
- Tool ACL
- AI Storage

約束：`E8` 生效時，AI flow 不可直連 `firebase/*`、不可跨租戶。

## 遷移策略（四階段）

1. 收斂 canonical path（停止新增 legacy 落點）。
2. 導入 adapter/port 合規檢查（D24/D25/D31）。
3. 收斂 projection 與 query 命名（L5/L6 一致）。
4. 以 `99-checklist.md` 做 PR gate。

## VS8 語義智慧匹配架構基礎設施映射

VS8 = 語義智慧匹配架構（SIMA），透過三大支柱與三個 Genkit AI 工具解決人力資源複雜分派問題。詳細設計見 [`03-Slices/VS8-SemanticBrain/architecture.md`](03-Slices/VS8-SemanticBrain/architecture.md)。

### 三大支柱基礎設施對應

| 支柱 | 角色隱喻 | Genkit 工具 | 資料集合（Firestore） | 模組路徑 |
|------|---------|------------|----------------------|---------|
| **支柱一：知識圖譜** | 🧠 邏輯大腦 | `verify_compliance` | `employees`（certifications 欄位比對） | `_types.ts`、`_actions.ts`、`genkit-tools/verify-compliance.tool.ts` |
| **支柱二：向量數據庫** | 💾 記憶模塊 | `match_candidates` | `employees`（skillEmbedding 向量索引）、`tasks`（requirementsEmbedding） | `_services.ts`、`_queries.ts`、`genkit-tools/match-candidates.tool.ts` |
| **支柱三：技能本體論** | 📖 語言定義 | `search_skills` | `skills`（embedding 向量索引 + taxonomyPath） | `_semantic-authority.ts`、`_aggregate.ts`、`genkit-tools/search-skills.tool.ts` |

### Firestore 集合與向量索引

| 集合 | 向量欄位 | 向量索引 | 用途 |
|------|---------|---------|------|
| `skills` | `embedding`（768 維） | ✅ 需建立 | `search_skills` 語義搜尋 |
| `employees` | `skillEmbedding`（768 維） | ✅ 需建立 | `match_candidates` 候選人匹配 |
| `tasks` | `requirementsEmbedding`（768 維） | ✅ 需建立 | 任務需求語義化 |

> Schema 詳細定義（TypeScript Interface）：`src/features/semantic-graph.slice/_schema.ts` → 見 [`architecture-build.md` Phase 1](03-Slices/VS8-SemanticBrain/architecture-build.md)

### VS8 模組 → Layer 映射

| 模組 | Layer | 角色 |
|------|-------|------|
| `_actions.ts` | L3 → L4 (outbox) | Tag / 圖譜邊寫入命令 [D3] |
| `_services.ts` | L3 (internal) | 向量索引管理 [VD-1] |
| `_queries.ts` | L3 → L6 (via global-search) | QGWAY_SEARCH 讀出埠 [D4] [VD-2] |
| `_semantic-authority.ts` | L1 (constants) | 分類法常數；被 L3/L6 消費 [OT-1] |
| `_aggregate.ts` | L3 (pure domain) | 時序衝突 + 分類法驗證 [OT-2] |
| `_bus.ts` | L3 → L5 (events) | Tag 生命週期事件匯流排 [T1] |
| `_cost-classifier.ts` | L3 (pure) | 成本語義分類（被 VS5 消費） [D27] |
| `genkit-tools/` | L10 (AI Tools) | 三工具分派引擎（`defineTool` 宣告）[GT-1] |
| `_dispatch-flow.ts` | L10 (AI Flow) | Genkit Flow；合規優先系統提示詞 [GT-2] |
| `_schema.ts` | L1 (type contracts) | Firestore 集合 TypeScript Interface |
| `projections/` | L5 → L6 | 語義投影讀取（Tag 快照；圖譜選擇器暫緩） |
| `outbox/` | L3 → L4 | 拓撲異動外送廣播 |
| `subscribers/` | L5 → L3 | 接收 TagLifecycleEvent 訂閱廣播 |

### VS8 外部依賴與接口

| 消費方向 | 接口 | 規則 |
|---------|------|------|
| VS8 → `shared-kernel` | `TAXONOMY_DIMENSIONS`、`CentralizedTagEntry`（型別合約） | [D19] 合約在 SK，邏輯在 VS8 |
| VS8 → `shared-infra/projection-bus` | `publishTagEvent` → `_tag-funnel.ts` | [T1] 事件匯流排出口 |
| VS8 → Firebase Firestore (L7-A) | 透過 SK_PORTS 讀寫 Tag 文件；Vector Search | [D24] 禁止直連 SDK |
| VS8 → Vertex AI (`text-embedding-004`) | 嵌入向量生成（透過 Genkit plugin） | [D24] via port；768 維 |
| `global-search.slice` → VS8 | `querySemanticIndex` / `SEARCH_DOMAINS` | [VD-2] 唯一讀出埠 |
| `workspace.slice` → VS8 | `classifyCostItem` / `classifyParserLineItem` | [D27] 成本語義 |
| `finance.slice` → VS8 | 成本分類器型別 | [D27] |
| Genkit AI Agent → VS8 | `searchSkillsTool`、`matchCandidatesTool`、`verifyComplianceTool` | [GT-1] via `defineTool` |
