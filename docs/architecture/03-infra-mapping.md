# 基礎設施視圖 (Infrastructure View)

> **原始檔（Source of Truth）**：完整 Mermaid 源碼與所有規則定義請見 [`00-LogicOverview.md`](./00-LogicOverview.md)
>
> 邏輯流圖請見 [`01-logical-flow.md`](./01-logical-flow.md) · 治理規則請見 [`02-governance-rules.md`](./02-governance-rules.md)

本視圖提供 **VS0–VS8 路徑對照表、標準目錄結構、Firebase 決策矩陣、AI 平台控制面** 與 **L9 可觀測性藍圖**，
供落地實作與基礎設施對接時快速定位目標路徑。

---

## VS0–VS8 路徑對照表（Path Map）

### 垂直域索引（VS0–VS8）

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
| `VS8` | Semantic Graph Engine | 語義圖譜引擎 |

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
```

### VS0 細分規則

| 標記 | 說明 |
|------|------|
| `VS0-Kernel` | `src/shared-kernel/*`：契約 / 常數 / 純函式（No I/O） → Layer L1 |
| `VS0-Infra` | `src/shared-infra/*`：執行層 → L0 / L2 / L4 / L5 / L6 / L7 / L9 |

> **規則**：VS0-Kernel 與 VS0-Infra 必須明確區分，不得混稱；檢核時必須標明 `VS0-Kernel` 或 `VS0-Infra`。

### 水平層位索引（L0–L10）

| Layer | 名稱 | 職責 | 路徑前綴 |
|-------|------|------|----------|
| `L0` | External Triggers | 外部觸發入口（HTTP/WebSocket/Schedule/Webhook/AI） | `src/shared-infra/gateway-*` / `src/app/api/` |
| `L1` | Shared Kernel | 契約/常數/純函式（No I/O, No Side Effects） | `src/shared-kernel/` |
| `L2` | Command Gateway | CBG_ENTRY / CBG_AUTH / CBG_ROUTE（唯一 traceId 注入點） | `src/shared-infra/gateway-command/` |
| `L3` | Domain Slices | VS1–VS8 業務切片（Aggregate / Application / Repository） | `src/features/*/` |
| `L4` | IER（Integration Event Router） | 統一事件出口（三條 Lane） | `src/shared-infra/event-router/` |
| `L5` | Projection Bus | 投影物化（event-funnel 唯一寫路徑） | `src/shared-infra/projection-bus/` |
| `L6` | Query Gateway | 統一讀取出口（read-model-registry） | `src/shared-infra/gateway-query/` |
| `L7-A` | firebase-client SDK（FIREBASE_ACL） | Client SDK Anti-Corruption Adapters（AuthAdapter / FirestoreAdapter / FCMAdapter / StorageAdapter / RTDBAdapter / AnalyticsAdapter / AppCheckAdapter）；Feature slice → L1 SK_PORTS → L7-A [D24] | `src/shared-infra/frontend-firebase/` |
| `L7-B` | firebase-admin SDK（Cloud Functions） | Admin SDK 唯一容器；Admin 權限 / 跨租戶 / Trigger / Scheduler / Webhook 驗簽；**`firebase-admin` 一律透過 functions**；禁止在 Next.js server/edge/Server Actions 直接使用 [D25] | `src/shared-infra/backend-firebase/functions/` |
| `L8` | Firebase Runtime | 外部 Firebase 平台（不在 codebase 管控範圍） | — |
| `L9` | Observability | 跨切面觀測（metrics/trace/errors）；observe-only，禁止產生 mutation | `src/shared-infra/observability/` |
| `L10` | AI Runtime & Orchestration | Genkit Flow Gateway / Prompt Policy / Tool ACL [E8] | `src/shared-infra/ai-orchestration/` |

---

## 標準目錄結構（Standard Directory Structure）

### Feature Slice 標準結構

```
src/features/{slice}/
  index.ts                   # 公開 API（跨切片只能 import 此檔）
  _actions.ts                # 所有 mutation [D3]
  _queries.ts                # 所有 read [D4]
  core/                      # Aggregate + Domain Events + ValueObjects
    _aggregate.ts
    _domain-events.ts
  application/               # Use Cases / Application Services
    _use-cases.ts
  _components/               # UI 元件（"use client" 允許）
  _hooks/                    # React Hooks（"use client" 允許）
  _projector.ts              # Projection 投影器（引用 SK_VERSION_GUARD [S2]）
  _outbox.ts                 # OUTBOX 宣告（必須聲明 DLQ 分級 [S1]）
```

### Shared Kernel 結構

```
src/shared-kernel/
  skill-tier/                # getTier() 純函式 [D12]
  outbox-contract/           # SK_OUTBOX_CONTRACT [S1]
  version-guard/             # SK_VERSION_GUARD [S2]
  read-consistency/          # SK_READ_CONSISTENCY [S3]
  staleness-contract/        # SK_STALENESS_CONTRACT [S4]
  resilience-contract/       # SK_RESILIENCE_CONTRACT [S5]
  token-refresh-contract/    # SK_TOKEN_REFRESH_CONTRACT [S6]
  observability/             # trace-identifier types（注入點在 L2）
  ports/                     # SK_PORTS（IAuthService / IFirestoreRepo / IMessaging / IFileStore）
