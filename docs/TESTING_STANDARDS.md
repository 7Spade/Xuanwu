# Testing Standards

> **Document Type**: Reference (Information-oriented)  
> **Target Audience**: All developers  
> **Purpose**: Testing requirements and patterns for each layer  
> **Version**: 1.0  
> **Last Updated**: 2026-02-05

## When to Use This

- ✅ **Writing tests** - Find required test patterns for your layer
- 📊 **Coverage goals** - Check minimum coverage requirements
- 🧪 **Test types** - Understand unit vs integration vs e2e
- 🔍 **Code review** - Verify test quality and coverage

**Prerequisites**: Understanding of [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md)  
**Related Docs**: [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) (Reference), [Naming Conventions](./NAMING_CONVENTIONS.md) (Reference)

---

## 🧪 Testing Philosophy

Xuanwu follows a **layered testing strategy** that mirrors the DDD architecture. Each layer has specific testing requirements that ensure isolation, maintainability, and reliability.

### Core Principles

1. **Test Isolation**: Each layer's tests must be independent
2. **Framework Separation**: Domain tests must be 100% framework-free
3. **Mock Strategically**: Only mock external dependencies, not business logic
4. **Test Coverage**: Focus on behavior, not implementation details
5. **Fast Feedback**: Unit tests should run in milliseconds

---

## 📊 Testing Strategy by Layer

### app/domain Testing

**Requirements**:
- ✅ Must be fully isolated and runnable without any framework
- ✅ 100% Pure TypeScript tests
- ✅ No mocking needed (pure business logic)
- ✅ Test business rules and invariants
- ❌ No Angular TestBed
- ❌ No Firebase dependencies
- ❌ No HTTP calls

**Example**:
```typescript
// app/domain/tasks/aggregates/task.aggregate.spec.ts
import { TaskAggregate } from './task.aggregate';
import { TaskStatus } from '../value-objects/task-status.vo';

describe('TaskAggregate', () => {
  describe('create', () => {
    it('should create task with valid data', () => {
      const task = TaskAggregate.create({
        title: 'Test Task',
        description: 'Test Description'
      });
      
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(TaskStatus.Draft);
    });
    
    it('should throw error for empty title', () => {
      expect(() => {
        TaskAggregate.create({ title: '' });
      }).toThrow('Title cannot be empty');
    });
  });
  
  describe('complete', () => {
    it('should transition to completed status', () => {
      const task = TaskAggregate.create({ title: 'Test' });
      task.complete();
      
      expect(task.status).toBe(TaskStatus.Completed);
      expect(task.domainEvents).toHaveLength(1);
    });
  });
});
```

---

### app/application Testing

**Requirements**:
- ✅ Unit tests with mocked infrastructure
- ✅ Test use case orchestration logic
- ✅ Verify domain method calls
- ✅ Verify repository interactions
- ❌ No real database calls
- ❌ No real HTTP requests

**Example**:
```typescript
// app/application/tasks/use-cases/create-task.use-case.spec.ts
import { CreateTaskUseCase } from './create-task.use-case';
import { MockTaskRepository } from '@app/infrastructure/persistence/testing';
import { CreateTaskDto } from '../dtos/create-task.dto';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockRepository: MockTaskRepository;
  
  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    useCase = new CreateTaskUseCase(mockRepository);
  });
  
  it('should create and save task', async () => {
    const dto: CreateTaskDto = {
      title: 'New Task',
      description: 'Task Description'
    };
    
    await useCase.execute(dto);
    
    expect(mockRepository.saved).toHaveLength(1);
    expect(mockRepository.saved[0].title).toBe('New Task');
  });
  
  it('should map domain events to integration events', async () => {
    const dto: CreateTaskDto = { title: 'New Task' };
    const eventBus = jasmine.createSpy('eventBus');
    
    await useCase.execute(dto);
    
    // Verify events were published
  });
});
```

---

### app/infrastructure Testing

**Requirements**:
- ✅ Integration tests with real or emulated services
- ✅ Use Firebase emulators for Firestore/Auth
- ✅ Test actual data persistence and retrieval
- ✅ Test error handling and edge cases
- ⚠️ May be slower than unit tests

**Example**:
```typescript
// app/infrastructure/persistence/repositories/task.repository.spec.ts
import { FirebaseTaskRepository } from './task.repository';
import { TaskAggregate } from '@app/domain/tasks';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('FirebaseTaskRepository', () => {
  let repository: FirebaseTaskRepository;
  let testEnv: any;
  
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: { host: 'localhost', port: 8080 }
    });
  });
  
  afterAll(async () => {
    await testEnv.cleanup();
  });
  
  beforeEach(async () => {
    await testEnv.clearFirestore();
    repository = new FirebaseTaskRepository(testEnv.firestore());
  });
  
  it('should save and retrieve task', async () => {
    const task = TaskAggregate.create({ title: 'Test Task' });
    
    await repository.save(task);
    const retrieved = await repository.findById(task.id);
    
    expect(retrieved.id).toBe(task.id);
    expect(retrieved.title).toBe('Test Task');
  });
});
```

---

### app/features Testing

