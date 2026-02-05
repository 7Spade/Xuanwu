# Import Rules and Dependency Direction

> **Based on**: `全局邊界.md` (Global Boundary Rules)  
> **Version**: 1.0  
> **Last Updated**: 2026-02-05

---

## 📐 Global Boundary Principles (DDD Layers)

- Only allow imports through each layer root's `index.ts` public API
- Forbid deep imports to any layer's `/domain`, `/application`, `/infrastructure` internal folders
- Forbid circular dependencies (A → B → A)
- Forbid cross-layer direct access to infrastructure implementation details
- Prioritize communication through application services or domain events
- shared-kernel and app/shared are base layers that can be depended on but must not depend on business layers

---

## 🧱 Dependency Direction Diagram (Based on DDD Layered Model)

```
app/core
├─ app/application
│  ├─ app/domain
│  ├─ app/infrastructure
│  └─ shared-kernel
│
├─ app/features
│  ├─ app/application
│  └─ app/shared
│
└─ shared-kernel (Lowest Layer)

functions/src/ (Independent Backend Architecture)
├─ interfaces
├─ application
├─ domain
├─ infrastructure
└─ shared
```

---

## 🧩 shared-kernel & app/shared Boundary Rules

### shared-kernel (Lowest Layer)

- Contains only common models, base types, tools, and abstractions
- Must not depend on any business modules or frameworks
- 100% Pure TypeScript, zero external dependencies
- Must not contain business semantics, Angular, or Firebase

#### Rule Statement:

> shared-kernel is the absolute base layer, can only be depended upon, must not depend on others, must be framework-agnostic.

### app/shared (Angular Layer UI Tools)

- Contains reusable UI atomic components, directives, pipes
- Must not contain business logic or state management
- Must not directly call APIs or Firebase
- Must not be depended on by app/domain or app/application

#### Rule Statement:

> app/shared provides UI tools, only serves app/features, cannot be depended on by business layers.

---

## 🏗️ app/core Boundary Rules

- Responsible for global application infrastructure initialization and configuration
- Contains authentication, interceptors, providers, error handling
- Must not contain any business logic
- Depended on by app/application and app/features

#### Rule Statement:

> app/core is technical foundation, does not carry business decisions.

---

## 📦 app/domain Boundary Rules

- Contains pure business logic, framework-agnostic
- Contains aggregates, entities, value objects, domain services, events
- Must not depend on any other layer (can only depend on shared-kernel)
- Must not contain HTTP, Firebase, or UI logic
- Internal structure organized by bounded_context

#### Rule Statement:

> app/domain is the business core, must be framework-agnostic, fully testable in isolation.

---

## 🏢 app/application Boundary Rules

- Responsible for application layer orchestration and use case orchestration
- Contains commands, queries, dtos, mappers, use-cases
- Can depend on app/domain and shared-kernel
- Calls app/infrastructure through dependency injection
- Must not directly call SDKs (provided by infrastructure)

#### Rule Statement:

> app/application orchestrates business and technical concerns, uses DI to isolate dependencies.

---

## 🔧 app/infrastructure Boundary Rules

- Responsible for technical implementation and external system adaptation
- Contains persistence, messaging, adapters, repositories
- Implements repository and port interfaces defined by app/domain
- Can depend on Firebase Admin, HTTP Client, third-party SDKs
- Only exposes capabilities through public interfaces

#### Rule Statement:

> app/infrastructure isolates technical details, only provides capabilities upward through interfaces.

---

## 🎨 app/features Boundary Rules

- Responsible for user UI interaction and routing
- Contains pages, containers, components, models
- Depends on app/application and app/shared (not directly on infrastructure)
- Keeps UI layer and business layer isolated
- Uses Signals to manage local UI state

#### Rule Statement:

> app/features assembles UI, does not execute business logic.

---

## ⚡ Cross-Layer Event Mechanism

- app/domain defines domain events
- app/application maps and subscribes to events
- app/features uses events to drive UI updates
- Avoid cross-layer direct calls, prioritize event-driven communication

#### Rule Statement:

> Event-driven cross-layer communication decouples business and presentation layers.

---

## 🖥️ functions (Backend Serverless) Boundary Rules

