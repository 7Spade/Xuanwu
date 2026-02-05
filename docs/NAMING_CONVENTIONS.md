# Naming Conventions

> **Document Type**: Reference (Information-oriented)  
> **Target Audience**: All developers  
> **Purpose**: Comprehensive naming rules for files, code, and patterns  
> **Version**: 2.0  
> **Project**: Xuanwu (玄武 - Black Tortoise)  
> **Optimized For**: GitHub Copilot and AI-assisted development  
> **Last Updated**: 2026-02-05

## When to Use This

- 📝 **Creating files** - Check correct naming format
- 🎯 **Naming variables/functions** - Follow conventions
- 🤖 **AI code generation** - Ensure Copilot understands patterns
- 📋 **Code review** - Verify naming compliance

**Prerequisites**: None (lookup reference)  
**Related Docs**: [Quick Reference](./QUICK_REFERENCE.md) (Reference), [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) (Reference), [Glossary](./GLOSSARY.md) (Reference - terminology)

---

## 🎯 Core Principles

1. **Semantic First**: Names describe "what" or "what it represents", not "how"
2. **No Abbreviations**: Except industry-standard (ID, URL, API, SDK, HTTP)
3. **Consistent Terminology**: Same concept uses same term across all layers
4. **DDD Role Tags**: Files must include role labels (`.vo`, `.entity`, `.aggregate`)

---

## 📐 Naming Cases Overview

| Case Type | Usage | Examples |
| --------- | ----- | -------- |
| **PascalCase** | Classes, Interfaces, Types, Enums | `TaskAggregate`, `UserRepository` |
| **camelCase** | Functions, Methods, Variables, Properties | `createTask()`, `userId` |
| **kebab-case** | Files, Folders, Routes, CSS classes | `task-list.component.ts`, `/tasks/daily-view` |
| **SCREAMING_SNAKE_CASE** | Constants, Environment variables | `MAX_RETRY_ATTEMPTS`, `FIREBASE_API_KEY` |

---

## 📁 Directory and File Naming Rules

### Folder Naming

- **Rule**: All folders must use `kebab-case`
- ✅ Correct: `src/app/features/task-management/`
- ❌ Wrong: `src/app/Features/TaskManagement/`

### File Naming Format

- **Rule**: All files must use `kebab-case.{type}.ts` format
- **Rule**: Filenames use nouns only, not verbs
- ✅ Correct: `task-list.component.ts`, `user-id.vo.ts`
- ❌ Wrong: `TaskList.component.ts`, `CreateTask.ts`

### File Type Suffixes

| DDD Pattern | Suffix | Example |
| ----------- | ------ | ------- |
| Value Object | `.vo.ts` | `task-id.vo.ts` |
| Entity | `.entity.ts` | `user.entity.ts` |
| Aggregate Root | `.aggregate.ts` | `task.aggregate.ts` |
| Factory | `.factory.ts` | `task.factory.ts` |
| Repository | `.repository.ts` | `task.repository.ts` |
| Port/Adapter | `.port.ts` / `.adapter.ts` | `notification.port.ts` |
| Domain Service | `.service.ts` | `task-calculator.service.ts` |
| Use Case | `.use-case.ts` | `create-task.use-case.ts` |
| Command | `.command.ts` | `create-task.command.ts` |
| Query | `.query.ts` | `get-tasks.query.ts` |
| DTO | `.dto.ts` | `task.dto.ts` |
| Mapper | `.mapper.ts` | `task.mapper.ts` |
| Exception | `.exception.ts` / `.error.ts` | `task-not-found.exception.ts` |

| Angular Pattern | Suffix | Example |
| --------------- | ------ | ------- |
| Component | `.component.ts` | `task-list.component.ts` |
| Directive | `.directive.ts` | `highlight.directive.ts` |
| Pipe | `.pipe.ts` | `date-format.pipe.ts` |
| Service | `.service.ts` | `auth.service.ts` |
| Guard | `.guard.ts` | `auth.guard.ts` |
| Interceptor | `.interceptor.ts` | `auth.interceptor.ts` |
| Routes | `.routes.ts` | `app.routes.ts` |
| Store | `.store.ts` | `task.store.ts` |

