# MDDD 目標架構：完整目錄樹

> 本文件為 [`docs/mddd-migration.md`](./mddd-migration.md) 的配套參考，呈現 Xuanwu 專案從 Vertical Slice Architecture 遷移至 **Micro Domain-Driven Design (MDDD)** 後的**完整目標目錄結構**。

---

## 目錄

1. [目錄慣例說明](#1-目錄慣例說明)
2. [頂層總覽](#2-頂層總覽)
3. [modules/ — 各功能模組](#3-modules--各功能模組)
4. [infrastructure/ — 全域共用基礎設施](#4-infrastructure--全域共用基礎設施)
5. [interfaces/ — 全域共用 API / Adapter](#5-interfaces--全域共用-api--adapter)
6. [shared/ — 自家共用程式碼](#6-shared--自家共用程式碼)
7. [ui/ — 可重用 UI 組件](#7-ui--可重用-ui-組件)
8. [lib/ — 第三方套件封裝](#8-lib--第三方套件封裝)
9. [VS8 企業知識庫（獨立重構）](#9-vs8-企業知識庫獨立重構)

---

## 1. 目錄慣例說明

### 模組五層結構

每個功能模組 `modules/[feature]/` 遵循以下**五層結構**：

```
modules/[feature]/
├── domains/          # 領域層：純業務規則，零外部依賴
│                     #   entities / value-objects / aggregates / events / services
├── application/      # 應用層：協調領域物件完成 Use Case
│                     #   commands / queries / projections / sagas / policies
├── infrastructure/   # 基礎設施層：實作 Port 介面
│                     #   persistence (Firestore) / adapters (外部服務)
├── interfaces/       # 介面層：UI + API 橋接
│                     #   components (React) / hooks (Presenter)
├── ports/            # Port 契約層：定義抽象介面（不含實作）
│                     #   i-<resource>.repo.ts / i-<service>.port.ts
└── index.ts          # 模組公開 API（ACL 邊界）
```

### 依賴方向

```
interfaces/ → application/ → domains/ ← (ports/ ← infrastructure/)
```

Port 介面定義在 `ports/`，實作在 `infrastructure/`，消費在 `application/`。

### 全域目錄說明

| 目錄 | 說明 | 對應現況 |
|------|------|---------|
| `modules/` | 垂直功能模組（每個 feature 自包含） | `features/*.slice/` |
| `infrastructure/` | 全域共用基礎設施（SDK 適配器） | `infrastructure/` + `shared-infra/` |
| `interfaces/` | 全域共用 API / Adapter（Next.js API routes, webhooks） | `shared-infra/api-gateway/` + `app/api/` |
| `shared/` | 自家共用程式碼（Shared Kernel + 跨模組工具） | `shared-kernel/` + `shared-infra/` (kernel 部分) |
| `ui/` | 可重用 UI 組件（shadcn-ui 包裝） | `lib-ui/` |
| `lib/` | 第三方套件封裝（薄包裝層） | `infrastructure/` SDK 初始化部分 |

---

## 2. 頂層總覽

```
src/
├── app/                          # Next.js App Router（不變）
│   ├── (shell)/
│   │   ├── (wiki)/
│   │   ├── @modal/
│   │   ├── @sidebar/
│   │   ├── (public)/
│   │   └── (portal)/
│   ├── globals.css
│   └── layout.tsx
│
├── modules/                      # ★ 垂直功能模組（每個 feature 自包含）
│   ├── workspace/                #   VS3-5：工作區管理
│   ├── organization/             #   VS2：組織治理
│   ├── scheduling/               #   VS6：人力排班
│   ├── finance/                  #   VS9：財務追蹤
│   ├── account/                  #   VS1：帳號管理
│   ├── skill-xp/                 #   VS7：技能經驗值
│   ├── notification/             #   VS?: 通知中樞
│   ├── identity/                 #   身分認證（登入/註冊）
│   ├── search/                   #   跨域搜尋（橫切輔助）
│   └── portal/                   #   門戶殼層（橫切輔助）
│   # ⚠️ semantic-graph (VS8) 不在 modules/ 內 — 獨立重構，見第 9 節
│
├── infrastructure/               # ★ 全域共用基礎設施
│   ├── firebase/
│   ├── upstash/
│   ├── document-ai/
│   └── event-bus/
│
├── interfaces/                   # ★ 全域共用 API / Adapter
│   ├── api/
│   ├── webhooks/
│   └── event-consumers/
│
├── shared/                       # ★ 自家共用程式碼
│   ├── kernel/
│   └── utils/
│
├── ui/                           # ★ 可重用 UI 組件
│   ├── shadcn-ui/
│   ├── custom-ui/
│   └── index.ts
│
├── lib/                          # ★ 第三方套件封裝
│   ├── firebase/
│   ├── upstash/
│   ├── ai/
│   └── index.ts
│
└── config/                       # 全域配置（不變）
    └── i18n/
```

---

## 3. modules/ — 各功能模組

### modules/workspace/（VS3-5：工作區管理）

> 最大功能模組（176 檔），含任務管理、工作流程、施工日誌、文件解析、稽核、成員治理。

```
modules/workspace/
├── domains/
│   ├── entities/
│   │   ├── workspace.entity.ts           # ← workspace.slice/core/_types.ts
│   │   ├── task.entity.ts                # ← workspace.slice/domain.tasks/_entity.ts
│   │   ├── daily-log.entity.ts           # ← workspace.slice/domain.daily/*
│   │   ├── workflow.entity.ts            # ← workspace.slice/domain.workflow/*
│   │   ├── issue.entity.ts               # ← workspace.slice/domain.issues/*
│   │   └── file.entity.ts                # ← workspace.slice/domain.files/*
│   ├── value-objects/
│   │   ├── workspace-id.vo.ts            # ← shared/kernel/value-objects/WorkspaceId
│   │   ├── task-id.vo.ts                 # ← shared/kernel/value-objects/TaskId
│   │   ├── workflow-stage.vo.ts          # ← workspace.slice/domain.workflow/*
│   │   └── acceptance-status.vo.ts       # ← workspace.slice/domain.acceptance/*
│   ├── aggregates/
│   │   ├── workspace.aggregate.ts        # ← workspace.slice/core/_actions.ts (aggregate root)
│   │   ├── task.aggregate.ts             # ← workspace.slice/domain.tasks/_actions/*
│   │   └── daily-log.aggregate.ts        # ← workspace.slice/domain.daily/*
│   ├── events/
│   │   ├── task-created.event.ts         # ← workspace.slice/core.event-bus/_events.ts
│   │   ├── task-assigned.event.ts
│   │   ├── workflow-stage-changed.event.ts
│   │   └── daily-log-submitted.event.ts
│   └── services/
│       ├── workspace-policy.service.ts   # ← workspace.slice/domain.application/policy-engine
│       └── parsing-intent.service.ts     # ← workspace.slice/domain.parsing-intent/*
│
├── application/
│   ├── commands/
│   │   ├── workspace/                    # ← workspace.slice/core/_actions.ts
│   │   ├── task/                         # ← workspace.slice/domain.tasks/_actions/*
│   │   ├── daily/                        # ← workspace.slice/domain.daily/*
│   │   ├── workflow/                     # ← workspace.slice/domain.workflow/*
│   │   ├── files/                        # ← workspace.slice/domain.files/_actions/*
│   │   └── governance/
│   │       ├── audit/                    # ← workspace.slice/gov.audit/*
│   │       ├── members/                  # ← workspace.slice/gov.members/*
│   │       ├── roles/                    # ← workspace.slice/gov.role/*
│   │       └── teams/                    # ← workspace.slice/gov.teams/*
│   ├── queries/
│   │   ├── workspace/                    # ← workspace.slice/core/_queries.ts
│   │   ├── task/                         # ← workspace.slice/domain.tasks/_queries.ts
│   │   └── files/                        # ← workspace.slice/domain.files/_queries/*
│   ├── projections/
│   │   ├── workspace-view/               # ← shared-infra/projection-bus/workspace-view/
│   │   ├── tasks-view/                   # ← shared-infra/projection-bus/tasks-view/
│   │   ├── workspace-scope-guard-view/   # ← shared-infra/projection-bus/workspace-scope-guard-view/
│   │   ├── task-finance-label-view/      # ← shared-infra/projection-bus/task-finance-label-view/
│   │   └── workspace-graph-view/         # ← shared-infra/projection-bus/workspace-graph-view/
│   └── sagas/
│       └── document-parsing.saga.ts      # ← workspace.slice/domain.document-parser/*
│
├── infrastructure/
│   ├── persistence/
│   │   ├── workspace.repo.ts             # ← shared-infra/firebase-client/repositories/workspace*.ts
│   │   ├── task.repo.ts                  # ← .../workspace-business.tasks.repository.ts
│   │   └── daily-log.repo.ts
│   └── adapters/
│       └── file-storage.adapter.ts       # ← infrastructure/firebase/client/storage
│
├── interfaces/
│   ├── components/
│   │   ├── shell/                        # ← workspace.slice/core/_components/
│   │   ├── task/                         # ← workspace.slice/domain.tasks/_components/
│   │   ├── daily/                        # ← workspace.slice/domain.daily/*
│   │   ├── files/                        # ← workspace.slice/domain.files/_components/
│   │   └── governance/                   # ← workspace.slice/gov.*/_components/
│   └── hooks/
│       ├── use-workspace.ts              # ← workspace.slice/core/_hooks/use-workspace.ts
│       ├── use-workspace-tasks.ts
│       └── use-visible-workspaces.ts
│
├── ports/
│   ├── i-workspace.repo.ts
│   ├── i-task.repo.ts
│   └── i-file-store.port.ts              # ← shared/kernel/ports/i-file-store.ts
│
└── index.ts                              # ← workspace.slice/index.ts
```

---

### modules/organization/（VS2：組織治理）

```
modules/organization/
├── domains/
│   ├── entities/
│   │   ├── organization.entity.ts        # ← organization.slice/core/_types.ts
│   │   ├── member.entity.ts              # ← organization.slice/gov.members/*
│   │   ├── team.entity.ts                # ← organization.slice/gov.teams/*
│   │   └── partner.entity.ts             # ← organization.slice/gov.partners/*
│   ├── value-objects/
│   │   ├── organization-id.vo.ts
│   │   └── membership-role.vo.ts
│   ├── aggregates/
│   │   └── organization.aggregate.ts
│   └── events/
│       ├── member-joined.event.ts        # ← organization.slice/core.event-bus/_events.ts
│       └── team-created.event.ts
│
├── application/
│   ├── commands/
│   │   ├── org/                          # ← organization.slice/core/_actions.ts
│   │   ├── members/                      # ← organization.slice/gov.members/_actions.ts
│   │   ├── teams/                        # ← organization.slice/gov.teams/_actions.ts
│   │   ├── partners/                     # ← organization.slice/gov.partners/_actions.ts
│   │   ├── policy/                       # ← organization.slice/gov.policy/_actions.ts
│   │   └── semantic/                     # ← organization.slice/gov.semantic/_actions.ts
│   ├── queries/
│   │   ├── org/                          # ← organization.slice/core/_queries.ts
│   │   └── members/                      # ← organization.slice/gov.members/_queries.ts
│   └── projections/
│       ├── organization-view/            # ← shared-infra/projection-bus/organization-view/
│       ├── org-eligible-member-view/     # ← shared-infra/projection-bus/org-eligible-member-view/
│       └── semantic-governance-view/     # ← shared-infra/projection-bus/semantic-governance-view/
│
├── infrastructure/
│   └── persistence/
│       └── organization.repo.ts
│
├── interfaces/
│   ├── components/
│   │   ├── core/                         # ← organization.slice/core/_components/
│   │   ├── members/                      # ← organization.slice/gov.members/_components/
│   │   ├── teams/                        # ← organization.slice/gov.teams/_components/
│   │   ├── partners/                     # ← organization.slice/gov.partners/_components/
│   │   └── semantic/                     # ← organization.slice/gov.semantic/_components/
│   └── hooks/
│       └── use-organization-management.ts
│
├── ports/
│   └── i-organization.repo.ts
│
└── index.ts
```

---

### modules/scheduling/（VS6：人力排班）

> 最接近 MDDD 的功能模組，已有 domain.core/aggregate、domain.application、domain.ports 分層。

```
modules/scheduling/
├── domains/
│   ├── entities/
│   │   └── schedule-item.entity.ts       # ← workforce-scheduling.slice/domain.core/types/
│   ├── value-objects/
│   │   └── schedule-status.vo.ts         # ← domain.core/rules/
│   ├── aggregates/
│   │   └── org-schedule.aggregate.ts     # ← domain.core/aggregate/
│   ├── events/
│   │   └── schedule-proposed.event.ts
│   └── services/
│       ├── eligibility.service.ts        # ← domain.core/eligibility/
│       └── policy-mapper.service.ts      # ← domain.core/policy-mapper/
│
├── application/
│   ├── commands/                         # ← domain.application/commands/
│   ├── queries/                          # ← domain.application/queries/
│   ├── sagas/                            # ← domain.application/sagas/
│   ├── selectors/                        # ← domain.application/selectors/
│   └── projections/
│       ├── account-schedule-view/        # ← shared-infra/projection-bus/account-schedule-view/
│       ├── demand-board-view/            # ← shared-infra/projection-bus/demand-board-view/
│       ├── schedule-calendar-view/       # ← shared-infra/projection-bus/schedule-calendar-view/
│       └── schedule-timeline-view/       # ← shared-infra/projection-bus/schedule-timeline-view/
│
├── infrastructure/
│   └── persistence/
│       └── schedule.repo.ts
│
├── interfaces/
│   ├── components/                       # ← domain.ui/components/runtime/
│   └── hooks/                            # ← domain.ui/hooks/runtime/
│
├── ports/
│   ├── i-scheduling-command.port.ts      # ← domain.ports/command.port.ts
│   ├── i-scheduling-query.port.ts        # ← domain.ports/query.port.ts
│   └── i-scheduling-event.port.ts        # ← domain.ports/event.port.ts
│
└── index.ts
```

---

### modules/finance/（VS9：財務追蹤）

```
modules/finance/
├── domains/
│   ├── entities/
│   │   └── finance-item.entity.ts        # ← finance.slice/_types.ts
│   ├── aggregates/
│   │   └── finance.aggregate.ts          # ← finance.slice/_services/finance-aggregate-query-gateway.ts
│   ├── events/
│   └── services/
│       └── finance-lifecycle.service.ts  # ← finance.slice/_hooks/use-finance-lifecycle.ts
│
├── application/
│   ├── commands/                         # ← finance.slice/_actions.ts
│   ├── queries/                          # ← finance.slice/_queries.ts
│   └── projections/
│       └── finance-staging-pool-view/    # ← shared-infra/projection-bus/finance-staging-pool-view/
│
├── infrastructure/
│   └── persistence/
│       └── finance.repo.ts
│
├── interfaces/
│   ├── components/                       # ← finance.slice/_components/
│   └── hooks/                            # ← finance.slice/_hooks/
│
├── ports/
│   └── i-finance.repo.ts
│
└── index.ts
```

---

### modules/account/（VS1：帳號管理）

```
modules/account/
├── domains/
│   ├── entities/
│   │   ├── account.entity.ts             # ← account.slice/domain.profile/*
│   │   └── wallet.entity.ts              # ← account.slice/domain.wallet/*
│   ├── value-objects/
│   │   └── account-role.vo.ts            # ← account.slice/gov.role/*
│   ├── events/
│   │   └── (account event bus)           # ← account.slice/account-event-bus.ts
│   └── services/
│       └── account-policy.service.ts     # ← account.slice/gov.policy/*
│
├── application/
│   ├── commands/
│   │   ├── profile/                      # ← account.slice/domain.profile/_actions.ts
│   │   ├── wallet/                       # ← account.slice/domain.wallet/_actions.ts
│   │   ├── policy/                       # ← account.slice/gov.policy/_actions.ts
│   │   └── role/                         # ← account.slice/gov.role/_actions.ts
│   ├── queries/
│   └── projections/
│       ├── account-view/                 # ← shared-infra/projection-bus/account-view/
│       ├── account-audit-view/           # ← shared-infra/projection-bus/account-audit-view/
│       ├── account-skill-view/           # ← shared-infra/projection-bus/account-skill-view/
│       ├── acl-projection-view/          # ← shared-infra/projection-bus/acl-projection-view/
│       └── wallet-balance-view/          # ← shared-infra/projection-bus/wallet-balance-view/
│
├── infrastructure/
│   └── persistence/
│       └── account.repo.ts
│
├── interfaces/
│   ├── components/                       # ← account.slice/domain.profile/_components/
│   └── hooks/
│       └── use-user.ts                   # ← account.slice/domain.profile/_hooks/
│
├── ports/
│   └── i-account.repo.ts
│
└── index.ts
```

---

### modules/skill-xp/（VS7：技能經驗值）

```
modules/skill-xp/
├── domains/
│   ├── entities/
│   │   └── skill-tag.entity.ts           # ← skill-xp.slice/_tag-pool.ts
│   ├── aggregates/
│   │   └── skill-xp.aggregate.ts         # ← skill-xp.slice/_aggregate.ts
│   ├── events/
│   │   └── skill-gained.event.ts
│   └── services/
│       ├── tag-lifecycle.service.ts      # ← skill-xp.slice/_tag-lifecycle.ts
│       └── org-recognition.service.ts    # ← skill-xp.slice/_org-recognition.ts
│
├── application/
│   ├── commands/                         # ← skill-xp.slice/_actions.ts
│   ├── queries/                          # ← skill-xp.slice/_queries.ts
│   └── projections/
│       └── (account-skill-view 與 account 模組共享)
│
├── infrastructure/
│   └── persistence/
│       └── skill-xp.repo.ts
│
├── interfaces/
│   └── components/
│       └── personal-skill-panel.tsx      # ← skill-xp.slice/_components/
│
├── ports/
│   └── i-skill-xp.repo.ts
│
└── index.ts
```

---

### modules/notification/（通知中樞）

```
modules/notification/
├── domains/
│   ├── entities/
│   │   └── notification.entity.ts        # ← notification-hub.slice/_types.ts
│   ├── aggregates/
│   │   └── notification-hub.aggregate.ts # ← notification-hub.slice/_notification-authority.ts
│   └── services/
│       └── notification-router.service.ts # ← notification-hub.slice/gov.notification-router/
│
├── application/
│   ├── commands/                         # ← notification-hub.slice/_actions.ts
│   ├── queries/                          # ← notification-hub.slice/domain.notification/_queries.ts
│   └── sagas/
│       └── notification-delivery.saga.ts # ← notification-hub.slice/_services/
│
├── infrastructure/
│   └── adapters/
│       └── push-notification.adapter.ts  # 實作 ports/i-notification.port.ts
│
├── interfaces/
│   └── components/
│       ├── notification-bell.tsx         # ← notification-hub.slice/_components/
│       └── notification-badge/           # ← notification-hub.slice/domain.notification/_components/
│
├── ports/
│   └── i-notification.port.ts            # ← shared/kernel/ports/i-messaging.ts 精煉
│
└── index.ts
```

---

### modules/identity/（身分認證）

```
modules/identity/
├── domains/
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   └── auth-token.vo.ts
│   └── services/
│       └── auth-policy.service.ts        # 登入策略（重試限制 / MFA）
│
├── application/
│   ├── commands/
│   │   ├── login/                        # ← identity.slice/ 登入 actions
│   │   ├── register/                     # ← identity.slice/ 註冊 actions
│   │   └── reset-password/
│   └── queries/
│       └── session/
│
├── infrastructure/
│   └── adapters/
│       └── firebase-auth.adapter.ts      # ← infrastructure/firebase/client/auth
│
├── interfaces/
│   └── components/
│       ├── login-form.tsx                # ← identity.slice/ login page
│       ├── register-form.tsx
│       └── reset-password-form.tsx
│
├── ports/
│   └── i-auth.port.ts                    # ← shared/kernel/ports/i-auth.service.ts
│
└── index.ts
```

---

### modules/search/（跨域搜尋，橫切輔助）

> 橫切輔助模組：不擁有業務資料，作為查詢路由器——扇出至各模組的 `application/queries/` 並彙整結果。

```
modules/search/
├── domains/
│   └── value-objects/
│       └── search-query.vo.ts
│
├── application/
│   └── queries/
│       └── global-search/                # ← global-search.slice/_actions.ts + _queries.ts
│           ├── federated-search.handler.ts
│           └── result-merger.ts
│
├── infrastructure/
│   └── adapters/
│       └── vector-search.adapter.ts      # ← lib/upstash/vector (VS8 重構後查企業知識庫)
│
├── interfaces/
│   └── hooks/
│       └── use-global-search.ts          # ← global-search.slice/ hooks
│
├── ports/
│   └── i-search-provider.port.ts         # 各模組實作此 Port，Search 模組聚合呼叫
│
└── index.ts
```

---

### modules/portal/（門戶殼層，橫切輔助）

> 橫切輔助模組：App Shell 狀態橋接，負責協調各模組的 UI 狀態（側欄、通知計數、全域 Loading）。

```
modules/portal/
├── domains/
│   └── value-objects/
│       └── portal-state.vo.ts            # 殼層 UI 狀態 VO
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
│       └── use-portal-state.ts           # ← portal.slice/core/_hooks/
│
├── ports/
│   └── i-portal-bridge.port.ts           # 各模組向 portal 推送 UI 狀態
│
└── index.ts
```

---

## 4. infrastructure/ — 全域共用基礎設施

> SDK 適配器與跨模組基礎設施。所有模組的 `infrastructure/adapters/` 透過此目錄的 SDK 實作 Port 介面。

```
infrastructure/
├── firebase/
│   ├── admin/                            # Firebase Admin SDK
│   │   ├── db/
│   │   │   ├── cacheLayer.ts             # Firestore 快取層
│   │   │   └── firestore.admin.ts
│   │   ├── auth/
│   │   └── index.ts
│   └── client/                           # Firebase Client SDK
│       ├── auth/
│       ├── firestore/
│       ├── storage/
│       └── index.ts
│
├── upstash/
│   ├── redis.ts                          # Upstash Redis（低延遲 KV + 會話快取）
│   ├── vector.ts                         # Upstash Vector（語意相似度搜尋）
│   ├── qstash.ts                         # Upstash QStash（持久化 HTTP 佇列）
│   ├── workflow.ts                       # Upstash Workflow（多步驟持久化工作流）
│   ├── box.ts                            # Upstash Box（AI agent sandbox）
│   └── index.ts
│
├── document-ai/
│   ├── genkit/                           # Google Genkit AI pipeline
│   └── index.ts
│
└── event-bus/                            # ← NEW：跨模組事件匯流排
    ├── event-router.ts                   # ← shared-infra/event-router/
    ├── outbox-relay.ts                   # ← shared-infra/outbox-relay/
    ├── dlq-manager.ts                    # ← shared-infra/dlq-manager/
    └── index.ts
```

---

## 5. interfaces/ — 全域共用 API / Adapter

> Next.js API Routes、Webhook endpoints、外部事件消費者。這些是系統的**對外邊界**，不包含業務邏輯（業務邏輯在各 `modules/[feature]/application/`）。

```
interfaces/
├── api/                                  # Next.js API Routes（/api/*）
│   ├── gateway/                          # ← shared-infra/api-gateway/
│   │   ├── command.ts                    # Command Gateway（← shared-infra/gateway-command/）
│   │   └── query.ts                      # Query Gateway（← shared-infra/gateway-query/）
│   └── observability/                    # 健康檢查 / 指標端點
│       └── health.ts                     # ← shared-infra/observability/
│
├── webhooks/
│   ├── firebase/                         # Firebase Cloud Functions 觸發器
│   └── qstash/                           # QStash 回呼端點
│
└── event-consumers/
    └── (外部事件消費者適配器)
```

---

## 6. shared/ — 自家共用程式碼

> Shared Kernel（精煉後）+ 跨模組共用工具。只包含**真正跨多個模組使用**的程式碼。

```
shared/
├── kernel/                               # ← src/shared-kernel/（精煉後）
│   ├── value-objects/                    # 跨模組共用 VO
│   │   ├── workspace-id.vo.ts            # WorkspaceId
│   │   ├── task-id.vo.ts                 # TaskId
│   │   ├── money.vo.ts                   # Money（modulo 精確度驗證）
│   │   └── index.ts
│   ├── ports/                            # 跨模組 Port 介面
│   │   ├── i-auth.service.ts             # IAuthService
│   │   ├── i-firestore.repo.ts           # IFirestoreRepo
│   │   ├── i-messaging.ts                # IMessaging
│   │   ├── i-file-store.ts               # IFileStore
│   │   └── index.ts
│   ├── events/                           # 跨模組領域事件契約
│   │   └── index.ts
│   ├── data-contracts/                   # DTO / 命令結果契約
│   │   ├── command-result-contract/
│   │   └── index.ts
│   ├── constants/
│   ├── enums/
│   ├── observability/                    # 跨模組可觀測性（logging, tracing）
│   └── index.ts
│
└── utils/                                # 跨模組純工具函式
    ├── date/
    ├── string/
    └── index.ts
```

---

## 7. ui/ — 可重用 UI 組件

> ← `src/lib-ui/`（重命名，內容不變）

```
ui/
├── shadcn-ui/                            # shadcn/ui 組件包裝
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...（其他 shadcn 組件）
│   ├── hooks/
│   └── lib/
│       └── utils.ts
│
├── custom-ui/                            # 自製基礎組件（非業務）
├── dnd/                                  # Drag & Drop 包裝
├── pdnd/                                 # pragmatic-drag-and-drop 包裝
├── tanstack/                             # TanStack Query / Table 包裝
├── vis/                                  # 視覺化組件（圖表、甘特圖）
├── state/                                # 狀態管理 hooks
└── index.ts
```

---

## 8. lib/ — 第三方套件封裝

> 薄包裝層，隔離第三方 SDK 與業務程式碼。`infrastructure/` 使用 `lib/` 提供的 SDK 實例。

```
lib/
├── firebase/                             # Firebase SDK 初始化包裝
│   ├── firebase-app.ts                   # app 初始化（singleton）
│   ├── firebase-auth.ts
│   ├── firebase-firestore.ts
│   └── index.ts
│
├── upstash/                              # Upstash SDK 初始化包裝
│   ├── redis.ts                          # Redis client（singleton）
│   ├── vector.ts                         # Vector Index factory
│   ├── qstash.ts                         # QStash client + receiver
│   ├── workflow.ts                       # Workflow client + serve
│   ├── box.ts                            # Box / Agent / ClaudeCode
│   └── index.ts
│
├── ai/                                   # AI SDK 包裝
│   ├── genkit.ts                         # Google Genkit pipeline
│   └── index.ts
│
└── index.ts
```

---

## 9. VS8 企業知識庫（獨立重構）

> `semantic-graph.slice`（VS8）**不遷移至 `modules/`**，而是在原路徑原地重構為企業知識庫。詳細重構計畫見 [`docs/mddd-migration.md` 第 9 節](./mddd-migration.md#9-vs8-企業知識庫重構獨立路線)。

```
features/semantic-graph.slice/            # 保留原路徑，重構內部結構
├── knowledge/                            # ★ 企業知識庫核心
│   ├── _entity.ts                        # KnowledgeItem entity
│   ├── _actions.ts                       # 知識 CRUD + Upstash Vector upsert
│   ├── _queries.ts                       # 語意相似度搜尋（Vector query）
│   ├── _cache.ts                         # Redis 快取層
│   └── index.ts
│
├── taxonomy/                             # ★ 分類法管理
│   ├── _aggregate.ts                     # 分類法驗證 + 時序衝突偵測
│   ├── _semantic-authority.ts            # 搜尋域定義 + TaxonomyDimension
│   ├── _cost-classifier.ts               # 費用項目分類（零 SDK 依賴）
│   ├── _actions.ts
│   ├── _queries.ts
│   └── index.ts
│
├── vector-ingestion/                     # ★ 向量嵌入管線
│   ├── _embedder.ts                      # 文字 → 向量（Genkit embedding）
│   ├── _chunker.ts                       # 文件分塊策略
│   ├── _ingestor.ts                      # 批次 upsert → Upstash Vector
│   ├── _pipeline.ts                      # 完整管線（QStash 工作佇列驅動）
│   └── index.ts
│
├── _bus.ts                               # 保留：標籤事件匯流排
├── _types.ts                             # 精煉後領域類型
├── outbox/                               # 保留：標籤 outbox
└── index.ts                              # 精煉後公開 API
```

### 使用的 Upstash SDK（均從 `lib/upstash/` 引入）

| 模組 | SDK | 用途 |
|------|-----|------|
| `knowledge/_actions.ts` | `vectorIndex()` | 知識項目嵌入向量 upsert |
| `knowledge/_queries.ts` | `vectorIndex()` | 語意相似度查詢 |
| `knowledge/_cache.ts` | `redis` | 熱門知識快取（TTL 300s）|
| `vector-ingestion/_ingestor.ts` | `vectorIndex()` | 批次 upsert |
| `vector-ingestion/_pipeline.ts` | `qstash` | 非同步嵌入工作佇列 |
| `vector-ingestion/_embedder.ts` | Genkit（`lib/ai/`） | 文字 → float32[] embedding |

---

## 附錄：路徑別名對映

遷移後建議在 `tsconfig.json` 設定以下路徑別名：

```json
{
  "compilerOptions": {
    "paths": {
      "@/modules/*": ["src/modules/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/interfaces/*": ["src/interfaces/*"],
      "@/shared/*": ["src/shared/*"],
      "@/shared-kernel": ["src/shared/kernel/index.ts"],
      "@/ui/*": ["src/ui/*"],
      "@/lib/*": ["src/lib/*"],
      "@/*": ["src/*"]
    }
  }
}
```

---

*文件版本：1.0*
*建立日期：2026-03-17*
*配套文件：[docs/mddd-migration.md](./mddd-migration.md)*
