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
| `L7` | Firebase Boundary（FIREBASE_ACL） | SDK Anti-Corruption Layer（AuthAdapter / FirestoreAdapter / FCMAdapter / StorageAdapter） | `src/shared-infra/frontend-firebase/` |
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
    auth/                    # AuthAdapter（L7）
    firestore/               # FirestoreAdapter（L7）
    realtime-database/       # RTDBAdapter（L7，即時通訊）
    messaging/               # FCMAdapter（L7，R8 traceId）
    storage/                 # StorageAdapter（L7）
    analytics/               # AnalyticsAdapter（L7，遙測只寫）
  backend-firebase/
    functions/               # Cloud Functions（Admin 權限/跨租戶/觸發器）
    dataconnect/             # GraphQL 資料契約（受治理 GraphQL）
  observability/             # L9 metrics/trace/errors
  ai-orchestration/          # L10 Genkit Flow Gateway
```

---

## L2 Command Gateway 邊界規則

### 可下沉至 L1（Shared Kernel）的元件

| 元件類型 | 說明 |
|----------|------|
| `GatewayCommand` / `DispatchOptions` / Handler 介面型別 | 純型別契約，無 async/side effects |
| `CommandResult` / 錯誤碼契約（純資料或純函式） | 符合 D8 |

### 必須保留在 L2 的元件

| 元件類型 | 說明 |
|----------|------|
| `CBG_ENTRY` / `CBG_AUTH` / `CBG_ROUTE` 執行管線 | 含執行邏輯，禁止下沉 |
| handler registry | 路由表動態注冊 |
| resilience 接線（rate-limit / circuit-breaker / bulkhead） | 含 async/side effects |

### 嚴格禁止

- `[D8]`：含 async / side effects / routing registry 的元件禁止下沉至 `shared-kernel/*`
- `[D10]`：L1 禁止產生 `traceId`；traceId 僅允許 `CBG_ENTRY` 注入

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

| Adapter | 實作介面 | 路徑 | 說明 |
|---------|----------|------|------|
| `AuthAdapter` | `IAuthService` | `src/shared-infra/frontend-firebase/auth/` | sole `firebase/auth` 呼叫點 |
| `FirestoreAdapter` | `IFirestoreRepo` [S2] | `src/shared-infra/frontend-firebase/firestore/` | sole `firebase/firestore` 呼叫點；enforces aggregateVersion |
| `FCMAdapter` | `IMessaging` [R8] | `src/shared-infra/frontend-firebase/messaging/` | sole `firebase/messaging` 呼叫點；adds traceId to FCM metadata |
| `StorageAdapter` | `IFileStore` | `src/shared-infra/frontend-firebase/storage/` | sole `firebase/storage` 呼叫點 |
| `RTDBAdapter` | — | `src/shared-infra/frontend-firebase/realtime-database/` | 即時通訊用；禁止承載領域寫入 [D25] |
| `AnalyticsAdapter` | — | `src/shared-infra/frontend-firebase/analytics/` | 遙測寫入；禁止承載領域寫入 [D25] |

> **Firebase 後端決策**：Admin 權限 / 跨租戶 / 排程 / 觸發器 / Webhook 驗簽 → `src/shared-infra/backend-firebase/functions` [D25]

---

## Firebase 前後端分層決策矩陣

| 情境 | 選擇 | 原因 |
|------|------|------|
| 高頻小請求且可由 Rules 安全完成 | `frontend-firebase`（直連） | 降低 Functions 成本 [D25 SHOULD] |
| 高扇出或可批次流程 | `backend-firebase/functions`（集中批處理） | 降低總寫入成本 [D25 SHOULD] |
| 需要即時訂閱能力 | `frontend-firebase/realtime-database`（須定義 subscribe/unsubscribe/reconnect/backoff 與權限失效策略） | [P7 D25 SHOULD] |
| Admin 權限 / 跨租戶 / Webhook 驗簽 | `backend-firebase/functions` | 安全邊界要求 [D25 MUST] |
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

## 跨切片 RULESET-MUST（分類整理）

### VS6 強制規則

| 規則 | 說明 |
|------|------|
| VS6 MUST 讀 `ORG_ELIGIBLE_MEMBER_VIEW` | 取得可排班成員、tagSlug 技能能力（skills{tagSlug→xp}）與 eligible 狀態 [#14 #15 #16] |
| VS6 MUST 使用語義感知排班路由 | 基於 VS8 tagSlug 語義，禁止硬編碼成員 ID 或技能 ID [D21-5] |
| VS6 MUST 使用 `SK_SKILL_REQ` × Tag Authority | 排班職能需求合法性由 `SK_SKILL_REQ` × tagSlug 確定 [T4] |
| VS6 MUST 走 L6 Query Gateway | 排班視圖讀取只可經 L6；UI 禁止直讀 VS6/Firebase [D27 L6-Gateway] |
| VS6 MUST overlap/resource-grouping 在 L5 完成 | 前端僅渲染，計算責任在 L5 Projection [D27 Timeline] |

### VS3 強制規則

| 規則 | 說明 |
|------|------|
| VS3 MUST 使用 Ledger 記帳 | XP 異動必須寫 Ledger [#13] |
| VS3 MUST `getTier()` 只推導 | 從 `shared-kernel/skill-tier` import；禁止存入 DB [D12 #12] |
| VS3 XP Award MUST 由 VS3 獨占寫入 | 來源只能是 VS5 的 `TaskCompleted(baseXp, semanticTagSlug)` 與 `QualityAssessed(qualityScore)` [A17] |

### 分層規則

| 規則 | 說明 |
|------|------|
| L3 → L4 | 域事件透過 OUTBOX，由 relay-worker 投遞到 IER [D1 S1] |
| L4 → L5 | IER lane-router 分發到 event-funnel，event-funnel 是唯一 Projection 寫入路徑 [#9 #4b] |
| L5 → L6 | Projection Bus 物化後由 Query Gateway 暴露 |
| L2 → L3 | CBG_ROUTE 分發至 handler（CBG_ENTRY 已注入 traceId [D10]）|
| L3 MUST NOT → firebase/* | Feature Slice 禁止跨越 L7，必須走 SK_PORTS [D24] |

### Cross-cutting Authority 出口規則

| 權威 | 說明 |
|------|------|
| `Global Search` | 唯一跨域搜尋出口；業務 Slice 禁止自建搜尋邏輯 [D26 #A12] |
| `Notification Hub`（VS7） | 唯一副作用出口；業務 Slice 只產生事件不決定通知策略 [D26 #A13] |