| Other Patterns | Suffix | Example |
| -------------- | ------ | ------- |
| Utility | `.util.ts` / `.helper.ts` | `date.util.ts` |
| Configuration | `.config.ts` | `firebase.config.ts` |
| Model | `.model.ts` | `task.model.ts` |
| Handler | `.handler.ts` | `task-created.handler.ts` |
| Test | `.spec.ts` | `task.aggregate.spec.ts` |

---

## 🎨 Code Entity Naming Rules

### Classes

- **Rule**: Use PascalCase
- ✅ Correct: `export class TaskAggregate { }`
- ❌ Wrong: `export class taskAggregate { }`

### Interfaces

- **Rule**: Use PascalCase, **NO** `I` prefix
- ✅ Correct: `export interface TaskProps { }`
- ❌ Wrong: `export interface ITaskProps { }`

**Naming Patterns**:
- Properties: `{Name}Props` (e.g., `TaskProps`, `UserProps`)
- Repositories: `{Name}Repository` (e.g., `TaskRepository`)
- Ports: `{Name}Port` (e.g., `NotificationPort`)

### Types and Enums

- **Rule**: Use PascalCase
- ✅ Correct: `export type TaskStatus = 'draft' | 'completed';`
- ✅ Correct: `export enum UserRole { Admin, User }`

### Functions and Methods

- **Rule**: Use camelCase and start with a verb
- ✅ Correct: `calculateTotalCost()`, `isCompleted()`, `createTask()`
- ❌ Wrong: `CalculateValue()`, `completed()`, `newTask()`

**Common Verb Prefixes**:
- `create` - Create new instances
- `get` / `find` - Retrieve data
- `update` / `set` - Modify data
- `delete` / `remove` - Delete data
- `is` / `has` / `can` - Boolean checks
- `calculate` / `compute` - Calculations
- `validate` - Validation
- `handle` - Event handling
- `execute` - Use case execution

### Properties and Variables

- **Rule**: Use camelCase
- ✅ Correct: `private taskId: string;`, `const taskCount = 10;`
- ❌ Wrong: `private TaskId: string;`, `const TaskCount = 10;`

**Private Members**:
- ✅ Preferred: `private taskId: string;`
- ⚠️ Only when needed: `private _value: number;` (when there's a `get value()`)

### Constants

- **Rule**: Use SCREAMING_SNAKE_CASE
- ✅ Correct: `export const MAX_RETRY_ATTEMPTS = 3;`
- ❌ Wrong: `export const maxRetryAttempts = 3;`

---

## ⚡ Angular 21+ Specific Rules

### Signals

- **Rule**: Signal variables use camelCase without `$` suffix
- ✅ Correct: `const taskCount = signal(0);`
- ❌ Wrong: `const taskCount$ = signal(0);`

### Observables

- **Rule**: Observable variables use camelCase with `$` suffix
- ✅ Correct: `const taskAdded$ = this.actions$.pipe(...);`
- ❌ Wrong: `const taskAdded = this.actions$.pipe(...);`

### Template Control Flow

- **Rule**: Use `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`, `*ngSwitch`)
- ✅ Correct: `@if (condition) { ... }`
- ❌ Wrong: `*ngIf="condition"`

### Directives

- **Rule**: Selector uses camelCase with prefix
- ✅ Correct: `@Directive({ selector: '[appHighlight]' })`
- ❌ Wrong: `@Directive({ selector: '[AppHighlight]' })`

### Pipes

- **Rule**: Class uses PascalCase + `Pipe`, name uses camelCase
- ✅ Correct: 
  ```typescript
  @Pipe({ name: 'dateFormat' })
  export class DateFormatPipe { }
  ```

---

## 🧩 Layer-Specific Naming Patterns

### app/domain

**Aggregates**:
```typescript
// File: task.aggregate.ts
export class TaskAggregate {
  static create(props: CreateTaskProps): TaskAggregate { }
}
```

