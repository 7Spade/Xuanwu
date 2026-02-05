# 專案結構樹 (Project Tree)

> **Document Type**: Reference  
> **Target Audience**: All developers  
> **Purpose**: Complete file tree showing all infrastructure paths for Firebase DDD project

---

## 📋 Table of Contents

1. [根目錄概覽 (Root Overview)](#根目錄概覽-root-overview)
2. [前端詳細結構 (Frontend Structure)](#前端詳細結構-frontend-structure)
3. [後端詳細結構 (Backend Structure)](#後端詳細結構-backend-structure)
4. [Firebase 配置檔案 (Firebase Config)](#firebase-配置檔案-firebase-config)
5. [快速參考表 (Quick Reference)](#快速參考表-quick-reference)

---

## 根目錄概覽 (Root Overview)

```
Xuanwu/
├── .github/                           # GitHub 配置
│   ├── agents/                        # 60+ Custom Copilot agents
│   │   ├── README.md                  # Agent governance
│   │   └── *.agent.md                 # Individual agents
│   ├── instructions/                  # Custom instructions
│   │   ├── README.md                  # Governance
│   │   ├── accessibility.md           # A11y standards
│   │   ├── style-guide.md             # Angular conventions
│   │   └── angular-cli.md             # CLI best practices
│   ├── prompts/                       # Prompt templates
│   │   └── README.md                  # Prompt governance
│   ├── skills/                        # Knowledge modules
│   │   └── README.md                  # Skills governance
│   └── workflows/                     # CI/CD workflows
│
├── docs/                              # 📚 Documentation
│   ├── INDEX.md                       # Documentation hub
│   ├── PROJECT_ARCHITECTURE.md        # Architecture overview
│   ├── PROJECT_TREE.md                # This file
│   ├── DDD_LAYER_BOUNDARIES.md        # Layer rules
│   ├── IMPORT_RULES.md                # Dependency rules
│   ├── NAMING_CONVENTIONS.md          # Naming standards
│   ├── TESTING_STANDARDS.md           # Testing per layer
│   ├── QUICK_REFERENCE.md             # Developer cheat sheet
│   ├── DATABASE_SCHEMA.md             # Firestore schema
│   ├── UI_UX_LAYOUT.md                # UI wireframes
│   ├── GLOSSARY.md                    # Terminology
│   ├── ANGULAR_CLI_GUIDE.md           # CLI reference
│   └── examples/                      # Code examples
│       ├── domain-layer-example.ts
│       ├── application-layer-example.ts
│       └── feature-layer-example.ts
│
├── functions/                         # 🔥 Firebase Functions (Backend)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/                           # [詳見後端結構]
│
├── public/                            # Static assets for hosting
│   └── index.html
│
├── src/                               # 🎨 Angular Frontend
│   ├── main.ts                        # Browser entry point
│   ├── main.server.ts                 # SSR entry point
│   ├── server.ts                      # Express server for SSR
│   ├── index.html                     # HTML template
│   ├── app/                           # [詳見前端結構]
│   ├── shared-kernel/                 # [詳見 Shared Kernel]
│   ├── environments/                  # Environment configs
│   │   ├── environment.ts             # Development
│   │   └── environment.prod.ts        # Production
│   ├── styles/                        # Global styles
│   │   ├── global.css                 # Main stylesheet
│   │   └── README.md
│   └── assets/                        # Static resources
│       └── .gitkeep
│
├── .schematics/                       # Custom DDD schematics
│   ├── collection.json
│   └── ddd-*/                         # Generators
│
├── firebase.json                      # Firebase project config
├── .firebaserc                        # Firebase project ID
├── firestore.rules                    # Firestore security rules
├── firestore.indexes.json             # Firestore indexes
├── storage.rules                      # Storage security rules
├── database.rules.json                # Realtime DB rules
├── apphosting.yaml                    # App Hosting config
├── angular.json                       # Angular CLI config
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies
├── AGENTS.md                          # Agent overview
└── README.md                          # Project overview
```

---

## 前端詳細結構 (Frontend Structure)

### src/app/ - 完整檔案樹

```
src/app/
├── app.component.ts                   # Root component
├── app.component.spec.ts              # Root component tests
│
├── core/                              # 🔧 Layer 1: Infrastructure Core
│   ├── README.md                      # Layer documentation
│   ├── index.ts                       # Barrel export
│   │
│   ├── auth/                          # Authentication
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Route guard
│   │   │   ├── role.guard.ts          # Role-based guard
│   │   │   └── auth.guard.spec.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts        # Auth state management
│   │   │   ├── token.service.ts       # Token handling
│   │   │   └── auth.service.spec.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts    # Add auth headers
│   │
│   ├── interceptors/                  # HTTP Interceptors
│   │   ├── error.interceptor.ts       # Global error handling
│   │   ├── loading.interceptor.ts     # Loading state
│   │   └── retry.interceptor.ts       # Retry logic
│   │
│   ├── guards/                        # Route Guards
│   │   ├── unsaved-changes.guard.ts   # Prevent navigation
│   │   └── permission.guard.ts        # Permission check
│   │
│   ├── services/                      # Core Services
│   │   ├── logger.service.ts          # Logging service
│   │   ├── notification.service.ts    # Toast/alerts
│   │   ├── analytics.service.ts       # Analytics tracking
│   │   └── error-handler.service.ts   # Error tracking
│   │
│   ├── providers/                     # App Configuration
│   │   ├── app.config.ts              # Browser config
│   │   ├── app.config.server.ts       # SSR config
│   │   └── firebase.config.ts         # Firebase initialization
│   │
│   ├── app.routes.ts                  # Main routes
│   └── app.routes.server.ts           # Server-only routes
│
├── domain/                            # 🎯 Layer 2: Pure Domain (Framework-Free)
│   ├── README.md                      # Domain layer docs
│   ├── index.ts                       # Barrel export
│   │
│   ├── shared/                        # Cross-context abstractions
│   │   ├── base.entity.ts             # Base entity class
│   │   ├── base.aggregate.ts          # Base aggregate
│   │   └── domain-event.ts            # Domain events
│   │
│   └── {bounded-context}/             # Example: user, order, product
│       ├── {name}.aggregate.ts        # Aggregate root
│       ├── {name}.entity.ts           # Entity
│       ├── {name}.vo.ts               # Value objects
│       ├── {name}.repository.ts       # Repository interface
│       ├── {name}.events.ts           # Domain events
│       └── {name}.spec.ts             # Domain tests
│
├── application/                       # ⚙️ Layer 3: Application (Orchestration)
│   ├── README.md                      # Application layer docs
│   ├── index.ts                       # Barrel export
│   │
│   ├── use-cases/                     # Business use cases
│   │   └── {feature}/
│   │       ├── {action}.use-case.ts   # Use case implementation
│   │       └── {action}.use-case.spec.ts
│   │
│   ├── dtos/                          # Data Transfer Objects
│   │   └── {feature}/
│   │       ├── {name}.dto.ts
│   │       └── {name}.mapper.ts       # DTO <-> Domain mapper
│   │
│   ├── commands/                      # Command pattern (optional)
│   │   └── {feature}/
│   │       └── {action}.command.ts
│   │
│   ├── queries/                       # Query pattern (optional)
│   │   └── {feature}/
│   │       └── {query}.query.ts
│   │
│   └── ports/                         # Output ports (interfaces)
│       ├── repositories/
│       │   └── {name}.repository.port.ts
│       └── services/
│           └── {name}.service.port.ts
│
├── infrastructure/                    # 🔌 Layer 4: Infrastructure (Technical)
│   ├── README.md                      # Infrastructure docs
│   ├── index.ts                       # Barrel export
│   │
│   ├── persistence/                   # Data persistence
│   │   ├── firestore/                 # Firestore adapters
│   │   │   ├── firestore.adapter.ts   # Generic Firestore wrapper
│   │   │   ├── collection.service.ts  # Collection operations
│   │   │   ├── transaction.service.ts # Transaction handling
│   │   │   └── query.builder.ts       # Query builder
│   │   │
│   │   └── repositories/              # Repository implementations
│   │       ├── user.repository.impl.ts
│   │       ├── order.repository.impl.ts
│   │       ├── product.repository.impl.ts
│   │       └── base.repository.ts     # Base repository with CRUD
│   │
│   ├── adapters/                      # External service adapters
│   │   └── firebase/                  # Firebase SDK adapters
│   │       ├── auth.adapter.ts        # Firebase Auth
│   │       ├── storage.adapter.ts     # Firebase Storage
│   │       ├── analytics.adapter.ts   # Firebase Analytics
│   │       └── messaging.adapter.ts   # Firebase Messaging
│   │
│   └── messaging/                     # Real-time messaging
│       └── firestore-listeners/
│           ├── user-listener.service.ts
│           ├── order-listener.service.ts
│           └── notification.service.ts
│
├── features/                          # 🎨 Layer 5: Presentation (UI)
│   ├── README.md                      # Features layer docs
│   ├── index.ts                       # Barrel export
│   │
│   ├── layout/                        # Global layout components
│   │   ├── app.component.html         # Root template
│   │   ├── app.component.css          # Root styles
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.css
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   ├── sidebar.component.html
│   │   │   └── sidebar.component.css
│   │   └── footer/
│   │       ├── footer.component.ts
│   │       ├── footer.component.html
│   │       └── footer.component.css
│   │
│   └── {feature}/                     # Feature modules
│       ├── {feature}.routes.ts        # Feature routes
│       ├── pages/                     # Smart components
│       │   └── {page}/
│       │       ├── {page}.component.ts
│       │       ├── {page}.component.html
│       │       ├── {page}.component.css
│       │       └── {page}.component.spec.ts
│       └── components/                # Feature-specific components
│           └── {component}/
│               ├── {component}.component.ts
│               ├── {component}.component.html
│               └── {component}.component.css
│
└── shared/                            # 🧩 Layer 6: UI Shared
    ├── README.md                      # Shared layer docs
    ├── index.ts                       # Barrel export
    │
    ├── ui/                            # Reusable UI components (dumb)
    │   ├── button/
    │   │   ├── button.component.ts
    │   │   ├── button.component.html
    │   │   ├── button.component.css
    │   │   └── button.component.spec.ts
    │   ├── card/
    │   ├── modal/
    │   ├── input/
    │   └── table/
    │
    ├── directives/                    # Custom directives
    │   ├── highlight.directive.ts
    │   ├── tooltip.directive.ts
    │   └── click-outside.directive.ts
    │
    ├── pipes/                         # Custom pipes
    │   ├── format-date.pipe.ts
    │   ├── safe-html.pipe.ts
    │   └── truncate.pipe.ts
    │
    └── utils/                         # Utility functions
        ├── array.utils.ts
        ├── date.utils.ts
        └── validation.utils.ts
```

### src/shared-kernel/ - 跨領域共用

```
src/shared-kernel/
├── README.md                          # Shared kernel docs
├── index.ts                           # Barrel export
│
├── types/                             # 共用型別
│   ├── index.ts
│   ├── base.entity.ts                 # BaseEntity interface
│   ├── result.type.ts                 # Result<T, E> type
│   ├── pagination.type.ts             # Pagination types
│   └── common.types.ts                # Common interfaces
│
├── constants/                         # 共用常數
│   ├── index.ts
│   ├── app.constants.ts               # App-wide constants
│   ├── http-status.enum.ts            # HTTP status codes
│   ├── user-role.enum.ts              # User roles
│   └── error-codes.enum.ts            # Error codes
│
├── guards/                            # Route guards
│   ├── index.ts
│   └── (future guards)
│
└── utils/                             # 共用工具
    ├── index.ts
    ├── uuid.generator.ts
    └── date.helper.ts
```

---

## 後端詳細結構 (Backend Structure)

### functions/src/ - Firebase Functions

```
functions/
├── package.json                       # Backend dependencies
├── tsconfig.json                      # Backend TypeScript config
├── .eslintrc.js                       # ESLint config
│
└── src/
    ├── index.ts                       # Cloud Functions entry
    │
    ├── interfaces/                    # 🌐 Layer 1: Entry Points
    │   ├── http/                      # HTTP callable functions
    │   │   ├── user-api.ts            # User CRUD endpoints
    │   │   ├── order-api.ts           # Order endpoints
    │   │   └── auth-api.ts            # Auth endpoints
    │   │
    │   └── triggers/                  # Cloud Function triggers
    │       ├── firestore/
    │       │   ├── user-created.trigger.ts
    │       │   ├── order-updated.trigger.ts
    │       │   └── product-deleted.trigger.ts
    │       ├── auth/
    │       │   ├── user-created.trigger.ts
    │       │   └── user-deleted.trigger.ts
    │       ├── storage/
    │       │   └── file-uploaded.trigger.ts
    │       └── pubsub/
    │           └── scheduled-tasks.trigger.ts
    │
    ├── application/                   # ⚙️ Layer 2: Backend Use Cases
    │   ├── use-cases/
    │   │   ├── user/
    │   │   │   ├── create-user.use-case.ts
    │   │   │   ├── update-user.use-case.ts
    │   │   │   └── delete-user.use-case.ts
    │   │   ├── order/
    │   │   │   ├── process-order.use-case.ts
    │   │   │   └── cancel-order.use-case.ts
    │   │   └── notification/
    │   │       └── send-notification.use-case.ts
    │   │
    │   └── dtos/
    │       ├── user/
    │       │   └── create-user.dto.ts
    │       └── order/
    │           └── create-order.dto.ts
    │
    ├── domain/                        # 🎯 Layer 3: Backend Domain (Pure TS)
    │   ├── user/
    │   │   ├── user.entity.ts
    │   │   ├── user.vo.ts
    │   │   ├── user.repository.ts     # Interface
    │   │   └── user.events.ts
    │   │
    │   ├── order/
    │   │   ├── order.aggregate.ts
    │   │   ├── order.entity.ts
    │   │   ├── order.vo.ts
    │   │   └── order.repository.ts
    │   │
    │   └── shared/
    │       ├── base.entity.ts
    │       └── domain-event.ts
    │
    └── infrastructure/                # 🔌 Layer 4: Backend Infrastructure
        ├── persistence/               # Data access
        │   ├── firestore/
        │   │   ├── admin.adapter.ts   # Firestore Admin SDK
        │   │   ├── batch.service.ts   # Batch operations
        │   │   └── transaction.service.ts
        │   │
        │   └── repositories/
        │       ├── user.repository.ts # User repository impl
        │       ├── order.repository.ts
        │       └── analytics.repository.ts
        │
        ├── external/                  # External services
        │   ├── email/
        │   │   └── sendgrid.adapter.ts
        │   ├── payment/
        │   │   └── stripe.adapter.ts
        │   ├── sms/
        │   │   └── twilio.adapter.ts
        │   └── storage/
        │       └── cloud-storage.adapter.ts
        │
        └── services/                  # Infrastructure services
            ├── cache.service.ts
            ├── queue.service.ts
            └── logger.service.ts
```

---

## Firebase 配置檔案 (Firebase Config)

### 根目錄配置

```
Xuanwu/
├── firebase.json                      # Firebase 專案配置
│   ├── hosting                        # Hosting settings
│   ├── functions                      # Functions settings
│   ├── firestore                      # Firestore settings
│   └── storage                        # Storage settings
│
├── .firebaserc                        # Firebase 專案 ID
│   └── projects.default               # "xuanwu" or your project ID
│
├── firestore.rules                    # Firestore 安全規則
│   └── Security rules for collections
│
├── firestore.indexes.json             # Firestore 索引
│   └── Composite indexes
│
├── storage.rules                      # Storage 安全規則
│   └── File upload/download rules
│
├── database.rules.json                # Realtime Database 規則 (if used)
│   └── Security and validation rules
│
└── apphosting.yaml                    # App Hosting 配置
    ├── env                            # Environment variables
    └── runConfig                      # Runtime configuration
```

---

## 快速參考表 (Quick Reference)

### 前端基礎設施路徑

| 功能 | 路徑 | 說明 |
|------|------|------|
| Firestore Adapter | `src/app/infrastructure/persistence/firestore/firestore.adapter.ts` | Firestore SDK 包裝 |
| User Repository | `src/app/infrastructure/persistence/repositories/user.repository.impl.ts` | 用戶資料存取實作 |
| Auth Adapter | `src/app/infrastructure/adapters/firebase/auth.adapter.ts` | Firebase Auth 包裝 |
| Storage Adapter | `src/app/infrastructure/adapters/firebase/storage.adapter.ts` | Firebase Storage 包裝 |
| Real-time Listener | `src/app/infrastructure/messaging/firestore-listeners/user-listener.service.ts` | Firestore 即時監聽 |
| Auth Guard | `src/app/core/auth/guards/auth.guard.ts` | 路由守衛 |
| Error Interceptor | `src/app/core/interceptors/error.interceptor.ts` | HTTP 錯誤處理 |
| App Config | `src/app/core/providers/app.config.ts` | 應用程式配置 |

### 後端基礎設施路徑

| 功能 | 路徑 | 說明 |
|------|------|------|
| Admin Adapter | `functions/src/infrastructure/persistence/firestore/admin.adapter.ts` | Admin SDK 包裝 |
| User Repository | `functions/src/infrastructure/persistence/repositories/user.repository.ts` | 後端用戶資料存取 |
| Email Service | `functions/src/infrastructure/external/email/sendgrid.adapter.ts` | 郵件服務 |
| Payment Service | `functions/src/infrastructure/external/payment/stripe.adapter.ts` | 支付服務 |
| User API | `functions/src/interfaces/http/user-api.ts` | HTTP 端點 |
| User Created Trigger | `functions/src/interfaces/triggers/firestore/user-created.trigger.ts` | Firestore 觸發器 |
| Create User Use Case | `functions/src/application/use-cases/user/create-user.use-case.ts` | 建立用戶用例 |

### Shared Kernel 組織

| 類別 | 路徑 | 內容 |
|------|------|------|
| Types | `src/shared-kernel/types/` | BaseEntity, Result<T>, Pagination |
| Constants | `src/shared-kernel/constants/` | APP_CONSTANTS, HttpStatus, UserRole |
| Guards | `src/shared-kernel/guards/` | Route guards (future) |
| Utils | `src/shared-kernel/utils/` | UUID generator, date helpers |

### Firebase 配置檔案

| 檔案 | 用途 |
|------|------|
| `firebase.json` | 主要配置 (hosting, functions, firestore, storage) |
| `.firebaserc` | 專案 ID 和別名 |
| `firestore.rules` | Firestore 安全規則 |
| `firestore.indexes.json` | 複合索引定義 |
| `storage.rules` | Storage 安全規則 |
| `database.rules.json` | Realtime Database 規則 (optional) |
| `apphosting.yaml` | App Hosting 配置 (environment, runtime) |

---

## 實作範例 (Implementation Examples)

### 範例 1: 用戶認證流程

**完整路徑:**
1. **Domain**: `src/app/domain/user/user.aggregate.ts` - User 聚合根
2. **Repository Interface**: `src/app/domain/user/user.repository.ts` - 儲存庫介面
3. **Use Case**: `src/app/application/use-cases/auth/login.use-case.ts` - 登入用例
4. **Repository Impl**: `src/app/infrastructure/persistence/repositories/user.repository.impl.ts` - 實作
5. **Auth Adapter**: `src/app/infrastructure/adapters/firebase/auth.adapter.ts` - Firebase Auth
6. **UI Component**: `src/app/features/auth/pages/login/login.component.ts` - 登入頁面

### 範例 2: 即時資料訂閱

**完整路徑:**
1. **Listener Service**: `src/app/infrastructure/messaging/firestore-listeners/user-listener.service.ts`
2. **Firestore Adapter**: `src/app/infrastructure/persistence/firestore/firestore.adapter.ts`
3. **Use Case**: `src/app/application/use-cases/user/subscribe-user.use-case.ts`
4. **UI Component**: `src/app/features/profile/pages/profile/profile.component.ts`

### 範例 3: Cloud Function 觸發器

**完整路徑:**
1. **Trigger**: `functions/src/interfaces/triggers/firestore/user-created.trigger.ts`
2. **Use Case**: `functions/src/application/use-cases/user/send-welcome-email.use-case.ts`
3. **Domain**: `functions/src/domain/user/user.entity.ts`
4. **Email Service**: `functions/src/infrastructure/external/email/sendgrid.adapter.ts`

---

## 注意事項 (Important Notes)

### Firebase 專案特性

1. **無需環境變數**: Firebase SDK 自動偵測專案配置
2. **自動配置**: `firebase.json` 和 `.firebaserc` 足夠
3. **型別安全**: 使用 TypeScript 介面定義所有服務
4. **即時能力**: Firestore listeners 實現即時更新

### 命名規範

- **檔案名稱**: kebab-case (例: `user.repository.impl.ts`)
- **類別名稱**: PascalCase (例: `UserRepositoryImpl`)
- **變數/函數**: camelCase (例: `createUser()`)
- **常數**: SCREAMING_SNAKE_CASE (例: `MAX_RETRIES`)

### 相關文檔

- 詳細架構說明: [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)
- 層級邊界規則: [DDD_LAYER_BOUNDARIES.md](./DDD_LAYER_BOUNDARIES.md)
- Import 規則: [IMPORT_RULES.md](./IMPORT_RULES.md)
- 命名規範: [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)
- 資料庫架構: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

**最後更新**: 2026-02-05  
**版本**: 2.0  
**維護者**: Architecture Team

