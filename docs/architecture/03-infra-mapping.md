# 基礎設施視圖 (Infrastructure View)

> **原始檔（Source of Truth）**：完整 Mermaid 源碼與所有規則定義請見 [`00-logic-overview.md`](./00-logic-overview.md)
>
> 邏輯流圖請見 [`01-logical-flow.md`](./01-logical-flow.md) · 治理規則請見 [`02-governance-rules.md`](./02-governance-rules.md)

本視圖提供 **VS0–VS9 路徑對照表、標準目錄結構、L7 Firebase Adapter 索引（決策矩陣請見 [`01-logical-flow.md §Firebase 路由決策`](./01-logical-flow.md#firebase-路由決策l7-a-firebase-client-sdk-vs-l7-b-functionsfirebase-admin)）、AI 平台控制面** 與 **L9 可觀測性藍圖**，
供落地實作與基礎設施對接時快速定位目標路徑。

---

## VS0–VS9 路徑對照表（Path Map）

### 垂直域索引（VS0–VS9）

| 編號 | 名稱 | 說明 |
|------|------|------|
| `VS0` | Foundation | SharedKernel + SharedInfra（基礎層） |
| `VS1` | Identity | 身份認證與授權 |
| `VS2` | Account | 帳戶與個人資料 |
| `VS3` | Skill XP | 技能 XP 與分級 |
| `VS4` | Organization | 組織管理 |
| `VS5` | Workspace | 工作空間與任務 |
| `VS6` | Workforce Scheduling | 排班與職能配對 |
| `VS7` | Notification Hub | 通知中樞（唯一副作用出口） |
| `VS8` | Semantic Memory & Feedback Brain | 語義治理 + 記憶檢索 + 回饋閉環（保留四層邊界） |
| `VS9` | Finance | 金融聚合閘道（Finance Staging Pool + Finance_Request） |

### 目標路徑（Source Path）

```
VS0 = src/shared-kernel/* + src/shared-kernel/observability
    + src/shared-infra/frontend-firebase/*
    + src/shared-infra/backend-firebase/*
    + src/shared-infra/observability
VS1 = src/features/identity.slice
VS2 = src/features/account.slice
VS3 = src/features/skill-xp.slice
VS4 = src/features/organization.slice
VS5 = src/features/workspace.slice
VS6 = src/features/workforce-scheduling.slice
VS7 = src/features/notification-hub.slice
VS8 = src/features/semantic-graph.slice
VS9 = src/features/finance.slice
```

### VS0 細分規則

| 標記 | 說明 |
|------|------|
| `VS0-Kernel` | `src/shared-kernel/*`：契約 / 常數 / 純函式（No I/O） → Layer L1 |
| `VS0-Infra` | `src/shared-infra/*`：執行層 → L0 / L2 / L4 / L5 / L6 / L7 / L9 / L10（L3 = VS1–VS8 Feature Slices，非 VS0-Infra 管轄；L8 = Firebase 外部平台，不在 codebase 管控範圍） |

> **規則**：VS0-Kernel 與 VS0-Infra 必須明確區分，不得混稱；檢核時必須標明 `VS0-Kernel` 或 `VS0-Infra`。

### 水平層位索引（L0–L10）

| Layer | 名稱 | 職責 | 路徑前綴 |
|-------|------|------|----------|
| `L0` | External Triggers | 外部觸發入口（HTTP/WebSocket/Schedule/Webhook/AI） | `src/shared-infra/gateway-*` / `src/app/api/` |
| `L0A` | CQRS Gateway 入口（讀寫分流） | `CMD_API_GW`（write-only ingress）→ L2 Write Path ／ `QRY_API_GW`（read-only ingress）→ L6 Read Path；`UNIFIED_GW` 讀寫分離統一閘道的入口 | `src/shared-infra/api-gateway/` |
| `L1` | Shared Kernel | 契約/常數/純函式（No I/O, No Side Effects） | `src/shared-kernel/` |
| `L2` | Command Gateway（Write Path） | CBG_ENTRY（TraceID 注入唯一點）/ CBG_AUTH / CBG_ROUTE；`UNIFIED_GW.CQRS_WRITE` Write Pipeline | `src/shared-infra/gateway-command/` |
| `L3` | Domain Slices | VS1–VS9 業務切片（Aggregate / Application / Repository） | `src/features/*/` |
| `L4` | IER（Integration Event Router） | 統一事件出口（三條 Lane） | `src/shared-infra/event-router/` |
| `L5` | Projection Bus | 投影物化（event-funnel 唯一寫路徑） | `src/shared-infra/projection-bus/` |
| `L6` | Query Gateway（Read Path） | 統一讀取出口（read-model-registry）；`UNIFIED_GW.CQRS_READ` Read Routes | `src/shared-infra/gateway-query/` |
| `L7-A` | firebase-client SDK（FIREBASE_ACL） | Client SDK Anti-Corruption Adapters（AuthAdapter / FirestoreAdapter / FCMAdapter / StorageAdapter / RTDBAdapter / AnalyticsAdapter / AppCheckAdapter）；Feature slice → L1 SK_PORTS → L7-A [D24] | `src/shared-infra/frontend-firebase/` |
| `L7-B` | firebase-admin SDK（Cloud Functions） | Admin SDK 唯一容器；Admin 權限 / 跨租戶 / Trigger / Scheduler / Webhook 驗簽；**`firebase-admin` 一律透過 functions**；禁止在 Next.js server/edge/Server Actions 直接使用 [D25] | `src/shared-infra/backend-firebase/functions/` |
| `L8` | Firebase Runtime | 外部 Firebase 平台（不在 codebase 管控範圍） | — |
| `L9` | Observability | 跨切面觀測（metrics/trace/errors）；observe-only，禁止產生 mutation | `src/shared-infra/observability/` |
| `L10` | AI Runtime & Orchestration | Genkit Flow Gateway / Prompt Policy / Tool ACL [E8] | `src/shared-infra/ai-orchestration/` |

---

## 標準目錄結構（Standard Directory Structure）

本視圖僅保留「路徑權威與邊界」；詳細模板以 `00-logic-overview.md` 標準目錄段落為準。最小必備分層如下：

- `src/features/{slice}`：L3 業務切片，公開 API 經 `index.ts`。
- `src/shared-kernel`：L1 契約/常數/純函式（No I/O）。
- `src/shared-infra/{api-gateway,gateway-command,event-router,projection-bus,gateway-query}`：L0A/L2/L4/L5/L6 執行路徑。
- `src/shared-infra/frontend-firebase`：L7-A firebase-client Adapter。
- `src/shared-infra/backend-firebase/{functions,dataconnect}`：L7-B backend 邊界（含 firebase-admin 唯一容器）。
- `src/shared-infra/{observability,ai-orchestration}`：L9/L10 橫切能力。

---

> **CQRS Gateway（讀寫分離統一閘道）**：L0A 入口（`CMD_API_GW` / `QRY_API_GW`）、L2 Command Gateway（CBG_ENTRY/CBG_AUTH/CBG_ROUTE）、L6 Query Gateway（QGWAY + routes）三者在圖中合一為 `UNIFIED_GW`，以讀寫分離為唯一切割線。詳見 [`01-logical-flow.md §三條主鏈`](./01-logical-flow.md)
>
> **L2 Command Gateway 邊界規則**（可下沉 L1 元件 / MUST stay at L2 / D8・D10 禁止）→ [`02-governance-rules.md §L2 Command Gateway 邊界規則`](./02-governance-rules.md#l2-command-gateway-邊界規則d8--d10-附則)
>
> **[D29] Transactional Outbox Pattern**：`CBG_ROUTE` 提供 `TransactionalCommand` 基類；所有 VS 切片的 Command Handler 必須在同一 Firestore Transaction 中完成 Aggregate 寫入 + `{slice}/_outbox` 寫入。禁止在 Transaction 外部以雙步驟執行。

---

## L4 IER 三條 Lane 與 DLQ 分級

### Lane 路由規則

| Lane | 消費場景 | 處理器 | 特性 |
|------|----------|--------|------|
| `CRITICAL_LANE` | RoleChanged / PolicyChanged / Security events / **TaskAcceptedConfirmed [#A19]** | CLAIMS_HANDLER / **finance-staging.acl [#A20]** | 即時，不批次；完成 S6 `SK_TOKEN_REFRESH_CONTRACT`；TaskAcceptedConfirmed → Finance Staging Pool 金融事實低延遲 |
| `STANDARD_LANE` | Domain events / Projections / Notifications / **FinanceRequestStatusChanged [#A22]** | STANDARD_PROJ + VS7 notification-router / **task-finance-label-view** | Eventual consistency |
| `BACKGROUND_LANE` | Analytics / TagLifecycleEvent / Observability | — | Best-effort |

### DLQ 分級（S1 合規要求）

| DLQ 分級 | 適用場景 | 恢復策略 |
|----------|----------|----------|
| `SAFE_AUTO` | 冪等操作（通知投遞失敗等） | 自動 retry backoff |
| `REVIEW_REQUIRED` | 財務 / 排班 / 角色變更 / **Finance_Request 事件 [#A21]** | 人工審查後手動 replay |
| `SECURITY_BLOCK` | 安全事件（RoleChanged / PolicyChanged）/ CircularDependencyDetected [D30] | 凍結 + 警報，禁止自動 replay |

### Outbox relay-worker CDC 鏈路

```
Firestore onSnapshot (CDC)
  → outbox-relay-worker [R9: 驗證 traceId 必帶；AsyncLocalStorage 傳遞上下文]
    → L4 IER Lane Router [D30: hopCount++ → ≥4 → SECURITY_BLOCK + CircularDependencyDetected]
      → [CRITICAL / STANDARD / BACKGROUND]
        → Projectors / Handlers / Subscribers
          → failure: retry backoff → 3 次失敗 → DLQ
          → relay_lag → L9 Observability [R1]
```

---

## L5 Projection Bus SLA

### Critical Projections（PROJ_STALE_CRITICAL ≤ 500ms）[S4]

| Projection | 相關不變量 |
|------------|------------|
| `workspace-scope-guard-view` | [A9] |
| `org-eligible-member-view`（含 `skills{tagSlug→xp}` / eligible） | [#14 #15 #16] |
| `wallet-balance`（display 用 EVENTUAL_READ） | [S3 A1] |
| `acl-projection`（讀取路徑權限鏡像）[D31] | CBG_AUTH 權限變更 → L5 同步更新；QRY_API_GW 自動 JOIN 過濾 |

### Standard Projections（PROJ_STALE_STANDARD ≤ 10s）[S4]

| Projection | 說明 |
|------------|------|
| `workspace-view` | 工作空間概覽 |
| `tasks-view` | 任務清單（按 `createdAt` 批次間 → `sourceIntentIndex` 批次內排序）[D27-Order] |
| `account-schedule` | 帳戶排班快照 |
| `schedule-calendar-view` | 日曆視圖 |
| `schedule-timeline-view` | 時間軸視圖（overlap/grouping 在 L5 預計算） |
| `account-view` | 帳戶資料（含 FCM Token）[#6] |
| `organization-view` | 組織資料 |
| `account-skill-view` | 技能視圖 [S2] |
| `global-audit-view` | 全域審計（含 traceId [R8]） |
| `tag-snapshot` | 語義標籤快照（TAG_MAX_STALENESS T5，禁止直接寫入） |
| `semantic-governance-view` | 語義治理頁讀模型（提案 / 共識 / 關係）；治理頁顯示必經 L5 投影 |
| `memory-snippet-view` | 解析前可檢索記憶片段（semanticTagSlug / org / workspace） |
| `feedback-pattern-view` | 人工修正模式聚合（高頻修正 / 覆寫建議） |
| `memory-quality-view` | 記憶品質與採納率指標（供 L9 治理觀測） |
| `workspace-graph-view` | 任務依賴 Nodes/Edges 拓撲；供 vis-network 消費 [D28] |
| `task-semantic-view` | 任務語義視圖 [O3]；同時包含 `required_skills`（Graph REQUIRES 邊）與 `eligible_persons`（skill-matcher 推理）；兩者缺一則投影不完整 |
| `causal-audit-log` | 因果審計日誌 [O4]；每條記錄必含 `inferenceTrace[]` + `traceId`（從 event-envelope 讀取，禁止重新生成）|
| `finance-staging-pool` | 待請款池：已驗收未請款任務清單；消費 `TaskAcceptedConfirmed`（CRITICAL_LANE）；狀態：`PENDING` ｜ `LOCKED_BY_FINANCE` [#A20] |
| `task-finance-label-view` | 任務金融顯示標籤；消費 `FinanceRequestStatusChanged`（STANDARD_LANE）；欄位：taskId, financeStatus, requestId, requestLabel [#A22] |

> **規則**：`getTier(xp) → Tier` 是純函式 [#12]；Tier 是推導值，永遠不存 DB。

### L5 Worker Pool 分流（Dynamic Backpressure）[P8]

> L5 `FUNNEL` 依 `priorityLane` 分配 Worker Pool Quota；對同一 `docId` 的高密度投影進行 Debounce/Batching，100ms 內合併為 1 次寫入。

| priorityLane | Worker Pool | Debounce |
|---|---|---|
| `CRITICAL_LANE` | 高配額（Critical 不批次） | 禁用（即時寫入） |
| `STANDARD_LANE` | 中配額 | 100ms 同 doc Batching |
| `BACKGROUND_LANE` | 低配額 | 100ms 同 doc Batching |

> **規則**：Worker Pool 配額邊界必須引用 `SK_STALENESS_CONTRACT` SLA 常數，禁止硬寫數字 [P8 S4]。

---

## L6 Query Gateway 路由清單

> **範圍說明**：以下為具有特定治理規則的**命名路由**（Governance-Named Routes），非 L6 全量路由清單。
> 其餘 L5 Projection 透過 `READ_REG` 版本目錄在 Query Gateway 均可一般性存取，無需獨立條目。

| 路由 | 說明 | 合規要求 |
|------|------|----------|
| `org-eligible-member-view` | 排班/組織成員快照 | [#14 #15 #16] |
| `schedule-calendar-view` | 日曆視圖（UI 禁止直讀 VS6/Firebase） | [D27 L6-Gateway] |
| `schedule-timeline-view` | 時間軸視圖（overlap/grouping 預計算） | [D27 Timeline] |
| `account-view` | 帳戶資料（含 FCM Token）；`notification-feed-view` RTDB 即時通知串流（via L7-A RTDBAdapter） | [#6] |
| `workspace-scope-guard-view` | Scope Guard 快路徑 | [A9] |
| `wallet-balance` | display → Projection；precise → STRONG_READ | [S3 A1] |
| `tag-snapshot` | 語義化索引檢索；禁止消費方直寫 | [D21-7 T5 O2] |
| `semantic-governance-view` | 語義治理頁讀模型（提案 / 共識 / 關係）；治理頁顯示必經 L6 Query Gateway 暴露 | [D21-7 T5] |
| `memory-snippet-view` | 解析前可檢索記憶片段；L10 pre-parse retrieval 唯一讀模型來源之一 | [D21-MF1] |
| `feedback-pattern-view` | 人工修正模式聚合；L10 post-parse calibration 唯一讀模型來源之一 | [D21-MF1 D21-MF2] |
| `memory-quality-view` | 記憶採納率/誤判率/信心校準指標 | [D21-MF3] |
| `workspace-graph-view` | 任務依賴 Nodes/Edges 拓撲；L6 暴露後由 VisDataAdapter [D28] 快取至 vis-network DataSet<> | [D28] |
| `task-semantic-view` | 任務語義視圖（required_skills + eligible_persons）；VS5 消費以顯示任務語義資訊；投影不完整時禁止對外提供 | [O3] |
| `causal-audit-log` | 因果審計日誌（inferenceTrace[] + traceId）；合規稽核路徑 | [O4 R8] |
| `acl-projection` | 讀取路徑權限鏡像；QRY_API_GW 讀取自動 JOIN 過濾（禁止讀路徑重新執行 Aggregate 鑑權）| [D31] |
| `finance-staging-pool` | 待請款池（已驗收未請款任務清單）；財務人員操作界面消費此路由 | [#A20] |
| `task-finance-label-view` | 任務金融顯示標籤（financeStatus, requestId, requestLabel）；任務列表 UI 合成顯示金融狀態 | [#A22] |

> **Global Search** 亦透過 Query Gateway 消費 `tag-snapshot` → VS8 semantic index [#A12]
>
> **VS8 提供**：scheduling combo matching→VS6, task semantic tags→VS5, classifyCostItem→document-parser, memory/feedback hints→L10

---

## L7 Firebase ACL Adapters（FIREBASE_ACL）

> Firebase SDK 唯一合法呼叫層 [D24 D25]
>
> **三層分離原則**：
> - **L7-A `firebase-client` SDK**（瀏覽器/Next.js client context）→ `frontend-firebase/` Client Adapters
> - **L7-B `firebase-admin` SDK**（Admin 特權 API）→ L7-B 後端 Adapters
> - **`functions`（Cloud Functions）→ `firebase-admin` 一律透過 functions** [D25]
>
> **路由決策矩陣**（何時用 L7-A vs L7-B）→ [`01-logical-flow.md §Firebase 路由決策`](./01-logical-flow.md#firebase-路由決策l7-a-firebase-client-sdk-vs-l7-b-functionsfirebase-admin)

### L7-A 前端 Client SDK Adapters（firebase client SDK · `src/shared-infra/frontend-firebase/`）

| Adapter | 實作介面 | 路徑 | 說明 |
|---------|----------|------|------|
| `AuthAdapter` | `IAuthService` | `.../auth/` | sole `firebase/auth` 呼叫點 |
| `FirestoreAdapter` | `IFirestoreRepo` [S2] | `.../firestore/` | sole `firebase/firestore` 呼叫點；enforces aggregateVersion |
| `FCMAdapter` | `IMessaging` [R8] | `.../messaging/` | sole `firebase/messaging` 呼叫點（Client context 推播；Server-side 推播改用 AdminMessagingAdapter）；adds traceId to FCM metadata |
| `StorageAdapter` | `IFileStore` | `.../storage/` | sole `firebase/storage` 呼叫點 |
| `RTDBAdapter` | — | `.../realtime-database/` | 即時通訊用；禁止承載領域寫入 [D25] |
| `AnalyticsAdapter` | — | `.../analytics/` | 遙測寫入；禁止承載領域寫入 [D25] |
| `AppCheckAdapter` | — | `.../app-check/` | Client attestation token 初始化/續期；未通過不得進入 L2/L3 [D24 D25 E7] |
| `VisDataAdapter` | — | `.../vis-data/` | DataSet<Node\|Edge\|DataItem> 本地快取；訂閱 Firebase Snapshot 一次，推播給所有 vis-* 消費者 [D28] |

### L7-B 後端 Admin SDK Adapters（firebase-admin SDK — 一律透過 Cloud Functions）[D25]

> **firebase-admin 一律透過 functions**：Admin SDK 只在 `src/shared-infra/backend-firebase/functions` 內初始化與執行。禁止在 Next.js Server Components / Server Actions / Edge Functions 中直接 import `firebase-admin`（[D25]）。

| Adapter | 實作介面 | 路徑 | 說明 |
|---------|----------|------|------|
| `FunctionsGateway` | — | `src/shared-infra/backend-firebase/functions/src/gateway/` | HTTP/Callable 入口；Admin SDK 初始化容器 |
| `AdminAuthAdapter` | `IAuthService`（BE） | `.../functions/src/claims/` | sole `firebase-admin/auth` 呼叫點（自訂 Claims）|
| `AdminFirestoreAdapter` | `IFirestoreRepo`（BE） | `.../functions/src/relay/` 與 `.../projection/` | sole `firebase-admin/firestore` 呼叫點（強一致寫入/跨集合 TX）|
| `AdminMessagingAdapter` | `IMessaging`（BE） | `.../functions/src/` | sole `firebase-admin/messaging` 呼叫點（Server-side FCM 主要通道）|
| `AdminStorageAdapter` | `IFileStore`（BE） | `.../functions/src/document-ai/` | sole `firebase-admin/storage` 呼叫點（後端簽署 URL / 跨租戶操作）|
| `AdminAppCheckAdapter` | — | `.../functions/src/` | sole `firebase-admin/app-check` 呼叫點（服務端 App Check token 驗簽）[D25 E7] |
| `DataConnectGatewayAdapter` | — | `src/shared-infra/backend-firebase/dataconnect/` | 受治理 GraphQL schema/connector；sole `firebase/data-connect` 呼叫點 |

---

## AI 平台控制面（AI Platform Control Plane · L10）

| 元件 | 說明 | 規則 |
|------|------|------|
| `Genkit Flow Gateway` | 統一 AI flow 入口，驗證 role/scope/tenant | [E8] |
| `Prompt Policy` | 提示詞治理與版本管理 | [E8] |
| `Tool ACL` | tool calling 前須完成 role/scope/tenant 驗證 + 審計追蹤（traceId/toolCallId/modelId） | [E8 MUST] |
| `AI Storage` | AI 模型/向量存儲，必須由 Genkit gateway 代理訪問 | [E8 MUST] |

**嚴格禁止**：

- AI flow 禁止直接呼叫 `firebase/*` [E8 FORBIDDEN]
- AI flow 禁止跨租戶讀寫 [E8 FORBIDDEN]

---

## L9 可觀測性藍圖（L9 Observability Blueprint）

> L9 **observe-only**：僅記錄觀測資料，禁止產生 mutation 或觸發業務事件

### 觀測維度

| 維度 | 指標 | 規則 |
|------|------|------|
| `trace-identifier` | CBG_ENTRY 注入的 traceId，全鏈唯讀傳遞 | [R8] |
| `relay_lag` | OUTBOX relay 延遲時間 | [R1] |
| `FUNNEL processing time` | 每個 Projection lane 的處理時間 | [S4] |
| `RATE_LIM hits` | Rate limit 命中次數（按 user+org） | [S5] |
| `CIRCUIT state` | Circuit breaker 狀態（consecutive 5xx） | [S5] |
| `domain-metrics` | IER Lane 吞吐量/延遲，DLQ 事件 | [R5] |
| `DOMAIN_ERRORS` | DLQ 事件 / failed relay / circuit-open / CircularDependencyDetected [D30] | [R5] |
| `hopCount-alerts` | L4 IER 循環依賴偵測（hopCount ≥ 4）告警事件 | [D30] |
| `context-propagation-miss` | outbox-relay-worker 缺少 traceId 的投遞拒絕事件 | [R9] |
| `findIsolatedNodes` | VS8 拓撲健康探針，孤立節點寫入 L9 | [D21-10 T7] |
| `global-audit-view` | 全域審計日誌（含 traceId） | [R8] |

---

## 落地採納清單（Optimization Adoption）

### 已啟用

- [x] `getTier()` 純函式 [D12 #12]
- [x] `SK_VERSION_GUARD`（aggregateVersion 單調遞增保護）[S2]
- [x] `SK_STALENESS_CONTRACT` 常數引用 [S4]
- [x] L7 FIREBASE_ACL Adapters [D24 D25]
- [x] L4 IER 三條 Lane + DLQ 分級 [S1]

### 待遷移（Migration Target）

> **遷移原則**：所有待遷移項目以**架構正確性優先原則**為最高指引。遷移是**結構性修正（Structural Correction）**，而非補丁式修補。G/C/E/O/B 規則落地是消除 VS8 P1-P10 架構缺陷的正式規範實作，遵循奧卡姆剃刀：正確的抽象與職責邊界，而非最少實作。

- [ ] D24 違規：43 個檔案仍直接 import `firebase/*` → 須遷移至 FIREBASE_ACL Adapter
- [ ] VS8 Memory & Feedback MVP：`memory-snippet-view` / `feedback-pattern-view` / `memory-quality-view` 三投影上線 [D21-MF1~3]
- [ ] `feedback-outbox` + IER 路徑完成（人工修正事件化，禁止 UI 直寫規則）[D21-MF2 O1]
- [ ] L10 pre-parse retrieval 僅走 L6 讀模型（禁止直讀 VS8 內部）[D21-MF1 T5]
- [ ] D21-MF1~MF3 合規檢核加入 PR Gate
- [ ] VS8 Semantic Graph Compute Engine（四層語義引擎正式落地）[D21]
- [ ] VS8 G/C/E/O/B 正規規則落地：skill-matcher、ISemanticClassificationPort、ISkillMatchPort、ISemanticFeedbackPort Port 介面實作 [O1 E4 E7]
- [ ] VS8 projection.task-semantic-view 實作：required_skills（REQUIRES 邊）+ eligible_persons（skill-matcher）[O3]
- [ ] VS8 projection.causal-audit-log 實作：每條記錄含 inferenceTrace[] + traceId [O4 E6 R8]
- [ ] VS8 SemanticRouteHint contract 實作：routing-engine 只輸出 hint；禁止持有副作用 [E11]
- [ ] VS8 inferenceTrace[] 強制輸出：cost-item-classifier 三步推理全程可審計 [E5 E6]
- [ ] VS8 learning-engine ISemanticFeedbackPort 強制邊界：只接受 VS3/VS5 事實事件 [E9]
- [ ] VS8 invariant-guard G3 規則落地：COMPLIANCE TaskNode 必須有 cert_required Skill [G3]
- [ ] VS8 staleness-monitor 引用 SK_STALENESS_CONTRACT [G6 S4]
- [ ] VS8 B3 邊界驗證：AI Flow (L10 Genkit) 只透過 ISemanticClassificationPort / ISkillMatchPort 存取 VS8；禁止直呼內部模組 [B3 O1]
- [ ] VS8 B4 認識論分離：IS_A 分類學（本體論）與向量縮範（認識論工具）各自獨立，禁止以一者替代另一者 [B4 C11]
- [ ] VS8 B5 主體圖邊界：VS8 只推論因果鏈；因果物化、排班、通知副作用必須通過 IER+L5 承載 [B5 B1]
- [ ] VS4 org-semantic-registry（組織語義字典）[D21-1 A18]
- [ ] L10 AI Runtime（Genkit Flow Gateway / Tool ACL）[E8]
- [ ] App Check 全面啟用 [E7]
- [ ] L9 Observability（metrics/trace dashboard）[R1 R5 R8]
- [ ] Skill XP Award Contract 完整驗收 [A17]
- [ ] D28 Visualization Bus：`VisDataAdapter` DataSet<> 快取實作；vis-network/vis-timeline/vis-graph3d 消費層遷移 [D28]
- [ ] D29 Transactional Outbox：L2 `TransactionalCommand` 基類實作；所有 VS 切片 Command Handler 遷移至單一 Firestore TX [D29]
- [ ] D30 Hop Limit：`SK_ENV.hopCount` 欄位加入；L4 IER 實作 hopCount 遞增與臨界值攔截 [D30]
- [ ] P8 Dynamic Backpressure：L5 FUNNEL Worker Pool 分流 + Debounce/Batching 實作 [P8]
- [ ] D31 Permission Projection：`projection.acl-projection` 實作；L6 Query Gateway JOIN 過濾接入 [D31]
- [ ] R9 Context Propagation Middleware：AsyncLocalStorage 上下文傳遞實作；前端 `x-trace-id` 自動注入 [R9]
- [ ] VS5 Task Lifecycle Convergence：任務狀態機 IN_PROGRESS→PENDING_QUALITY→PENDING_ACCEPTANCE→ACCEPTED 落地；task-accepted-validator 實作；TaskAcceptedConfirmed 與狀態變更同一 Firestore TX [#A19 D29]
- [ ] VS9 Finance Slice：`src/features/finance.slice` 建立；Finance_Staging_Pool 實作；Finance_Request Aggregate（DRAFT→AUDITING→DISBURSING→PAID）落地 [#A21]
- [ ] VS9 finance-staging-pool Projection：消費 CRITICAL_LANE TaskAcceptedConfirmed；LOCKED_BY_FINANCE 鎖定邏輯 [#A20]
- [ ] VS9 task-finance-label-view Projection：消費 STANDARD_LANE FinanceRequestStatusChanged；逆向更新任務金融顯示標籤 [#A22]

---

> **跨切片強制規則**（VS6 / VS3 / 分層規則 / 出口規則）→ [`02-governance-rules.md §跨切片 RULESET-MUST`](./02-governance-rules.md#跨切片-ruleset-must分類整理)
