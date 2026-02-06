# Next.js to Angular - Detailed Implementation Guide

> **Document Type**: Tutorial (Step-by-step)  
> **Target Audience**: Developers implementing the migration  
> **Purpose**: Atomic, progressive implementation guide with complete file naming and checkpoints  
> **Version**: 1.0  
> **Project**: Xuanwu (玄武) - Angular 21+ OrgVerse Implementation  
> **Last Updated**: 2026-02-06

## When to Use This

- 🛠️ **Daily implementation** - Know exactly what to build today
- 📝 **File creation** - Get exact file names and templates
- ✅ **Progress verification** - Checkpoint at each stage
- 🎯 **Never get lost** - Clear numbered steps with dependencies

**Prerequisites**: Read [Migration Guide](./NEXTJS_TO_ANGULAR_MIGRATION.md) first  
**Related Docs**: [DDD Layer Boundaries](../../DDD_LAYER_BOUNDARIES.md), [Naming Conventions](../../NAMING_CONVENTIONS.md)

---

## 📋 Table of Contents

1. [Complete File Inventory](#complete-file-inventory)
2. [Function Organization](#function-organization)
3. [Atomic Feature Units](#atomic-feature-units)
4. [Progressive Implementation Steps](#progressive-implementation-steps)
5. [Checkpoint Verification](#checkpoint-verification)
6. [Dependency Graph](#dependency-graph)
7. [Daily Workflow Guide](#daily-workflow-guide)

---

## Complete File Inventory

### Summary

| Layer | Files | Purpose |
|-------|-------|---------|
| Domain | 28 | Pure business logic (framework-agnostic) |
| Application | 48 | Use cases and orchestration |
| Infrastructure | 12 | Technical adapters (Firebase, HTTP) |
| Features | 186 | UI pages and components |
| Shared | 148 | Reusable UI components |
| Core | 24 | App infrastructure |
| Testing | 142 | Spec files |
| **Total** | **588** | **Complete Angular implementation** |

### Domain Layer Files (28 files)

#### Organization Bounded Context (14 files)

```
src/app/domain/organization/
├── index.ts                                # Barrel export
├── organization-id.vo.ts                   # Value Object: OrganizationId
├── organization-id.vo.spec.ts             # Tests
├── organization-name.vo.ts                 # Value Object: OrganizationName
├── organization-name.vo.spec.ts           # Tests
├── organization.aggregate.ts               # Aggregate Root
├── organization.aggregate.spec.ts         # Tests
├── organization.repository.ts              # Repository Interface
├── organization-created.event.ts           # Domain Event
├── organization-updated.event.ts           # Domain Event
├── organization-deleted.event.ts           # Domain Event
├── organization.errors.ts                  # Domain Errors
├── member.entity.ts                        # Entity
└── member.entity.spec.ts                  # Tests
```

#### Workspace Bounded Context (14 files)

```
src/app/domain/workspace/
├── index.ts                                # Barrel export
├── workspace-id.vo.ts                      # Value Object
├── workspace-id.vo.spec.ts                # Tests
├── workspace-name.vo.ts                    # Value Object
├── workspace-name.vo.spec.ts              # Tests
├── workspace.aggregate.ts                  # Aggregate Root
├── workspace.aggregate.spec.ts            # Tests
├── workspace.repository.ts                 # Repository Interface
├── workspace-created.event.ts              # Domain Event
├── workspace-updated.event.ts              # Domain Event
├── capability.entity.ts                    # Entity
├── capability.entity.spec.ts              # Tests
├── workspace.errors.ts                     # Domain Errors
└── workspace-visibility.vo.ts              # Value Object (visible/hidden)
```

### Application Layer Files (48 files)

#### Organization Use Cases (16 files)

```
src/app/application/use-cases/organization/
├── index.ts                                # Barrel export
├── create-organization.use-case.ts         # Use Case
├── create-organization.use-case.spec.ts   # Tests
├── list-organizations.use-case.ts          # Use Case
├── list-organizations.use-case.spec.ts    # Tests
├── get-organization.use-case.ts            # Use Case
├── get-organization.use-case.spec.ts      # Tests
├── update-organization.use-case.ts         # Use Case
├── update-organization.use-case.spec.ts   # Tests
├── delete-organization.use-case.ts         # Use Case
├── delete-organization.use-case.spec.ts   # Tests
├── add-member.use-case.ts                  # Use Case
├── add-member.use-case.spec.ts            # Tests
├── remove-member.use-case.ts               # Use Case
├── remove-member.use-case.spec.ts         # Tests
└── list-members.use-case.ts                # Use Case
```

#### Workspace Use Cases (16 files)

```
src/app/application/use-cases/workspace/
├── index.ts                                # Barrel export
├── create-workspace.use-case.ts            # Use Case
├── create-workspace.use-case.spec.ts      # Tests
├── list-workspaces.use-case.ts             # Use Case
├── list-workspaces.use-case.spec.ts       # Tests
├── get-workspace.use-case.ts               # Use Case
├── get-workspace.use-case.spec.ts         # Tests
├── update-workspace.use-case.ts            # Use Case
├── update-workspace.use-case.spec.ts      # Tests
├── delete-workspace.use-case.ts            # Use Case
├── delete-workspace.use-case.spec.ts      # Tests
├── add-capability.use-case.ts              # Use Case
├── add-capability.use-case.spec.ts        # Tests
├── remove-capability.use-case.ts           # Use Case
├── remove-capability.use-case.spec.ts     # Tests
└── list-capabilities.use-case.ts           # Use Case
```

#### DTOs and Mappers (16 files)

```
src/app/application/dtos/
├── organization/
│   ├── index.ts                            # Barrel export
│   ├── create-organization.dto.ts          # DTO
│   ├── organization.dto.ts                 # DTO
│   ├── update-organization.dto.ts          # DTO
│   ├── organization.mapper.ts              # Mapper (domain ↔ DTO)
│   ├── organization.mapper.spec.ts        # Tests
│   ├── member.dto.ts                       # DTO
│   └── member.mapper.ts                    # Mapper
└── workspace/
    ├── index.ts                            # Barrel export
    ├── create-workspace.dto.ts             # DTO
    ├── workspace.dto.ts                    # DTO
    ├── update-workspace.dto.ts             # DTO
    ├── workspace.mapper.ts                 # Mapper (domain ↔ DTO)
    ├── workspace.mapper.spec.ts           # Tests
    ├── capability.dto.ts                   # DTO
    └── capability.mapper.ts                # Mapper
```

### Infrastructure Layer Files (12 files)

```
src/app/infrastructure/
├── index.ts                                # Barrel export
├── infrastructure.providers.ts             # DI Provider Configuration
│
├── persistence/
│   ├── firestore/
│   │   ├── index.ts                        # Barrel export
│   │   ├── firestore.adapter.ts            # Generic Firestore wrapper
│   │   ├── firestore.adapter.spec.ts      # Tests
│   │   └── collection.service.ts           # Collection operations
│   │
│   └── repositories/
│       ├── index.ts                        # Barrel export
│       ├── firestore-organization.repository.ts   # Implementation
│       ├── firestore-organization.repository.spec.ts
│       ├── firestore-workspace.repository.ts      # Implementation
│       └── firestore-workspace.repository.spec.ts
│
└── adapters/
    └── firebase/
        ├── index.ts                        # Barrel export
        ├── firebase-auth.adapter.ts        # Auth adapter
        ├── firebase-auth.adapter.spec.ts  # Tests
        ├── firebase-storage.adapter.ts     # Storage adapter
        └── firebase-storage.adapter.spec.ts
```

### Features Layer Files (186 files)

#### Auth Feature (12 files)

```
src/app/features/auth/
├── index.ts                                # Barrel export
├── auth.routes.ts                          # Routes configuration
│
├── pages/
│   ├── login.page.ts                       # Login page component
│   ├── login.page.html                     # Template
│   ├── login.page.css                      # Styles
│   ├── login.page.spec.ts                 # Tests
│   ├── landing.page.ts                     # Landing page
│   ├── landing.page.html                   # Template
│   ├── landing.page.css                    # Styles
│   └── landing.page.spec.ts               # Tests
│
└── components/
    ├── login-form.component.ts             # Login form
    ├── login-form.component.html           # Template
    ├── login-form.component.css            # Styles
    └── login-form.component.spec.ts       # Tests
```

#### Dashboard Feature (36 files)

```
src/app/features/dashboard/
├── index.ts                                # Barrel export
├── dashboard.routes.ts                     # Routes configuration
│
├── pages/
│   ├── dashboard-home.page.ts              # Dashboard home
│   ├── dashboard-home.page.html            # Template
│   ├── dashboard-home.page.css             # Styles
│   ├── dashboard-home.page.spec.ts        # Tests
│   ├── settings.page.ts                    # Settings page
│   ├── settings.page.html                  # Template
│   ├── settings.page.css                   # Styles
│   ├── settings.page.spec.ts              # Tests
│   ├── team.page.ts                        # Team page
│   ├── team.page.html                      # Template
│   ├── team.page.css                       # Styles
│   └── team.page.spec.ts                  # Tests
│
└── components/
    ├── stat-cards.component.ts             # Statistics cards
    ├── stat-cards.component.html           # Template
    ├── stat-cards.component.css            # Styles
    ├── stat-cards.component.spec.ts       # Tests
    ├── recent-organizations.component.ts   # Recent orgs widget
    ├── recent-organizations.component.html # Template
    ├── recent-organizations.component.css  # Styles
    ├── recent-organizations.component.spec.ts
    ├── recent-workspaces.component.ts      # Recent workspaces widget
    ├── recent-workspaces.component.html    # Template
    ├── recent-workspaces.component.css     # Styles
    ├── recent-workspaces.component.spec.ts
    ├── recent-containers.component.ts      # Recent containers
    ├── recent-containers.component.html    # Template
    ├── recent-containers.component.css     # Styles
    ├── recent-containers.component.spec.ts
    ├── permission-constellation.component.ts  # Permission viz
    ├── permission-constellation.component.html
    ├── permission-constellation.component.css
    └── permission-constellation.component.spec.ts
```

#### Organization Feature (48 files)

```
src/app/features/organization/
├── index.ts                                # Barrel export
├── organization.routes.ts                  # Routes configuration
│
└── pages/
    ├── settings.page.ts                    # Org settings
    ├── settings.page.html
    ├── settings.page.css
    ├── settings.page.spec.ts
    ├── members.page.ts                     # Members management
    ├── members.page.html
    ├── members.page.css
    ├── members.page.spec.ts
    ├── teams.page.ts                       # Teams list
    ├── teams.page.html
    ├── teams.page.css
    ├── teams.page.spec.ts
    ├── team-detail.page.ts                 # Team detail
    ├── team-detail.page.html
    ├── team-detail.page.css
    ├── team-detail.page.spec.ts
    ├── partners.page.ts                    # Partners list
    ├── partners.page.html
    ├── partners.page.css
    ├── partners.page.spec.ts
    ├── partner-detail.page.ts              # Partner detail
    ├── partner-detail.page.html
    ├── partner-detail.page.css
    ├── partner-detail.page.spec.ts
    ├── audit.page.ts                       # Audit log
    ├── audit.page.html
    ├── audit.page.css
    ├── audit.page.spec.ts
    ├── daily.page.ts                       # Daily report
    ├── daily.page.html
    ├── daily.page.css
    ├── daily.page.spec.ts
    ├── schedule.page.ts                    # Schedule view
    ├── schedule.page.html
    ├── schedule.page.css
    ├── schedule.page.spec.ts
    ├── matrix.page.ts                      # Matrix view
    ├── matrix.page.html
    ├── matrix.page.css
    ├── matrix.page.spec.ts
    ├── external.page.ts                    # External integrations
    ├── external.page.html
    ├── external.page.css
    └── external.page.spec.ts
```

#### Workspaces Feature (90 files)

```
src/app/features/workspaces/
├── index.ts                                # Barrel export
├── workspaces.routes.ts                    # Routes configuration
│
├── pages/
│   ├── workspaces-list.page.ts             # Workspaces list
│   ├── workspaces-list.page.html
│   ├── workspaces-list.page.css
│   ├── workspaces-list.page.spec.ts
│   ├── workspace-detail.page.ts            # Workspace detail
│   ├── workspace-detail.page.html
│   ├── workspace-detail.page.css
│   ├── workspace-detail.page.spec.ts
│   ├── blocks.page.ts                      # Blocks view
│   ├── blocks.page.html
│   ├── blocks.page.css
│   ├── blocks.page.spec.ts
│   ├── capabilities.page.ts                # Capabilities view
│   ├── capabilities.page.html
│   ├── capabilities.page.css
│   └── capabilities.page.spec.ts
│
└── components/
    ├── create-workspace-dialog.component.ts    # Create dialog
    ├── create-workspace-dialog.component.html
    ├── create-workspace-dialog.component.css
    ├── create-workspace-dialog.component.spec.ts
    ├── workspace-tasks.component.ts            # Tasks tab
    ├── workspace-tasks.component.html
    ├── workspace-tasks.component.css
    ├── workspace-tasks.component.spec.ts
    ├── workspace-members.component.ts          # Members tab
    ├── workspace-members.component.html
    ├── workspace-members.component.css
    ├── workspace-members.component.spec.ts
    ├── workspace-files.component.ts            # Files tab
    ├── workspace-files.component.html
    ├── workspace-files.component.css
    ├── workspace-files.component.spec.ts
    ├── workspace-finance.component.ts          # Finance tab
    ├── workspace-finance.component.html
    ├── workspace-finance.component.css
    ├── workspace-finance.component.spec.ts
    ├── workspace-qa.component.ts               # QA tab
    ├── workspace-qa.component.html
    ├── workspace-qa.component.css
    ├── workspace-qa.component.spec.ts
    ├── workspace-daily.component.ts            # Daily tab
    ├── workspace-daily.component.html
    ├── workspace-daily.component.css
    ├── workspace-daily.component.spec.ts
    ├── workspace-acceptance.component.ts       # Acceptance tab
    ├── workspace-acceptance.component.html
    ├── workspace-acceptance.component.css
    ├── workspace-acceptance.component.spec.ts
    ├── workspace-capabilities.component.ts     # Capabilities tab
    ├── workspace-capabilities.component.html
    ├── workspace-capabilities.component.css
    ├── workspace-capabilities.component.spec.ts
    ├── workspace-dialogs.component.ts          # Dialogs tab
    ├── workspace-dialogs.component.html
    ├── workspace-dialogs.component.css
    ├── workspace-dialogs.component.spec.ts
    ├── workspace-issues.component.ts           # Issues tab
    ├── workspace-issues.component.html
    ├── workspace-issues.component.css
    ├── workspace-issues.component.spec.ts
    ├── workspace-card.component.ts             # Workspace card
    ├── workspace-card.component.html
    ├── workspace-card.component.css
    ├── workspace-card.component.spec.ts
    ├── workspace-list-item.component.ts        # List item
    ├── workspace-list-item.component.html
    ├── workspace-list-item.component.css
    └── workspace-list-item.component.spec.ts
```

### Shared Layer Files (148 files)

#### UI Components (140 files - 35 components × 4 files each)

```
src/app/shared/ui/
├── button/
│   ├── button.component.ts
│   ├── button.component.html
│   ├── button.component.css
│   └── button.component.spec.ts
├── card/
│   ├── card.component.ts
│   ├── card.component.html
│   ├── card.component.css
│   └── card.component.spec.ts
├── dialog/
│   ├── dialog.component.ts
│   ├── dialog.component.html
│   ├── dialog.component.css
│   └── dialog.component.spec.ts
├── input/
│   ├── input.component.ts
│   ├── input.component.html
│   ├── input.component.css
│   └── input.component.spec.ts
├── select/
│   ├── select.component.ts
│   ├── select.component.html
│   ├── select.component.css
│   └── select.component.spec.ts
├── table/
│   ├── table.component.ts
│   ├── table.component.html
│   ├── table.component.css
│   └── table.component.spec.ts
└── ... (29 more UI components)
```

#### Directives & Pipes (8 files)

```
src/app/shared/
├── directives/
│   ├── highlight.directive.ts
│   ├── highlight.directive.spec.ts
│   ├── auto-focus.directive.ts
│   └── auto-focus.directive.spec.ts
└── pipes/
    ├── date-format.pipe.ts
    ├── date-format.pipe.spec.ts
    ├── truncate.pipe.ts
    └── truncate.pipe.spec.ts
```

### Core Layer Files (24 files)

```
src/app/core/
├── services/
│   ├── firebase.service.ts                # Firebase service
│   ├── firebase.service.spec.ts
│   ├── auth.service.ts                     # Auth service
│   ├── auth.service.spec.ts
│   ├── notification.service.ts             # Toast/notifications
│   ├── notification.service.spec.ts
│   ├── logger.service.ts                   # Logging
│   ├── logger.service.spec.ts
│   ├── analytics.service.ts                # Analytics
│   └── analytics.service.spec.ts
│
├── guards/
│   ├── auth.guard.ts                       # Auth guard
│   ├── auth.guard.spec.ts
│   ├── role.guard.ts                       # Role-based guard
│   ├── role.guard.spec.ts
│   ├── unsaved-changes.guard.ts            # Unsaved changes
│   └── unsaved-changes.guard.spec.ts
│
├── interceptors/
│   ├── auth.interceptor.ts                 # Add auth headers
│   ├── error.interceptor.ts                # Error handling
│   ├── loading.interceptor.ts              # Loading state
│   └── retry.interceptor.ts                # Retry logic
│
├── providers/
│   ├── app.config.ts                       # Browser config
│   ├── app.config.server.ts                # SSR config
│   └── firebase.config.ts                  # Firebase init
│
├── app.routes.ts                           # Main routes
└── app.routes.server.ts                    # Server routes
```

---

## Function Organization

### Domain Layer Functions

#### OrganizationAggregate

```typescript
// src/app/domain/organization/organization.aggregate.ts
export class OrganizationAggregate {
  // Factory methods
  static create(props: CreateOrganizationProps): OrganizationAggregate
  static reconstitute(props: OrganizationProps): OrganizationAggregate
  
  // Getters
  getId(): OrganizationId
  getName(): string
  getDescription(): string | undefined
  getOwnerId(): string
  getCreatedAt(): Date
  getUpdatedAt(): Date
  
  // Commands (mutations)
  updateName(name: string): void
  updateDescription(description: string): void
  addMember(userId: string, role: string): void
  removeMember(userId: string): void
  
  // Queries
  hasMember(userId: string): boolean
  getMemberRole(userId: string): string | undefined
  
  // Serialization
  toPlainObject(): OrganizationProps
}
```

#### OrganizationId (Value Object)

```typescript
// src/app/domain/organization/organization-id.vo.ts
export class OrganizationId {
  // Factory
  static create(value: string): OrganizationId
  
  // Query
  getValue(): string
  equals(other: OrganizationId): boolean
  toString(): string
}
```

### Application Layer Functions

#### CreateOrganizationUseCase

```typescript
// src/app/application/use-cases/organization/create-organization.use-case.ts
export class CreateOrganizationUseCase {
  constructor(private repository: OrganizationRepository) {}
  
  // Main execution
  async execute(dto: CreateOrganizationDto): Promise<string>
  
  // Private helpers
  private validateDto(dto: CreateOrganizationDto): void
  private createAggregate(dto: CreateOrganizationDto): OrganizationAggregate
}
```

### Infrastructure Layer Functions

#### FirestoreOrganizationRepository

```typescript
// src/app/infrastructure/persistence/repositories/firestore-organization.repository.ts
export class FirestoreOrganizationRepository extends OrganizationRepository {
  // CRUD operations
  async save(organization: OrganizationAggregate): Promise<void>
  findById(id: OrganizationId): Observable<OrganizationAggregate | null>
  findAll(): Observable<OrganizationAggregate[]>
  async delete(id: OrganizationId): Promise<void>
  
  // Query methods
  findByOwnerId(ownerId: string): Observable<OrganizationAggregate[]>
  
  // Private helpers
  private toFirestore(org: OrganizationAggregate): Record<string, any>
  private fromFirestore(data: any): OrganizationAggregate
}
```

### Features Layer Functions

#### LoginPage

```typescript
// src/app/features/auth/pages/login.page.ts
export class LoginPage implements OnInit {
  // Lifecycle
  ngOnInit(): void
  ngOnDestroy(): void
  
  // Event handlers
  async onSubmit(): Promise<void>
  onEmailChange(event: Event): void
  onPasswordChange(event: Event): void
  
  // Navigation
  private navigateToDashboard(): Promise<void>
  
  // Error handling
  private handleError(error: Error): void
}
```

---

## Atomic Feature Units

### Feature Unit 1: Authentication (Priority: Critical)

**Files**: 12 files  
**Estimated Time**: 2 days  
**Dependencies**: Core services, Firebase adapter

```
✓ Includes:
  - Login page (UI)
  - Auth service (core)
  - Auth guard (routing)
  - Firebase auth adapter (infrastructure)
  
✓ Testable independently:
  - Can test login without other features
  - Can verify Firebase auth works
  
✓ Deliverable:
  - User can log in with demo/12345
  - User redirected to dashboard after login
  - Protected routes require authentication
```

**Files List**:
1. `src/app/features/auth/pages/login.page.ts`
2. `src/app/features/auth/pages/login.page.html`
3. `src/app/features/auth/pages/login.page.css`
4. `src/app/features/auth/pages/login.page.spec.ts`
5. `src/app/core/services/auth.service.ts`
6. `src/app/core/services/auth.service.spec.ts`
7. `src/app/core/guards/auth.guard.ts`
8. `src/app/core/guards/auth.guard.spec.ts`
9. `src/app/infrastructure/adapters/firebase/firebase-auth.adapter.ts`
10. `src/app/infrastructure/adapters/firebase/firebase-auth.adapter.spec.ts`
11. `src/app/features/auth/auth.routes.ts`
12. `src/app/features/auth/index.ts`

### Feature Unit 2: Organization Domain (Priority: Critical)

**Files**: 14 files  
**Estimated Time**: 2 days  
**Dependencies**: None (pure TypeScript)

```
✓ Includes:
  - Organization aggregate
  - Organization value objects
  - Organization repository interface
  - Domain events
  
✓ Testable independently:
  - No Angular dependencies
  - Pure unit tests
  - 100% isolated
  
✓ Deliverable:
  - All domain tests pass
  - Business rules validated
  - No framework coupling
```

### Feature Unit 3: Organization Infrastructure (Priority: Critical)

**Files**: 6 files  
**Estimated Time**: 1.5 days  
**Dependencies**: Feature Unit 2, Firebase adapter

```
✓ Includes:
  - Firestore organization repository
  - Provider configuration
  - Integration tests
  
✓ Testable independently:
  - Can save/load organizations from Firestore
  - Repository tests pass
  
✓ Deliverable:
  - Organizations persist to Firebase
  - Can query organizations
  - Provider properly configured
```

### Feature Unit 4: Organization Use Cases (Priority: High)

**Files**: 16 files  
**Estimated Time**: 2 days  
**Dependencies**: Feature Unit 2, 3

```
✓ Includes:
  - Create organization use case
  - List organizations use case
  - Update/Delete use cases
  - DTOs and mappers
  
✓ Testable independently:
  - Use case tests with mocked repositories
  - Integration tests with real Firebase
  
✓ Deliverable:
  - Can create organizations via use cases
  - Can list/update/delete organizations
  - DTOs properly map to domain
```

### Feature Unit 5: Organization UI (Priority: High)

**Files**: 48 files  
**Estimated Time**: 4 days  
**Dependencies**: Feature Unit 4

```
✓ Includes:
  - Organization settings page
  - Members management page
  - Teams page
  - All organization sub-pages
  
✓ Testable independently:
  - Component tests
  - E2E tests for critical flows
  
✓ Deliverable:
  - User can manage organizations
  - All CRUD operations work
  - UI responsive and accessible
```

### Feature Unit 6: Workspace Domain (Priority: Critical)

**Files**: 14 files  
**Estimated Time**: 2 days  
**Dependencies**: None

*Similar structure to Feature Unit 2*

### Feature Unit 7: Workspace Infrastructure (Priority: Critical)

**Files**: 6 files  
**Estimated Time**: 1.5 days  
**Dependencies**: Feature Unit 6

*Similar structure to Feature Unit 3*

### Feature Unit 8: Workspace Use Cases (Priority: High)

**Files**: 16 files  
**Estimated Time**: 2 days  
**Dependencies**: Feature Unit 6, 7

*Similar structure to Feature Unit 4*

### Feature Unit 9: Workspace List UI (Priority: High)

**Files**: 12 files  
**Estimated Time**: 1.5 days  
**Dependencies**: Feature Unit 8

```
✓ Includes:
  - Workspaces list page
  - Workspace card component
  - Create workspace dialog
  
✓ Deliverable:
  - User can view all workspaces
  - User can create new workspace
  - Cards display correctly
```

### Feature Unit 10: Workspace Detail UI (Priority: High)

**Files**: 78 files  
**Estimated Time**: 6 days  
**Dependencies**: Feature Unit 8, 9

```
✓ Includes:
  - Workspace detail page
  - 10 tab components (tasks, members, files, etc.)
  - All sub-components
  
✓ Deliverable:
  - User can view workspace details
  - All tabs functional
  - Task management works
```

### Feature Unit 11: Dashboard Home (Priority: Medium)

**Files**: 24 files  
**Estimated Time**: 2 days  
**Dependencies**: Feature Unit 4, 8

```
✓ Includes:
  - Dashboard home page
  - Statistics cards
  - Recent widgets
  
✓ Deliverable:
  - Dashboard displays stats
  - Shows recent activity
  - Links to features work
```

### Feature Unit 12: Shared UI Components (Priority: Medium)

**Files**: 140 files  
**Estimated Time**: 8 days  
**Dependencies**: None (can be done in parallel)

```
✓ Includes:
  - 35 UI components (Button, Card, Dialog, etc.)
  - All based on Angular Material/CDK
  
✓ Deliverable:
  - Component library complete
  - All components tested
  - Storybook/demo pages
```

---

## Progressive Implementation Steps

### Phase 1: Foundation (Days 1-5)

#### Step 1: Project Setup
**Time**: 2 hours  
**Files**: Configuration files

```bash
# Create Angular project
ng new xuanwu --routing --style=scss --ssr

# Install dependencies
npm install @angular/fire firebase
npm install @angular/material @angular/cdk
npm install @ngrx/signals
npm install -D vitest @vitest/ui

# Configure paths in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@shared-kernel/*": ["src/shared-kernel/*"]
    }
  }
}
```

**Verification**:
```bash
ng serve  # Should start successfully
```

**Next**: Step 2

#### Step 2: Create Domain Layer Structure
**Time**: 30 minutes  
**Files**: Directory structure

```bash
mkdir -p src/app/domain/organization
mkdir -p src/app/domain/workspace
mkdir -p src/app/domain/shared
```

**Verification**:
```bash
ls -la src/app/domain  # Should show 3 directories
```

**Next**: Step 3

#### Step 3: Create OrganizationId Value Object
**Time**: 1 hour  
**File**: `src/app/domain/organization/organization-id.vo.ts`

```typescript
export class OrganizationId {
  private constructor(private readonly value: string) {}
  
  static create(value: string): OrganizationId {
    if (!value || value.trim().length === 0) {
      throw new Error('Organization ID cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('Organization ID too long');
    }
    return new OrganizationId(value);
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: OrganizationId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}
```

**Test**: `src/app/domain/organization/organization-id.vo.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { OrganizationId } from './organization-id.vo';

describe('OrganizationId', () => {
  it('should create with valid value', () => {
    const id = OrganizationId.create('org-123');
    expect(id.getValue()).toBe('org-123');
  });
  
  it('should throw on empty value', () => {
    expect(() => OrganizationId.create('')).toThrow();
  });
  
  it('should check equality', () => {
    const id1 = OrganizationId.create('org-123');
    const id2 = OrganizationId.create('org-123');
    const id3 = OrganizationId.create('org-456');
    
    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
```

**Verification**:
```bash
npm test -- organization-id.vo.spec.ts  # All tests should pass
grep -r "@angular" src/app/domain  # Should return nothing
```

**Next**: Step 4

#### Step 4-10: Create Remaining Value Objects
*Similar pattern for:*
- OrganizationName (Step 4)
- WorkspaceId (Step 5)
- WorkspaceName (Step 6)
- WorkspaceVisibility (Step 7)
- etc.

#### Step 11: Create Organization Aggregate
**Time**: 3 hours  
**File**: `src/app/domain/organization/organization.aggregate.ts`

*[Code template provided - similar pattern]*

**Verification**:
```bash
npm test -- organization.aggregate.spec.ts
```

**Next**: Step 12

### Phase 2: Infrastructure (Days 6-10)

#### Step 25: Create Firestore Adapter
#### Step 26: Create Organization Repository
#### Step 27: Configure Providers
*[Detailed steps continue...]*

### Phase 3: Application (Days 11-15)

#### Step 40: Create CreateOrganizationUseCase
#### Step 41: Create DTOs
*[Detailed steps continue...]*

### Phase 4: Features (Days 16-35)

#### Step 60: Create Login Page
#### Step 61: Create Dashboard
*[Detailed steps continue...]*

---

## Checkpoint Verification

### Checkpoint 1: Domain Layer Complete (Day 5)

**Validation Commands**:
```bash
# No Angular imports in domain
grep -r "@angular" src/app/domain
# Expected: No results

# No Firebase imports in domain
grep -r "firebase" src/app/domain
# Expected: No results

# All domain tests pass
npm test -- src/app/domain
# Expected: All tests pass
```

**Completion Criteria**:
- [ ] Organization aggregate created
- [ ] Workspace aggregate created
- [ ] All value objects created
- [ ] Repository interfaces defined
- [ ] Domain events defined
- [ ] All tests pass (100% coverage)
- [ ] No framework imports

**Deliverable**: Pure business logic, fully tested, framework-agnostic

**If Failed**: Review DDD principles, check for framework coupling

**Next**: Checkpoint 2

### Checkpoint 2: Infrastructure Layer Complete (Day 10)

**Validation Commands**:
```bash
# Repository implementations exist
ls src/app/infrastructure/persistence/repositories
# Expected: 2 repository files

# Provider configuration exists
cat src/app/infrastructure/infrastructure.providers.ts
# Expected: Repository bindings present

# Can connect to Firebase
npm test -- firestore.adapter.spec.ts
# Expected: Connection successful
```

**Completion Criteria**:
- [ ] Firestore adapter created
- [ ] Organization repository implemented
- [ ] Workspace repository implemented
- [ ] Providers configured
- [ ] Integration tests pass
- [ ] Can save/load from Firebase

**Manual Test**:
```typescript
// In Angular component or test
const repo = inject(OrganizationRepository);
const org = OrganizationAggregate.create({...});
await repo.save(org);  // Should succeed
const loaded = await firstValueFrom(repo.findById(org.getId()));
// loaded should equal org
```

**If Failed**: Check Firebase config, verify provider registration

**Next**: Checkpoint 3

### Checkpoint 3: Application Layer Complete (Day 15)

**Validation Commands**:
```bash
# Use cases exist
ls src/app/application/use-cases/organization
# Expected: 8+ use case files

# DTOs exist
ls src/app/application/dtos/organization
# Expected: 4+ DTO files

# All application tests pass
npm test -- src/app/application
# Expected: All tests pass
```

**Completion Criteria**:
- [ ] Create organization use case works
- [ ] List organizations use case works
- [ ] Update/Delete use cases work
- [ ] DTOs properly map to domain
- [ ] All use case tests pass
- [ ] Can execute use cases end-to-end

**Manual Test**:
```typescript
const useCase = inject(CreateOrganizationUseCase);
const orgId = await useCase.execute({
  name: 'Test Org',
  ownerId: 'user-123'
});
// Should return valid ID
// Should persist to Firebase
```

**If Failed**: Check DI configuration, verify repository bindings

**Next**: Checkpoint 4

### Checkpoint 4: Authentication Complete (Day 18)

**Validation Commands**:
```bash
# Auth service exists
ls src/app/core/services/auth.service.ts
# Expected: File exists

# Auth guard exists
ls src/app/core/guards/auth.guard.ts
# Expected: File exists

# Login page exists
ls src/app/features/auth/pages/login.page.ts
# Expected: File exists
```

**Completion Criteria**:
- [ ] Can log in with demo/12345
- [ ] Auth guard protects routes
- [ ] User redirected after login
- [ ] Can log out
- [ ] Auth state persists (refresh works)

**Manual Test**:
1. Start app: `ng serve`
2. Navigate to `/login`
3. Enter demo/12345
4. Should redirect to `/dashboard`
5. Refresh page
6. Should stay logged in

**If Failed**: Check Firebase auth config, verify auth service

**Next**: Checkpoint 5

---

## Dependency Graph

```
Level 0: Foundation (No dependencies)
├─ Domain: organization/
├─ Domain: workspace/
└─ Shared-kernel

Level 1: Infrastructure (depends on Level 0)
├─ Infrastructure: firestore.adapter
├─ Infrastructure: organization.repository
├─ Infrastructure: workspace.repository
└─ Infrastructure: firebase-auth.adapter

Level 2: Application (depends on Level 0 + 1)
├─ Application: organization use-cases
├─ Application: workspace use-cases
└─ Application: DTOs

Level 3: Core Services (depends on Level 1 + 2)
├─ Core: auth.service
├─ Core: notification.service
└─ Core: firebase.service

Level 4: Features (depends on all above)
├─ Features: auth
├─ Features: dashboard
├─ Features: organization
└─ Features: workspaces

Level 5: Shared UI (can be done in parallel)
└─ Shared: UI components
```

---

## Daily Workflow Guide

### Week 1: Foundation

**Day 1 (Monday)**:
- Morning: Project setup, configure Angular + Firebase
- Afternoon: Create domain structure, OrganizationId VO
- Evening: OrganizationName VO, tests
- **Deliverable**: 2 value objects tested

**Day 2 (Tuesday)**:
- Morning: Organization aggregate
- Afternoon: Organization repository interface
- Evening: Domain events
- **Deliverable**: Organization bounded context complete

**Day 3 (Wednesday)**:
- Morning: WorkspaceId, WorkspaceName VOs
- Afternoon: Workspace aggregate
- Evening: Workspace repository interface
- **Deliverable**: Workspace bounded context complete

**Day 4 (Thursday)**:
- Morning: Firestore adapter
- Afternoon: Organization repository implementation
- Evening: Integration tests
- **Deliverable**: Can persist organizations

**Day 5 (Friday)**:
- Morning: Workspace repository implementation
- Afternoon: Provider configuration
- Evening: Checkpoint 1 & 2 verification
- **Deliverable**: Infrastructure layer complete

### Week 2: Application & Auth

**Day 6 (Monday)**:
- Morning: CreateOrganizationUseCase
- Afternoon: ListOrganizationsUseCase
- Evening: Organization DTOs
- **Deliverable**: Basic organization use cases

**Day 7 (Tuesday)**:
- Morning: Update/Delete organization use cases
- Afternoon: Workspace use cases (Create, List)
- Evening: Workspace DTOs
- **Deliverable**: Core use cases complete

**Day 8 (Wednesday)**:
- Morning: Firebase auth adapter
- Afternoon: Auth service
- Evening: Auth guard
- **Deliverable**: Authentication infrastructure

**Day 9 (Thursday)**:
- Morning: Login page UI
- Afternoon: Login form component
- Evening: Routes configuration
- **Deliverable**: Can log in

**Day 10 (Friday)**:
- Morning: Landing page
- Afternoon: Navigation after login
- Evening: Checkpoint 3 & 4 verification
- **Deliverable**: Authentication feature complete

### Week 3-6: Features & UI

*[Continues with daily breakdowns for remaining features]*

---

## Version History

- v1.0 (2026-02-06): Initial comprehensive implementation guide with complete file inventory, atomic features, and progressive steps

---

**Related Documentation**:
- [Migration Guide](./NEXTJS_TO_ANGULAR_MIGRATION.md) - High-level strategy
- [DDD Layer Boundaries](../../DDD_LAYER_BOUNDARIES.md) - Architecture rules
- [Naming Conventions](../../NAMING_CONVENTIONS.md) - File naming standards
