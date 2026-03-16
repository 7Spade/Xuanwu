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
   - [Bounded Context 標準結構](#42-bounded-context-標準結構)
   - [各 Bounded Context 完整樹](#43-各-bounded-context-完整樹)
5. [現況 → MDDD 對映表](#5-現況--mddd-對映表)
6. [差距分析](#6-差距分析)
7. [遷移路徑](#7-遷移路徑)
8. [風險與注意事項](#8-風險與注意事項)

---

## 1. 概覽

本文件分析 Xuanwu 專案從現有 **Vertical Slice Architecture (VS)** 轉換至 **Micro Domain-Driven Design (MDDD)** 架構的結構差異、對映關係與遷移策略。

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
│   ├── semantic-graph.slice/   # VS8: 語意知識圖譜
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
| `semantic-graph.slice` | 平坦式 + `projections/` + `subscribers/` + `outbox/` | 語意圖譜 / 標籤 / 提案流 |
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
│  │  Interface Layer (interface/)                         │  │
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
│  │  Domain Layer (domain/)  │ │  Infrastructure Layer    │  │
│  │  Entities · VOs          │ │  (infrastructure/)       │  │
│  │  Aggregates              │ │  Repository Impls        │  │
│  │  Domain Events           │ │  External Service Adapts │  │
│  │  Domain Services         │ │  Outbox / Relay          │  │
│  │  Repository Ports        │ └──────────────────────────┘  │
│  └──────────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘

依賴方向：Interface → Application → Domain ← (Port ← Infrastructure)
```

### MDDD vs 現有 VS 慣例對照

| VS 慣例 | MDDD 對映 | 說明 |
|--------|----------|------|
| `core/_actions.ts` | `application/commands/` | 命令動作 → 命令處理器 |
| `core/_queries.ts` | `application/queries/` | 查詢 → 查詢處理器 |
| `core/_hooks/` | `interface/hooks/` | Presenter hooks |
| `core/_components/` | `interface/components/` | UI 元件 |
| `domain.*/_actions.ts` | `application/commands/` | 子領域命令 |
| `domain.*/aggregate*` | `domain/aggregates/` | 聚合根 |
| `domain.*/rules*` | `domain/` 或 `domain/services/` | 領域規則 |
| `gov.*/_actions.ts` | `application/commands/governance/` | 治理命令 |
| `gov.*/_components/` | `interface/components/governance/` | 治理 UI |
| `domain.ports/` | `domain/ports/` | Port 介面 (位置對) |
| `shared-infra/projection-bus/X-view/` | BC `application/projections/` | Read Model |
| `shared-infra/firebase-client/repositories/` | BC `infrastructure/persistence/` | Repository 實作 |

---

## 4. 目標 TO-BE：MDDD 結構樹

### 4.1 頂層目錄樹

```
src/
├── app/                        # Next.js App Router (不變)
│   └── (同現況)
│
├── app-runtime/                # Runtime providers (不變)
│
├── contexts/                   # ← NEW: Bounded Contexts 根目錄
│   ├── workspace/              # BC: 工作區管理 (含 task / daily / file / workflow)
│   ├── organization/           # BC: 組織治理 (含 member / team / partner / policy)
│   ├── scheduling/             # BC: 人力排班
│   ├── semantic-graph/         # BC: 語意知識圖譜
│   ├── finance/                # BC: 財務追蹤
│   ├── account/                # BC: 帳號 / 個人資料 / 錢包
│   ├── skill-xp/               # BC: 技能經驗值
│   ├── notification/           # BC: 通知中樞
│   ├── identity/               # BC: 身分認證 (登入/註冊)
│   ├── search/                 # BC: 跨域搜尋 (橫切輔助)
│   └── portal/                 # BC: 門戶殼層 (橫切輔助)
│
├── shared-kernel/              # Shared Kernel (精煉後)
│   ├── value-objects/          # 跨 BC 共用 VO (WorkspaceId, TaskId, Money…)
│   ├── events/                 # 跨 BC 領域事件契約
│   ├── ports/                  # 跨 BC Port 介面
│   ├── data-contracts/         # DTO / 契約類型
│   ├── constants/
│   ├── enums/
│   ├── observability/
│   └── index.ts
│
├── infrastructure/             # 共享基礎設施 (SDK 適配器)
│   ├── firebase/               # Firebase SDK (Admin + Client 初始化)
│   ├── upstash/                # Redis / QStash / Vector / Workflow
│   ├── document-ai/            # Google Document AI + Genkit
│   └── event-bus/              # ← NEW: 跨 BC 事件匯流排實作
│       ├── event-router.ts
│       ├── outbox-relay.ts
│       └── dlq-manager.ts
│
├── lib-ui/                     # UI 元件庫 (不變)
│
└── config/                     # 全域配置 (不變)
```

### 4.2 Bounded Context 標準結構

每個 BC 遵循以下四層結構：

```
contexts/<bc-name>/
├── domain/                     # 領域層 — 零外部依賴
│   ├── entities/               # 領域實體 (有 ID 的業務物件)
│   ├── value-objects/          # 值物件 (不可變，以值判等)
│   ├── aggregates/             # 聚合根 (一致性邊界)
│   ├── events/                 # 領域事件 (已發生的事實)
│   ├── services/               # 領域服務 (跨 entity 的業務規則)
│   ├── ports/                  # Repository 介面 & 服務 Port
│   └── index.ts
│
├── application/                # 應用層 — 協調領域物件完成使用案例
│   ├── commands/               # 命令處理器 (寫操作)
│   │   └── <subdomain>/
│   ├── queries/                # 查詢處理器 (讀操作)
│   │   └── <subdomain>/
│   ├── projections/            # Read Model 投影 (從 shared-infra 遷移)
│   ├── sagas/                  # 長時序協調 (Saga / Process Manager)
│   ├── policies/               # 業務策略 (事件驅動)
│   └── index.ts
│
├── infrastructure/             # 基礎設施層 — 實作 Port 介面
│   ├── persistence/            # Repository 實作 (Firestore)
│   ├── adapters/               # 外部服務適配器
│   └── index.ts
│
├── interface/                  # 介面層 — UI + API 橋接
│   ├── components/             # React 元件 (純展示)
│   ├── hooks/                  # React hooks (Presenter)
│   └── index.ts
│
└── index.ts                    # BC 公開 API (ACL 邊界)
```

### 4.3 各 Bounded Context 完整樹

#### BC: workspace（工作區管理）

```
contexts/workspace/
├── domain/
│   ├── entities/
│   │   ├── workspace.entity.ts         # ← workspace.slice/core/_types.ts
│   │   ├── task.entity.ts              # ← workspace.slice/domain.tasks/_entity.ts
│   │   ├── daily-log.entity.ts         # ← workspace.slice/domain.daily/*
│   │   ├── workflow.entity.ts          # ← workspace.slice/domain.workflow/*
│   │   ├── issue.entity.ts             # ← workspace.slice/domain.issues/*
│   │   └── file.entity.ts              # ← workspace.slice/domain.files/*
│   ├── value-objects/
│   │   ├── workspace-id.vo.ts          # ← shared-kernel/value-objects/WorkspaceId
│   │   ├── task-id.vo.ts               # ← shared-kernel/value-objects/TaskId
│   │   ├── workflow-stage.vo.ts        # ← workspace.slice/domain.workflow/*
│   │   └── acceptance-status.vo.ts    # ← workspace.slice/domain.acceptance/*
│   ├── aggregates/
│   │   ├── workspace.aggregate.ts      # ← workspace.slice/core/_actions.ts (aggregate root)
│   │   ├── task.aggregate.ts           # ← workspace.slice/domain.tasks/_actions/*
│   │   └── daily-log.aggregate.ts      # ← workspace.slice/domain.daily/*
│   ├── events/
│   │   ├── task-created.event.ts       # ← workspace.slice/core.event-bus/_events.ts
│   │   ├── task-assigned.event.ts
│   │   ├── workflow-stage-changed.event.ts
│   │   └── daily-log-submitted.event.ts
│   ├── services/
│   │   ├── workspace-policy.service.ts # ← workspace.slice/domain.application/policy-engine
│   │   └── parsing-intent.service.ts  # ← workspace.slice/domain.parsing-intent/*
│   └── ports/
│       ├── i-workspace.repo.ts
│       ├── i-task.repo.ts
│       └── i-file-store.port.ts        # ← shared-kernel/ports/i-file-store.ts
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
├── interface/
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
└── index.ts                            # ← workspace.slice/index.ts
```

#### BC: organization（組織治理）

```
contexts/organization/
├── domain/
│   ├── entities/
│   │   ├── organization.entity.ts      # ← organization.slice/core/_types.ts
│   │   ├── member.entity.ts            # ← organization.slice/gov.members/*
│   │   ├── team.entity.ts              # ← organization.slice/gov.teams/*
│   │   └── partner.entity.ts          # ← organization.slice/gov.partners/*
│   ├── value-objects/
│   │   ├── organization-id.vo.ts
│   │   └── membership-role.vo.ts
│   ├── aggregates/
│   │   └── organization.aggregate.ts
│   ├── events/
│   │   ├── member-joined.event.ts      # ← organization.slice/core.event-bus/_events.ts
│   │   └── team-created.event.ts
│   └── ports/
│       └── i-organization.repo.ts
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
│   │   ├── members/                    # ← organization.slice/gov.members/_queries.ts
│   │   └── ...
│   └── projections/
│       ├── organization-view/          # ← shared-infra/projection-bus/organization-view/
│       ├── org-eligible-member-view/   # ← shared-infra/projection-bus/org-eligible-member-view/
│       └── semantic-governance-view/   # ← shared-infra/projection-bus/semantic-governance-view/
│
├── infrastructure/
│   └── persistence/
│       └── organization.repo.ts
│
├── interface/
│   ├── components/
│   │   ├── core/                       # ← organization.slice/core/_components/
│   │   ├── members/                    # ← organization.slice/gov.members/_components/
│   │   ├── teams/                      # ← organization.slice/gov.teams/_components/
│   │   ├── partners/                   # ← organization.slice/gov.partners/_components/
│   │   └── semantic/                   # ← organization.slice/gov.semantic/_components/
│   └── hooks/
│       └── use-organization-management.ts
│
└── index.ts
```

#### BC: scheduling（人力排班）

```
contexts/scheduling/
├── domain/
│   ├── entities/
│   │   └── schedule-item.entity.ts     # ← workforce-scheduling.slice/domain.core/types/
│   ├── value-objects/
│   │   └── schedule-status.vo.ts       # ← workforce-scheduling.slice/domain.core/rules/
│   ├── aggregates/
│   │   └── org-schedule.aggregate.ts   # ← workforce-scheduling.slice/domain.core/aggregate/
│   ├── events/
│   │   └── schedule-proposed.event.ts
│   ├── services/
│   │   ├── eligibility.service.ts      # ← domain.core/eligibility/
│   │   └── policy-mapper.service.ts    # ← domain.core/policy-mapper/
│   └── ports/
│       ├── i-scheduling-command.port.ts # ← domain.ports/command.port.ts
│       ├── i-scheduling-query.port.ts   # ← domain.ports/query.port.ts
│       └── i-scheduling-event.port.ts   # ← domain.ports/event.port.ts
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
├── interface/
│   ├── components/                     # ← domain.ui/components/runtime/
│   └── hooks/                          # ← domain.ui/hooks/runtime/
│
└── index.ts
```

#### BC: semantic-graph（語意知識圖譜）

```
contexts/semantic-graph/
├── domain/
│   ├── entities/
│   │   └── semantic-tag.entity.ts      # ← semantic-graph.slice/_types.ts
│   ├── aggregates/
│   │   └── semantic-graph.aggregate.ts # ← semantic-graph.slice/_aggregate.ts
│   ├── events/                         # ← semantic-graph.slice/_bus.ts
│   ├── services/
│   │   ├── cost-classifier.service.ts  # ← _cost-classifier.ts
│   │   └── semantic-authority.service.ts # ← _semantic-authority.ts
│   └── ports/
│       └── i-semantic-graph.repo.ts
│
├── application/
│   ├── commands/                       # ← semantic-graph.slice/_actions.ts
│   ├── queries/                        # ← semantic-graph.slice/_queries.ts
│   ├── projections/
│   │   ├── tag-snapshot-view/          # ← shared-infra/projection-bus/tag-snapshot-view/
│   │   └── global-audit-view/          # ← shared-infra/projection-bus/global-audit-view/ (partial)
│   └── sagas/
│       └── tag-lifecycle.saga.ts       # ← _services.ts + subscribers/
│
├── infrastructure/
│   └── persistence/
│       └── semantic-graph.repo.ts
│
├── interface/
│   ├── components/
│   │   └── wiki-editor/                # ← semantic-graph.slice/wiki-editor/
│   └── hooks/
│       └── proposal-stream/            # ← semantic-graph.slice/proposal-stream/
│
└── index.ts
```

#### BC: finance（財務追蹤）

```
contexts/finance/
├── domain/
│   ├── entities/
│   │   └── finance-item.entity.ts      # ← finance.slice/_types.ts
│   ├── aggregates/
│   │   └── finance.aggregate.ts        # ← finance.slice/_services/finance-aggregate-query-gateway.ts
│   ├── events/
│   ├── services/
│   │   └── finance-lifecycle.service.ts # ← finance.slice/_hooks/use-finance-lifecycle.ts
│   └── ports/
│       └── i-finance.repo.ts
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
├── interface/
│   ├── components/                     # ← finance.slice/_components/
│   └── hooks/                          # ← finance.slice/_hooks/
│
└── index.ts
```

#### BC: account（帳號管理）

```
contexts/account/
├── domain/
│   ├── entities/
│   │   ├── account.entity.ts           # ← account.slice/domain.profile/*
│   │   └── wallet.entity.ts            # ← account.slice/domain.wallet/*
│   ├── value-objects/
│   │   └── account-role.vo.ts          # ← account.slice/gov.role/*
│   ├── events/
│   │   └── (account event bus)         # ← account.slice/account-event-bus.ts
│   ├── services/
│   │   └── account-policy.service.ts   # ← account.slice/gov.policy/*
│   └── ports/
│       └── i-account.repo.ts
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
├── interface/
│   ├── components/                     # ← account.slice/domain.profile/_components/
│   └── hooks/
│       └── use-user.ts                 # ← account.slice/domain.profile/_hooks/
│
└── index.ts
```

#### BC: skill-xp（技能經驗值）

```
contexts/skill-xp/
├── domain/
│   ├── aggregates/
│   │   └── skill-xp.aggregate.ts       # ← skill-xp.slice/_aggregate.ts
│   ├── entities/
│   │   └── skill-tag.entity.ts         # ← skill-xp.slice/_tag-pool.ts
│   ├── events/
│   │   └── skill-gained.event.ts
│   ├── services/
│   │   ├── tag-lifecycle.service.ts    # ← skill-xp.slice/_tag-lifecycle.ts
│   │   └── org-recognition.service.ts  # ← skill-xp.slice/_org-recognition.ts
│   └── ports/
│       └── i-skill-xp.repo.ts
│
├── application/
│   ├── commands/                       # ← skill-xp.slice/_actions.ts
│   ├── queries/                        # ← skill-xp.slice/_queries.ts
│   └── projections/
│       └── (account-skill-view 共享 account BC)
│
├── infrastructure/
│   └── persistence/
│       └── skill-xp.repo.ts
│
├── interface/
│   └── components/
│       └── personal-skill-panel.tsx    # ← skill-xp.slice/_components/
│
└── index.ts
```

#### BC: notification（通知中樞）

```
contexts/notification/
├── domain/
│   ├── entities/
│   │   └── notification.entity.ts      # ← notification-hub.slice/_types.ts
│   ├── aggregates/
│   │   └── notification-hub.aggregate.ts # ← notification-hub.slice/_notification-authority.ts
│   ├── services/
│   │   └── notification-router.service.ts # ← notification-hub.slice/gov.notification-router/
│   └── ports/
│       └── i-notification.repo.ts
│
├── application/
│   ├── commands/                       # ← notification-hub.slice/_actions.ts
│   ├── queries/                        # ← notification-hub.slice/domain.notification/_queries.ts
│   └── sagas/
│       └── notification-delivery.saga.ts # ← notification-hub.slice/_services/
│
├── infrastructure/
│   └── adapters/
│       └── push-notification.adapter.ts # ← shared-kernel/ports/i-messaging.ts 實作
│
├── interface/
│   └── components/
│       ├── notification-bell.tsx       # ← notification-hub.slice/_components/
│       └── notification-badge/         # ← notification-hub.slice/domain.notification/_components/
│
└── index.ts
```

---

## 5. 現況 → MDDD 對映表

### 5.1 Feature Slices 對映

| 現況路徑 | MDDD 目標路徑 | 層 | 備註 |
|---------|-------------|---|------|
| `features/workspace.slice/core/_actions.ts` | `contexts/workspace/application/commands/workspace/` | Application | 命令處理器 |
| `features/workspace.slice/core/_queries.ts` | `contexts/workspace/application/queries/workspace/` | Application | 查詢處理器 |
| `features/workspace.slice/core/_hooks/` | `contexts/workspace/interface/hooks/` | Interface | Presenter |
| `features/workspace.slice/core/_components/` | `contexts/workspace/interface/components/shell/` | Interface | UI |
| `features/workspace.slice/domain.tasks/_actions/` | `contexts/workspace/application/commands/task/` | Application | |
| `features/workspace.slice/domain.tasks/_entity.ts` | `contexts/workspace/domain/entities/task.entity.ts` | Domain | |
| `features/workspace.slice/domain.workflow/` | `contexts/workspace/domain/aggregates/` + `application/commands/workflow/` | Domain+App | |
| `features/workspace.slice/gov.audit/` | `contexts/workspace/application/commands/governance/audit/` + `interface/components/governance/` | App+Interface | |
| `features/workspace.slice/gov.role/` | `contexts/workspace/application/commands/governance/roles/` | Application | |
| `features/workforce-scheduling.slice/domain.core/aggregate/` | `contexts/scheduling/domain/aggregates/` | Domain | ✅ 已接近 MDDD |
| `features/workforce-scheduling.slice/domain.core/rules/` | `contexts/scheduling/domain/` 或 `domain/services/` | Domain | ✅ 已接近 |
| `features/workforce-scheduling.slice/domain.application/` | `contexts/scheduling/application/` | Application | ✅ 已接近 |
| `features/workforce-scheduling.slice/domain.ports/` | `contexts/scheduling/domain/ports/` | Domain | ✅ 已接近 |
| `features/workforce-scheduling.slice/domain.ui/` | `contexts/scheduling/interface/` | Interface | ✅ 已接近 |
| `features/organization.slice/core/` | `contexts/organization/application/commands/org/` + `interface/` | App+Interface | |
| `features/organization.slice/gov.members/` | `contexts/organization/application/commands/members/` + `interface/components/members/` | App+Interface | |
| `features/finance.slice/` | `contexts/finance/` | All | 整體遷移 |
| `features/semantic-graph.slice/_aggregate.ts` | `contexts/semantic-graph/domain/aggregates/` | Domain | |
| `features/account.slice/domain.profile/` | `contexts/account/` | All | |
| `features/skill-xp.slice/_aggregate.ts` | `contexts/skill-xp/domain/aggregates/` | Domain | |
| `features/notification-hub.slice/` | `contexts/notification/` | All | |
| `features/global-search.slice/` | `contexts/search/` | All | 橫切輔助 BC |
| `features/portal.slice/` | `contexts/portal/` | All | 橫切輔助 BC |
| `features/identity.slice/` | `contexts/identity/` | All | 認證 BC |

### 5.2 Shared Infrastructure 對映

| 現況路徑 | MDDD 目標路徑 | 備註 |
|---------|-------------|------|
| `shared-infra/projection-bus/workspace-view/` | `contexts/workspace/application/projections/workspace-view/` | BC 內部 Read Model |
| `shared-infra/projection-bus/tasks-view/` | `contexts/workspace/application/projections/tasks-view/` | |
| `shared-infra/projection-bus/organization-view/` | `contexts/organization/application/projections/organization-view/` | |
| `shared-infra/projection-bus/account-view/` | `contexts/account/application/projections/account-view/` | |
| `shared-infra/projection-bus/account-schedule-view/` | `contexts/scheduling/application/projections/` | |
| `shared-infra/projection-bus/demand-board-view/` | `contexts/scheduling/application/projections/` | |
| `shared-infra/projection-bus/finance-staging-pool-view/` | `contexts/finance/application/projections/` | |
| `shared-infra/projection-bus/tag-snapshot-view/` | `contexts/semantic-graph/application/projections/` | |
| `shared-infra/projection-bus/wallet-balance-view/` | `contexts/account/application/projections/` | |
| `shared-infra/firebase-client/firestore/repositories/workspace*.ts` | `contexts/workspace/infrastructure/persistence/` | |
| `shared-infra/firebase-client/firestore/repositories/workspace-business.tasks.repository.ts` | `contexts/workspace/infrastructure/persistence/task.repo.ts` | |
| `shared-infra/gateway-command/` | `infrastructure/event-bus/` 或各 BC `infrastructure/` | |
| `shared-infra/gateway-query/` | `infrastructure/event-bus/` 或各 BC `infrastructure/` | |
| `shared-infra/event-router/` | `infrastructure/event-bus/event-router.ts` | |
| `shared-infra/outbox-relay/` | `infrastructure/event-bus/outbox-relay.ts` | |
| `shared-infra/dlq-manager/` | `infrastructure/event-bus/dlq-manager.ts` | |

### 5.3 Shared Kernel 精煉

| 現況內容 | MDDD 後位置 | 說明 |
|---------|-----------|------|
| `shared-kernel/types/workspace*.ts` | `contexts/workspace/domain/` 或留 SK | 若只屬一個 BC → 移入 BC |
| `shared-kernel/types/finance.ts` | `contexts/finance/domain/` 或留 SK | 同上 |
| `shared-kernel/ports/` | `shared-kernel/ports/` (保留) | 跨 BC Port → 留 SK |
| `shared-kernel/value-objects/` | `shared-kernel/value-objects/` (保留) | WorkspaceId, TaskId, Money |
| `shared-kernel/data-contracts/` | `shared-kernel/data-contracts/` (保留) | 跨 BC 契約 |
| `shared-kernel/constants/` | `shared-kernel/constants/` 或各 BC | 依使用範圍判斷 |
| `shared-kernel/observability/` | `shared-kernel/observability/` (保留) | 跨 BC 可觀測性 |

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

**目標：** 建立 `contexts/` 目錄結構，不移動任何檔案，只建立 BC 的 `index.ts` 公開 API。

```
工作項目：
□ 建立 contexts/<bc-name>/ 目錄骨架（共 11 個 BC）
□ 各 BC 建立 index.ts，re-export 現有 features/* 內容
□ 建立 BC 邊界規則文件 (contexts/<bc-name>/AGENTS.md)
□ 更新 tsconfig.json 路徑別名：@/contexts/<bc> → src/contexts/<bc>
□ 建立 docs/mddd-migration-progress.md 追蹤進度
```

### Wave 2 — 精煉 Shared Kernel（中風險）

**目標：** 清理 `shared-kernel`，只留下真正跨 BC 共用的內容。

```
工作項目：
□ 識別 shared-kernel/types/ 中屬於單一 BC 的類型
□ 將 BC 專用類型遷移至對應 BC 的 domain/
□ 強化 shared-kernel/value-objects/ (完善 VOs)
□ 建立 shared-kernel/events/ 跨 BC 領域事件目錄
□ 確保 shared-kernel 不反向依賴任何 BC
```

### Wave 3 — 分散 Projections & Repositories（高工作量）

**目標：** 將 `shared-infra` 中屬於特定 BC 的資源移入各 BC。

```
優先順序（依耦合度從低到高）：
1. scheduling BC：projection-bus/* → contexts/scheduling/application/projections/
2. finance BC：finance-staging-pool-view → contexts/finance/application/projections/
3. semantic-graph BC：tag-snapshot-view → contexts/semantic-graph/application/projections/
4. account BC：account-*/wallet-balance → contexts/account/application/projections/
5. workspace BC：workspace-*/tasks-view → contexts/workspace/application/projections/
6. organization BC：organization-*/eligible-member → contexts/organization/application/projections/

Repositories：
7. workspace Firestore repos → contexts/workspace/infrastructure/persistence/
8. 其他 BC repositories 按需遷移
```

### Wave 4 — 實作 ACL & 完整 Domain 層（最高風險）

**目標：** 建立完整的 Domain 層，消除 BC 間的直接依賴。

```
工作項目：
□ 各 BC 建立 domain/entities/ (從現有 _types.ts 萃取)
□ 將 BC 事件匯流排事件遷移至 domain/events/
□ 跨 BC 通訊改用領域事件或 Anti-Corruption Layer
□ 建立 BC 整合測試，驗證邊界隔離
□ 移除 features/ 目錄（或保留為向後相容 re-export stub）
```

### 遷移決策矩陣

| BC | 現況成熟度 | 遷移優先順序 | 建議 Wave |
|----|----------|------------|----------|
| `scheduling` | ⭐⭐⭐⭐ (已有 domain/app/ports 分層) | 🔵 最先 | Wave 2 |
| `finance` | ⭐⭐⭐ (結構清晰) | 🔵 優先 | Wave 2-3 |
| `notification` | ⭐⭐⭐ (有 domain 子目錄) | 🔵 優先 | Wave 3 |
| `semantic-graph` | ⭐⭐⭐ (有 aggregate) | 🟡 中等 | Wave 3 |
| `skill-xp` | ⭐⭐⭐ (有 aggregate, 規模小) | 🟡 中等 | Wave 3 |
| `organization` | ⭐⭐ (gov.* 混合) | 🟡 中等 | Wave 3-4 |
| `account` | ⭐⭐ (domain.* + gov.*) | 🟡 中等 | Wave 3-4 |
| `workspace` | ⭐ (最大 VS，高耦合) | 🔴 最後 | Wave 4 |

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
| **contexts/ vs features/** | 新目錄 `contexts/` | 原地重構 `features/` | 建議 A：降低遷移風險 |
| **global-audit-view 歸屬** | 獨立 audit BC | 分散至各 BC | 建議 A：稽核是跨域橫切 |
| **portal.slice** | 保留為 app-level concern | 建立 portal BC | 建議 A：不是業務 BC |
| **Firestore 直存** | 完全透過 Port | 保留部分直存 | 建議 A：MDDD 原則優先 |

### 保留不動的項目

以下項目在 MDDD 後**不需要變動**：

- `src/app/` — Next.js App Router 結構維持不變
- `src/infrastructure/firebase/` — SDK 初始化適配器維持共享
- `src/infrastructure/upstash/` — 同上
- `src/lib-ui/` — UI 元件庫維持共享
- `src/shared-kernel/ports/` — Port 介面維持在 SK

---

## 附錄：MDDD 目錄樹快速參考

```
src/
├── app/                        ← Next.js routes（不動）
├── app-runtime/                ← Runtime providers（不動）
├── contexts/                   ← ★ 新增：BC 根目錄
│   ├── workspace/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── interface/
│   │   └── index.ts
│   ├── organization/           ← 同上結構
│   ├── scheduling/             ← 同上結構（最接近完成）
│   ├── semantic-graph/         ← 同上結構
│   ├── finance/                ← 同上結構
│   ├── account/                ← 同上結構
│   ├── skill-xp/               ← 同上結構
│   ├── notification/           ← 同上結構
│   ├── identity/               ← 認證 BC
│   ├── search/                 ← 橫切輔助 BC
│   └── portal/                 ← 殼層 BC
├── shared-kernel/              ← 精煉後的 SK
│   ├── value-objects/
│   ├── events/
│   ├── ports/
│   ├── data-contracts/
│   └── index.ts
├── infrastructure/             ← SDK 適配器（保留 + event-bus 新增）
│   ├── firebase/
│   ├── upstash/
│   ├── document-ai/
│   └── event-bus/              ← ★ 新增：跨 BC 事件匯流排
├── lib-ui/                     ← UI 庫（不動）
└── config/                     ← 全域配置（不動）
```

---

*文件版本：1.0*
*分析日期：2026-03-16*
*分析範疇：xuanwu 專案 src/ 目錄完整結構*
