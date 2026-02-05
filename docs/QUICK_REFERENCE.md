# Quick Reference Guide

> **Version**: 1.0  
> **Last Updated**: 2026-02-05  
> **Purpose**: One-page cheat sheet for developers

---

## 🎯 Layer Quick Decisions

| I'm working on... | Put it in... | Can depend on... |
| ----------------- | ------------ | ---------------- |
| Business rules | `app/domain/{context}/` | Only `shared-kernel` |
| Use case | `app/application/{module}/use-cases/` | `domain`, `infrastructure` (via DI) |
| API call | `app/infrastructure/persistence/` | Anything except `domain` |
| UI component | `app/features/{feature}/components/` | `application`, `shared` |
| Reusable button | `app/shared/ui/` | Nothing |
| Shared type | `shared-kernel/types/` | Nothing |
| Backend function | `functions/src/` | Backend layers only |

---

## 🔒 Import Rules Checklist

- [ ] ✅ Import from layer root (e.g., `@app/domain/tasks`)
- [ ] ❌ NO deep imports (e.g., `@app/domain/tasks/aggregates/task.aggregate`)
- [ ] ❌ NO circular dependencies (A → B → A)
- [ ] ❌ NO features → domain (must go through application)
- [ ] ❌ NO domain → anything except shared-kernel
- [ ] ❌ NO Angular/Firebase in domain layer
- [ ] ❌ NO browser code in functions

---

## 📝 File Naming Quick Guide

| Type | Format | Example |
| ---- | ------ | ------- |
| Aggregate | `{name}.aggregate.ts` | `task.aggregate.ts` |
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Value Object | `{name}.vo.ts` | `task-id.vo.ts` |
| Use Case | `{action}-{entity}.use-case.ts` | `create-task.use-case.ts` |
| Component | `{name}.component.ts` | `task-list.component.ts` |
| Service | `{name}.service.ts` | `auth.service.ts` |
| Repository | `{name}.repository.ts` | `task.repository.ts` |
| DTO | `{name}.dto.ts` | `create-task.dto.ts` |
| Mapper | `{name}.mapper.ts` | `task.mapper.ts` |
| Store | `{name}.store.ts` | `task.store.ts` |
| Pipe | `{name}.pipe.ts` | `date-format.pipe.ts` |
| Directive | `{name}.directive.ts` | `highlight.directive.ts` |

---

## 🎨 Code Naming Quick Guide

| Element | Case | Example |
| ------- | ---- | ------- |
| Class | PascalCase | `TaskAggregate` |
| Interface | PascalCase | `TaskRepository` (no `I` prefix) |
| Type | PascalCase | `TaskStatus` |
| Enum | PascalCase | `UserRole` |
| Function | camelCase | `createTask()` |
| Variable | camelCase | `taskCount` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Folder | kebab-case | `task-management` |
| File | kebab-case | `task-list.component.ts` |
| Signal | camelCase (no `$`) | `count` not `count$` |
| Observable | camelCase + `$` | `tasks$` |

---

## 🧪 Testing Quick Checklist

| Layer | Test Type | Mock? | Framework? |
| ----- | --------- | ----- | ---------- |
| domain | Unit | ❌ No | ❌ No (pure TS) |
| application | Unit | ✅ Infrastructure | ⚠️ Minimal |
| infrastructure | Integration | ⚠️ External only | ✅ Emulators |
| features | Component | ✅ Application | ✅ TestBed |
| shared | Component | ❌ No | ✅ TestBed |

**Test File**: `{name}.{type}.spec.ts` (e.g., `task.aggregate.spec.ts`)

---

## ⚡ Angular 20+ Quick Rules

- [ ] ✅ Use standalone components (no NgModules)
- [ ] ✅ Use `signal()` for state (not `BehaviorSubject`)
- [ ] ✅ Use `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`, `*ngSwitch`)
- [ ] ✅ Use `input()` and `output()` (not `@Input()`, `@Output()`)
- [ ] ✅ Use `computed()` for derived state
- [ ] ✅ Use `ChangeDetectionStrategy.OnPush`
- [ ] ✅ Use `inject()` (not constructor injection)
- [ ] ❌ NO `ngClass` or `ngStyle` (use bindings)
- [ ] ❌ NO Zone.js (pure reactive)

---

## 🚨 Boundary Violation Quick Check

Before committing, ask:

- [ ] Does `app/domain` import Angular, Firebase, or HTTP?
- [ ] Does `app/features` directly import from `app/domain`?
- [ ] Does `app/features` directly import from `app/infrastructure`?
- [ ] Are there any deep imports (paths with `/aggregates/`, `/entities/`, etc.)?
- [ ] Does `shared-kernel` have any external dependencies?
- [ ] Does `functions` import any `@angular/*` packages?
- [ ] Is there any circular dependency?

**If YES to any**: ❌ Fix before committing!

---

## 📦 Common Code Patterns

### Creating an Aggregate

```typescript
// app/domain/tasks/aggregates/task.aggregate.ts
export class TaskAggregate {
  private constructor(private props: TaskProps) {}
  
  static create(props: CreateTaskProps): TaskAggregate {
    // Validation & business rules
    return new TaskAggregate({ ...props, status: 'draft' });
  }
  
  complete(): void {
    // Business logic
    this.props.status = 'completed';
    this.addDomainEvent(new TaskCompletedEvent(this.id));
  }
}
```

### Creating a Use Case

```typescript
// app/application/tasks/use-cases/create-task.use-case.ts
export class CreateTaskUseCase {
  constructor(private repository: TaskRepository) {}
  
  async execute(dto: CreateTaskDto): Promise<TaskDto> {
    const task = TaskAggregate.create(dto);
    await this.repository.save(task);
    return TaskMapper.toDto(task);
  }
}
```

### Creating a Component

```typescript
// app/features/tasks/components/task-list.component.ts
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  private createTask = inject(CreateTaskUseCase);
  
  tasks = signal<Task[]>([]);
  taskCount = computed(() => this.tasks().length);
  
  onCreateTask(data: TaskFormData): void {
    this.createTask.execute(data);
  }
}
```

---

## 🔗 Layer Dependencies at a Glance

```
features ──→ application ──→ domain
   │            │              ↑
   │            ↓              │ (interface only)
   │      infrastructure ──────┘
   ↓            ↓
 shared    shared-kernel
```

**Rules**:
- Arrows = "depends on"
- Lower layers never import higher layers
- Only through `index.ts` public APIs

---

## 📚 Documentation Links

- [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) - Full architecture
- [DDD_LAYER_BOUNDARIES.md](./DDD_LAYER_BOUNDARIES.md) - Layer rules
- [IMPORT_RULES.md](./IMPORT_RULES.md) - Import guidelines
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Naming standards
- [TESTING_STANDARDS.md](./TESTING_STANDARDS.md) - Testing guide

---

## 🎓 When in Doubt

1. **Business logic?** → Put in `domain`
2. **Orchestration?** → Put in `application`
3. **API/DB call?** → Put in `infrastructure`
4. **UI stuff?** → Put in `features`
5. **Reusable UI?** → Put in `shared`
6. **Shared across layers?** → Put in `shared-kernel`

**Golden Rule**: If you're not sure, ask "What is the PRIMARY responsibility of this code?"

---

**Version History**:
- v1.0 (2026-02-05): Initial quick reference