**Value Objects**:
```typescript
// File: task-id.vo.ts
export class TaskId {
  private constructor(private value: string) { }
  static create(value: string): TaskId { }
}
```

**Domain Events**:
```typescript
// File: task-created.event.ts
export class TaskCreatedEvent {
  constructor(public readonly taskId: string) { }
}
```

### app/application

**Use Cases**:
```typescript
// File: create-task.use-case.ts
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<TaskDto> { }
}
```

**DTOs**:
```typescript
// File: create-task.dto.ts
export interface CreateTaskDto {
  title: string;
  description?: string;
}
```

**Mappers**:
```typescript
// File: task.mapper.ts
export class TaskMapper {
  static toDto(aggregate: TaskAggregate): TaskDto { }
  static toDomain(dto: TaskDto): TaskAggregate { }
}
```

### app/infrastructure

**Repositories**:
```typescript
// File: task.repository.ts
export class FirebaseTaskRepository implements TaskRepository {
  async save(task: TaskAggregate): Promise<void> { }
}
```

**Adapters**:
```typescript
// File: email.adapter.ts
export class SendGridEmailAdapter implements EmailPort {
  async send(email: Email): Promise<void> { }
}
```

### app/features

**Components**:
```typescript
// File: task-list.component.ts
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent { }
```

**Pages**:
```typescript
// File: task-detail.page.ts
@Component({
  selector: 'app-task-detail-page',
  templateUrl: './task-detail.page.html'
})
export class TaskDetailPage { }
```

---

## 🖥️ Backend (functions/) Naming

### Cloud Functions

- **Rule**: Function names use camelCase
- ✅ Correct: `export const processDocumentAI = onCall(...)`
- ❌ Wrong: `export const ProcessDocumentAI = onCall(...)`

### Function Files

- **Rule**: Use `{name}.function.ts` format
- ✅ Correct: `analyze-document.function.ts`

### Firestore Collections

- **Rule**: Use kebab-case plural
- ✅ Correct: `workspaces`, `daily-entries`, `audit-logs`
- ❌ Wrong: `Workspace`, `dailyEntry`

### Document IDs

- **Rule**: Use UUID or semantic IDs
- ✅ Correct: `uuid()`, `user-${userId}-task-${timestamp}`
- ⚠️ Avoid: Auto-generated random IDs (unless no alternative)

---

## 🎯 Semantic Decision Tree

### Where to Place Code?

**Ask**: "Is this a domain rule?"
- **Yes** → `app/domain/{bounded_context}/`
- **No** → Continue...

**Ask**: "Is this use case orchestration?"
- **Yes** → `app/application/{module}/use-cases/`
- **No** → Continue...

**Ask**: "Is this a technical implementation?"
- **Yes, Browser** → `app/infrastructure/`
- **Yes, Node.js** → `functions/src/infrastructure/`
- **No** → Continue...

**Ask**: "Is this UI interaction?"
- **Yes** → `app/features/{feature}/`
- **No** → Continue...

**Ask**: "Is this reusable UI?"
- **Yes** → `app/shared/`
- **No** → Continue...

**Ask**: "Is this shared across layers?"
- **Yes** → `shared-kernel/`

---

## 🚨 Common Naming Mistakes

### Mistake 1: Using Abbreviations

❌ Wrong:
```typescript
export class TskAgg { } // Task Aggregate
const usrRepo = new UsrRepo(); // User Repository
```

✅ Correct:
```typescript
export class TaskAggregate { }
const userRepository = new UserRepository();
```

### Mistake 2: Wrong Case

❌ Wrong:
```typescript
export class task_Aggregate { } // Mixed case
const TaskCount = 10; // PascalCase for variable
```

✅ Correct:
```typescript
export class TaskAggregate { }
const taskCount = 10;
```

### Mistake 3: Missing Type Suffix

❌ Wrong:
```typescript
// File: task.ts (ambiguous)
export class Task { } // Is this entity, aggregate, or DTO?
```

✅ Correct:
```typescript
// File: task.aggregate.ts (clear)
export class TaskAggregate { }
```

### Mistake 4: Verb in Filename

