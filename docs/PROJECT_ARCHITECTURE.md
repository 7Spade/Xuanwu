# Xuanwu Project Architecture

> **Version**: 1.0  
> **Project**: Xuanwu (玄武 - Black Tortoise)  
> **Stack**: Angular 21+ / SSR / Zoneless / DDD / NgRx Signals / Firebase  
> **Last Updated**: 2026-02-05

---

## 🚀 Core Technology Features

### Server-Side Rendering (SSR)
- **Package**: `@angular/ssr` v21.1.2
- **Runtime**: Express server with Node.js
- **Benefits**: Improved SEO, faster initial load, better Core Web Vitals
- **Configuration**: `outputMode: "server"` in `angular.json`

### Zoneless Architecture
- **Pure Reactive**: No NgZone dependency
- **State Management**: NgRx Signal Store + Angular Signals
- **Performance**: Eliminates change detection overhead
- **Modern Angular**: Uses Angular 21+ native reactivity

### Angular Version
- **Framework**: Angular 21.1.3 (Angular 20+ generation)
- **Build System**: Angular CLI 21.1.2 with `@angular/build`
- **Features**: Standalone components, control flow syntax, deferred loading

---

## 🏗️ Architecture Overview

Xuanwu follows a strict **8-layer Domain-Driven Design (DDD)** architecture, optimized for Angular 21+ with **Server-Side Rendering (SSR)** and **pure reactive (zoneless)** architecture using Signals and NgRx Signal Store.

### Architecture Principles

