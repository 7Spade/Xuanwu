# Next.js to Angular Migration Guide

> **Document Type**: Tutorial (Learning-oriented)  
> **Target Audience**: Developers implementing OrgVerse in Angular  
> **Purpose**: Complete guide for converting Next.js OrgVerse to Angular 20+ with DDD  
> **Version**: 1.0  
> **Project**: Xuanwu (玄武) - Angular 21+ Implementation  
> **Last Updated**: 2026-02-05

## When to Use This

- 🏗️ **Planning migration** - Understand conversion strategy
- 📝 **Implementing features** - Follow step-by-step guide
- 🎯 **Understanding mapping** - See Next.js → Angular equivalents
- 📊 **Estimating effort** - Know file counts and complexity

**Prerequisites**: Understanding of both Next.js and Angular, familiarity with DDD  
**Related Docs**: [Next.js Project Tree](./NEXTJS_PROJECT_TREE.md), [Angular Project Tree](../../PROJECT_TREE.md), [DDD Layer Boundaries](../../DDD_LAYER_BOUNDARIES.md)

---

## 📋 Table of Contents

1. [Migration Overview](#migration-overview)
2. [Technology Mapping](#technology-mapping)
3. [File Structure Conversion](#file-structure-conversion)
4. [File Count Estimation](#file-count-estimation)
5. [DDD Boundary Compliance Rules](#-ddd-boundary-compliance-rules)
6. [Barrel Exports (index.ts) Pattern](#-barrel-exports-indexts-pattern)
7. [Dependency Injection Configuration](#-dependency-injection-configuration)
8. [Forbidden Imports Reference](#-forbidden-imports-reference)
9. [Migration Validation Checklist](#-migration-validation-checklist)
10. [Development Guide](#development-guide)
11. [Implementation Phases](#implementation-phases)
12. [Testing Strategy](#testing-strategy)
13. [Deployment](#deployment)

---

## Migration Overview

### 🎯 Goal

Convert the Next.js OrgVerse demo into an Angular 20+ application following the Xuanwu project's **8-layer DDD architecture** with:
- ✅ SSR (Server-Side Rendering)
- ✅ Zoneless (Pure Reactive)
- ✅ Angular Signals + NgRx Signal Store
- ✅ Firebase backend (same as Next.js)
- ✅ Strict naming conventions
- ✅ OnPush change detection

### 📊 Scope

**Next.js Demo Features to Migrate**:
1. Authentication (demo/12345)
2. Organization management
3. Workspace management
4. Dashboard with statistics
5. Member management
6. Team management
7. Partner invitations
8. AI-powered theme adaptation

**What We're NOT Migrating**:
- Genkit AI flows (will use Angular-compatible solution)
- Next.js-specific optimizations
- ShadCN UI components (will use Angular Material/CDK)

---

## Technology Mapping

### Framework Layer

| Next.js 15 | Angular 21+ | Notes |
|------------|-------------|-------|
| App Router | Angular Router | File-based → Config-based routing |
| `page.tsx` | `{name}.page.ts` | Component with route |
| `layout.tsx` | Layout component | Shared layout pattern |
| `_components/` | Feature components | Private components |
| Server Components | SSR components | Use `isPlatformBrowser` |
| Client Components | All components | All Angular components are client-side |
| Metadata | `Meta` service | Angular `Meta` and `Title` services |

### UI Layer

| Next.js/React | Angular | Notes |
|---------------|---------|-------|
| ShadCN UI | Angular Material | Use Material components |
| Radix UI | Angular CDK | Use CDK primitives |
| Tailwind CSS | Tailwind CSS | Keep same styling |
| React components | Angular components | Standalone components |
| JSX/TSX | Templates | Separate `.html` files |
| `useState` | `signal()` | Angular Signals |
| `useEffect` | `effect()` | Angular effects |
| Context | Services + DI | Angular DI system |

### State Management

| Next.js/React | Angular | Notes |
|---------------|---------|-------|
| Zustand | NgRx Signal Store | Global state |
| React Context | Angular Services | Dependency injection |
| `useState` | `signal()` | Local state |
| `useCallback` | Methods | No memo needed with OnPush |
| `useMemo` | `computed()` | Computed signals |

### Firebase Integration

| Next.js | Angular | Notes |
|---------|---------|-------|
| `use-user.tsx` | `auth.service.ts` | Auth service |
| `use-collection.tsx` | `firestore.service.ts` | Collection service |
| `use-doc.tsx` | `firestore.service.ts` | Document service |
| `firebase/config.ts` | `firebase.config.ts` | Same config |
| Client SDK | Same | Use browser SDK |

### Routing

| Next.js | Angular | Notes |
|---------|---------|-------|
| `/app/page.tsx` | `{ path: '', component: LandingPage }` | Root route |
| `/app/login/page.tsx` | `{ path: 'login', component: LoginPage }` | Login route |
| `/app/dashboard/page.tsx` | `{ path: 'dashboard', component: DashboardPage }` | Dashboard |
| `/app/[id]/page.tsx` | `{ path: ':id', component: DetailPage }` | Dynamic route |
| `useRouter()` | `inject(Router)` | Router service |
| `useParams()` | `inject(ActivatedRoute)` | Route params |

---

## File Structure Conversion

### Next.js Structure → Angular DDD Structure

```
Next.js (docs/nextjs/src/)          →    Angular (src/app/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 app/                             →    📁 features/
├── page.tsx                        →    ├── landing/
│                                   →    │   └── landing.page.ts
├── login/                          →    ├── auth/
│   └── page.tsx                    →    │   └── pages/
│                                   →    │       └── login.page.ts
└── dashboard/                      →    ├── dashboard/
    ├── layout.tsx                  →    │   ├── dashboard.routes.ts
    ├── page.tsx                    →    │   └── pages/
    │                               →    │       └── dashboard-home.page.ts
    ├── _components/                →    │   ├── components/
    │   ├── stat-cards.tsx          →    │   │   ├── stat-cards.component.ts
    │   └── ...                     →    │   │   └── ...
    ├── organization/               →    └── organization/
    │   ├── settings/page.tsx       →        ├── pages/
    │   ├── members/page.tsx        →        │   ├── settings.page.ts
    │   └── ...                     →        │   ├── members.page.ts
    └── workspaces/                 →        │   └── ...
        ├── page.tsx                →        └── organization.routes.ts
        └── [id]/page.tsx           →    
                                    →    📁 domain/
📁 types/                           →    ├── organization/
├── domain.ts                       →    │   ├── organization.aggregate.ts
                                    →    │   ├── organization.vo.ts
                                    →    │   └── organization.repository.ts
                                    →    └── workspace/
                                    →        ├── workspace.aggregate.ts
                                    →        ├── workspace.vo.ts
                                    →        └── workspace.repository.ts
                                    →    
📁 firebase/                        →    📁 infrastructure/
├── config.ts                       →    ├── persistence/firestore/
├── provider.tsx                    →    │   ├── firestore.adapter.ts
├── auth/use-user.tsx               →    │   └── organization.repository.impl.ts
└── firestore/                      →    └── adapters/firebase/
    ├── use-collection.tsx          →        ├── auth.adapter.ts
    └── use-doc.tsx                 →        └── firestore.adapter.ts
                                    →    
📁 lib/                             →    📁 application/
├── store.ts                        →    ├── use-cases/
├── utils.ts                        →    │   ├── organization/
                                    →    │   │   ├── create-organization.use-case.ts
                                    →    │   │   └── list-organizations.use-case.ts
                                    →    │   └── workspace/
                                    →    │       ├── create-workspace.use-case.ts
                                    →    │       └── list-workspaces.use-case.ts
                                    →    └── dtos/
                                    →        ├── organization/
                                    →        │   └── organization.dto.ts
                                    →        └── workspace/
                                    →            └── workspace.dto.ts
                                    →    
📁 components/                      →    📁 shared/
├── ui/                             →    ├── ui/
│   ├── button.tsx                  →    │   ├── button/
│   ├── card.tsx                    →    │   │   └── button.component.ts
│   └── ...                         →    │   ├── card/
                                    →    │   │   └── card.component.ts
                                    →    │   └── ...
├── dashboard/                      →    └── directives/
│   └── global-switcher.tsx         →        └── ...
└── ...                             →    
                                    →    📁 core/
                                    →    ├── services/
                                    →    │   ├── firebase.service.ts
                                    →    │   └── notification.service.ts
                                    →    ├── guards/
                                    →    │   └── auth.guard.ts
                                    →    └── providers/
                                    →        └── app.config.ts
```

---

## File Count Estimation

### Next.js Demo (Current)

| Category | Count | Files |
|----------|-------|-------|
| **Pages** | ~30 | `page.tsx` files |
| **Components** | ~45 | React components |
| **UI Components** | ~35 | ShadCN UI |
| **Hooks** | ~10 | Custom hooks |
| **Firebase** | ~7 | Auth, Firestore hooks |
| **AI** | ~3 | Genkit flows |
| **Utilities** | ~5 | Helper functions |
| **Config** | ~8 | Config files |
| **Total** | **~143** | TypeScript/TSX files |

### Angular Implementation (Estimated)

| Layer | Category | Count | Files |
|-------|----------|-------|-------|
| **Domain** | Aggregates | 2 | organization.aggregate.ts, workspace.aggregate.ts |
| | Value Objects | 6 | organization-id.vo.ts, workspace-id.vo.ts, etc. |
| | Entities | 2 | member.entity.ts, capability.entity.ts |
| | Events | 4 | organization-created.event.ts, etc. |
| | Repository Interfaces | 2 | organization.repository.ts, workspace.repository.ts |
| | **Subtotal** | **16** | Pure domain logic |
| **Application** | Use Cases | 12 | create-org, list-org, create-workspace, etc. |
| | DTOs | 8 | organization.dto.ts, workspace.dto.ts, etc. |
| | Mappers | 4 | organization.mapper.ts, workspace.mapper.ts |
| | Commands | 6 | Optional CQRS commands |
| | Queries | 6 | Optional CQRS queries |
| | **Subtotal** | **36** | Orchestration layer |
| **Infrastructure** | Repository Impls | 2 | firestore-organization.repository.ts, etc. |
| | Firestore Adapter | 3 | firestore.adapter.ts, collection.service.ts |
| | Auth Adapter | 2 | firebase-auth.adapter.ts |
| | Storage Adapter | 1 | firebase-storage.adapter.ts |
| | **Subtotal** | **8** | Technical adapters |
| **Features** | Pages | 30 | landing.page.ts, login.page.ts, etc. |
| | Components | 45 | stat-cards.component.ts, etc. |
| | Templates | 75 | .html files for each component |
| | Styles | 75 | .css/.scss files |
| | Routes | 8 | dashboard.routes.ts, etc. |
| | **Subtotal** | **233** | UI presentation |
| **Shared** | UI Components | 35 | button.component.ts, card.component.ts |
| | Directives | 5 | highlight.directive.ts, etc. |
| | Pipes | 5 | date-format.pipe.ts, etc. |
| | Templates/Styles | 70 | .html + .css for UI components |
| | **Subtotal** | **115** | Shared utilities |
| **Core** | Services | 8 | firebase.service.ts, notification.service.ts |
| | Guards | 3 | auth.guard.ts, role.guard.ts |
| | Interceptors | 3 | auth.interceptor.ts, error.interceptor.ts |
| | Providers | 2 | app.config.ts, app.config.server.ts |
| | **Subtotal** | **16** | Core infrastructure |
| **Testing** | Spec files | ~150 | .spec.ts for all layers |
| | Test utilities | 5 | mock-firebase.ts, test-helpers.ts |
| | **Subtotal** | **155** | Test infrastructure |
| **Configuration** | Config files | 8 | angular.json, tsconfig.json, etc. |
| **Documentation** | README/docs | 5 | Layer documentation |
| | | | |
| **TOTAL** | | **~592** | **Complete Angular implementation** |

### Breakdown by File Type

| Extension | Count | Purpose |
|-----------|-------|---------|
| `.ts` | ~270 | TypeScript classes, services, logic |
| `.html` | ~145 | Angular templates |
| `.css` / `.scss` | ~145 | Component styles |
| `.spec.ts` | ~150 | Unit tests |
| `.json` | ~8 | Configuration |
| **Total** | **~718** | **All files including tests and config** |

---

## 🚨 DDD Boundary Compliance Rules

### ⚠️ CRITICAL: Domain Layer Purity

The domain layer is the heart of the application and **MUST** remain framework-agnostic. This is NON-NEGOTIABLE.

#### Domain Layer Rules

**✅ ALLOWED in Domain Layer**:
```typescript
// Pure TypeScript - OK
export class OrganizationId {
  private constructor(private value: string) {}
}

// Business logic - OK
export class OrganizationAggregate {
  updateName(name: string): void {
    if (name.length < 3) {
      throw new DomainError('Name too short');
    }
    this.props.name = name;
  }
}

// Domain events - OK
export class OrganizationCreatedEvent {
  constructor(public readonly orgId: string) {}
}

// Repository interfaces - OK
export abstract class OrganizationRepository {
  abstract save(org: OrganizationAggregate): Promise<void>;
}
```

**❌ FORBIDDEN in Domain Layer**:
```typescript
// ❌ NO Angular imports!
import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

// ❌ NO Firebase imports!
import { Firestore, collection } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';

// ❌ NO HTTP client!
import { HttpClient } from '@angular/common/http';

// ❌ NO dependency injection decorators!
@Injectable({ providedIn: 'root' })  // WRONG!
export class OrganizationAggregate { }

// ❌ NO framework-specific code!
export class Organization {
  status = signal('active');  // WRONG! Use plain properties
}
```

#### Why Domain Layer Must Be Pure

1. **Testability**: Pure TypeScript is easy to unit test
2. **Portability**: Can reuse logic in other frameworks
3. **Maintainability**: No framework upgrade dependencies
4. **DDD Principles**: Domain represents business, not technology

---

## 📦 Barrel Exports (index.ts) Pattern

### Requirement: All Layers Must Export Through index.ts

Every layer and sub-module **MUST** have an `index.ts` file that exports its public API. Direct imports to internal files are **FORBIDDEN**.

#### Domain Layer Barrel Exports

```typescript
// src/app/domain/organization/index.ts
export * from './organization.aggregate';
export * from './organization-id.vo';
export * from './organization.repository';
export * from './organization-created.event';
// DO NOT export internal implementation details
```

**✅ Correct Import**:
```typescript
import { OrganizationAggregate, OrganizationId } from '@app/domain/organization';
```

**❌ Wrong Import**:
```typescript
import { OrganizationAggregate } from '@app/domain/organization/organization.aggregate';
import { OrganizationId } from '@app/domain/organization/organization-id.vo';
```

#### Application Layer Barrel Exports

```typescript
// src/app/application/use-cases/organization/index.ts
export * from './create-organization.use-case';
export * from './list-organizations.use-case';
export * from './update-organization.use-case';
export * from './delete-organization.use-case';
```

```typescript
// src/app/application/dtos/organization/index.ts
export * from './create-organization.dto';
export * from './organization.dto';
export * from './organization.mapper';
```

```typescript
// src/app/application/index.ts
export * from './use-cases/organization';
export * from './dtos/organization';
```

**✅ Correct Import**:
```typescript
import { CreateOrganizationUseCase } from '@app/application/use-cases/organization';
```

#### Infrastructure Layer Barrel Exports

```typescript
// src/app/infrastructure/persistence/repositories/index.ts
export * from './firestore-organization.repository';
export * from './firestore-workspace.repository';
```

```typescript
// src/app/infrastructure/index.ts
export * from './persistence/repositories';
export * from './adapters/firebase';
```

#### Features Layer Barrel Exports

```typescript
// src/app/features/dashboard/index.ts
export * from './pages/dashboard-home.page';
export * from './components/stat-cards.component';
export * from './dashboard.routes';
```

### Migration Checklist: Barrel Exports

For EVERY module created during migration:

- [ ] Create `index.ts` in module root
- [ ] Export all public APIs through `index.ts`
- [ ] Do NOT export internal implementation details
- [ ] Verify imports use module root, not deep paths
- [ ] Add ESLint rule to prevent deep imports (recommended)

---

## 🔌 Dependency Injection Configuration

### Critical: Repository Interface Binding

The migration guide shows repository interfaces in domain and implementations in infrastructure. But Angular needs to know which implementation to use!

#### Infrastructure Providers Configuration

**Create this file** (ESSENTIAL):

```typescript
// src/app/infrastructure/infrastructure.providers.ts
import { Provider } from '@angular/core';
import { OrganizationRepository } from '../domain/organization';
import { WorkspaceRepository } from '../domain/workspace';
import { FirestoreOrganizationRepository } from './persistence/repositories/firestore-organization.repository';
import { FirestoreWorkspaceRepository } from './persistence/repositories/firestore-workspace.repository';

export const INFRASTRUCTURE_PROVIDERS: Provider[] = [
  // Bind domain repository interfaces to infrastructure implementations
  {
    provide: OrganizationRepository,
    useClass: FirestoreOrganizationRepository
  },
  {
    provide: WorkspaceRepository,
    useClass: FirestoreWorkspaceRepository
  },
  
  // Other infrastructure services
  FirestoreAdapter,
  FirebaseAuthAdapter,
  FirebaseStorageAdapter
];
```

#### Register Providers in App Config

```typescript
// src/app/core/providers/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { routes } from '../app.routes';
import { INFRASTRUCTURE_PROVIDERS } from '../../infrastructure/infrastructure.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    
    // Firebase initialization
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    
    // Infrastructure layer providers (CRITICAL!)
    ...INFRASTRUCTURE_PROVIDERS,
  ]
};
```

#### Use Case Dependency Injection

Now use cases can inject repository interfaces:

```typescript
// src/app/application/use-cases/organization/create-organization.use-case.ts
import { inject, Injectable } from '@angular/core';
import { OrganizationRepository } from '../../../domain/organization';  // Interface
import { OrganizationAggregate, OrganizationId } from '../../../domain/organization';

@Injectable({ providedIn: 'root' })
export class CreateOrganizationUseCase {
  // Inject the INTERFACE, Angular provides the implementation
  private repository = inject(OrganizationRepository);
  
  async execute(dto: CreateOrganizationDto): Promise<string> {
    const id = OrganizationId.create(crypto.randomUUID());
    const organization = OrganizationAggregate.create({
      id,
      name: dto.name,
      ownerId: dto.ownerId,
    });
    
    // This calls the Firestore implementation automatically
    await this.repository.save(organization);
    
    return id.getValue();
  }
}
```

### Why This Matters

**Without proper DI configuration**:
```
ERROR: No provider for OrganizationRepository!
```

**With proper DI configuration**:
```
✓ Use cases work seamlessly
✓ Easy to swap implementations (e.g., mock for testing)
✓ Maintains DDD layer boundaries
```

---

## 🚫 Forbidden Imports Reference

### Import Violations by Layer

#### Domain Layer - NEVER Import

```typescript
// ❌ Domain layer violations
import { Injectable } from '@angular/core';              // Framework
import { signal } from '@angular/core';                  // Framework
import { Firestore } from '@angular/fire/firestore';     // External service
import { HttpClient } from '@angular/common/http';       // Framework
import { Router } from '@angular/router';                // Framework
import { ComponentRef } from '@angular/core';            // Framework
```

**Rule**: Domain layer can only import from `shared-kernel` or other domain modules.

#### Application Layer - Limited Imports

```typescript
// ✅ Allowed in Application layer
import { Injectable } from '@angular/core';              // For @Injectable decorator
import { inject } from '@angular/core';                  // For dependency injection

// ❌ Forbidden in Application layer
import { Firestore } from '@angular/fire/firestore';     // Use repository instead
import { HttpClient } from '@angular/common/http';       // Use adapter instead
import { Component } from '@angular/core';               // No UI components
import { signal } from '@angular/core';                  // No UI state management
```

**Rule**: Application layer can use Angular DI, but NO direct Firebase/HTTP calls, NO UI components.

#### Infrastructure Layer - Allowed Imports

```typescript
// ✅ Allowed in Infrastructure layer
import { Injectable, inject } from '@angular/core';      // Framework
import { Firestore, collection, doc } from '@angular/fire/firestore';  // External services
import { HttpClient } from '@angular/common/http';       // HTTP
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';  // Auth
```

**Rule**: Infrastructure layer can import anything needed to implement adapters.

#### Features Layer - UI Imports Only

```typescript
// ✅ Allowed in Features layer
import { Component, signal, computed } from '@angular/core';  // Angular
import { RouterLink } from '@angular/router';                 // Routing
import { MatButton } from '@angular/material/button';         // UI library

// ❌ Forbidden in Features layer
import { Firestore } from '@angular/fire/firestore';          // Use use-cases instead
import { OrganizationAggregate } from '@app/domain/...';      // Don't import domain directly
```

**Rule**: Features layer imports use-cases and DTOs, never domain or infrastructure directly.

---

## ✅ Migration Validation Checklist

Use this checklist during migration to ensure DDD boundaries are maintained.

### Phase 1: Domain Layer Validation

- [ ] **No Angular imports**: Search domain folder for `@angular` - should be ZERO
- [ ] **No Firebase imports**: Search domain folder for `firebase` - should be ZERO
- [ ] **No decorators**: Search domain folder for `@Injectable` - should be ZERO
- [ ] **Pure TypeScript**: All domain classes use plain classes/interfaces
- [ ] **Repository interfaces**: All repositories are abstract classes/interfaces
- [ ] **index.ts exists**: Every domain module has barrel export
- [ ] **Tests pass**: Domain layer tests run without Angular TestBed

```bash
# Validation commands
cd src/app/domain
grep -r "@angular" .  # Should return nothing
grep -r "firebase" .   # Should return nothing
grep -r "@Injectable" .  # Should return nothing
```

### Phase 2: Application Layer Validation

- [ ] **Use cases use DI**: All use cases have `@Injectable` decorator
- [ ] **Use cases inject interfaces**: Use `inject(OrganizationRepository)`, not concrete class
- [ ] **No direct Firestore**: No `collection()`, `doc()`, or Firestore calls
- [ ] **No direct HTTP**: No `HttpClient` usage
- [ ] **DTOs are interfaces**: All DTOs are plain TypeScript interfaces
- [ ] **index.ts exists**: Every application module has barrel export

```bash
# Validation commands
cd src/app/application
grep -r "collection\|doc\|getDoc" .  # Should return nothing
grep -r "HttpClient" .  # Should return nothing
```

### Phase 3: Infrastructure Layer Validation

- [ ] **Implements interfaces**: All repositories extend domain repository interfaces
- [ ] **Provider configuration**: `infrastructure.providers.ts` exists
- [ ] **Repository bindings**: All domain interfaces bound to implementations
- [ ] **Firebase adapters**: Firestore access encapsulated in adapters
- [ ] **index.ts exists**: Infrastructure has barrel exports

```bash
# Check provider bindings
cat src/app/infrastructure/infrastructure.providers.ts
# Should see: { provide: OrganizationRepository, useClass: ... }
```

### Phase 4: Features Layer Validation

- [ ] **No domain imports**: Features don't import from domain
- [ ] **No infrastructure imports**: Features don't import from infrastructure
- [ ] **Use cases only**: Features inject use cases, not repositories
- [ ] **OnPush change detection**: All components use `ChangeDetectionStrategy.OnPush`
- [ ] **Signals for state**: All state uses `signal()`, not `BehaviorSubject`
- [ ] **index.ts exists**: Every feature has barrel exports

```bash
# Validation commands
cd src/app/features
grep -r "from '@app/domain" .  # Should return nothing
grep -r "from '@app/infrastructure" .  # Should return nothing
grep -r "ChangeDetectionStrategy.Default" .  # Should return nothing
```

### Phase 5: Import Rules Validation

- [ ] **No deep imports**: All imports use module roots, not deep paths
- [ ] **Barrel exports exist**: Every layer/module has `index.ts`
- [ ] **Circular dependencies**: No circular dependency errors
- [ ] **ESLint passes**: No import rule violations

```bash
# Check for deep import violations
grep -r "from '@app/domain/.*/.*'" src/app  # Should return nothing
grep -r "from '@app/application/.*/.*'" src/app  # Should return nothing

# Run ESLint
npm run lint
```

### Phase 6: App Configuration Validation

- [ ] **Providers registered**: `INFRASTRUCTURE_PROVIDERS` in `app.config.ts`
- [ ] **Zoneless enabled**: `provideZonelessChangeDetection()` configured
- [ ] **Firebase initialized**: `provideFirebaseApp()` configured
- [ ] **Routes configured**: `provideRouter(routes)` configured
- [ ] **SSR configured**: Server config exists for SSR

```bash
# Check app config
cat src/app/core/providers/app.config.ts
# Should include: ...INFRASTRUCTURE_PROVIDERS
```

### Phase 7: Build & Runtime Validation

- [ ] **Build succeeds**: `npm run build` completes without errors
- [ ] **No DI errors**: Application starts without "No provider for..." errors
- [ ] **Routes work**: All lazy-loaded routes work correctly
- [ ] **Tests pass**: All layer tests pass
- [ ] **E2E tests pass**: Critical user flows work

```bash
# Build validation
npm run build
# Check for DI errors in console

# Test validation
npm test
```

---

## Development Guide

### Phase 1: Foundation (Week 1)

**Goal**: Set up core infrastructure

#### 1.1 Domain Layer - Organizations

**Files to Create** (~8 files):

```typescript
// src/app/domain/organization/organization-id.vo.ts
export class OrganizationId {
  private constructor(private readonly value: string) {}
  
  static create(value: string): OrganizationId {
    if (!value || value.trim().length === 0) {
      throw new Error('Organization ID cannot be empty');
    }
    return new OrganizationId(value);
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: OrganizationId): boolean {
    return this.value === other.value;
  }
}
```

```typescript
// src/app/domain/organization/organization.aggregate.ts
import { OrganizationId } from './organization-id.vo';

export interface OrganizationProps {
  id: OrganizationId;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationAggregate {
  private constructor(private props: OrganizationProps) {}
  
  static create(props: Omit<OrganizationProps, 'createdAt' | 'updatedAt'>): OrganizationAggregate {
    return new OrganizationAggregate({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  static reconstitute(props: OrganizationProps): OrganizationAggregate {
    return new OrganizationAggregate(props);
  }
  
  getId(): OrganizationId {
    return this.props.id;
  }
  
  getName(): string {
    return this.props.name;
  }
  
  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }
  
  toPlainObject(): OrganizationProps {
    return { ...this.props };
  }
}
```

```typescript
// src/app/domain/organization/organization.repository.ts
import { Observable } from 'rxjs';
import { OrganizationAggregate } from './organization.aggregate';
import { OrganizationId } from './organization-id.vo';

export abstract class OrganizationRepository {
  abstract save(organization: OrganizationAggregate): Promise<void>;
  abstract findById(id: OrganizationId): Observable<OrganizationAggregate | null>;
  abstract findAll(): Observable<OrganizationAggregate[]>;
  abstract delete(id: OrganizationId): Promise<void>;
}
```

#### 1.2 Infrastructure Layer - Firebase Integration

**Files to Create** (~5 files):

```typescript
// src/app/infrastructure/persistence/firestore/firestore.adapter.ts
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreAdapter {
  private firestore = inject(Firestore);
  
  getDocument<T>(collectionPath: string, docId: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionPath, docId);
    return from(getDoc(docRef).then(snap => snap.exists() ? snap.data() as T : null));
  }
  
  getCollection<T>(collectionPath: string): Observable<T[]> {
    const colRef = collection(this.firestore, collectionPath);
    return from(getDocs(colRef).then(snap => snap.docs.map(doc => doc.data() as T)));
  }
  
  setDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
    const docRef = doc(this.firestore, collectionPath, docId);
    return setDoc(docRef, data);
  }
  
  deleteDocument(collectionPath: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionPath, docId);
    return deleteDoc(docRef);
  }
}
```

```typescript
// src/app/infrastructure/persistence/repositories/firestore-organization.repository.ts
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { OrganizationRepository } from '../../../domain/organization/organization.repository';
import { OrganizationAggregate } from '../../../domain/organization/organization.aggregate';
import { OrganizationId } from '../../../domain/organization/organization-id.vo';
import { FirestoreAdapter } from '../firestore/firestore.adapter';

@Injectable({ providedIn: 'root' })
export class FirestoreOrganizationRepository extends OrganizationRepository {
  private adapter = inject(FirestoreAdapter);
  private collectionPath = 'organizations';
  
  async save(organization: OrganizationAggregate): Promise<void> {
    const data = organization.toPlainObject();
    await this.adapter.setDocument(this.collectionPath, data.id.getValue(), data);
  }
  
  findById(id: OrganizationId): Observable<OrganizationAggregate | null> {
    return this.adapter.getDocument(this.collectionPath, id.getValue()).pipe(
      map(data => data ? OrganizationAggregate.reconstitute(data as any) : null)
    );
  }
  
  findAll(): Observable<OrganizationAggregate[]> {
    return this.adapter.getCollection(this.collectionPath).pipe(
      map(docs => docs.map(doc => OrganizationAggregate.reconstitute(doc as any)))
    );
  }
  
  async delete(id: OrganizationId): Promise<void> {
    await this.adapter.deleteDocument(this.collectionPath, id.getValue());
  }
}
```

#### 1.3 Application Layer - Use Cases

**Files to Create** (~4 files):

```typescript
// src/app/application/use-cases/organization/create-organization.use-case.ts
import { inject, Injectable } from '@angular/core';
import { OrganizationRepository } from '../../../domain/organization/organization.repository';
import { OrganizationAggregate } from '../../../domain/organization/organization.aggregate';
import { OrganizationId } from '../../../domain/organization/organization-id.vo';
import { CreateOrganizationDto } from '../../dtos/organization/create-organization.dto';

@Injectable({ providedIn: 'root' })
export class CreateOrganizationUseCase {
  private repository = inject(OrganizationRepository);
  
  async execute(dto: CreateOrganizationDto): Promise<string> {
    const id = OrganizationId.create(crypto.randomUUID());
    
    const organization = OrganizationAggregate.create({
      id,
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
    });
    
    await this.repository.save(organization);
    
    return id.getValue();
  }
}
```

```typescript
// src/app/application/dtos/organization/create-organization.dto.ts
export interface CreateOrganizationDto {
  name: string;
  description?: string;
  ownerId: string;
}
```

### Phase 2: Feature Implementation (Week 2-3)

#### 2.1 Authentication Feature

**Files to Create** (~6 files):

```typescript
// src/app/features/auth/pages/login.page.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  
  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      await this.authService.signIn(this.email(), this.password());
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set('Login failed. Please check your credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}
```

```html
<!-- src/app/features/auth/pages/login.page.html -->
<div class="login-container">
  <div class="login-card">
    <h1>Welcome to OrgVerse</h1>
    
    <form (ngSubmit)="onSubmit()">
      <div class="form-field">
        <label for="email">Email</label>
        <input 
          id="email" 
          type="text" 
          [(ngModel)]="email"
          name="email"
          placeholder="demo"
          required
        />
      </div>
      
      <div class="form-field">
        <label for="password">Password</label>
        <input 
          id="password" 
          type="password" 
          [(ngModel)]="password"
          name="password"
          placeholder="12345"
          required
        />
      </div>
      
      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
      
      <button 
        type="submit" 
        [disabled]="loading()"
      >
        @if (loading()) {
          <span>Signing in...</span>
        } @else {
          <span>Sign In</span>
        }
      </button>
    </form>
  </div>
</div>
```

#### 2.2 Dashboard Feature

**Files to Create** (~15 files):

```typescript
// src/app/features/dashboard/pages/dashboard-home.page.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ListOrganizationsUseCase } from '../../../application/use-cases/organization/list-organizations.use-case';
import { OrganizationAggregate } from '../../../domain/organization/organization.aggregate';
import { StatCardsComponent } from '../components/stat-cards.component';
import { RecentOrganizationsComponent } from '../components/recent-organizations.component';

@Component({
  selector: 'app-dashboard-home-page',
  standalone: true,
  imports: [StatCardsComponent, RecentOrganizationsComponent],
  templateUrl: './dashboard-home.page.html',
  styleUrl: './dashboard-home.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomePage implements OnInit {
  private listOrgsUseCase = inject(ListOrganizationsUseCase);
  
  organizations = signal<OrganizationAggregate[]>([]);
  loading = signal(true);
  
  ngOnInit(): void {
    this.loadOrganizations();
  }
  
  private loadOrganizations(): void {
    this.listOrgsUseCase.execute().subscribe({
      next: (orgs) => {
        this.organizations.set(orgs);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load organizations', err);
        this.loading.set(false);
      }
    });
  }
}
```

### Phase 3: UI Components (Week 4)

#### 3.1 Shared UI Components

**Files to Create** (~70 files - components + templates + styles):

```typescript
// src/app/shared/ui/button/button.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  variant = input<'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'>('default');
  size = input<'default' | 'sm' | 'lg' | 'icon'>('default');
  disabled = input(false);
  
  clicked = output<void>();
  
  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
```

```html
<!-- src/app/shared/ui/button/button.component.html -->
<button 
  [class]="'btn btn-' + variant() + ' btn-' + size()"
  [disabled]="disabled()"
  (click)="onClick()"
>
  <ng-content></ng-content>
</button>
```

### Phase 4: Routing (Week 4)

**Files to Create** (~8 route files):

```typescript
// src/app/core/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../features/landing/landing.page').then(m => m.LandingPage)
  },
  {
    path: 'login',
    loadComponent: () => import('../features/auth/pages/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('../features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

```typescript
// src/app/features/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-home.page').then(m => m.DashboardHomePage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'organization',
    loadChildren: () => import('../organization/organization.routes').then(m => m.ORGANIZATION_ROUTES)
  },
  {
    path: 'workspaces',
    loadChildren: () => import('../workspaces/workspaces.routes').then(m => m.WORKSPACES_ROUTES)
  }
];
```

---

## Implementation Phases

### 📅 Timeline Overview

| Phase | Duration | Files | Description |
|-------|----------|-------|-------------|
| **Phase 1** | Week 1 | ~25 | Domain, Infrastructure, Application setup |
| **Phase 2** | Week 2-3 | ~50 | Core features (Auth, Dashboard, Organizations) |
| **Phase 3** | Week 4 | ~100 | UI components and styling |
| **Phase 4** | Week 4 | ~15 | Routing and navigation |
| **Phase 5** | Week 5 | ~150 | Testing all layers |
| **Phase 6** | Week 6 | ~10 | Documentation and deployment |
| **Total** | **6 weeks** | **~350** | **Core files (excluding tests)** |

### Phase 1: Foundation ✅

**Week 1 - Core Architecture**

- [ ] Domain layer setup
  - [ ] Organization aggregate
  - [ ] Workspace aggregate
  - [ ] Value objects (IDs, etc.)
  - [ ] Repository interfaces
  - [ ] Domain events
- [ ] Infrastructure layer
  - [ ] Firestore adapter
  - [ ] Organization repository implementation
  - [ ] Workspace repository implementation
  - [ ] Firebase Auth adapter
- [ ] Application layer
  - [ ] Organization use cases (Create, List, Update, Delete)
  - [ ] Workspace use cases (Create, List, Update, Delete)
  - [ ] DTOs and mappers
- [ ] Core services
  - [ ] Firebase service
  - [ ] Auth service
  - [ ] Notification service

**Deliverable**: Working backend integration with Firebase

### Phase 2: Core Features ✅

**Week 2-3 - Essential Features**

- [ ] Authentication
  - [ ] Login page
  - [ ] Auth guard
  - [ ] Auth service integration
- [ ] Dashboard
  - [ ] Dashboard home page
  - [ ] Statistics cards
  - [ ] Recent organizations
  - [ ] Recent workspaces
- [ ] Organization management
  - [ ] Organization list
  - [ ] Organization details
  - [ ] Settings page
  - [ ] Members page
- [ ] Workspace management
  - [ ] Workspace list
  - [ ] Workspace details
  - [ ] Create workspace dialog

**Deliverable**: Working dashboard with org/workspace management

### Phase 3: UI Components ✅

**Week 4 - User Interface**

- [ ] Shared UI components (35+)
  - [ ] Button
  - [ ] Card
  - [ ] Dialog
  - [ ] Input
  - [ ] Select
  - [ ] Table
  - [ ] Tabs
  - [ ] And more...
- [ ] Layout components
  - [ ] Dashboard header
  - [ ] Dashboard sidebar
  - [ ] Page header
- [ ] Feature components
  - [ ] Organization card
  - [ ] Workspace card
  - [ ] Member list
  - [ ] Team list

**Deliverable**: Complete UI component library

### Phase 4: Routing ✅

**Week 4 - Navigation**

- [ ] Route configuration
  - [ ] Main routes
  - [ ] Dashboard routes
  - [ ] Organization routes
  - [ ] Workspace routes
- [ ] Guards
  - [ ] Auth guard
  - [ ] Role guard
  - [ ] Unsaved changes guard
- [ ] Lazy loading setup

**Deliverable**: Full navigation system

### Phase 5: Testing ✅

**Week 5 - Quality Assurance**

- [ ] Domain layer tests (~16 specs)
- [ ] Application layer tests (~36 specs)
- [ ] Infrastructure layer tests (~8 specs)
- [ ] Feature layer tests (~50 specs)
- [ ] Integration tests (~20 specs)
- [ ] E2E tests (~20 specs)

**Deliverable**: >80% test coverage

### Phase 6: Finalization ✅

**Week 6 - Polish & Deploy**

- [ ] Documentation
  - [ ] README updates
  - [ ] API documentation
  - [ ] Deployment guide
- [ ] Performance optimization
  - [ ] OnPush everywhere
  - [ ] Lazy loading verification
  - [ ] Bundle size optimization
- [ ] Deployment
  - [ ] Firebase hosting setup
  - [ ] CI/CD pipeline
  - [ ] Production build

**Deliverable**: Production-ready application

---

## Testing Strategy

### Unit Tests

**Domain Layer** (Pure logic):
```typescript
// src/app/domain/organization/organization.aggregate.spec.ts
import { OrganizationAggregate } from './organization.aggregate';
import { OrganizationId } from './organization-id.vo';

describe('OrganizationAggregate', () => {
  it('should create organization with valid data', () => {
    const id = OrganizationId.create('test-id');
    const org = OrganizationAggregate.create({
      id,
      name: 'Test Org',
      ownerId: 'user-123'
    });
    
    expect(org.getName()).toBe('Test Org');
  });
  
  it('should update name', () => {
    const id = OrganizationId.create('test-id');
    const org = OrganizationAggregate.create({
      id,
      name: 'Old Name',
      ownerId: 'user-123'
    });
    
    org.updateName('New Name');
    
    expect(org.getName()).toBe('New Name');
  });
});
```

**Application Layer** (Use cases):
```typescript
// src/app/application/use-cases/organization/create-organization.use-case.spec.ts
import { TestBed } from '@angular/core/testing';
import { CreateOrganizationUseCase } from './create-organization.use-case';
import { OrganizationRepository } from '../../../domain/organization/organization.repository';

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;
  let repository: jasmine.SpyObj<OrganizationRepository>;
  
  beforeEach(() => {
    const repoSpy = jasmine.createSpyObj('OrganizationRepository', ['save']);
    
    TestBed.configureTestingModule({
      providers: [
        CreateOrganizationUseCase,
        { provide: OrganizationRepository, useValue: repoSpy }
      ]
    });
    
    useCase = TestBed.inject(CreateOrganizationUseCase);
    repository = TestBed.inject(OrganizationRepository) as jasmine.SpyObj<OrganizationRepository>;
  });
  
  it('should create organization and save to repository', async () => {
    repository.save.and.returnValue(Promise.resolve());
    
    const id = await useCase.execute({
      name: 'Test Org',
      ownerId: 'user-123'
    });
    
    expect(repository.save).toHaveBeenCalled();
    expect(id).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// src/app/features/dashboard/pages/dashboard-home.page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHomePage } from './dashboard-home.page';
import { ListOrganizationsUseCase } from '../../../application/use-cases/organization/list-organizations.use-case';
import { of } from 'rxjs';

describe('DashboardHomePage', () => {
  let component: DashboardHomePage;
  let fixture: ComponentFixture<DashboardHomePage>;
  let useCase: jasmine.SpyObj<ListOrganizationsUseCase>;
  
  beforeEach(async () => {
    const useCaseSpy = jasmine.createSpyObj('ListOrganizationsUseCase', ['execute']);
    
    await TestBed.configureTestingModule({
      imports: [DashboardHomePage],
      providers: [
        { provide: ListOrganizationsUseCase, useValue: useCaseSpy }
      ]
    }).compileComponents();
    
    useCase = TestBed.inject(ListOrganizationsUseCase) as jasmine.SpyObj<ListOrganizationsUseCase>;
    fixture = TestBed.createComponent(DashboardHomePage);
    component = fixture.componentInstance;
  });
  
  it('should load organizations on init', () => {
    useCase.execute.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(useCase.execute).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });
});
```

---

## Deployment

### Firebase Hosting

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Configuration

```json
// firebase.json
{
  "hosting": {
    "public": "dist/xuanwu/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Summary

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Files** | ~592 (core) + ~150 (tests) = **~742** |
| **Development Time** | **6 weeks** |
| **Team Size** | 2-3 developers |
| **Lines of Code** | ~35,000 (estimated) |
| **Test Coverage** | >80% target |

### Success Criteria

- ✅ All Next.js features migrated
- ✅ 8-layer DDD architecture followed
- ✅ >80% test coverage
- ✅ OnPush change detection everywhere
- ✅ Zoneless configuration enabled
- ✅ SSR working properly
- ✅ Firebase integration complete
- ✅ Production deployment successful

### Next Steps

1. **Review this plan** with the team
2. **Set up project structure** (Phase 1 foundation)
3. **Create first domain aggregate** (Organization)
4. **Implement first use case** (CreateOrganization)
5. **Build first page** (Login)
6. **Iterate and expand** following the phases

---

## 📖 Related Documentation

- [Next.js Project Tree](./NEXTJS_PROJECT_TREE.md) - Source structure
- [Angular Project Tree](../../PROJECT_TREE.md) - Target structure
- [DDD Layer Boundaries](../../DDD_LAYER_BOUNDARIES.md) - Architecture rules
- [Naming Conventions](../../NAMING_CONVENTIONS.md) - File naming rules
- [Testing Standards](../../TESTING_STANDARDS.md) - Test patterns

---

**Version History**:
- v1.0 (2026-02-05): Initial migration guide with complete file mapping and development plan