❌ Wrong:
```typescript
// File: create-task.ts
export class CreateTask { } // Should be noun
```

✅ Correct:
```typescript
// File: create-task.use-case.ts
export class CreateTaskUseCase { }
```

---

## 📊 CSS/SCSS Naming

### Component SCSS

- **Rule**: Match component name with `.component.scss`
- ✅ Correct: `task-list.component.scss`

### SCSS Variables

- **Rule**: Use kebab-case with prefix
- ✅ Correct: `$app-color-primary-500`, `$app-spacing-md`

### CSS Classes (BEM)

- **Rule**: Follow BEM (Block__Element--Modifier) with kebab-case
- ✅ Correct: `app-task-list__item--active`
- Format: `{block}__{element}--{modifier}`

---

## 🌐 Routes and URLs

- **Rule**: Use kebab-case
- ✅ Correct: `/workspaces/123/tasks/daily-view`
- ❌ Wrong: `/Workspaces/123/Tasks/DailyView`

---

## 📝 Documentation Files

### Core Documentation

- **Rule**: Use SCREAMING_SNAKE_CASE.md
- ✅ Correct: `README.md`, `ARCHITECTURE.md`
- **Exception**: `README.md` and `AGENTS.md` are standard

### General Documentation

- **Rule**: Use kebab-case.md
- ✅ Correct: `deployment-guide.md`, `api-documentation.md`

---

## 🔤 Event Naming

### Event Type String

- **Rule**: Use `{module}.{entity}.{action}` format (lowercase with dots)
- ✅ Correct: `'tasks.task.created'`, `'users.user.registered'`

### Event Class

- **Rule**: Use PascalCase + `Event`
- ✅ Correct: `TaskCreatedEvent`, `UserRegisteredEvent`

---

## 🧪 Test File Naming

- **Rule**: Use `{name}.{type}.spec.ts` format
- ✅ Correct: `task.aggregate.spec.ts`, `create-task.use-case.spec.ts`

---

## 📚 Complete Example

```
src/app/domain/tasks/
├── aggregates/
│   ├── task.aggregate.ts          # TaskAggregate class
│   └── task.aggregate.spec.ts     # Tests
├── entities/
│   └── task-item.entity.ts        # TaskItemEntity class
├── value-objects/
│   ├── task-id.vo.ts               # TaskId class
│   └── task-status.vo.ts           # TaskStatus class
├── events/
│   └── task-created.event.ts      # TaskCreatedEvent class
├── repository-interfaces/
│   └── task.repository.interface.ts # TaskRepository interface
├── services/
│   └── task-calculator.service.ts # TaskCalculatorService class
└── index.ts                        # Public API exports

src/app/application/tasks/
├── use-cases/
│   ├── create-task.use-case.ts    # CreateTaskUseCase class
│   └── get-task.use-case.ts       # GetTaskUseCase class
├── commands/
│   └── create-task.command.ts     # CreateTaskCommand interface
├── queries/
│   └── get-tasks.query.ts         # GetTasksQuery interface
├── dtos/
│   ├── create-task.dto.ts         # CreateTaskDto interface
│   └── task.dto.ts                 # TaskDto interface
├── mappers/
│   └── task.mapper.ts              # TaskMapper class
└── index.ts                        # Public API exports

src/app/features/tasks/
├── pages/
│   └── task-list.page.ts           # TaskListPage component
├── components/
│   ├── task-item.component.ts     # TaskItemComponent
│   └── task-form.component.ts     # TaskFormComponent
├── models/
│   └── task-view.model.ts          # TaskViewModel interface
└── tasks.routes.ts                 # Routes configuration
```

---

## 📖 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Complete architecture overview
- [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Layer responsibility rules
- [Import Rules](./IMPORT_RULES.md) - Dependency direction
- [Testing Standards](./TESTING_STANDARDS.md) - Testing per layer
- [Quick Reference](./QUICK_REFERENCE.md) - Quick checklist

---

**Version History**:
- v2.0 (2026-02-05): Extracted and enhanced from 全局命名規範.md
- v1.0: Original Chinese version