```

### Shared Infra 結構

```
src/shared-infra/
  gateway-command/           # L2 CBG_ENTRY + CBG_AUTH + CBG_ROUTE
  gateway-query/             # L6 read-model-registry
  event-router/              # L4 IER（outbox-relay-worker / lane-router / dlq）
  projection-bus/            # L5 event-funnel + projectors
  frontend-firebase/
    auth/                    # AuthAdapter（L7-A · firebase/auth）
    firestore/               # FirestoreAdapter（L7-A · firebase/firestore）
    realtime-database/       # RTDBAdapter（L7-A · firebase/database，即時通訊）
    messaging/               # FCMAdapter（L7-A · firebase/messaging · R8 traceId）
    storage/                 # StorageAdapter（L7-A · firebase/storage）
    analytics/               # AnalyticsAdapter（L7-A · firebase/analytics，遙測只寫）
    app-check/               # AppCheckAdapter（L7-A · firebase/app-check）
  backend-firebase/
    functions/               # Cloud Functions（firebase-admin 唯一容器）[D25]
      src/claims/            #   Admin Auth → firebase-admin/auth（自訂 Claims）
      src/gateway/           #   functions-gateway HTTP/Callable 入口
      src/ier/               #   IER 三條 Lane
      src/projection/        #   Projection Workers
      src/relay/             #   Outbox Relay Worker
      src/document-ai/       #   Document AI integration
    dataconnect/             # GraphQL 資料契約（受治理 GraphQL）[D25]
  observability/             # L9 metrics/trace/errors
  ai-orchestration/          # L10 Genkit Flow Gateway
```

---

> **L2 Command Gateway 邊界規則**（可下沉 L1 元件 / MUST stay at L2 / D8・D10 禁止）→ [`02-governance-rules.md §L2 Command Gateway 邊界規則`](./02-governance-rules.md#l2-command-gateway-邊界規則d8--d10-附則)

---

## L4 IER 三條 Lane 與 DLQ 分級

### Lane 路由規則

| Lane | 消費場景 | 處理器 | 特性 |
|------|----------|--------|------|
| `CRITICAL_LANE` | RoleChanged / PolicyChanged / Security events | CLAIMS_HANDLER | 即時，不批次；完成 S6 `SK_TOKEN_REFRESH_CONTRACT` |
| `STANDARD_LANE` | Domain events / Projections / Notifications | STANDARD_PROJ + VS7 notification-router | Eventual consistency |
| `BACKGROUND_LANE` | Analytics / TagLifecycleEvent / Observability | — | Best-effort |

### DLQ 分級（S1 合規要求）

| DLQ 分級 | 適用場景 | 恢復策略 |
|----------|----------|----------|
| `SAFE_AUTO` | 冪等操作（通知投遞失敗等） | 自動 retry backoff |
| `REVIEW_REQUIRED` | 財務 / 排班 / 角色變更 | 人工審查後手動 replay |
| `SECURITY_BLOCK` | 安全事件（RoleChanged / PolicyChanged） | 凍結 + 警報，禁止自動 replay |

### Outbox relay-worker CDC 鏈路

```
Firestore onSnapshot (CDC)
  → outbox-relay-worker
    → L4 IER Lane Router
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

### Standard Projections（PROJ_STALE_STANDARD ≤ 10s）[S4]