- Independent backend DDD architecture, mirrors frontend layering
- Contains interfaces (HTTP / Triggers), application, domain, infrastructure
- Backend domain and frontend domain can share types through shared-kernel
- Only uses firebase-admin and @google-cloud/* SDKs
- Must not contain Angular, @angular/fire, or other browser code

#### Rule Statement:

> functions is independent backend, uses Node.js with elevated permissions, cannot contain browser code.

---

## 🔒 Import Rule Statements (Can Be Listed Separately)

> Only allow imports from module roots' public APIs; forbid references to any `/domain`, `/application`, `/infrastructure` internal paths.

---

## ✅ Correct Import Examples

```typescript
// ✅ Import from layer root through index.ts
import { TaskAggregate } from '@app/domain/tasks';
import { CreateTaskUseCase } from '@app/application/tasks';
import { TasksRepository } from '@app/infrastructure/persistence';
import { TaskFormComponent } from '@app/features/tasks';

// ✅ Import types and constants from shared-kernel
import { TaskStatus, TASK_PRIORITY_LEVELS } from '@shared-kernel/constants';
import { Result } from '@shared-kernel/types';

// ✅ Import UI components from shared
import { ButtonComponent } from '@app/shared/ui';
import { HighlightDirective } from '@app/shared/directives';
```

---

## ❌ Forbidden Import Examples

```typescript
// ❌ Deep imports bypassing public API
import { TaskAggregate } from '@app/domain/tasks/aggregates/task.aggregate';
import { TaskPersistenceRepository } from '@app/infrastructure/persistence/repositories/task';
import { TaskFormComponent } from '@app/features/tasks/components/form';

// ❌ Cross-layer direct references
import { HttpClient } from '@angular/common/http'; // Should use app/core provided wrapper
import { Firebase } from '@angular/fire'; // Should use app/infrastructure adapter

// ❌ Circular dependencies
// File A imports from B, File B imports from A

// ❌ Business layers depending on shared UI
// app/domain importing from app/shared

// ❌ Domain depending on higher layers
// app/domain importing from app/application or app/infrastructure

// ❌ Frontend importing backend
// src/app/* importing from functions/src/*

// ❌ Backend importing frontend
// functions/src/* importing from src/app/* (except shared-kernel)
```

---

## 🔄 Allowed Communication Patterns

### Pattern 1: Features → Application → Domain

```typescript
// ✅ Feature calls application use case
// app/features/tasks/containers/task-list.container.ts
import { CreateTaskUseCase } from '@app/application/tasks';

export class TaskListContainer {
  constructor(private createTask: CreateTaskUseCase) {}
  
  onCreateTask(data: TaskFormData) {
    this.createTask.execute(data);
  }
}

// ✅ Use case orchestrates domain and infrastructure
// app/application/tasks/use-cases/create-task.use-case.ts
import { TaskAggregate } from '@app/domain/tasks';
import { TasksRepository } from '@app/infrastructure/persistence';

export class CreateTaskUseCase {
  constructor(private repository: TasksRepository) {}
  
  async execute(data: CreateTaskDto): Promise<void> {
    const task = TaskAggregate.create(data);
    await this.repository.save(task);
  }
}
```

### Pattern 2: Event-Driven Communication

```typescript
// ✅ Domain emits events
// app/domain/tasks/aggregates/task.aggregate.ts
export class TaskAggregate {
  complete(): void {
    // Business logic
    this.addDomainEvent(new TaskCompletedEvent(this.id));
  }
}

// ✅ Application handles events
// app/application/tasks/event-handlers/task-completed.handler.ts
import { TaskCompletedEvent } from '@app/domain/tasks';

export class TaskCompletedEventHandler {
  handle(event: TaskCompletedEvent): void {
    // Coordinate side effects
  }
}
```

### Pattern 3: Dependency Injection

```typescript
// ✅ Infrastructure implements domain interface
// app/domain/tasks/repository-interfaces/task.repository.interface.ts
export interface TaskRepository {
  save(task: TaskAggregate): Promise<void>;
  findById(id: string): Promise<TaskAggregate>;
}

// ✅ Infrastructure provides concrete implementation
// app/infrastructure/persistence/repositories/task.repository.ts
export class FirebaseTaskRepository implements TaskRepository {
  async save(task: TaskAggregate): Promise<void> {
    // Firebase implementation
  }
}

// ✅ Application depends on interface, DI provides implementation
// app/application/tasks/use-cases/get-task.use-case.ts
export class GetTaskUseCase {
  constructor(private repository: TaskRepository) {} // Interface, not concrete
}
```

---

## �� Testing Import Isolation

```typescript
// ✅ Domain tests - pure, no framework
// app/domain/tasks/aggregates/task.aggregate.spec.ts
import { TaskAggregate } from './task.aggregate';

describe('TaskAggregate', () => {
  it('should create task', () => {
    const task = TaskAggregate.create({ title: 'Test' });
    expect(task).toBeDefined();
  });
});

// ✅ Application tests - mock infrastructure
// app/application/tasks/use-cases/create-task.use-case.spec.ts
import { CreateTaskUseCase } from './create-task.use-case';
import { MockTaskRepository } from '@app/infrastructure/persistence/testing';

describe('CreateTaskUseCase', () => {
  it('should create task', async () => {
    const mockRepo = new MockTaskRepository();
    const useCase = new CreateTaskUseCase(mockRepo);
    await useCase.execute({ title: 'Test' });
    expect(mockRepo.saved).toHaveLength(1);
  });
});
```

---

## 📖 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Complete architecture overview
- [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Layer responsibility rules
- [Naming Conventions](./NAMING_CONVENTIONS.md) - File and code naming
- [Testing Standards](./TESTING_STANDARDS.md) - Testing per layer
- [Quick Reference](./QUICK_REFERENCE.md) - Quick checklist

---

**Version History**:
- v1.0 (2026-02-05): Extracted from 全局邊界.md
