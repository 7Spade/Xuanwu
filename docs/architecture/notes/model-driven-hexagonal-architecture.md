# Model-Driven Hexagonal Architecture

**Project:** Xuanwu  
**Status:** Living Document  
**Last Updated:** 2026-03-16

---

## 目錄 (Table of Contents)

1. [設計哲學 (Design Philosophy)](#1-設計哲學-design-philosophy)
2. [整體架構圖 (Architecture Overview)](#2-整體架構圖-architecture-overview)
3. [層次定義 (Layer Definitions)](#3-層次定義-layer-definitions)
4. [垂直切片 (Vertical Slices)](#4-垂直切片-vertical-slices)
5. [端口與適配器 (Ports & Adapters)](#5-端口與適配器-ports--adapters)
6. [訊息流 (Message Flow)](#6-訊息流-message-flow)
7. [共享核心 (Shared Kernel)](#7-共享核心-shared-kernel)
8. [共享基礎設施 (Shared Infrastructure)](#8-共享基礎設施-shared-infrastructure)
9. [CQRS 與讀模型 (CQRS and Read Models)](#9-cqrs-與讀模型-cqrs-and-read-models)
10. [事件驅動與 Outbox (Event-Driven & Outbox)](#10-事件驅動與-outbox-event-driven--outbox)
11. [依賴規則 (Dependency Rules)](#11-依賴規則-dependency-rules)
12. [目錄對照 (Directory Mapping)](#12-目錄對照-directory-mapping)

---

## 1. 設計哲學 (Design Philosophy)

Xuanwu 採用 **Model-Driven Hexagonal Architecture**：以**領域模型**為核心驅動力，透過**六邊形架構（Ports & Adapters）**將業務邏輯與所有技術細節完全解耦。

### 核心原則

| 原則 | 說明 |
|------|------|
| **Domain First** | 所有設計決策從領域模型出發，技術選型服從領域需求 |
| **Dependency Inversion** | 領域層定義 Port 介面，基礎設施層實作 Adapter，依賴方向由外向內 |
| **Vertical Slices** | 每個業務垂直面（VS）自包含：命令、查詢、事件、UI 全在同一 slice |
| **Explicit Contracts** | 跨 slice 通訊僅透過 Shared Kernel 中明確定義的契約型別 |
| **Event Isolation** | 所有副作用透過 Outbox → IER（整合事件路由器）非同步傳遞，不直接呼叫外部系統 |
| **CQRS** | 命令（Command）與查詢（Query）路徑完全分離，讀模型由 Projection Bus 維護 |

---

## 2. 整體架構圖 (Architecture Overview)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Layer (src/app/)                        │
│              Server Components · Server Actions · Route Handlers              │
└────────────────────────┬────────────────────────┬───────────────────────────┘
                         │                        │
              ┌──────────▼──────────┐  ┌──────────▼──────────┐
              │   GW_CMD [R4]       │  │   GW_QUERY [Q8]     │
              │  Command Gateway    │  │   Query Gateway     │
              │  CBG_ENTRY [E4][R8] │  │  read-model-registry│
              └──────────┬──────────┘  └──────────┬──────────┘
                         │                        │
         ┌───────────────▼────────────────────────▼────────────────┐
         │                   Feature Slices (VS1–VS9)               │
         │                                                          │
         │  workspace.slice (VS5) │ account.slice │ finance.slice  │
         │  semantic-graph.slice  │ org.slice     │ identity.slice  │
         │  scheduling.slice      │ skill-xp      │ notification    │
         │                                                          │
         │  Each slice:  _actions.ts │ _queries.ts │ _types.ts      │
         │               domain.*   │ gov.*        │ core.*         │
         └──────────────────────────┬───────────────────────────────┘
                                    │
         ┌──────────────────────────▼───────────────────────────────┐
         │                    Shared Kernel (VS0)                    │
         │                                                          │
         │  Port Interfaces    │ Data Contracts │ Value Objects      │
         │  EventEnvelope      │ CommandResult  │ Infra Contracts    │
         │  OutboxRecord       │ AuthoritySnap  │ Observability      │
         └──────────────────────────┬───────────────────────────────┘
                                    │
         ┌──────────────────────────▼───────────────────────────────┐
         │               Shared Infrastructure Layer                 │
         │                                                          │
         │  gateway-command  │ gateway-query   │ outbox-relay [R1]  │
         │  event-router[R2] │ projection-bus  │ dlq-manager  [R5]  │
         │  observability    │ firebase-client │ firebase-admin     │
         └──────────────────────────┬───────────────────────────────┘
                                    │
         ┌──────────────────────────▼───────────────────────────────┐
         │              Infrastructure Adapters (src/infrastructure/)│
         │                                                          │
         │  firebase/  ← IAuthService, IFirestoreRepo, IFileStore  │
         │  upstash/   ← ICachePort, IQueuePort, IVectorIndexPort  │
         │  document-ai/ ← Google Document AI + Genkit ML pipeline │
         └──────────────────────────────────────────────────────────┘
```

---

## 3. 層次定義 (Layer Definitions)

### L1 — App Layer (`src/app/`)

Next.js App Router 呈現層。包含：
- **Server Components**：讀取讀模型並呈現 HTML
- **Server Actions**：接收表單提交，呼叫 `GW_CMD`
- **Route Handlers**：REST/Webhook 端點，轉發至對應 Command/Query

**規則：**
- 僅能呼叫 Feature Slice 的 `_actions.ts` 或 `_queries.ts`
- 不得直接存取 Infrastructure 或 Shared Infrastructure
- 不得包含業務規則

### L2 — Feature Slice Layer (`src/features/`)

每個垂直業務面（VS1–VS9）的完整自治單元。內部結構：

```
<name>.slice/
├── _actions.ts          ← Server Actions (命令端點) → returns CommandResult
├── _queries.ts          ← Query 函數 → reads from projection-bus / firebase-client
├── _types.ts            ← Slice 本地型別定義
├── core/                ← Aggregate、Provider、React hooks
├── core.event-bus/      ← In-process 領域事件 bus [E5]
├── core.event-store/    ← Append-only 事件儲存（replay / audit）
├── domain.<name>/       ← 特定領域子模組（可多個）
│   ├── _actions.ts
│   ├── _queries.ts
│   ├── _types.ts
│   └── _ports.ts        ← 模組範圍的 Port 介面（可選）
└── gov.<name>/          ← 治理子模組（ACL、角色、策略）
```

**規則：**
- Slice 間通訊**僅透過 Shared Kernel 契約型別**，不得 cross-import
- 命令一律回傳 `CommandResult`（`CommandSuccess | CommandFailure`）
- 所有寫入副作用須透過 Outbox，不得直接呼叫外部系統

### L3 — Shared Kernel (`src/shared-kernel/`)

VS0：零基礎設施依賴的純領域契約層。

```
shared-kernel/
├── data-contracts/      ← 跨 slice 共享的資料型別
│   ├── event-envelope/  ← EventEnvelope<T> 通用事件信封
│   ├── command-result-contract/ ← CommandSuccess | CommandFailure
│   ├── account/         ← Account, Wallet, Team ...
│   ├── authority-snapshot/ ← AuthoritySnapshot（ACL 授權快照）
│   └── ...
├── ports/               ← Port 介面（純 TypeScript，無 I/O）
│   ├── i-auth.service.ts
│   ├── i-firestore.repo.ts
│   ├── i-messaging.ts
│   └── i-file-store.ts
├── infra-contracts/     ← 基礎設施協定（Outbox、版本守衛、韌性）
├── enums/               ← 跨域列舉值
├── types/               ← 共用型別工具
└── index.ts             ← 唯一公開 barrel（所有消費者從此 import）
```

### L4 — Shared Infrastructure (`src/shared-infra/`)

橫跨多個 Slice 的基礎設施服務。**實作** Shared Kernel Port 介面，**不含業務邏輯**。

### L5 — Infrastructure Adapters (`src/infrastructure/`)

具體的外部技術適配器：Firebase、Upstash、Google Document AI。每個 Adapter 對應一個 Port 介面。

---

## 4. 垂直切片 (Vertical Slices)

| VS 編號 | Slice 名稱 | 職責 |
|---------|-----------|------|
| **VS0** | `shared-kernel` | 跨域契約、Port 介面、基礎型別（零 I/O） |
| **VS1** | `identity.slice` | 身份認證（登入、登出、匿名、OAuth） |
| **VS2** | `account.slice` | 帳號管理、角色、錢包、技能、通知 |
| **VS3** | `organization.slice` | 組織治理、成員、合作夥伴、語義治理 |
| **VS4** | `semantic-graph.slice` | 語義標籤圖譜、提案流、Wiki 編輯器 |
| **VS5** | `workspace.slice` | 工作空間、任務管理、日誌、工作流、QA |
| **VS6** | `workforce-scheduling.slice` | 人力排班、應徵申請、日曆 |
| **VS7** | `skill-xp.slice` | 技能等級與 XP 成長軌跡 |
| **VS8** | `notification-hub.slice` | 通知路由（FCM、In-App） |
| **VS9** | `finance.slice` | 財務暫存池、資金調撥、成本標籤 |
| **AUX** | `global-search.slice` | 跨域搜尋權威（cross-domain search） |
| **AUX** | `portal.slice` | Portal shell 狀態橋接 |

---

## 5. 端口與適配器 (Ports & Adapters)

六邊形的「六邊」代表應用程式核心與外界的**明確邊界**。每個邊界由一個 **Port（介面）** 定義，由一個 **Adapter（實作）** 橋接。

### 主要端口映射

```
Port Interface              Location                    Adapter              SDK
─────────────────────────────────────────────────────────────────────────────────
IAuthService                shared-kernel/ports/        firebase/client/auth  Firebase Web SDK
IFirestoreRepo              shared-kernel/ports/        firebase/client/      Firebase Web SDK
IFileStore                  shared-kernel/ports/        firebase/client/      Firebase Storage
IMessaging                  shared-kernel/ports/        firebase/client/      Firebase FCM
ICachePort                  shared-kernel/ports/ *      upstash/redis.ts      Upstash Redis
IQueuePort                  shared-kernel/ports/ *      upstash/qstash.ts     Upstash QStash
IVectorIndexPort            shared-kernel/ports/ *      upstash/vector.ts     Upstash Vector
IWorkflowPort               shared-kernel/ports/ *      upstash/workflow.ts   Upstash Workflow
```

> `*` Cross-cutting ports are defined in `src/shared/ports/` (upstash); module-scoped ports live in `domain.*/_ports.ts`.

### 依賴方向

```
Domain Layer (Feature Slice)
      │
      │  depends on Port interface (abstraction)
      ▼
Port Interface (shared-kernel/ports/)
      ▲
      │  implements
      │
Adapter (infrastructure/)
      │
      │  calls
      ▼
External SDK / Service
```

Domain 層**永遠不知道** Adapter 的存在；Adapter **永遠不知道** Domain 規則的細節。

---

## 6. 訊息流 (Message Flow)

### 6.1 命令流 (Command Flow)

```
User Action
    │
    ▼
Next.js Server Action (_actions.ts)
    │
    ▼
GW_CMD — Command Gateway [R4]
    ├─ [E4] TraceID 注入 (CBG_ENTRY)
    ├─ [R8] 傳播 traceId 到所有下游節點
    ├─ [Q4] AuthoritySnapshot 驗證
    └─ Command Router (CBG_ROUTE)
         │
         ▼
    Feature Slice Handler
         ├─ 領域規則驗證 (Aggregate Invariants)
         ├─ 狀態變更
         ├─ 發布 EventEnvelope 到 OUTBOX [S1]
         └─ 回傳 CommandResult [R4]
              └─ CommandSuccess { aggregateId, version }
                 CommandFailure { code, message }
```

### 6.2 查詢流 (Query Flow)

```
Server Component (data fetching)
    │
    ▼
GW_QUERY — Query Gateway [Q8]
    ├─ read-model-registry (版本比對 / snapshot 路由)
    └─ Projection Selector
         │
         ▼
    Projection Bus Read Model
         ├─ tasks-view, account-view, wallet-balance-view ...
         └─ Firestore 最終一致性讀取（SLA ≤ 10s）
```

### 6.3 事件傳遞流 (Event Delivery Flow)

```
Feature Slice
    │
    │ write EventEnvelope to OUTBOX (Firestore)
    ▼
OUTBOX Collection
    │
    │ CDC onSnapshot [R1]
    ▼
OUTBOX_RELAY_WORKER (infra.outbox-relay) [R1]
    │
    ├─ Success: mark 'relayed'
    ├─ Retry:   exponential backoff (max 3 attempts)
    └─ Failure: write to DLQ with dlqLevel tag [R5]
         │
         ▼
IER — Integration Event Router [R2]
    ├─ CRITICAL_LANE:    WalletDeducted, ClaimsRefreshed, RoleChanged
    ├─ STANDARD_LANE:    ScheduleAssigned, MemberJoined, MemberRemoved
    └─ BACKGROUND_LANE:  TagCreated, TagUpdated, AuditLogged, FCMDelivered
         │
         ▼
    Lane Subscribers (Projection Updaters, FCM, Audit Log, ...)
```

### 6.4 DLQ 三級策略

| 等級 | Tag | 觸發條件 | 處理策略 |
|------|-----|---------|---------|
| **L1** | `SAFE_AUTO` | 短暫性錯誤（網路超時、Firestore 暫時不可用） | 自動重試，無需人工介入 |
| **L2** | `REVIEW_REQUIRED` | 業務規則衝突、版本衝突 | 人工審核後決定重播或棄置 |
| **L3** | `SECURITY_BLOCK` | 授權失敗、Schema 驗證失敗 | 封鎖並告警，禁止自動重播 |

---

## 7. 共享核心 (Shared Kernel)

Shared Kernel（VS0）是唯一允許跨所有 Slice 引用的模組。它定義：

### 7.1 EventEnvelope\<T\>

```typescript
interface EventEnvelope<TPayload = unknown> {
  readonly eventId:        string;   // UUID
  readonly eventType:      string;   // e.g. "workspace:tasks:assigned"
  readonly occurredAt:     string;   // ISO 8601
  readonly sourceId:       string;   // Aggregate ID
  readonly payload:        TPayload;
  readonly version?:       number;   // Aggregate version [R7]
  readonly traceId?:       string;   // Original Command trace [R8]
  readonly idempotencyKey?: string;  // eventId + aggregateId + version [Q3][D8]
  readonly causationId?:   string;   // Causal chain ID [SK_ENV]
  readonly correlationId?: string;   // Saga / replay correlation [SK_ENV]
}
```

**三大不變量：**
- `[R8]` `traceId` 由 CBG_ENTRY 注入一次，**下游節點絕不覆寫**
- `[Q3][D8]` `idempotencyKey` 由 FUNNEL 用於冪等 upsert，DLQ 重播時**不得重新生成**
- `[R7]` `version` 用於 SK_VERSION_GUARD 單調遞增檢查

### 7.2 CommandResult

```typescript
type CommandResult = CommandSuccess | CommandFailure;

interface CommandSuccess {
  readonly ok:          true;
  readonly aggregateId: string;
  readonly version:     number;
}

interface CommandFailure {
  readonly ok:    false;
  readonly error: DomainError;
}

interface DomainError {
  readonly code:     string;                          // e.g. "SKILL_TIER_INSUFFICIENT"
  readonly message:  string;
  readonly context?: Record<string, unknown>;         // 診斷上下文
}
```

### 7.3 AuthoritySnapshot

跨 slice 的 ACL 授權狀態快照。每次命令執行時由 CBG_AUTH 注入，避免重複查詢授權狀態。

### 7.4 OutboxRecord

```typescript
interface OutboxRecord {
  readonly outboxId:       string;
  readonly idempotencyKey: string;
  readonly dlqTier:        'SAFE_AUTO' | 'REVIEW_REQUIRED' | 'SECURITY_BLOCK';
  readonly payload:        string;  // serialized EventEnvelope JSON
  readonly createdAt:      string;
  readonly status:         'pending' | 'relayed' | 'dlq';
}
```

---

## 8. 共享基礎設施 (Shared Infrastructure)

`src/shared-infra/` 提供所有 Slice 可共用的基礎設施服務。

| 模組 | 職責 | 對應架構節點 |
|------|------|------------|
| `gateway-command` | 統一命令入口，TraceID 注入，授權攔截，命令路由 | `GW_CMD` [R4][E4][R8][Q4] |
| `gateway-query` | 統一查詢入口，版本比對，讀模型路由 | `GW_QUERY` [Q8][P4][R7] |
| `outbox-relay` | CDC 掃描 OUTBOX，投遞至 IER，處理重試與 DLQ | `OUTBOX_RELAY` [R1] |
| `event-router` | IER 三路段訂閱分發（CRITICAL/STANDARD/BACKGROUND） | `IER` [R2] |
| `projection-bus` | 讀模型投影注冊表，支援 snapshot routing | `PROJ_BUS` |
| `dlq-manager` | DLQ 三級策略計算，故障收容 | `DLQ` [R5] |
| `observability` | TraceID 生成，指標記錄，錯誤日誌 | `OBS` |
| `firebase-client` | Firebase Web SDK 封裝（Auth、Firestore、Storage、FCM） | Adapter |
| `firebase-admin` | Firebase Admin SDK 封裝（後端批次、自訂 Claims） | Adapter |

---

## 9. CQRS 與讀模型 (CQRS and Read Models)

### 9.1 讀寫分離

```
Write Side                           Read Side
──────────────────────────────────   ─────────────────────────────────────
Feature Slice _actions.ts            Feature Slice _queries.ts
      │                                    │
      ▼                                    ▼
GW_CMD (Command Gateway)             GW_QUERY (Query Gateway)
      │                                    │
      ▼                                    ▼
Aggregate (Domain Model)             Projection Read Model
      │                                    │
      ▼                                    ▼
OUTBOX (Firestore)               projection-bus/*.view
      │                                    ▲
      ▼                                    │
IER → Lane Subscribers → Projectors ──────┘
```

### 9.2 Projection Views 清單

| 讀模型 | 路徑 | SLA | 消費者 |
|--------|------|-----|--------|
| `tasks-view` | `projection-bus/tasks-view/` | ≤ 10s | workspace task list |
| `account-view` | `projection-bus/account-view/` | ≤ 10s | FCM token, profile |
| `account-audit-view` | `projection-bus/account-audit-view/` | ≤ 30s | audit dashboard |
| `account-schedule-view` | `projection-bus/account-schedule-view/` | ≤ 10s | schedule calendar |
| `account-skill-view` | `projection-bus/account-skill-view/` | ≤ 10s | skill badge |
| `organization-view` | `projection-bus/organization-view/` | ≤ 10s | org dashboard |
| `org-eligible-member-view` | `projection-bus/org-eligible-member-view/` | ≤ 10s | scheduling [P4] |
| `wallet-balance-view` | `projection-bus/wallet-balance-view/` | STRONG | finance [Q8][D5] |
| `workspace-view` | `projection-bus/workspace-view/` | ≤ 10s | workspace list |
| `workspace-graph-view` | `projection-bus/workspace-graph-view/` | ≤ 10s | graph explorer |
| `workspace-scope-guard-view` | `projection-bus/workspace-scope-guard-view/` | ≤ 5s | ACL guard [A9] |
| `demand-board-view` | `projection-bus/demand-board-view/` | ≤ 10s | demand board |
| `schedule-calendar-view` | `projection-bus/schedule-calendar-view/` | ≤ 10s | calendar UI |
| `schedule-timeline-view` | `projection-bus/schedule-timeline-view/` | ≤ 10s | timeline UI |
| `semantic-governance-view` | `projection-bus/semantic-governance-view/` | ≤ 10s | semantic wiki |
| `tag-snapshot-view` | `projection-bus/tag-snapshot-view/` | ≤ 10s | tag graph |
| `finance-staging-pool-view` | `projection-bus/finance-staging-pool-view/` | ≤ 10s | finance staging |
| `task-finance-label-view` | `projection-bus/task-finance-label-view/` | ≤ 10s | task cost label |
| `acl-projection-view` | `projection-bus/acl-projection-view/` | ≤ 5s | permission check |
| `global-audit-view` | `projection-bus/global-audit-view/` | ≤ 30s | global audit |

---

## 10. 事件驅動與 Outbox (Event-Driven & Outbox)

### 10.1 Outbox Pattern

Outbox Pattern 保證「業務狀態更新」與「事件發布」**原子性**：在同一 Firestore 交易中寫入業務文件與 Outbox 紀錄，確保即使系統崩潰也不會丟失事件。

```
Transaction (atomic)
├── Write business document (e.g. task update)
└── Write OutboxRecord { status: 'pending', payload: EventEnvelope JSON }

OUTBOX_RELAY_WORKER (async)
├── CDC: onSnapshot listens for 'pending' entries
├── Deliver to IER
└── Update status: 'relayed' | 'dlq'
```

### 10.2 In-Process vs. Integration Events

| 類型 | 傳遞機制 | 用途 |
|------|---------|------|
| **Domain Event (in-process)** | `core.event-bus` (in-memory) | Slice 內部協調，無跨 BC 保證 |
| **Integration Event** | Outbox → IER → Lane Subscriber | 跨 BC 可靠傳遞，持久化，可重播 |

### 10.3 TraceID 傳播規則 [R8]

```
CBG_ENTRY (GW_CMD)
    │
    │  generate & inject traceId
    ▼
EventEnvelope.traceId = <UUID>
    │
    │  MUST propagate unchanged through:
    ▼
OUTBOX_RELAY → IER → Lane Subscribers → Projectors → FCM Delivery → Audit Log
```

**鐵律**：任何下游節點**不得覆寫或重新生成** `traceId`，違者即為架構違規。

---

## 11. 依賴規則 (Dependency Rules)

### 11.1 允許的依賴方向

```
src/app/
    ↓ (can call)
src/features/        ← _actions.ts, _queries.ts, _components
    ↓ (can use)
src/shared-kernel/   ← types, contracts, port interfaces
    ↓ (implemented by)
src/shared-infra/    ← cross-cutting infra services
src/infrastructure/  ← concrete adapters (Firebase, Upstash, etc.)
```

### 11.2 禁止的依賴 (Hard Rules)

| 規則 | 說明 |
|------|------|
| **No cross-slice import** | `workspace.slice` 不得直接 import `account.slice` |
| **No infra in domain** | Feature Slice 不得直接 import Firebase SDK |
| **No domain in infra** | `src/infrastructure/` 不得 import `src/features/` |
| **No app in infra** | `src/infrastructure/` 不得 import `src/app/` |
| **Shared Kernel is zero-I/O** | `src/shared-kernel/` 不得有任何 Firebase / React 依賴 |
| **No hardcoded secrets** | 所有憑證必須從 `process.env.*` 讀取 |

### 11.3 Import 規則速查

```typescript
// ✅ Feature Slice action → Shared Kernel
import { commandSuccess, commandFailureFrom } from '@/shared-kernel';

// ✅ Feature Slice query → projection-bus
import { getTasksView } from '@/shared-infra/projection-bus/tasks-view';

// ✅ Server Action → GW_CMD
import { dispatchCommand } from '@/shared-infra/gateway-command';

// ✅ Infrastructure adapter → port interface
import type { IAuthService } from '@/shared-kernel';

// ❌ Cross-slice direct import
import { something } from '@/features/account.slice'; // FORBIDDEN in workspace.slice

// ❌ Domain layer imports SDK directly
import { getFirestore } from 'firebase/firestore'; // FORBIDDEN in _actions.ts

// ❌ Infrastructure imports domain
import { createWorkspace } from '@/features/workspace.slice'; // FORBIDDEN in src/infrastructure/
```

---

## 12. 目錄對照 (Directory Mapping)

```
xuanwu/
├── src/
│   ├── app/                          # L1: Next.js App Layer
│   │   └── (shell)/                  # Route groups (portal, public, wiki)
│   │
│   ├── app-runtime/                  # React providers, AI flows, contexts
│   │   ├── ai/                       # Genkit AI flows & schemas
│   │   ├── contexts/                 # React context definitions
│   │   └── providers/                # Provider composition root
│   │
│   ├── features/                     # L2: Feature Slices (VS1–VS9 + AUX)
│   │   ├── account.slice/            # VS2
│   │   ├── finance.slice/            # VS9
│   │   ├── global-search.slice/      # AUX
│   │   ├── identity.slice/           # VS1
│   │   ├── notification-hub.slice/   # VS8
│   │   ├── organization.slice/       # VS3
│   │   ├── portal.slice/             # AUX
│   │   ├── semantic-graph.slice/     # VS4
│   │   ├── skill-xp.slice/           # VS7
│   │   ├── workforce-scheduling.slice/ # VS6
│   │   └── workspace.slice/          # VS5
│   │
│   ├── shared-kernel/               # L3: VS0 — Pure domain contracts
│   │   ├── data-contracts/           # EventEnvelope, CommandResult, Account...
│   │   ├── ports/                    # IAuthService, IFirestoreRepo, IMessaging...
│   │   ├── infra-contracts/          # Outbox, VersionGuard, Resilience...
│   │   ├── enums/                    # OutboxLane, CostItemType...
│   │   ├── types/                    # Utility types
│   │   └── index.ts                  # Single public barrel
│   │
│   ├── shared-infra/                # L4: Cross-cutting infra services
│   │   ├── gateway-command/          # GW_CMD [R4][E4][R8][Q4]
│   │   ├── gateway-query/            # GW_QUERY [Q8][P4][R7]
│   │   ├── outbox-relay/             # OUTBOX_RELAY [R1]
│   │   ├── event-router/             # IER [R2] CRITICAL/STANDARD/BACKGROUND
│   │   ├── projection-bus/           # Read model projections
│   │   ├── dlq-manager/              # DLQ [R5] 三級策略
│   │   ├── observability/            # Trace, metrics, error logging
│   │   ├── firebase-client/          # Firebase Web SDK adapters
│   │   ├── firebase-admin/           # Firebase Admin SDK adapters
│   │   ├── api-gateway/              # External API gateway
│   │   ├── external-triggers/        # Webhook / external event triggers
│   │   └── path-integrity-audit.test.ts # Architecture compliance tests
│   │
│   ├── infrastructure/              # L5: Concrete technology adapters
│   │   ├── firebase/                 # Auth, Firestore, Storage adapters
│   │   ├── upstash/                  # Redis, QStash, Vector, Workflow adapters
│   │   └── document-ai/             # Google Document AI + Genkit pipeline
│   │
│   ├── lib-ui/                      # UI component library
│   │   ├── shadcn-ui/               # shadcn/ui components
│   │   ├── custom-ui/               # Project-specific UI components
│   │   ├── dnd/                     # Drag-and-drop primitives
│   │   └── ...
│   │
│   └── config/                      # i18n, app configuration
│
├── functions/                       # Firebase Cloud Functions (server-side triggers)
├── public/                          # Static assets
└── docs/
    └── architecture/
        ├── README.md                # Navigation index
        └── notes/
            └── model-driven-hexagonal-architecture.md  ← 本文件
```

---

## 附錄：架構標記說明 (Annotation Reference)

| 標記 | 說明 |
|------|------|
| `[R1]` | OUTBOX_RELAY_WORKER — 共享 Relay Worker |
| `[R2]` | IER — Integration Event Router 三路段 |
| `[R4]` | COMMAND_RESULT_CONTRACT — 所有命令回傳 CommandResult |
| `[R5]` | DLQ 三級策略（SAFE_AUTO / REVIEW_REQUIRED / SECURITY_BLOCK） |
| `[R7]` | 版本守衛 (SK_VERSION_GUARD) |
| `[R8]` | TraceID 全鏈傳播，CBG_ENTRY 注入，下游不得覆寫 |
| `[E4]` | CBG_ENTRY — 命令入口 TraceID 注入點 |
| `[E5]` | In-process 領域事件 bus（slice 內部） |
| `[Q3]` | idempotencyKey = eventId + aggregateId + version |
| `[Q4]` | AuthoritySnapshot 驗證（CBG_AUTH） |
| `[Q7]` | 命令路由（CBG_ROUTE） |
| `[Q8]` | STRONG_READ — 強一致性查詢（財務餘額）[D5] |
| `[D4]` | 所有新 Slice 必須採用 CommandResult |
| `[D5]` | 財務操作強一致性保證 |
| `[D8]` | DLQ 重播時 idempotencyKey 不得重新生成 |
| `[D9]` | traceId 從 Envelope 讀取並轉發，不得覆寫 |
| `[D11]` | Listener 韌性：onError 時自動重連（指數退避） |
| `[A3]` | B-track Issues（工程問題追蹤） |
| `[A4]` | Document AI 解析（domain.document-parser）|
| `[A9]` | Workspace Scope Guard（ACL 範圍守衛）|
| `[P4]` | 排班系統 eligible member projection |
| `[S1]` | Outbox 寫入保證（原子性） |
| `[SK_ENV]` | EventEnvelope 核心不變量 |

---

> **See Also:**
> - Infrastructure Adapters: [`src/infrastructure/README.md`](../../src/infrastructure/README.md)
> - Shared Kernel API: [`src/shared-kernel/index.ts`](../../src/shared-kernel/index.ts)
> - Firebase Design Guide: [`src/infrastructure/firebase/README.md`](../../src/infrastructure/firebase/README.md)