| Projection | 說明 |
|------------|------|
| `workspace-view` | 工作空間概覽 |
| `account-schedule` | 帳戶排班快照 |
| `schedule-calendar-view` | 日曆視圖 |
| `schedule-timeline-view` | 時間軸視圖（overlap/grouping 在 L5 預計算） |
| `account-view` | 帳戶資料（含 FCM Token）[#6] |
| `organization-view` | 組織資料 |
| `account-skill-view` | 技能視圖 [S2] |
| `global-audit-view` | 全域審計（含 traceId [R8]） |
| `tag-snapshot` | 語義標籤快照（TAG_MAX_STALENESS T5，禁止直接寫入） |

> **規則**：`getTier(xp) → Tier` 是純函式 [#12]；Tier 是推導值，永遠不存 DB。

---

## L6 Query Gateway 路由清單

| 路由 | 說明 | 合規要求 |
|------|------|----------|
| `org-eligible-member-view` | 排班/組織成員快照 | [#14 #15 #16] |
| `schedule-calendar-view` | 日曆視圖（UI 禁止直讀 VS6/Firebase） | [D27 L6-Gateway] |
| `schedule-timeline-view` | 時間軸視圖（overlap/grouping 預計算） | [D27 Timeline] |
| `account-view` | 帳戶資料（含 FCM Token） | [#6] |
| `workspace-scope-guard-view` | Scope Guard 快路徑 | [A9] |
| `wallet-balance` | display → Projection；precise → STRONG_READ | [S3 A1] |
| `tag-snapshot` | 語義化索引檢索；禁止消費方直寫 | [D21-7 T5] |

> **Global Search** 亦透過 Query Gateway 消費 `tag-snapshot` → VS8 semantic index [#A12]
>
> **VS8 提供**：scheduling combo matching→VS6, task semantic tags→VS5, classifyCostItem→document-parser

---

## L7 Firebase ACL Adapters（FIREBASE_ACL）

> Firebase SDK 唯一合法呼叫層 [D24 D25]
>
> **三層分離原則**：`firebase-client` SDK（瀏覽器/Next.js client context）→ L7-A 前端 Adapters ／ `firebase-admin` SDK（Admin 特權 API）→ L7-B 後端 Adapters ／ `functions`（Cloud Functions）→ firebase-admin 一律透過 functions [D25]

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

### L7-B 後端 Admin SDK Adapters（firebase-admin SDK — 一律透過 Cloud Functions）[D25]

> **firebase-admin 一律透過 functions**：Admin SDK 只在 `src/shared-infra/backend-firebase/functions` 內初始化與執行。禁止在 Next.js Server Components / Server Actions / Edge Functions 中直接 import `firebase-admin`（[D25]）。

| Adapter | 實作介面 | 路徑 | 說明 |
|---------|----------|------|------|
| `FunctionsGateway` | — | `src/shared-infra/backend-firebase/functions/src/gateway/` | HTTP/Callable 入口；Admin SDK 初始化容器 |
| `AdminAuthAdapter` | `IAuthService`（BE） | `.../functions/src/claims/` | sole `firebase-admin/auth` 呼叫點（自訂 Claims）|
| `AdminFirestoreAdapter` | `IFirestoreRepo`（BE） | `.../functions/src/relay/` 與 `.../projection/` | sole `firebase-admin/firestore` 呼叫點（強一致寫入/跨集合 TX）|
| `AdminMessagingAdapter` | `IMessaging`（BE） | `.../functions/src/` | sole `firebase-admin/messaging` 呼叫點（Server-side FCM 主要通道）|
| `AdminStorageAdapter` | `IFileStore`（BE） | `.../functions/src/document-ai/` | sole `firebase-admin/storage` 呼叫點（後端簽署 URL / 跨租戶操作）|
| `DataConnectGatewayAdapter` | — | `src/shared-infra/backend-firebase/dataconnect/` | 受治理 GraphQL schema/connector；sole `firebase/data-connect` 呼叫點 |

---

## Firebase 前後端分層決策矩陣

> **核心原則**：`firebase-client` SDK（瀏覽器端） → L7-A 前端 Adapters；`firebase-admin` SDK → L7-B 後端 Adapters 且一律透過 Cloud Functions

| 情境 | 選擇 | 原因 |
|------|------|------|
| 高頻小請求且可由 Rules 安全完成 | `frontend-firebase`（直連） | 降低 Functions 成本 [D25 SHOULD] |
| 高扇出或可批次流程 | `backend-firebase/functions`（集中批處理） | 降低總寫入成本 [D25 SHOULD] |
| 需要即時訂閱能力 | `frontend-firebase/realtime-database`（須定義 subscribe/unsubscribe/reconnect/backoff 與權限失效策略） | [P7 D25 SHOULD] |
| Admin 權限 / 跨租戶 / Webhook 驗簽 | `backend-firebase/functions` | 安全邊界要求 [D25 MUST] |
| **firebase-admin SDK 任何使用場景** | **`backend-firebase/functions`（Cloud Functions 唯一容器）** | **firebase-admin 一律透過 functions [D25 MUST]** |
| 受治理的 GraphQL 資料契約 | `backend-firebase/dataconnect` | [D25 MUST] |
| 受保護資料或可變更狀態 | 必須先完成 App Check 驗證（含 token 續期與失效處理）| [E7 D25 MUST] |
| AI tool data access | 必須由 Genkit tool gateway 統一檢查租戶邊界 | [E8 D25 SHOULD] |

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
| `DOMAIN_ERRORS` | DLQ 事件 / failed relay / circuit-open | [R5] |
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

- [ ] D24 違規：43 個檔案仍直接 import `firebase/*` → 須遷移至 FIREBASE_ACL Adapter
- [ ] VS8 Semantic Graph Compute Engine（四層語義引擎正式落地）[D21]
- [ ] VS4 org-semantic-registry（組織語義字典）[D21-1 A18]
- [ ] L10 AI Runtime（Genkit Flow Gateway / Tool ACL）[E8]
- [ ] App Check 全面啟用 [E7]
- [ ] L9 Observability（metrics/trace dashboard）[R1 R5 R8]
- [ ] Skill XP Award Contract 完整驗收 [A17]
- [ ] Multi-Claim Cycle Contract 完整驗收 [A16]

---

> **跨切片強制規則**（VS6 / VS3 / 分層規則 / 出口規則）→ [`02-governance-rules.md §跨切片 RULESET-MUST`](./02-governance-rules.md#跨切片-ruleset-must分類整理)