**Requirements**:
- ✅ Component tests with mocked application layer
- ✅ Use Angular TestBed for component testing
- ✅ Test user interactions and UI behavior
- ✅ Test signal updates and computed values
- ❌ No real backend calls
- ❌ Don't test business logic (that's in domain/application)

**Example**:
```typescript
// app/features/tasks/components/task-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { CreateTaskUseCase } from '@app/application/tasks';
import { signal } from '@angular/core';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockCreateTask: jasmine.SpyObj<CreateTaskUseCase>;
  
  beforeEach(async () => {
    mockCreateTask = jasmine.createSpyObj('CreateTaskUseCase', ['execute']);
    
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: CreateTaskUseCase, useValue: mockCreateTask }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });
  
  it('should create task when form is submitted', async () => {
    component.taskTitle.set('New Task');
    
    await component.onSubmit();
    
    expect(mockCreateTask.execute).toHaveBeenCalledWith({
      title: 'New Task'
    });
  });
  
  it('should update task count signal', () => {
    component.tasks.set([
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' }
    ]);
    
    expect(component.taskCount()).toBe(2);
  });
});
```

---

### app/shared Testing

**Requirements**:
- ✅ Test reusable components in isolation
- ✅ Test directives and pipes
- ✅ Focus on component API (inputs/outputs)
- ❌ No business logic testing

**Example**:
```typescript
// app/shared/ui/button/button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });
  
  it('should emit click event', () => {
    let clicked = false;
    component.clicked.subscribe(() => clicked = true);
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    
    expect(clicked).toBe(true);
  });
  
  it('should apply variant class', () => {
    component.variant.set('primary');
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('btn-primary')).toBe(true);
  });
});
```

---

## 🚫 Forbidden Testing Practices

### ❌ Cross-Layer Integration Tests

**Problem**: Testing multiple layers together in unit tests

```typescript
// ❌ BAD: Features test calling real application and infrastructure
it('should create task end-to-end', async () => {
  const component = new TaskListComponent(
    new CreateTaskUseCase(
      new FirebaseTaskRepository(realFirestore) // Real infrastructure!
    )
  );
  
  await component.createTask();
  // This is an integration test disguised as a unit test
});
```

**Solution**: Use mocks for lower layers, save integration testing for E2E

```typescript
// ✅ GOOD: Mock the application layer
it('should call create task use case', async () => {
  const mockUseCase = jasmine.createSpyObj('CreateTaskUseCase', ['execute']);
  const component = new TaskListComponent(mockUseCase);
  
  await component.createTask();
  expect(mockUseCase.execute).toHaveBeenCalled();
});
```

---

### ❌ Domain Tests with Framework Dependencies

**Problem**: Using Angular TestBed for pure domain logic

```typescript
// ❌ BAD: Using TestBed for domain testing
import { TestBed } from '@angular/core/testing';

describe('TaskAggregate', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });
  
  it('should create task', () => {
    const task = TestBed.runInInjectionContext(() => {
      return TaskAggregate.create({ title: 'Test' });
    });
  });
});
```

**Solution**: Pure TypeScript tests

```typescript
// ✅ GOOD: Pure TypeScript
describe('TaskAggregate', () => {
  it('should create task', () => {
    const task = TaskAggregate.create({ title: 'Test' });
    expect(task).toBeDefined();
  });
});
```

---

## 📏 Test File Naming Conventions

- **Domain tests**: `{name}.{type}.spec.ts`
  - Example: `task.aggregate.spec.ts`, `task-id.vo.spec.ts`
- **Application tests**: `{name}.{type}.spec.ts`
  - Example: `create-task.use-case.spec.ts`, `task.mapper.spec.ts`
- **Component tests**: `{name}.component.spec.ts`
  - Example: `task-list.component.spec.ts`
- **Service tests**: `{name}.service.spec.ts`
  - Example: `auth.service.spec.ts`

---

## 🎯 Test Coverage Goals

| Layer              | Coverage Target | Focus                                |
| ------------------ | --------------- | ------------------------------------ |
| app/domain         | 90%+            | Business rules, invariants           |
| app/application    | 85%+            | Use case orchestration               |
| app/infrastructure | 70%+            | Repository implementations           |
| app/features       | 75%+            | User interactions, UI behavior       |
| app/shared         | 80%+            | Component API, reusable logic        |

---

## 🏃 Running Tests

```bash
# Run all tests
npm test

# Run tests for specific layer
npm test -- --testPathPattern=app/domain
npm test -- --testPathPattern=app/application
npm test -- --testPathPattern=app/features

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run e2e
```

---

## 🔧 Test Configuration

### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.spec.ts$',
    'index.ts$'
  ],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/index.ts'
  ]
};
```

---

## 📖 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md) - Complete architecture overview
- [DDD Layer Boundaries](./DDD_LAYER_BOUNDARIES.md) - Layer responsibility rules
- [Import Rules](./IMPORT_RULES.md) - Dependency direction
- [Naming Conventions](./NAMING_CONVENTIONS.md) - File and code naming
- [Quick Reference](./QUICK_REFERENCE.md) - Quick checklist

---

**Version History**:
- v1.0 (2026-02-05): Extracted testing rules and examples
