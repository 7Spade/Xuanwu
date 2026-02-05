# DDD Layer Boundaries

> **Based on**: `General Standard DDD.md` 8-layer architecture  
> **Version**: 1.0  
> **Last Updated**: 2026-02-05

---

## 🏆 Layer Positioning and Responsibilities

| Layer              | Responsibility                          | Owner                    |
| ------------------ | --------------------------------------- | ------------------------ |
| app/core           | Technical initialization & infrastructure | Framework Team          |
| app/domain         | Pure business logic & domain rules      | Domain Experts           |
| app/application    | Use case orchestration & workflow       | Application Layer Owners |
| app/infrastructure | Technical implementation & external adapters | Infrastructure Team  |
| app/features       | UI assembly & user interaction          | Frontend/Feature Team    |
| app/shared         | UI common components & tools            | Frontend Infrastructure  |
| shared-kernel      | Cross-layer shared types & constants    | Architecture Committee   |
| functions          | Backend serverless business logic       | Backend Team             |

---

## 🔒 Import Boundary Rules (Based on DDD Layers)

### Only Allow Through index.ts Public API

#### ✅ Allowed Imports

```typescript
// Import from layer root
import { TaskAggregate } from '@app/domain/tasks';
import { CreateTaskUseCase } from '@app/application/tasks';
import { TasksRepository } from '@app/infrastructure/persistence';
import { TaskFormComponent } from '@app/features/tasks';

// Import types and constants
import { TaskStatus, TASK_PRIORITY_LEVELS } from '@shared-kernel/constants';
```

#### ❌ Forbidden Imports

```typescript
// No deep imports (internal folders)
import { TaskAggregate } from '@app/domain/tasks/aggregates/task.aggregate';
import { TaskPersistenceRepository } from '@app/infrastructure/persistence/repositories/task';
import { TaskFormComponent } from '@app/features/tasks/components/form';

// No cross-layer direct references
import { HttpClient } from '@angular/common/http'; // Should use app/core provided
import { Firebase } from '@angular/fire'; // Should use app/infrastructure
```

### Rule Statement

> **Only allow imports through layer root's index.ts public API; forbid deep imports to any `/domain`, `/application`, `/infrastructure` internal paths.**

---

## 🎯 app/domain Responsibility Boundaries

### app/domain Can Only Handle:

- Aggregates and Entities
- Value Objects and immutability rules
- Domain Services and business logic
- Domain Events definitions
- Repository Interfaces definitions

### app/domain Cannot Handle:

- HTTP or Firebase calls
- Dependency injection framework logic
- UI state management
- External system adaptation

### Rule Statement:

> app/domain is the business core and must be framework-agnostic, fully testable in isolation.

---

## 🔁 Cross-Layer Communication Rules

### Allowed Communication:

- **features → application** through use-cases or commands/queries
- **application → domain** direct business logic calls
- **application → infrastructure** through dependency injection
- **Cross-layer** through domain events (event-driven)

### Forbidden Communication:

- ❌ features directly calling domain
- ❌ domain calling application or infrastructure
- ❌ infrastructure defining business rules
- ❌ Direct access to other layer's internal folders

### Rule Statement:

> Only coordinate through application layer; use events for cross-layer; forbid deep imports.

---

## 🧪 Testing Boundary Rules (By Layer)

- **app/domain tests** must be fully isolated, 100% framework-free
- **app/application tests** need to mock app/infrastructure
- **app/features tests** need to mock app/application (using Jest, Jasmine)
- **app/infrastructure tests** need to use real Firebase or Firestore emulator
- **No cross-layer integration tests** (should use e2e tests instead)

### Rule Statement:

> Unit tests are isolated by layer; integration and e2e tests cover cross-layer scenarios.

---

## 🛣️ Routing Boundary Rules (Angular Routes)

- app/core sets up global routes and interceptors
- app/features defines feature-level lazy routes
- Route parameters injected through resolvers (not directly parsed in components)
- Route changes must not directly trigger business logic (should use app/application)

### Rule Statement:

> Routing belongs to app/core, lazy loading belongs to app/features, business logic belongs to app/application.

---

## 🔍 Boundary Violation Checklist

During code review, check for these boundary violations:

- [ ] Does app/domain contain Angular, Firebase, or HTTP imports?
- [ ] Does app/features directly call app/infrastructure?
- [ ] Does app/application contain UI logic or state management?
- [ ] Are there deep imports (like `from '@app/domain/tasks/aggregates'`)?
- [ ] Are there circular dependencies (A → B → A)?
- [ ] Does app/infrastructure expose implementation details instead of interfaces?
- [ ] Does shared-kernel contain framework-related code?
- [ ] Does functions contain @angular/fire or browser APIs?

---

## 📜 DDD Boundary Core Principles

> **Clear Layer Responsibilities**: Each layer only does what it should do.  
> **Unidirectional Dependencies**: Higher layers depend on lower layers, lower layers don't know higher layers.  
> **Interface Isolation**: Cross-layer interaction only through public APIs, forbid deep imports.  
> **Event-Driven**: Use domain events for cross-layer decoupling.  
> **Framework-Free Domain**: app/domain must be 100% framework-agnostic.

---

## 🚨 Common Violations and Solutions

### Violation 1: Features Calling Domain Directly

**Problem**:
```typescript
// In app/features/tasks/components/task-list.component.ts
import { TaskAggregate } from '@app/domain/tasks';

export class TaskListComponent {
  createTask() {
    const task = TaskAggregate.create({ ... }); // ❌ Direct domain call
  }
}
```

**Solution**:
```typescript
// In app/features/tasks/components/task-list.component.ts
import { CreateTaskUseCase } from '@app/application/tasks';

export class TaskListComponent {
  constructor(private createTask: CreateTaskUseCase) {}
  
  createTask() {
    this.createTask.execute({ ... }); // ✅ Through application layer
  }
}
```

### Violation 2: Domain Layer with Framework Dependencies

**Problem**:
```typescript
// In app/domain/tasks/aggregates/task.aggregate.ts
import { inject } from '@angular/core'; // ❌ Framework in domain
import { HttpClient } from '@angular/common/http'; // ❌ HTTP in domain

export class TaskAggregate {
  private http = inject(HttpClient);
}
```

**Solution**:
```typescript
// In app/domain/tasks/aggregates/task.aggregate.ts
// Pure TypeScript - no framework imports ✅

export class TaskAggregate {
  private constructor(private props: TaskProps) {}
  
  static create(props: TaskProps): TaskAggregate {
    // Pure domain logic
    return new TaskAggregate(props);
  }
}
```

### Violation 3: Deep Imports

**Problem**:
```typescript
// ❌ Deep import bypassing public API
import { TaskRepository } from '@app/infrastructure/persistence/repositories/task.repository';
```

**Solution**:
```typescript
// ✅ Import from layer root
import { TaskRepository } from '@app/infrastructure/persistence';

// In @app/infrastructure/persistence/index.ts
export { TaskRepository } from './repositories/task.repository';
```

---

## 📖 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Complete architecture overview
- [Import Rules](./IMPORT_RULES.md) - Detailed import and dependency rules
- [Naming Conventions](./NAMING_CONVENTIONS.md) - File and code naming
- [Testing Standards](./TESTING_STANDARDS.md) - Testing per layer
- [Quick Reference](./QUICK_REFERENCE.md) - Quick checklist

---

**Version History**:
- v1.0 (2026-02-05): Extracted from 邊界檢查規範.md
