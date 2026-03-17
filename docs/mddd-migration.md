# MDDD 結構轉換分析文件

> **M**icro **D**omain-**D**riven **D**esign — 現況分析與目標架構

---

## 目錄

1. [概覽](#1-概覽)
2. [現況 AS-IS：Vertical Slice Architecture](#2-現況-as-is-vertical-slice-architecture)
   - [頂層目錄樹](#21-頂層目錄樹)
   - [Feature Slices 詳細結構](#22-feature-slices-詳細結構)
   - [Shared 層](#23-shared-層)
3. [MDDD 核心概念](#3-mddd-核心概念)
4. [目標 TO-BE：MDDD 結構樹](#4-目標-to-be-mddd-結構樹)
   - [頂層目錄樹](#41-頂層目錄樹)
   - [模組標準結構（五層）](#42-模組標準結構五層)
   - [各模組完整樹](#43-各模組完整樹)
5. [現況 → MDDD 對映表](#5-現況--mddd-對映表)
6. [差距分析](#6-差距分析)
7. [遷移路徑](#7-遷移路徑)
8. [風險與注意事項](#8-風險與注意事項)
9. [VS8 企業知識庫重構（獨立路線）](#9-vs8-企業知識庫重構獨立路線)

> 📄 **配套文件：[docs/mddd-target-tree.md](./mddd-target-tree.md)** — 完整目標目錄樹（modules/ 全展開版）

---

## 1. 概覽

本文件分析 Xuanwu 專案從現有 **Vertical Slice Architecture (VS)** 轉換至 **Micro Domain-Driven Design (MDDD)** 架構的結構差異、對映關係與遷移策略。

> ⚠️ **重要說明：VS8 不納入 MDDD 遷移**
>
> `semantic-graph.slice`（VS8）將被**獨立重構**為企業知識庫，採用 **Upstash SDK**（Vector + Redis + QStash），新結構為 `knowledge/`、`taxonomy/`、`vector-ingestion/`。VS8 的重構計畫詳見 [第 9 節](#9-vs8-企業知識庫重構獨立路線)，本文件其餘章節的 MDDD 遷移分析**不包含 VS8**。

### 什麼是 MDDD？

MDDD 是 DDD 在微服務或模組化單體 (Modular Monolith) 情境下的具體實踐，核心原則：

| 原則 | 說明 |
|------|------|
| **Bounded Context (BC)** | 每個業務領域擁有明確的語義邊界，不同 BC 的相同術語具有不同含義 |
| **四層架構** | 每個 BC 內部強制分為 Domain / Application / Infrastructure / Interface 四層 |
| **Domain 核心** | Entity、Value Object、Aggregate、Domain Event、Domain Service 都在 Domain 層，零外部依賴 |
| **Ports & Adapters** | Application 層透過 Port interface 使用 Infrastructure，不直接依賴 SDK |
| **防腐層 (ACL)** | BC 間溝通透過 Anti-Corruption Layer，避免語義污染 |
| **共享核心 (Shared Kernel)** | 跨 BC 共用的 Value Object、事件契約，由全體 BC owner 共同維護 |

---

## 2. 現況 AS-IS：Vertical Slice Architecture

### 2.1 頂層目錄樹

```
src/
├── app/                        # Next.js App Router (路由殼層)
│   ├── (shell)/                # Protected shell routes
│   │   ├── (wiki)/             # Wiki 路由 (semantic-governance)
│   │   ├── @modal/             # Modal parallel route
│   │   ├── @sidebar/           # Sidebar parallel route
│   │   ├── (public)/           # 公開路由 (login, landing)
│   │   └── (portal)/           # 受保護門戶路由 (dashboard, workspaces, account)
│   ├── globals.css
│   └── layout.tsx
│
├── app-runtime/                # 應用層 runtime 提供者
│   ├── ai/                     # AI/ML context
│   ├── contexts/               # Runtime contexts
│   └── providers/              # State/Context providers
│
├── config/                     # 全域配置 (i18n 等)
│
├── features/                   # 核心業務功能 (11 個 VS)
│   ├── account.slice/          # VS1: 帳號 / 個人資料 / 錢包
│   ├── finance.slice/          # VS9: 財務追蹤
│   ├── global-search.slice/    # 跨域搜尋 (橫切)
│   ├── identity.slice/         # 身分認證 UI (login/register)
│   ├── notification-hub.slice/ # VS?: 通知路由
│   ├── organization.slice/     # VS2: 組織治理
│   ├── portal.slice/           # 門戶殼層狀態橋接 (橫切)
│   ├── semantic-graph.slice/   # VS8: 企業知識庫 (⚠️ 獨立重構，不納入 MDDD 遷移)
│   ├── skill-xp.slice/         # VS7: 技能經驗值
│   ├── workforce-scheduling.slice/ # VS6: 人力排班
│   └── workspace.slice/        # VS3-5: 工作區綜合管理
│
├── infrastructure/             # 具體基礎設施適配器 (SDK 實作)
│   ├── firebase/               # Firebase Client + Admin SDK
│   ├── upstash/                # Redis / QStash / Vector / Workflow
│   └── document-ai/            # Google Document AI + Genkit
│
├── lib-ui/                     # UI 元件庫 (shadcn-ui 包裝)
│
├── shared-infra/               # 共享基礎設施 (事件路由 / 投影匯流排)
│   ├── firebase-admin/         # Cloud Functions 適配器
│   ├── firebase-client/        # Firestore / Auth / Storage 客戶端
│   │   └── firestore/
│   │       └── repositories/   # 跨 VS 通用 Firestore repositories
│   ├── api-gateway/
│   ├── dlq-manager/
│   ├── event-router/
│   ├── gateway-command/
│   ├── gateway-query/
│   ├── observability/
│   ├── outbox-relay/
│   └── projection-bus/         # 17 個投影視圖 (read model)
│       ├── account-view/
│       ├── tasks-view/
│       ├── organization-view/
│       ├── workspace-view/
│       └── ... (共 17 個)
│
└── shared-kernel/              # 共享核心 (類型 / 契約 / Ports)
    ├── constants/
    ├── data-contracts/
    ├── directives/
    ├── enums/
    ├── infra-contracts/
    ├── observability/
    ├── ontologys/
    ├── pipes/
    ├── ports/                  # IAuthService / IFirestoreRepo / IMessaging / IFileStore
    ├── types/
    ├── utils/
    └── validators/
```

### 2.2 Feature Slices 詳細結構

目前各 VS 的內部命名慣例為 `core/`、`domain.*`、`gov.*`、`core.event-bus/`，非標準 DDD 四層：

#### workspace.slice（最大 VS，176 檔）

```
workspace.slice/
├── core/                       # 殼層 hooks + 全局 actions + queries
├── core.event-bus/             # 工作區事件匯流排
├── core.event-store/           # 事件儲存
├── domain.acceptance/          # 驗收功能
├── domain.application/         # 命令處理 + 策略引擎 + 交易執行器
├── domain.daily/               # 施工日誌 (A-track)
├── domain.document-parser/     # 文件解析意圖
├── domain.files/               # 檔案管理 + 儲存 + 版本
│   ├── _actions/
│   ├── _components/
│   ├── _hooks/
│   └── _queries/
├── domain.issues/              # B-track 問題追蹤
├── domain.parsing-intent/      # 解析意圖數位孿生
├── domain.quality-assurance/   # 品保
├── domain.tasks/               # 任務管理 + 工作流
│   ├── _actions/
│   ├── _components/
│   ├── _hooks/
│   └── _queries.ts
├── domain.workflow/            # 工作流狀態機
├── gov.audit/                  # 稽核記錄 (A/B track)
├── gov.audit-convergence/      # 稽核橋接
├── gov.members/                # 成員管理
├── gov.partners/               # 合作夥伴治理
├── gov.role/                   # 角色授權
└── gov.teams/                  # 團隊治理
```

#### workforce-scheduling.slice（最接近 MDDD 的 VS）

```
workforce-scheduling.slice/
├── domain.core/                # 純領域邏輯 (aggregate / eligibility / rules)
│   ├── aggregate/
│   ├── eligibility/
│   ├── policy-mapper/
│   ├── rules/
│   └── types/
├── domain.application/         # 應用層 (commands / queries / sagas / selectors)
│   ├── commands/
│   ├── projectors/
│   ├── queries/
│   ├── selectors/
│   └── sagas/
├── domain.ports/               # Port 契約 (command / query / event ports)
└── domain.ui/                  # UI 層 (components / hooks)
    ├── components/runtime/
    └── hooks/runtime/
```

#### organization.slice

```
organization.slice/
├── core/                       # 組織核心 actions + queries + hooks
├── core.event-bus/             # 組織事件匯流排
├── gov.members/                # 成員治理
├── gov.teams/                  # 團隊管理
├── gov.partners/               # 夥伴管理
├── gov.policy/                 # 組織策略
└── gov.semantic/               # 語意詞典治理
```

#### 其他 Feature Slices

| Slice | 結構模式 | 主要內容 |
|-------|---------|---------|
| `account.slice` | `domain.profile/` + `domain.wallet/` + `gov.policy/` + `gov.role/` | 帳號 / 個人資料 / 錢包 / 權限 |
| `finance.slice` | 平坦式 `_actions/queries/components/hooks/services/` | 財務追蹤 / 預算 / 週期 |
| `semantic-graph.slice` | `knowledge/` + `taxonomy/` + `vector-ingestion/` (**重構中**) | 企業知識庫 / 語意分類 / 向量嵌入 (Upstash SDK) ⚠️ 不納入 MDDD 遷移 |
| `skill-xp.slice` | 平坦式 + `_aggregate/ledger/projector/tag-pool` | 技能 XP / 分類帳 / 標籤池 |
| `notification-hub.slice` | `domain.notification/` + `gov.notification-router/` | 通知路由 / 交付 |
| `global-search.slice` | 平坦式 | 跨域搜尋 |
| `portal.slice` | 平坦式 | 殼層狀態橋接 |
| `identity.slice` | 平坦式 | 認證 UI |

### 2.3 Shared 層

| 目錄 | 角色 | MDDD 位置 |
|------|------|-----------|
| `shared-kernel/` | 跨 BC 共用類型 / 契約 / Ports | → Shared Kernel (保留) |
| `shared-infra/firebase-client/firestore/repositories/` | Firestore 通用 repositories | → 各 BC 的 `infrastructure/persistence/` |
| `shared-infra/projection-bus/` | 17 個 Read Model 投影視圖 | → 各 BC 的 `application/projections/` |
| `shared-infra/gateway-command/` | 命令閘道 | → Shared Infra 或各 BC 的 `infrastructure/` |
| `shared-infra/event-router/` | 事件路由 | → Cross-BC 事件匯流排 |
| `infrastructure/firebase/` | Firebase SDK 適配器 | → 各 BC 的 `infrastructure/adapters/` 或保留共享 |

---

## 3. MDDD 核心概念

### 層次定義

```
┌─────────────────────────────────────────────────────────────┐
│  Bounded Context (BC)                                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interface Layer (interfaces/)                        │  │
│  │  React Components · React Hooks (Presenters)         │  │
│  │  Next.js Route Handlers · API Controllers            │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │ DTO / ViewModel               │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │  Application Layer (application/)                     │  │
│  │  Use Cases · Command Handlers · Query Handlers        │  │
│  │  Application Services · Sagas · Projections           │  │
│  │  DTO definitions                                      │  │
│  └────────────┬──────────────────────────┬──────────────┘  │
│               │ domain calls             │ port contracts    │
│  ┌────────────▼─────────────┐ ┌──────────▼──────────────┐  │
│  │  Domain Layer (domains/) │ │  Infrastructure Layer    │  │
│  │  Entities · VOs          │ │  (infrastructure/)       │  │
│  │  Aggregates              │ │  Repository Impls        │  │
│  │  Domain Events           │ │  External Service Adapts │  │
│  │  Domain Services         │ │  Outbox / Relay          │  │
│  └──────────────────────────┘ └──────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Ports Layer (ports/) — Port 契約介面（不含實作）     │    │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

依賴方向：interfaces/ → application/ → domains/ ← (ports/ ← infrastructure/)
```

### MDDD vs 現有 VS 慣例對照

| VS 慣例 | MDDD 對映 | 說明 |
|--------|----------|------|
| `core/_actions.ts` | `application/commands/` | 命令動作 → 命令處理器 |
| `core/_queries.ts` | `application/queries/` | 查詢 → 查詢處理器 |
| `core/_hooks/` | `interfaces/hooks/` | Presenter hooks |
| `core/_components/` | `interfaces/components/` | UI 元件 |
| `domain.*/_actions.ts` | `application/commands/` | 子領域命令 |
| `domain.*/aggregate*` | `domains/aggregates/` | 聚合根 |
| `domain.*/rules*` | `domains/` 或 `domains/services/` | 領域規則 |
| `gov.*/_actions.ts` | `application/commands/governance/` | 治理命令 |
| `gov.*/_components/` | `interfaces/components/governance/` | 治理 UI |
| `domain.ports/` | `ports/` | Port 契約（獨立頂層層） |
| `shared-infra/projection-bus/X-view/` | module `application/projections/` | Read Model |
| `shared-infra/firebase-client/repositories/` | module `infrastructure/persistence/` | Repository 實作 |
| `shared-kernel/` | `shared/kernel/` | Shared Kernel 精煉後 |
| `lib-ui/` | `ui/` | UI 組件庫重命名 |
| `infrastructure/` | `lib/` + `infrastructure/` | SDK 封裝 + 跨模組基礎設施 |

---

## 4. 目標 TO-BE：MDDD 結構樹

> 📄 完整目錄樹請見配套文件：**[docs/mddd-target-tree.md](./mddd-target-tree.md)**

### 4.1 頂層目錄樹

```
src/
├── app/                          # Next.js App Router（不變）
│
├── modules/                      # ★ 垂直功能模組（每個 feature 自包含）
│   ├── workspace/                #   VS3-5：工作區管理
│   ├── organization/             #   VS2：組織治理
│   ├── scheduling/               #   VS6：人力排班
│   ├── finance/                  #   VS9：財務追蹤
│   ├── account/                  #   VS1：帳號管理
│   ├── skill-xp/                 #   VS7：技能經驗值
│   ├── notification/             #   通知中樞
│   ├── identity/                 #   身分認證（登入/註冊）
│   ├── search/                   #   跨域搜尋（橫切輔助）
│   └── portal/                   #   門戶殼層（橫切輔助）
│   # ⚠️ semantic-graph (VS8) 不在 modules/ 內 — 獨立重構，見第 9 節
│
├── infrastructure/               # ★ 全域共用基礎設施（SDK 適配器）
│   ├── firebase/                 #   Firebase Admin + Client SDK
│   ├── upstash/                  #   Redis / QStash / Vector / Workflow
│   ├── document-ai/              #   Google Document AI + Genkit
│   └── event-bus/                #   跨模組事件匯流排
│
├── interfaces/                   # ★ 全域共用 API / Adapter
│   ├── api/                      #   Next.js API Routes（Command / Query Gateway）
│   ├── webhooks/                 #   Webhook endpoints
│   └── event-consumers/          #   外部事件消費者適配器
│
├── shared/                       # ★ 自家共用程式碼
│   ├── kernel/                   #   Shared Kernel（← shared-kernel/ 精煉後）
│   │   ├── value-objects/        #   WorkspaceId / TaskId / Money
│   │   ├── ports/                #   跨模組 Port 介面
│   │   ├── events/               #   跨模組領域事件契約
│   │   ├── data-contracts/       #   DTO / 命令結果契約
│   │   └── index.ts
│   └── utils/                    #   跨模組純工具函式
│
├── ui/                           # ★ 可重用 UI 組件（← lib-ui/ 重命名）
│   ├── shadcn-ui/
│   ├── custom-ui/
│   └── index.ts
│
├── lib/                          # ★ 第三方套件封裝（薄包裝層）
│   ├── firebase/                 #   Firebase SDK 初始化 singleton
│   ├── upstash/                  #   Upstash SDK 初始化（redis / vector / qstash）
│   ├── ai/                       #   Genkit pipeline 封裝
│   └── index.ts
│
└── config/                       # 全域配置（不變）
```

### 4.2 模組標準結構（五層）

每個功能模組 `modules/[feature]/` 遵循以下**五層結構**：

```
modules/<module-name>/
├── domains/                      # 領域層 — 零外部依賴
│   ├── entities/                 # 領域實體（有 ID 的業務物件）
│   ├── value-objects/            # 值物件（不可變，以值判等）
│   ├── aggregates/               # 聚合根（一致性邊界）
│   ├── events/                   # 領域事件（已發生的事實）
│   └── services/                 # 領域服務（跨 entity 的業務規則）
│
├── application/                  # 應用層 — 協調領域物件完成 Use Case
│   ├── commands/                 # 命令處理器（寫操作）
│   │   └── <subdomain>/
│   ├── queries/                  # 查詢處理器（讀操作）
│   │   └── <subdomain>/
│   ├── projections/              # Read Model 投影（從 shared-infra 遷移）
│   ├── sagas/                    # 長時序協調（Saga / Process Manager）
│   └── policies/                 # 業務策略（事件驅動）
│
├── infrastructure/               # 基礎設施層 — 實作 Port 介面
│   ├── persistence/              # Repository 實作（Firestore）
│   └── adapters/                 # 外部服務適配器
│
├── interfaces/                   # 介面層 — UI + API 橋接
│   ├── components/               # React 元件（純展示）
│   └── hooks/                    # React hooks（Presenter）
│
├── ports/                        # Port 契約層 — 定義抽象介面（不含實作）
│   ├── i-<resource>.repo.ts      # Repository 介面
│   └── i-<service>.port.ts       # 服務 Port 介面
│
└── index.ts                      # 模組公開 API（ACL 邊界）
```

**依賴方向：**
```
interfaces/ → application/ → domains/ ← (ports/ ← infrastructure/)
```

### 4.3 各模組完整樹

#### modules/workspace（工作區管理）

```
modules/workspace/
├── domains/
│   ├── entities/
│   │   ├── workspace.entity.ts         # ← workspace.slice/core/_types.ts
│   │   ├── task.entity.ts              # ← workspace.slice/domain.tasks/_entity.ts
│   │   ├── daily-log.entity.ts         # ← workspace.slice/domain.daily/*
│   │   ├── workflow.entity.ts          # ← workspace.slice/domain.workflow/*
│   │   ├── issue.entity.ts             # ← workspace.slice/domain.issues/*
│   │   └── file.entity.ts              # ← workspace.slice/domain.files/*
│   ├── value-objects/
│   │   ├── workspace-id.vo.ts          # ← shared/kernel/value-objects/WorkspaceId
│   │   ├── task-id.vo.ts               # ← shared/kernel/value-objects/TaskId
│   │   ├── workflow-stage.vo.ts        # ← workspace.slice/domain.workflow/*
│   │   └── acceptance-status.vo.ts     # ← workspace.slice/domain.acceptance/*
│   ├── aggregates/
│   │   ├── workspace.aggregate.ts      # ← workspace.slice/core/_actions.ts (aggregate root)
│   │   ├── task.aggregate.ts           # ← workspace.slice/domain.tasks/_actions/*
│   │   └── daily-log.aggregate.ts      # ← workspace.slice/domain.daily/*
│   ├── events/
│   │   ├── task-created.event.ts       # ← workspace.slice/core.event-bus/_events.ts
│   │   ├── task-assigned.event.ts
│   │   ├── workflow-stage-changed.event.ts
│   │   └── daily-log-submitted.event.ts
│   └── services/
│       ├── workspace-policy.service.ts # ← workspace.slice/domain.application/policy-engine
│       └── parsing-intent.service.ts   # ← workspace.slice/domain.parsing-intent/*
│
├── application/
│   ├── commands/
│   │   ├── workspace/                  # ← workspace.slice/core/_actions.ts
│   │   ├── task/                       # ← workspace.slice/domain.tasks/_actions/*
│   │   ├── daily/                      # ← workspace.slice/domain.daily/*
│   │   ├── workflow/                   # ← workspace.slice/domain.workflow/*
│   │   ├── files/                      # ← workspace.slice/domain.files/_actions/*
│   │   └── governance/
│   │       ├── audit/                  # ← workspace.slice/gov.audit/*
│   │       ├── members/                # ← workspace.slice/gov.members/*
│   │       ├── roles/                  # ← workspace.slice/gov.role/*
│   │       └── teams/                  # ← workspace.slice/gov.teams/*
│   ├── queries/
│   │   ├── workspace/                  # ← workspace.slice/core/_queries.ts
│   │   ├── task/                       # ← workspace.slice/domain.tasks/_queries.ts
│   │   └── files/                      # ← workspace.slice/domain.files/_queries/*
│   ├── projections/
│   │   ├── workspace-view/             # ← shared-infra/projection-bus/workspace-view/
│   │   ├── tasks-view/                 # ← shared-infra/projection-bus/tasks-view/
│   │   ├── workspace-scope-guard-view/ # ← shared-infra/projection-bus/workspace-scope-guard-view/
│   │   ├── task-finance-label-view/    # ← shared-infra/projection-bus/task-finance-label-view/
│   │   └── workspace-graph-view/       # ← shared-infra/projection-bus/workspace-graph-view/
│   └── sagas/
│       └── document-parsing.saga.ts    # ← workspace.slice/domain.document-parser/*
│
├── infrastructure/
│   ├── persistence/
│   │   ├── workspace.repo.ts           # ← shared-infra/firebase-client/firestore/repositories/workspace*.ts
│   │   ├── task.repo.ts
│   │   └── daily-log.repo.ts
│   └── adapters/
│       └── file-storage.adapter.ts     # ← infrastructure/firebase/client/storage
│
├── interfaces/
│   ├── components/
│   │   ├── shell/                      # ← workspace.slice/core/_components/
│   │   ├── task/                       # ← workspace.slice/domain.tasks/_components/
│   │   ├── daily/                      # ← workspace.slice/domain.daily/*
│   │   ├── files/                      # ← workspace.slice/domain.files/_components/
│   │   └── governance/                 # ← workspace.slice/gov.*/_components/
│   └── hooks/
│       ├── use-workspace.ts            # ← workspace.slice/core/_hooks/use-workspace.ts
│       ├── use-workspace-tasks.ts
│       └── use-visible-workspaces.ts
│
├── ports/
│   ├── i-workspace.repo.ts
│   ├── i-task.repo.ts
│   └── i-file-store.port.ts            # ← shared/kernel/ports/i-file-store.ts
│
└── index.ts                            # ← workspace.slice/index.ts
```

#### modules/organization（組織治理）

```
modules/organization/
├── domains/
│   ├── entities/
│   │   ├── organization.entity.ts      # ← organization.slice/core/_types.ts
│   │   ├── member.entity.ts            # ← organization.slice/gov.members/*
│   │   ├── team.entity.ts              # ← organization.slice/gov.teams/*
│   │   └── partner.entity.ts           # ← organization.slice/gov.partners/*
│   ├── value-objects/
│   │   ├── organization-id.vo.ts
│   │   └── membership-role.vo.ts
│   ├── aggregates/
│   │   └── organization.aggregate.ts
│   └── events/
│       ├── member-joined.event.ts      # ← organization.slice/core.event-bus/_events.ts
│       └── team-created.event.ts
│
├── application/
│   ├── commands/
│   │   ├── org/                        # ← organization.slice/core/_actions.ts
│   │   ├── members/                    # ← organization.slice/gov.members/_actions.ts
│   │   ├── teams/                      # ← organization.slice/gov.teams/_actions.ts
│   │   ├── partners/                   # ← organization.slice/gov.partners/_actions.ts
│   │   ├── policy/                     # ← organization.slice/gov.policy/_actions.ts
│   │   └── semantic/                   # ← organization.slice/gov.semantic/_actions.ts
│   ├── queries/
│   │   ├── org/                        # ← organization.slice/core/_queries.ts
│   │   └── members/                    # ← organization.slice/gov.members/_queries.ts
│   └── projections/
│       ├── organization-view/          # ← shared-infra/projection-bus/organization-view/
│       ├── org-eligible-member-view/   # ← shared-infra/projection-bus/org-eligible-member-view/
│       └── semantic-governance-view/   # ← shared-infra/projection-bus/semantic-governance-view/
│
├── infrastructure/
│   └── persistence/
│       └── organization.repo.ts
│
├── interfaces/
│   ├── components/
│   │   ├── core/                       # ← organization.slice/core/_components/
│   │   ├── members/                    # ← organization.slice/gov.members/_components/
│   │   ├── teams/                      # ← organization.slice/gov.teams/_components/
│   │   ├── partners/                   # ← organization.slice/gov.partners/_components/
│   │   └── semantic/                   # ← organization.slice/gov.semantic/_components/
│   └── hooks/
│       └── use-organization-management.ts
│
├── ports/
│   └── i-organization.repo.ts
│
└── index.ts
```

#### modules/scheduling（人力排班）

```
modules/scheduling/
├── domains/
│   ├── entities/
│   │   └── schedule-item.entity.ts     # ← workforce-scheduling.slice/domain.core/types/
│   ├── value-objects/
│   │   └── schedule-status.vo.ts       # ← workforce-scheduling.slice/domain.core/rules/
│   ├── aggregates/
│   │   └── org-schedule.aggregate.ts   # ← workforce-scheduling.slice/domain.core/aggregate/
│   ├── events/
│   │   └── schedule-proposed.event.ts
│   └── services/
│       ├── eligibility.service.ts      # ← domain.core/eligibility/
│       └── policy-mapper.service.ts    # ← domain.core/policy-mapper/
│
├── application/
│   ├── commands/                       # ← domain.application/commands/
│   ├── queries/                        # ← domain.application/queries/
│   ├── sagas/                          # ← domain.application/sagas/
│   ├── selectors/                      # ← domain.application/selectors/
│   └── projections/
│       ├── account-schedule-view/      # ← shared-infra/projection-bus/account-schedule-view/
│       ├── demand-board-view/          # ← shared-infra/projection-bus/demand-board-view/
│       ├── schedule-calendar-view/     # ← shared-infra/projection-bus/schedule-calendar-view/
│       └── schedule-timeline-view/     # ← shared-infra/projection-bus/schedule-timeline-view/
│
├── infrastructure/
│   └── persistence/
│       └── schedule.repo.ts
│
├── interfaces/
│   ├── components/                     # ← domain.ui/components/runtime/
│   └── hooks/                          # ← domain.ui/hooks/runtime/
│
├── ports/
│   ├── i-scheduling-command.port.ts    # ← domain.ports/command.port.ts
│   ├── i-scheduling-query.port.ts      # ← domain.ports/query.port.ts
│   └── i-scheduling-event.port.ts      # ← domain.ports/event.port.ts
│
└── index.ts
```

#### ⚠️ VS8 semantic-graph（不納入 MDDD 遷移）

> `semantic-graph.slice` 將被獨立重構為**企業知識庫**，採用 Upstash Vector + Redis，新結構為 `knowledge/`、`taxonomy/`、`vector-ingestion/`，詳見[第 9 節](#9-vs8-企業知識庫重構獨立路線)。此模組**不存在於** `modules/` 目錄中。

#### modules/finance（財務追蹤）

```
modules/finance/
├── domains/
│   ├── entities/
│   │   └── finance-item.entity.ts      # ← finance.slice/_types.ts
│   ├── aggregates/
│   │   └── finance.aggregate.ts        # ← finance.slice/_services/finance-aggregate-query-gateway.ts
│   ├── events/
│   └── services/
│       └── finance-lifecycle.service.ts # ← finance.slice/_hooks/use-finance-lifecycle.ts
│
├── application/
│   ├── commands/                       # ← finance.slice/_actions.ts
│   ├── queries/                        # ← finance.slice/_queries.ts
│   └── projections/
│       └── finance-staging-pool-view/  # ← shared-infra/projection-bus/finance-staging-pool-view/
│
├── infrastructure/
│   └── persistence/
│       └── finance.repo.ts
│
├── interfaces/
│   ├── components/                     # ← finance.slice/_components/
│   └── hooks/                          # ← finance.slice/_hooks/
│
├── ports/
│   └── i-finance.repo.ts
│
└── index.ts
```

#### modules/account（帳號管理）

```
modules/account/
├── domains/
│   ├── entities/
│   │   ├── account.entity.ts           # ← account.slice/domain.profile/*
│   │   └── wallet.entity.ts            # ← account.slice/domain.wallet/*
│   ├── value-objects/
│   │   └── account-role.vo.ts          # ← account.slice/gov.role/*
│   ├── events/
│   │   └── (account event bus)         # ← account.slice/account-event-bus.ts
│   └── services/
│       └── account-policy.service.ts   # ← account.slice/gov.policy/*
│
├── application/
│   ├── commands/
│   │   ├── profile/                    # ← account.slice/domain.profile/_actions.ts
│   │   ├── wallet/                     # ← account.slice/domain.wallet/_actions.ts
│   │   ├── policy/                     # ← account.slice/gov.policy/_actions.ts
│   │   └── role/                       # ← account.slice/gov.role/_actions.ts
│   ├── queries/
│   └── projections/
│       ├── account-view/               # ← shared-infra/projection-bus/account-view/
│       ├── account-audit-view/         # ← shared-infra/projection-bus/account-audit-view/
│       ├── account-skill-view/         # ← shared-infra/projection-bus/account-skill-view/
│       ├── acl-projection-view/        # ← shared-infra/projection-bus/acl-projection-view/
│       └── wallet-balance-view/        # ← shared-infra/projection-bus/wallet-balance-view/
│
├── infrastructure/
│   └── persistence/
│       └── account.repo.ts
│
├── interfaces/
│   ├── components/                     # ← account.slice/domain.profile/_components/
│   └── hooks/
│       └── use-user.ts                 # ← account.slice/domain.profile/_hooks/
│
├── ports/
│   └── i-account.repo.ts
│
└── index.ts
```

#### modules/skill-xp（技能經驗值）

```
modules/skill-xp/
├── domains/
│   ├── entities/
│   │   └── skill-tag.entity.ts         # ← skill-xp.slice/_tag-pool.ts
│   ├── aggregates/
│   │   └── skill-xp.aggregate.ts       # ← skill-xp.slice/_aggregate.ts
│   ├── events/
│   │   └── skill-gained.event.ts
│   └── services/
│       ├── tag-lifecycle.service.ts    # ← skill-xp.slice/_tag-lifecycle.ts
│       └── org-recognition.service.ts  # ← skill-xp.slice/_org-recognition.ts
│
├── application/
│   ├── commands/                       # ← skill-xp.slice/_actions.ts
│   ├── queries/                        # ← skill-xp.slice/_queries.ts
│   └── projections/
│       └── (account-skill-view 與 account 模組共享)
│
├── infrastructure/
│   └── persistence/
│       └── skill-xp.repo.ts
│
├── interfaces/
│   └── components/
│       └── personal-skill-panel.tsx    # ← skill-xp.slice/_components/
│
├── ports/
│   └── i-skill-xp.repo.ts
│
└── index.ts
```

#### modules/notification（通知中樞）

```
modules/notification/
├── domains/
│   ├── entities/
│   │   └── notification.entity.ts      # ← notification-hub.slice/_types.ts
│   ├── aggregates/
│   │   └── notification-hub.aggregate.ts # ← notification-hub.slice/_notification-authority.ts
│   └── services/
│       └── notification-router.service.ts # ← notification-hub.slice/gov.notification-router/
│
├── application/
│   ├── commands/                       # ← notification-hub.slice/_actions.ts
│   ├── queries/                        # ← notification-hub.slice/domain.notification/_queries.ts
│   └── sagas/
│       └── notification-delivery.saga.ts # ← notification-hub.slice/_services/
│
├── infrastructure/
│   └── adapters/
│       └── push-notification.adapter.ts # ← 實作 ports/i-notification.port.ts
│
├── interfaces/
│   └── components/
│       ├── notification-bell.tsx       # ← notification-hub.slice/_components/
│       └── notification-badge/         # ← notification-hub.slice/domain.notification/_components/
│
├── ports/
│   └── i-notification.port.ts          # ← shared/kernel/ports/i-messaging.ts 精煉
│
└── index.ts
```

#### modules/identity（身分認證）

```
modules/identity/
├── domains/
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   └── auth-token.vo.ts
│   └── services/
│       └── auth-policy.service.ts      # 登入策略（重試限制 / MFA）
│
├── application/
│   ├── commands/
│   │   ├── login/                      # ← identity.slice/ 登入 actions
│   │   ├── register/                   # ← identity.slice/ 註冊 actions
│   │   └── reset-password/
│   └── queries/
│       └── session/
│
├── infrastructure/
│   └── adapters/
│       └── firebase-auth.adapter.ts    # ← infrastructure/firebase/client/auth
│                                       #   實作 ports/i-auth.port.ts
│
├── interfaces/
│   └── components/
│       ├── login-form.tsx              # ← identity.slice/ login page
│       ├── register-form.tsx
│       └── reset-password-form.tsx
│
├── ports/
│   └── i-auth.port.ts                  # ← shared/kernel/ports/i-auth.service.ts
│
└── index.ts
```

#### modules/search（跨域搜尋，橫切輔助）

> `search` 是橫切輔助模組，不擁有業務資料，僅作為查詢路由器——接收搜尋請求、扇出至各模組的 `application/queries/`，並彙整結果。

```
modules/search/
├── domains/
│   └── value-objects/
│       └── search-query.vo.ts          # 搜尋關鍵字 + 篩選條件 VO
│
├── application/
│   └── queries/
│       └── global-search/              # ← global-search.slice/_actions.ts + _queries.ts
│           ├── federated-search.handler.ts
│           └── result-merger.ts
│
├── infrastructure/
│   └── adapters/
│       └── vector-search.adapter.ts    # ← lib/upstash/vector
│                                       #   (VS8 重構後可直接查企業知識庫)
│
├── interfaces/
│   └── hooks/
│       └── use-global-search.ts        # ← global-search.slice/ hooks
│
├── ports/
│   └── i-search-provider.port.ts       # 各模組實作此 Port，Search 模組聚合呼叫
│
└── index.ts
```

#### modules/portal（門戶殼層，橫切輔助）

> `portal` 是 App Shell 的狀態橋接模組，不擁有業務領域資料，負責協調各模組的 UI 狀態（側欄、通知計數、全域 Loading 等）。

```
modules/portal/
├── domains/
│   └── value-objects/
│       └── portal-state.vo.ts          # 殼層 UI 狀態 VO
│
├── application/
│   ├── commands/
│   │   └── shell/
│   └── queries/
│       └── shell/
│
├── infrastructure/
│   └── (無外部 I/O — 純 in-memory state)
│
├── interfaces/
│   └── hooks/
│       └── use-portal-state.ts         # ← portal.slice/core/_hooks/use-portal-state.ts
│
├── ports/
│   └── i-portal-bridge.port.ts         # 各模組向 portal 推送 UI 狀態
│
└── index.ts
```

---

## 5. 現況 → MDDD 對映表

### 5.1 Feature Slices 對映

| 現況路徑 | MDDD 目標路徑 | 層 | 備註 |
|---------|-------------|---|------|
| `features/workspace.slice/core/_actions.ts` | `modules/workspace/application/commands/workspace/` | Application | 命令處理器 |
| `features/workspace.slice/core/_queries.ts` | `modules/workspace/application/queries/workspace/` | Application | 查詢處理器 |
| `features/workspace.slice/core/_hooks/` | `modules/workspace/interfaces/hooks/` | Interfaces | Presenter |
| `features/workspace.slice/core/_components/` | `modules/workspace/interfaces/components/shell/` | Interfaces | UI |
| `features/workspace.slice/domain.tasks/_actions/` | `modules/workspace/application/commands/task/` | Application | |
| `features/workspace.slice/domain.tasks/_entity.ts` | `modules/workspace/domains/entities/task.entity.ts` | Domains | |
| `features/workspace.slice/domain.workflow/` | `modules/workspace/domains/aggregates/` + `application/commands/workflow/` | Domains+App | |
| `features/workspace.slice/gov.audit/` | `modules/workspace/application/commands/governance/audit/` + `interfaces/components/governance/` | App+Interfaces | |
| `features/workspace.slice/gov.role/` | `modules/workspace/application/commands/governance/roles/` | Application | |
| `features/workforce-scheduling.slice/domain.core/aggregate/` | `modules/scheduling/domains/aggregates/` | Domains | ✅ 已接近 MDDD |
| `features/workforce-scheduling.slice/domain.core/rules/` | `modules/scheduling/domains/` 或 `domains/services/` | Domains | ✅ 已接近 |
| `features/workforce-scheduling.slice/domain.application/` | `modules/scheduling/application/` | Application | ✅ 已接近 |
| `features/workforce-scheduling.slice/domain.ports/` | `modules/scheduling/ports/` | Ports | ✅ 已接近（升至獨立層）|
| `features/workforce-scheduling.slice/domain.ui/` | `modules/scheduling/interfaces/` | Interfaces | ✅ 已接近 |
| `features/organization.slice/core/` | `modules/organization/application/commands/org/` + `interfaces/` | App+Interfaces | |
| `features/organization.slice/gov.members/` | `modules/organization/application/commands/members/` + `interfaces/components/members/` | App+Interfaces | |
| `features/finance.slice/` | `modules/finance/` | All | 整體遷移 |
| `features/semantic-graph.slice/` | *(不遷移至 MDDD — 見第 9 節重構計畫)* | — | ⚠️ VS8 獨立重構 |
| `features/account.slice/domain.profile/` | `modules/account/` | All | |
| `features/skill-xp.slice/_aggregate.ts` | `modules/skill-xp/domains/aggregates/` | Domains | |
| `features/notification-hub.slice/` | `modules/notification/` | All | |
| `features/global-search.slice/` | `modules/search/` | All | 橫切輔助模組 |
| `features/portal.slice/` | `modules/portal/` | All | 橫切輔助模組 |
| `features/identity.slice/` | `modules/identity/` | All | 認證模組 |

### 5.2 Shared Infrastructure 對映

| 現況路徑 | MDDD 目標路徑 | 備註 |
|---------|-------------|------|
| `shared-infra/projection-bus/workspace-view/` | `modules/workspace/application/projections/workspace-view/` | 模組內部 Read Model |
| `shared-infra/projection-bus/tasks-view/` | `modules/workspace/application/projections/tasks-view/` | |
| `shared-infra/projection-bus/organization-view/` | `modules/organization/application/projections/organization-view/` | |
| `shared-infra/projection-bus/account-view/` | `modules/account/application/projections/account-view/` | |
| `shared-infra/projection-bus/account-schedule-view/` | `modules/scheduling/application/projections/` | |
| `shared-infra/projection-bus/demand-board-view/` | `modules/scheduling/application/projections/` | |
| `shared-infra/projection-bus/finance-staging-pool-view/` | `modules/finance/application/projections/` | |
| `shared-infra/projection-bus/tag-snapshot-view/` | VS8 重構後移入企業知識庫 `knowledge/` 模組（見第 9 節）| ⚠️ VS8 獨立重構 |
| `shared-infra/projection-bus/wallet-balance-view/` | `modules/account/application/projections/` | |
| `shared-infra/firebase-client/firestore/repositories/workspace*.ts` | `modules/workspace/infrastructure/persistence/` | |
| `shared-infra/firebase-client/firestore/repositories/workspace-business.tasks.repository.ts` | `modules/workspace/infrastructure/persistence/task.repo.ts` | |
| `shared-infra/gateway-command/` | `infrastructure/event-bus/` 或各模組 `infrastructure/` | |
| `shared-infra/gateway-query/` | `infrastructure/event-bus/` 或各模組 `infrastructure/` | |
| `shared-infra/event-router/` | `infrastructure/event-bus/event-router.ts` | |
| `shared-infra/outbox-relay/` | `infrastructure/event-bus/outbox-relay.ts` | |
| `shared-infra/dlq-manager/` | `infrastructure/event-bus/dlq-manager.ts` | |

### 5.3 Shared Kernel 精煉

| 現況內容 | MDDD 後位置 | 說明 |
|---------|-----------|------|
| `shared-kernel/types/workspace*.ts` | `modules/workspace/domains/` 或留 SK | 若只屬一個模組 → 移入模組 |
| `shared-kernel/types/finance.ts` | `modules/finance/domains/` 或留 SK | 同上 |
| `shared-kernel/ports/` | `shared/kernel/ports/` (保留) | 跨模組 Port → 留 SK |
| `shared-kernel/value-objects/` | `shared/kernel/value-objects/` (保留) | WorkspaceId, TaskId, Money |
| `shared-kernel/data-contracts/` | `shared/kernel/data-contracts/` (保留) | 跨模組契約 |
| `shared-kernel/constants/` | `shared/kernel/constants/` 或各模組 | 依使用範圍判斷 |
| `shared-kernel/observability/` | `shared/kernel/observability/` (保留) | 跨模組可觀測性 |

---

## 6. 差距分析

### 6.1 已符合 MDDD 的部分 ✅

| 項目 | 現況 | 說明 |
|------|------|------|
| Port 介面 | `shared-kernel/ports/` | IAuthService, IFirestoreRepo 等已定義 |
| 聚合根概念 | `workforce-scheduling.slice/domain.core/aggregate/` | 排班 BC 已有標準聚合 |
| 領域層分離 | `workforce-scheduling.slice/domain.core/` | 排班的領域邏輯已隔離 |
| 應用層分離 | `workforce-scheduling.slice/domain.application/` | 命令/查詢/Saga 已分層 |
| Port 契約 | `workforce-scheduling.slice/domain.ports/` | 命令/查詢/事件 Port 已定義 |
| 事件匯流排 | `*/core.event-bus/` | 各 BC 已有事件機制 |
| Outbox Pattern | `*/outbox/` + `shared-infra/outbox-relay/` | 已實作 Outbox 模式 |
| Value Objects | `shared-kernel/value-objects/` | WorkspaceId, TaskId, Money 已建立 |

### 6.2 需要改進的差距 ⚠️

| 差距 | 現況問題 | MDDD 目標 | 影響程度 |
|------|---------|----------|---------|
| **BC 邊界不清** | Features 與 gov.* 是 VS 慣例，非 BC | 明確 BC 定義與邊界 | 高 |
| **UI 與 Domain 混合** | `core/_components/` 與 `domain.*/_actions.ts` 同層 | Interface 層與 Application 層明確分離 | 中 |
| **Projections 散佈** | 17 個 Read Models 集中在 `shared-infra/projection-bus/` | 移入各 BC 的 `application/projections/` | 中 |
| **Repositories 共享** | Firestore repositories 在 `shared-infra/firebase-client/` | 移入各 BC 的 `infrastructure/persistence/` | 高 |
| **Domain Types 在 SK** | 單一 BC 專用的類型放在 `shared-kernel/types/` | BC 專用類型移入 BC domain 層 | 中 |
| **缺乏 ACL** | BC 間直接 import，無防腐層 | 透過 `index.ts` 公開 API 管控 BC 邊界 | 高 |
| **gov.* 命名** | 混合 governance 與 domain concern | 明確對映到 DDD 四層 | 低 |
| **workspace.slice 過大** | 176 檔，聚合過多子領域 | 考慮進一步細分（tasks / files / workflow BC） | 中 |

### 6.3 架構違規風險

```
當前已知的跨 BC 直接依賴（需建立 ACL）：

workspace.slice
  └─ 直接 import → finance.slice (財務標籤)
  └─ 直接 import → organization.slice (成員清單)
  └─ 直接 import → skill-xp.slice (技能標籤)

organization.slice
  └─ 直接 import → account.slice (帳號資料)

scheduling.slice
  └─ 直接 import → account.slice (帳號排班資料)
  └─ 直接 import → organization.slice (可用成員)

→ MDDD 後需透過共享 BC 的 published interface 或 domain event 溝通
```

---

## 7. 遷移路徑

建議採用**漸進式遷移**（Strangler Fig Pattern），分四波推進，保持系統隨時可交付。

### Wave 1 — 建立 BC 框架（低風險）

**目標：** 建立 `modules/` 目錄結構，不移動任何檔案，只建立各模組的 `index.ts` 公開 API。

```
工作項目：
□ 建立 modules/<feature-name>/ 目錄骨架（共 10 個模組）
□ 各模組建立 index.ts，re-export 現有 features/* 內容
□ 建立模組邊界規則文件 (modules/<feature>/AGENTS.md)
□ 更新 tsconfig.json 路徑別名：@/modules/<feature> → src/modules/<feature>
□ 建立 docs/mddd-migration-progress.md 追蹤進度
```

### Wave 2 — 精煉 Shared Kernel（中風險）

**目標：** 清理 `shared-kernel`，只留下真正跨模組共用的內容，並遷移至 `shared/kernel/`。

```
工作項目：
□ 識別 shared-kernel/types/ 中屬於單一模組的類型
□ 將模組專用類型遷移至對應模組的 domains/
□ 強化 shared/kernel/value-objects/ (完善 VOs)
□ 建立 shared/kernel/events/ 跨模組領域事件目錄
□ 確保 shared/kernel/ 不反向依賴任何模組
```

### Wave 3 — 分散 Projections & Repositories（高工作量）

**目標：** 將 `shared-infra` 中屬於特定 BC 的資源移入各 BC。

```
優先順序（依耦合度從低到高）：
1. scheduling 模組：projection-bus/* → modules/scheduling/application/projections/
2. finance 模組：finance-staging-pool-view → modules/finance/application/projections/
3. account 模組：account-*/wallet-balance → modules/account/application/projections/
4. workspace 模組：workspace-*/tasks-view → modules/workspace/application/projections/
5. organization 模組：organization-*/eligible-member → modules/organization/application/projections/

# ⚠️ tag-snapshot-view 屬於 VS8，將隨 VS8 重構（見第 9 節），不在此 Wave 處理

Repositories：
6. workspace Firestore repos → modules/workspace/infrastructure/persistence/
7. 其他模組 repositories 按需遷移
```

### Wave 4 — 實作 ACL & 完整 Domain 層（最高風險）

**目標：** 建立完整的 Domains 層，消除模組間的直接依賴，正式建立 `ports/` 為獨立層。

```
工作項目：
□ 各模組建立 domains/entities/ (從現有 _types.ts 萃取)
□ 將模組事件匯流排事件遷移至 domains/events/
□ domain.ports/ 升格為頂層 ports/ 層（獨立於 domains/）
□ 跨模組通訊改用領域事件或 Anti-Corruption Layer
□ 建立模組整合測試，驗證邊界隔離
□ 移除 features/ 目錄（或保留為向後相容 re-export stub）
```

### 遷移決策矩陣

| 模組 | 現況成熟度 | 遷移優先順序 | 建議 Wave |
|----|----------|------------|----------|
| `scheduling` | ⭐⭐⭐⭐ (已有 domains/app/ports 分層) | 🔵 最先 | Wave 2 |
| `finance` | ⭐⭐⭐ (結構清晰) | 🔵 優先 | Wave 2-3 |
| `notification` | ⭐⭐⭐ (有 domain 子目錄) | 🔵 優先 | Wave 3 |
| `skill-xp` | ⭐⭐⭐ (有 aggregate, 規模小) | 🟡 中等 | Wave 3 |
| `organization` | ⭐⭐ (gov.* 混合) | 🟡 中等 | Wave 3-4 |
| `account` | ⭐⭐ (domain.* + gov.*) | 🟡 中等 | Wave 3-4 |
| `identity` | ⭐⭐ (薄 UI slice，需 IAuthPort 整合) | 🟡 中等 | Wave 3 |
| `search` | ⭐⭐ (橫切，依賴其他模組穩定後) | 🟡 中等 | Wave 3-4 |
| `portal` | ⭐⭐ (純狀態橋接，影響範圍廣) | 🟡 中等 | Wave 4 |
| `workspace` | ⭐ (最大 VS，高耦合) | 🔴 最後 | Wave 4 |
| `semantic-graph` | — | ⚠️ **不遷移 MDDD** | 見第 9 節 |

---

## 8. 風險與注意事項

### 技術風險

| 風險 | 影響 | 緩解策略 |
|------|------|---------|
| **Import 路徑大量變動** | 破壞現有 TypeScript 別名 | 建立 re-export stubs，漸進更新 import |
| **Projection 解耦困難** | projection-bus 跨 BC 共用的 funnel 邏輯 | 保留 `shared-infra/projection-bus/_funnel*.ts` 為共享基礎設施 |
| **workspace.slice 過大** | Wave 4 遷移工作量龐大 | 考慮先拆分為 task-management + file-management + workflow sub-BC |
| **Firebase Repo 共享狀態** | 部分 Repository 跨 BC 存取相同 Collection | 明確定義 Collection ownership，建立 Cross-BC 資料存取規則 |
| **測試覆蓋率** | 遷移過程可能引入 regression | 遷移前先確保 unit test 覆蓋 domain/application 層 |

### 架構決策點

| 決策 | 選項 A | 選項 B | 建議 |
|------|--------|--------|------|
| **contexts/ vs features/** | 新目錄 `modules/` | 原地重構 `features/` | 建議 A：降低遷移風險 |
| **global-audit-view 歸屬** | 獨立 audit BC | 分散至各 BC | 建議 A：稽核是跨域橫切 |
| **portal.slice** | 保留為 app-level concern | 建立 portal BC | 建議 A：不是業務 BC |
| **Firestore 直存** | 完全透過 Port | 保留部分直存 | 建議 A：MDDD 原則優先 |

### 保留不動的項目

以下項目在 MDDD 後**不需要變動**：

- `src/app/` — Next.js App Router 結構維持不變
- `src/infrastructure/firebase/` — SDK 初始化適配器維持共享
- `src/infrastructure/upstash/` — 同上
- `src/lib-ui/` → 最終重命名為 `src/ui/`，但內容不需重構
- `src/shared/kernel/ports/` — Port 介面維持在 Shared Kernel

---

## 附錄：MDDD 目錄樹快速參考

> 📄 完整展開版請見 **[docs/mddd-target-tree.md](./mddd-target-tree.md)**

```
src/
├── app/                          ← Next.js routes（不動）
├── modules/                      ← ★ 新增：功能模組根目錄
│   ├── workspace/
│   │   ├── domains/              ← 領域層（entities / value-objects / aggregates / events / services）
│   │   ├── application/          ← 應用層（commands / queries / projections / sagas）
│   │   ├── infrastructure/       ← 基礎設施層（persistence / adapters）
│   │   ├── interfaces/           ← 介面層（components / hooks）
│   │   ├── ports/                ← Port 契約層（i-*.repo.ts / i-*.port.ts）
│   │   └── index.ts
│   ├── organization/             ← 同上結構
│   ├── scheduling/               ← 同上結構（最接近完成）
│   ├── finance/                  ← 同上結構
│   ├── account/                  ← 同上結構
│   ├── skill-xp/                 ← 同上結構
│   ├── notification/             ← 同上結構
│   ├── identity/                 ← 認證模組
│   ├── search/                   ← 橫切輔助模組
│   └── portal/                   ← 殼層橋接模組
│
│   # ⚠️ semantic-graph (VS8) 不在此目錄
│   #    → 保留 features/semantic-graph.slice/，重構為企業知識庫（見第 9 節）
│
├── infrastructure/               ← SDK 適配器（保留 + event-bus 新增）
│   ├── firebase/
│   ├── upstash/
│   ├── document-ai/
│   └── event-bus/                ← ★ 新增：跨模組事件匯流排
├── interfaces/                   ← ★ 新增：全域 API / Adapter
│   ├── api/                      ←    Command / Query Gateway
│   └── webhooks/
├── shared/                       ← ★ 新增（← shared-kernel/ 精煉）
│   ├── kernel/
│   │   ├── value-objects/
│   │   ├── ports/
│   │   ├── events/
│   │   └── data-contracts/
│   └── utils/
├── ui/                           ← ★ 重命名（← lib-ui/）
└── lib/                          ← ★ 新增：第三方 SDK 薄包裝
    ├── firebase/
    ├── upstash/
    └── ai/
```

---

## 9. VS8 企業知識庫重構（獨立路線）

> `semantic-graph.slice`（VS8）**不進行 MDDD 遷移**。其職責將被全面重構為**企業知識庫 (Enterprise Knowledge Base)**，採用 **Upstash SDK**（Vector、Redis、QStash），形成以向量語意搜尋為核心的知識服務。

### 9.1 重構動機

| 現況問題 | 重構方向 |
|---------|---------|
| `_services.ts` 使用 in-memory `Map` 作為語意索引，無法跨節點持久化 | → Upstash **Vector** 持久化向量索引 |
| 標籤查詢無語意相似度排序 | → 向量相似度搜尋 (cosine similarity) |
| 知識圖譜僅在客戶端記憶體中 | → Redis 快取 + Vector 持久化 |
| 無嵌入 (embedding) 管線 | → vector-ingestion 模組負責文字 → 向量 |
| proposal-stream 依賴 in-memory 推播 | → QStash 佇列驅動的知識提案工作流 |

### 9.2 目標結構（AS-IS → TO-BE）

#### 現況 semantic-graph.slice（AS-IS）

```
features/semantic-graph.slice/
├── _aggregate.ts           # 時序衝突偵測 + 分類法驗證
├── _actions.ts             # 標籤 CRUD (Server Actions)
├── _bus.ts                 # 標籤事件匯流排 (in-process)
├── _cost-classifier.ts     # 費用項目語意分類
├── _queries.ts             # 讀取 Port
├── _semantic-authority.ts  # 搜尋域 + 分類維度定義
├── _services.ts            # ⚠️ in-memory Map 語意索引
├── _types.ts               # 領域類型
├── outbox/                 # 標籤 outbox
├── projections/            # 投影選擇器
│   ├── context-selectors.ts
│   ├── graph-selectors.ts
│   └── tag-snapshot.slice.ts
├── proposal-stream/        # 提案流
├── subscribers/            # 生命週期訂閱者
└── wiki-editor/            # 知識圖譜視覺化
```

#### 目標 Enterprise Knowledge Base（TO-BE）

```
features/semantic-graph.slice/          # 保留路徑，重構內部結構
├── knowledge/                          # ★ 企業知識庫核心模組
│   ├── _entity.ts                      # KnowledgeItem entity (id, title, content, tags, embedding[])
│   ├── _actions.ts                     # 知識項目 CRUD + upsert to Upstash Vector
│   │                                   #   import { vectorIndex } from '@/infrastructure/upstash/vector'
│   ├── _queries.ts                     # 語意搜尋 (vector similarity) + metadata filter
│   │                                   #   import { vectorIndex } from '@/infrastructure/upstash/vector'
│   ├── _cache.ts                       # Redis 快取層 (熱門知識項目 + 分類結果)
│   │                                   #   import { redis } from '@/infrastructure/upstash/redis'
│   └── index.ts
│
├── taxonomy/                           # ★ 分類法管理模組
│   ├── _aggregate.ts                   # ← semantic-graph.slice/_aggregate.ts (精煉)
│   │                                   #   保留：分類法驗證、時序衝突偵測
│   │                                   #   移除：in-memory index 邏輯（已移至 knowledge/）
│   ├── _semantic-authority.ts          # ← semantic-graph.slice/_semantic-authority.ts
│   │                                   #   搜尋域定義 + TaxonomyDimension
│   ├── _cost-classifier.ts             # ← semantic-graph.slice/_cost-classifier.ts
│   │                                   #   純 keyword-based 分類，零 SDK 依賴
│   ├── _actions.ts                     # 分類法 CRUD (新增/更新/棄用分類維度)
│   ├── _queries.ts                     # 分類法查詢 (getTaxonomyTree, validatePath)
│   └── index.ts
│
├── vector-ingestion/                   # ★ 向量嵌入管線模組
│   ├── _embedder.ts                    # 文字 → 向量 (OpenAI / Genkit embedding)
│   │                                   #   import { genkit } from '@/infrastructure/document-ai/genkit'
│   ├── _chunker.ts                     # 長文件分塊策略 (fixed / semantic chunking)
│   ├── _ingestor.ts                    # 批次寫入 Upstash Vector
│   │                                   #   import { vectorIndex } from '@/infrastructure/upstash/vector'
│   ├── _pipeline.ts                    # 完整管線：document → chunk → embed → upsert
│   │                                   #   可由 QStash 工作佇列驅動
│   │                                   #   import { qstash } from '@/infrastructure/upstash/qstash'
│   └── index.ts
│
├── _bus.ts                             # 保留：標籤事件匯流排 (供其他 VS 訂閱)
├── _types.ts                           # 精煉後的領域類型
├── outbox/                             # 保留：標籤 outbox
└── index.ts                            # 精煉後的公開 API
```

### 9.3 Upstash SDK 整合對映

| 模組 | 使用 SDK | 用途 |
|------|---------|------|
| `knowledge/_actions.ts` | `vectorIndex()` (Upstash Vector) | upsert 知識項目嵌入向量 + metadata |
| `knowledge/_queries.ts` | `vectorIndex()` (Upstash Vector) | query by vector / metadata filter |
| `knowledge/_cache.ts` | `redis` (Upstash Redis) | 快取熱門知識項目 TTL 300s |
| `vector-ingestion/_ingestor.ts` | `vectorIndex()` (Upstash Vector) | 批次 upsert |
| `vector-ingestion/_pipeline.ts` | `qstash` (Upstash QStash) | 非同步嵌入工作佇列 |
| `vector-ingestion/_embedder.ts` | Genkit (Google AI) | 文字 → float32[] embedding |

#### Upstash Vector 資料結構

```typescript
// 每筆知識項目在 Upstash Vector 中的結構
interface KnowledgeVectorRecord {
  id: string;                  // 唯一識別碼 (e.g., "kb:tag:skill-react")
  vector: number[];            // 嵌入向量 (1536-dim for text-embedding-3-small)
  metadata: {
    title: string;
    content: string;           // 摘要 / 原文節錄
    domain: string;            // taxonomy domain (e.g., "skill", "tool", "process")
    tags: string[];            // 關聯標籤 slugs
    source: 'tag' | 'wiki' | 'document' | 'manual';
    createdAt: string;
    updatedAt: string;
  };
}
```

### 9.4 現況 → 目標 對映

| 現況檔案 | 去向 | 說明 |
|---------|------|------|
| `_services.ts` (in-memory Map) | `knowledge/_queries.ts` (Upstash Vector) | **核心變更**：記憶體 → 向量資料庫 |
| `_actions.ts` (tag CRUD) | `knowledge/_actions.ts` + `taxonomy/_actions.ts` | 按知識 vs 分類法分開 |
| `_aggregate.ts` | `taxonomy/_aggregate.ts` | 保留分類法驗證邏輯 |
| `_cost-classifier.ts` | `taxonomy/_cost-classifier.ts` | 保留，純函式無依賴 |
| `_semantic-authority.ts` | `taxonomy/_semantic-authority.ts` | 保留搜尋域定義 |
| `_queries.ts` | `knowledge/_queries.ts` | 語意搜尋改用 Vector query |
| `_bus.ts` | `_bus.ts` (保留) | 標籤事件機制保持不變 |
| `outbox/tag-outbox.ts` | `outbox/` (保留) | Outbox 模式保持不變 |
| `projections/tag-snapshot.slice.ts` | `knowledge/_cache.ts` (部分) | Read Model 遷移至 Redis 快取 |
| `proposal-stream/` | `vector-ingestion/_pipeline.ts` | 提案流 → QStash 工作佇列 |
| `wiki-editor/` | `knowledge/` (保留為 interface) | 知識圖譜視覺化移入 knowledge 模組 |
| `subscribers/lifecycle-subscriber.ts` | `knowledge/_actions.ts` (訂閱觸發) | 生命週期事件 → 觸發 vector upsert |

### 9.5 重構路徑

```
Phase 1 — 建立新模組骨架（不移動現有程式碼）
□ 建立 knowledge/ taxonomy/ vector-ingestion/ 目錄骨架
□ 建立各模組 index.ts (re-export 現有邏輯)
□ 驗證現有 unit tests 仍通過

Phase 2 — 接入 Upstash Vector
□ 實作 knowledge/_actions.ts (vectorIndex().upsert)
□ 實作 knowledge/_queries.ts (vectorIndex().query)
□ 實作 vector-ingestion/_embedder.ts (Genkit embedding)
□ 實作 vector-ingestion/_ingestor.ts (批次 upsert)
□ 撰寫整合測試 (mock vectorIndex)

Phase 3 — 遷移現有邏輯
□ 將 _services.ts (in-memory Map) 替換為 Upstash Vector 查詢
□ 將 proposal-stream/ 遷移至 QStash 工作佇列
□ 將 tag-snapshot.slice.ts 遷移至 Redis 快取
□ 更新 shared-infra/projection-bus/tag-snapshot-view/ 指向新實作

Phase 4 — 清理
□ 移除 _services.ts 中的 in-memory Map
□ 更新 index.ts 公開 API
□ 更新 docs 與 AGENTS.md
```

---

*文件版本：1.1*
*分析日期：2026-03-16*
*更新日期：2026-03-17（新增 VS8 企業知識庫重構章節；移除 VS8 的 MDDD 遷移規劃）*
*分析範疇：xuanwu 專案 src/ 目錄完整結構*