1. **Layer Responsibility Separation**: Each layer has a single, well-defined responsibility
2. **Unidirectional Dependencies**: Higher layers depend on lower layers, never the reverse
3. **Interface Isolation**: Cross-layer interaction only through public APIs via \`index.ts\`
4. **Event-Driven Decoupling**: Use domain events for cross-layer communication
5. **Framework-Free Domain**: \`app/domain\` must be 100% framework-agnostic

---

## 📦 Frontend Architecture (Browser Runtime)

### src/

\`\`\`
src/
├── 📂 app/
│ ├── 📂 core/                    # Global Infrastructure Core
│ │ ├── 📂 auth/                  # Authentication & Authorization (Signals-based Auth Store)
│ │ ├── 📂 interceptors/          # Functional Interceptors
│ │ ├── 📂 providers/             # AppConfig & Global DI Configuration
│ │ ├── 📂 error-handler/         # Global Exception Handling & Logging
│ │ └── 📂 services/              # Cross-domain Technical Services (e.g., StorageService)
│ │
│ ├── 📂 domain/                  # Core Domain Layer (Pure Domain - Framework-Free)
│ │ ├── 📂 {bounded_context}/    # Organized by Domain Boundaries (e.g., Sales, Inventory)
│ │ │ ├── 📂 aggregates/          # Aggregate Roots - Business Consistency Boundaries
│ │ │ ├── 📂 entities/            # Domain Entities
│ │ │ ├── 📂 value-objects/       # Value Objects - Immutability Implementation
│ │ │ ├── 📂 factories/           # Domain Factories - Encapsulate Complex Object Creation
│ │ │ ├── 📂 events/              # Domain Events
│ │ │ ├── 📂 exceptions/          # Domain-Specific Exceptions
│ │ │ ├── 📂 specifications/      # Specification Pattern - Complex Business Rules
│ │ │ ├── �� repository-interfaces/ # Repository Interfaces (Define Persistence Abstraction)
│ │ │ ├── 📂 services/            # Domain Services - Stateless Business Logic
│ │ │ ├── 📂 state/               # Domain Local State (Signal-based Logic Containers)
│ │ │ └── 📂 testing/             # Domain Test Fixtures (Mocks, Builders, Fakes)
│ │ └── 📂 shared/                # Domain Layer Common Abstractions (BaseEntity, Identity)
│ │
│ ├── 📂 application/             # Application Layer (Orchestration)
│ │ ├── 📂 {module_name}/
│ │ │ ├── 📂 commands/            # Command Handling (State-changing Operations)
│ │ │ ├── 📂 queries/             # Query Handling (Read-only Data Flow - Signals/Resource)
│ │ │ ├── 📂 dtos/                # Data Transfer Objects (Request/Response)
│ │ │ ├── 📂 mappers/             # Bidirectional Mappers (Domain ↔ DTO)
│ │ │ └── 📂 use-cases/           # Business Use Cases (Concrete Business Process Orchestration)
│ │ └── 📂 ports/                 # Application Layer Output Interfaces (ILogger, INotification)
│ │
│ ├── 📂 infrastructure/          # Infrastructure Implementation Layer (Technical Implementation)
│ │ ├── 📂 persistence/           # Persistence Implementation (API/GraphQL/IndexDB)
│ │ │ ├── 📂 repositories/        # Concrete Repository Implementations
│ │ │ └── 📂 models/              # Database/API-Specific Models (Data Models)
│ │ ├── 📂 messaging/             # Messaging (EventBus, SignalR)
│ │ └── 📂 adapters/              # Third-party Adapters (StripeAdapter, Auth0Adapter)
│ │
│ ├── 📂 features/                # Presentation Layer (UI Presentation - Smart Components)
│ │ ├── 📂 {feature_name}/
│ │ │ ├── 📂 pages/               # Route-level Pages (Using @defer for Optimized Loading)
│ │ │ ├── 📂 containers/          # Logic Container Components (Connect to Application Layer)
│ │ │ ├── 📂 components/          # View Components (Presentational Components)
│ │ │ ├── 📂 models/              # UI-Specific ViewModels (View-only Signals)
│ │ │ └── 📂 {name}.routes.ts     # Standalone Route Definitions
│ │ └── 📂 layout/                # Global Layout (Header, Sidebar, Footer)
│ │
│ └── 📂 shared/                  # UI Shared Layer (Dumb Components & Utilities)
│   ├── 📂 ui/                    # Atomic Components (Buttons, Cards, Modals)
│   ├── 📂 directives/            # Functional Directives (Highlight, Permission)
│   ├── 📂 pipes/                 # Reactive Pipes (Pure Pipes)
│   └── 📂 utils/                 # Frontend Utility Functions (Date, Format)
│
├── 📂 shared-kernel/             # Shared Kernel (Cross-domain Common Code)
│ ├── 📂 constants/               # Global Enums & Constants
│ ├── 📂 types/                   # Base TypeScript Types
│ └── 📂 guards/                  # Cross-module Common Route Guards
│
├── 📂 assets/                    # Static Resources (Images, JSON, Icons)
├── 📂 environments/              # Environment Configuration (Dev, Prod, Staging)
└── 📂 styles/                    # Global Style System (Variables, Mixins, Theme)
\`\`\`

---

## ⚡ Backend Architecture (Node.js Runtime)

### functions/

\`\`\`
functions/
├── 📂 src/
│ ├── 📂 interfaces/              # Interface Layer (Entry Points / Triggers)
│ │ ├── 📂 http/                  # HTTPS OnCall / OnRequest Handlers
│ │ ├── 📂 triggers/              # DB Triggers (Firestore, Auth, PubSub)
│ │ └── 📂 middleware/            # Backend Middleware (Auth Check, Validation)
│ │
│ ├── 📂 application/             # Application Layer (Orchestration)
│ │ ├── 📂 use-cases/             # Core Business Process Orchestration
│ │ ├── 📂 commands/              # Write Operation Intents
│ │ ├── 📂 queries/               # Read Operation Intents
│ │ ├── 📂 dtos/                  # Interface Input/Output Models
│ │ └── 📂 mappers/               # Domain ↔ DTO Conversion
│ │
│ ├── 📂 domain/                  # Core Domain Layer (Pure Logic)
│ │ ├── 📂 aggregates/            # Aggregate Roots (Consistency Boundaries)
│ │ ├── 📂 entities/              # Entities
│ │ ├── 📂 value-objects/         # Value Objects
│ │ ├── 📂 factories/             # Complex Entity Factories
│ │ ├── 📂 services/              # Domain Services (Cross-entity Logic)
│ │ ├── 📂 repository-interfaces/ # Repository Contracts (Interfaces)
│ │ └── 📂 events/                # Domain Event Definitions
│ │
│ ├── 📂 infrastructure/          # Infrastructure Implementation Layer
│ │ ├── 📂 persistence/           # DB Implementation (Admin SDK / Firestore / SQL)
│ │ ├── 📂 external-services/     # External API Adapters (Stripe, SendGrid)
│ │ ├── 📂 messaging/             # Message Sending Implementation (PubSub, FCM)
│ │ └── 📂 config/                # Environment Variables & Secret Management (Secret Manager)
│ │
│ └── 📂 shared/                  # Backend Internal Shared Tools
│
├── 📂 tests/                     # Backend Unit Tests & Integration Tests
├── package.json
└── tsconfig.json
\`\`\`

---

## 🔗 Cross-Runtime Shared Kernel

### shared-kernel/ (Frontend + Backend Shared)

\`\`\`
shared-kernel/
├── 📂 constants/                 # Shared Enums, Status Codes
├── 📂 types/                     # Shared TypeScript Interfaces/Types
├── 📂 validation/                # Shared Validation Rules (e.g., Zod Schemas)
└── 📂 utils/                     # Shared Pure Functions (Date formatting, Math)
\`\`\`

**Key Constraint**: \`shared-kernel\` must be 100% Pure TypeScript with **zero external dependencies** and **no framework code**.

---

## 🎯 Layer Responsibilities

| Layer               | Responsibility                                  | Owner                      | Runtime   |
| ------------------- | ----------------------------------------------- | -------------------------- | --------- |
| \`app/core\`          | Technical initialization & infrastructure       | Framework Team             | Browser   |
| \`app/domain\`        | Pure business logic & domain rules              | Domain Experts             | Browser   |
| \`app/application\`   | Use case orchestration & business workflows     | Application Layer Owners   | Browser   |
| \`app/infrastructure\`| Technical implementation & external adapters    | Infrastructure Team        | Browser   |
| \`app/features\`      | UI assembly & user interaction                  | Frontend/Feature Team      | Browser   |
| \`app/shared\`        | UI common components & tools                    | Frontend Infrastructure    | Browser   |
| \`shared-kernel\`     | Cross-layer shared types & constants            | Architecture Committee     | Universal |
| \`functions\`         | Backend serverless business logic               | Backend Team               | Node.js   |

---

## 🔒 Technology Constraints by Layer

| Layer                 | Runtime        | Allowed SDKs                                | Forbidden SDKs                                  |
| --------------------- | -------------- | ------------------------------------------- | ----------------------------------------------- |
| \`shared-kernel/\`      | Pure TS        | ❌ NO external deps                         | ✅ Pure TS + Type defs only                     |
| \`app/shared/\`         | Browser        | ⚠️ Angular APIs only                        | ❌ Firebase, HttpClient (use injection)         |
| \`app/domain/\`         | Pure TS        | ❌ NO framework, NO HTTP                    | ✅ Pure business logic                          |
| \`app/application/\`    | Browser        | ⚠️ Dependency Injection                     | ❌ Direct SDK calls                             |
| \`app/infrastructure/\` | Browser        | ✅ @angular/fire, SDK clients               | ❌ firebase-admin, @google-cloud/*             |
| \`app/features/\`       | Browser        | ⚠️ Angular Components / Signals             | ❌ Direct API calls (use services)             |
| \`app/core/\`           | Browser        | ✅ Angular, Firebase Client Auth            | ❌ Business logic                               |
| \`functions/src/\`      | Node.js (GCP)  | ✅ firebase-admin, @google-cloud/*         | ❌ @angular/fire, Angular imports, Browser APIs |

---

## 📊 Dependency Flow

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                      app/core                           │
│         (Global Infrastructure & Configuration)         │
└─────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│   features  │─────▶│ application │─────▶│   domain    │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
        │                    │                    │
        │                    │                    │
        │                    ▼                    │
        │            ┌─────────────┐              │
        │            │             │              │
        └───────────▶│infrastructure│◀─────────────┘
                     │             │
                     └─────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │                 │
                   │  shared-kernel  │
                   │   (Base Layer)  │
                   │                 │
                   └─────────────────┘

functions/ (Independent Backend - Mirrors Frontend Structure)
\`\`\`

**Key Rules**:
- ✅ \`features\` → \`application\` (through use-cases)
- ✅ \`application\` → \`domain\` (direct call)
- ✅ \`application\` → \`infrastructure\` (through DI)
- ❌ \`features\` → \`domain\` (forbidden)
- ❌ \`domain\` → any other layer (forbidden)
- ❌ Deep imports into internal folders (forbidden)

---

## 🚀 Modern Angular Features

This architecture leverages Angular 20+ modern features:

1. **Standalone Components**: No NgModules, all components are standalone
2. **Signals**: Reactive state management using \`signal()\` and \`computed()\`
3. **Signal Store (NgRx)**: Application-level state management
4. **Control Flow**: Native \`@if\`, \`@for\`, \`@switch\` syntax
5. **Deferrable Views**: \`@defer\` for lazy loading optimization
6. **Zone-less**: Pure reactive architecture without Zone.js
7. **Resource API**: Modern data loading with \`rxResource()\`
8. **Functional Guards**: Route protection with functions

---

## 🧪 Testing Strategy

- **Domain Layer**: 100% unit tests, framework-free, no mocks needed
- **Application Layer**: Unit tests with mocked infrastructure
- **Infrastructure Layer**: Integration tests with Firebase emulators
- **Features Layer**: Component tests with mocked application services
- **E2E**: Cross-layer integration scenarios

---

## 📚 Related Documentation

- [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Layer responsibility rules
- [Import Rules](./IMPORT_RULES.md) - Dependency direction and import constraints
- [Naming Conventions](./NAMING_CONVENTIONS.md) - File and code naming standards
- [Testing Standards](./TESTING_STANDARDS.md) - Testing rules per layer
- [Quick Reference](./QUICK_REFERENCE.md) - Developer cheat sheet

---

## 🎓 Architecture Decision Records

### Why 8 Layers?

1. **Separation of Concerns**: Each layer has a single, clear responsibility
2. **Testability**: Pure domain layer can be tested in isolation
3. **Scalability**: Features can be developed independently
4. **Maintainability**: Clear boundaries prevent spaghetti code
5. **Flexibility**: Easy to swap implementations (e.g., Firebase → PostgreSQL)

### Why SSR (Server-Side Rendering)?

1. **SEO**: Search engines can index pre-rendered content
2. **Performance**: Faster Time to First Byte (TTFB) and First Contentful Paint (FCP)
3. **Core Web Vitals**: Improved Largest Contentful Paint (LCP) scores
4. **Social Sharing**: Meta tags work properly for Open Graph and Twitter Cards
5. **User Experience**: Faster perceived load time

**Configuration**:
- SSR is enabled by default in `angular.json` with `outputMode: "server"`
- Express server runs on port 4000 in production
- Use `npm run serve:ssr:Xuanwu` to test SSR locally
- Package: `@angular/ssr` v21.1.2

### Why Zone-less?

1. **Performance**: Eliminates Zone.js overhead (~30KB bundle reduction)
2. **Predictability**: Explicit change detection via Signals
3. **Debugging**: Easier to trace state changes
4. **Modern**: Aligns with Angular's future direction (Angular 18+ official support)
5. **SSR Compatible**: Works seamlessly with server-side rendering

**Implementation**:
- All state managed through Signals (`signal()`, `computed()`)
- Components use `ChangeDetectionStrategy.OnPush`
- NgRx Signal Store for global state
- No `ngZone.run()` or Zone.js dependency

### Why Separate Frontend/Backend?

1. **Security**: Backend has elevated privileges (firebase-admin)
2. **APIs**: Backend can access Google Cloud APIs (Document AI, Vertex AI)
3. **Scalability**: Independent deployment and scaling
4. **Type Safety**: Shared kernel ensures type consistency

---

**Version History**:
- v1.0 (2026-02-05): Initial architecture definition
