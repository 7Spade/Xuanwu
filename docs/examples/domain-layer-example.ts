/**
 * Domain Layer Example
 * 
 * This file demonstrates proper domain layer implementation following DDD principles.
 * 
 * Key Characteristics:
 * - 100% framework-agnostic (pure TypeScript)
 * - Contains only business logic
 * - No external dependencies (except shared-kernel)
 * - No HTTP, Firebase, or UI code
 * - Fully testable in isolation
 */

// ============================================================================
// Value Objects
// ============================================================================

/**
 * TaskId Value Object
 * File: app/domain/tasks/value-objects/task-id.vo.ts
 */
export class TaskId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }
  }

  static create(value: string): TaskId {
    return new TaskId(value);
  }

  static generate(): TaskId {
    // In real implementation, use UUID library
    return new TaskId(`task-${Date.now()}`);
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * TaskStatus Value Object
 * File: app/domain/tasks/value-objects/task-status.vo.ts
 */
export enum TaskStatus {
  Draft = 'draft',
  InProgress = 'in_progress',
  Completed = 'completed',
  Archived = 'archived'
}

// ============================================================================
// Domain Events
// ============================================================================

/**
 * Base Domain Event
 * File: app/domain/shared/domain-event.base.ts
 */
export abstract class DomainEvent {
  readonly occurredOn: Date;

  constructor() {
    this.occurredOn = new Date();
  }

  abstract get eventName(): string;
}

/**
 * TaskCreatedEvent
 * File: app/domain/tasks/events/task-created.event.ts
 */
export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly title: string
  ) {
    super();
  }

  get eventName(): string {
    return 'tasks.task.created';
  }
}

/**
 * TaskCompletedEvent
 * File: app/domain/tasks/events/task-completed.event.ts
 */
export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly completedAt: Date
  ) {
    super();
  }

  get eventName(): string {
    return 'tasks.task.completed';
  }
}

// ============================================================================
// Entities and Aggregates
// ============================================================================

/**
 * Task Aggregate Root Properties
 */
export interface TaskProps {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * CreateTask Input
 */
export interface CreateTaskProps {
  title: string;
  description: string;
}

/**
 * TaskAggregate - Aggregate Root
 * File: app/domain/tasks/aggregates/task.aggregate.ts
 * 
 * Responsibilities:
 * - Enforce business invariants
 * - Coordinate behavior across entities
 * - Emit domain events
 * - Maintain consistency boundaries
 */
export class TaskAggregate {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: TaskProps) {}

  // Factory method for creating new tasks
  static create(input: CreateTaskProps): TaskAggregate {
    // Validation: Business rules
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (input.title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters');
    }

    const now = new Date();
    const task = new TaskAggregate({
      id: TaskId.generate(),
      title: input.title.trim(),
      description: input.description.trim(),
      status: TaskStatus.Draft,
      createdAt: now,
      updatedAt: now
    });

    // Emit domain event
    task.addDomainEvent(
      new TaskCreatedEvent(task.id.toString(), task.title)
    );

    return task;
  }

  // Factory method for reconstituting from persistence
  static reconstitute(props: TaskProps): TaskAggregate {
    return new TaskAggregate(props);
  }

  // Getters (read-only access to properties)
  get id(): TaskId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  // Business method: Start task
  startTask(): void {
    if (this.props.status !== TaskStatus.Draft) {
      throw new Error('Can only start tasks in draft status');
    }

    this.props.status = TaskStatus.InProgress;
    this.props.updatedAt = new Date();
  }

  // Business method: Complete task
  complete(): void {
    if (this.props.status === TaskStatus.Completed) {
      throw new Error('Task is already completed');
    }

    if (this.props.status === TaskStatus.Archived) {
      throw new Error('Cannot complete archived task');
    }

    const now = new Date();
    this.props.status = TaskStatus.Completed;
    this.props.completedAt = now;
    this.props.updatedAt = now;

    // Emit domain event
    this.addDomainEvent(
      new TaskCompletedEvent(this.id.toString(), now)
    );
  }

  // Business method: Archive task
  archive(): void {
    if (this.props.status !== TaskStatus.Completed) {
      throw new Error('Can only archive completed tasks');
    }

    this.props.status = TaskStatus.Archived;
    this.props.updatedAt = new Date();
  }

  // Business method: Update task details
  updateDetails(title: string, description: string): void {
    if (this.props.status === TaskStatus.Archived) {
      throw new Error('Cannot update archived task');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters');
    }

    this.props.title = title.trim();
    this.props.description = description.trim();
    this.props.updatedAt = new Date();
  }

  // Business query: Check if task is overdue (example)
  isOverdue(dueDate: Date): boolean {
    if (this.props.status === TaskStatus.Completed) {
      return false; // Completed tasks are never overdue
    }

    return new Date() > dueDate;
  }

  // Domain events management
  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // For persistence (snapshot of internal state)
  toSnapshot(): TaskProps {
    return { ...this.props };
  }
}

// ============================================================================
// Repository Interface (defined in domain, implemented in infrastructure)
// ============================================================================

/**
 * TaskRepository Interface
 * File: app/domain/tasks/repository-interfaces/task.repository.interface.ts
 */
export interface TaskRepository {
  save(task: TaskAggregate): Promise<void>;
  findById(id: TaskId): Promise<TaskAggregate | null>;
  findAll(): Promise<TaskAggregate[]>;
  delete(id: TaskId): Promise<void>;
}

// ============================================================================
// Domain Service (when business logic spans multiple aggregates)
// ============================================================================

/**
 * TaskDuplicationService
 * File: app/domain/tasks/services/task-duplication.service.ts
 * 
 * Use domain services when:
 * - Logic doesn't belong to a single aggregate
 * - Logic requires coordination between multiple aggregates
 * - Logic is stateless
 */
export class TaskDuplicationService {
  canDuplicate(task: TaskAggregate): boolean {
    // Business rule: Can only duplicate non-archived tasks
    return task.status !== TaskStatus.Archived;
  }

  duplicate(original: TaskAggregate): TaskAggregate {
    if (!this.canDuplicate(original)) {
      throw new Error('Cannot duplicate archived task');
    }

    return TaskAggregate.create({
      title: `${original.title} (Copy)`,
      description: original.description
    });
  }
}

// ============================================================================
// Example Unit Tests (framework-free)
// ============================================================================

/**
 * Example tests for TaskAggregate
 * File: app/domain/tasks/aggregates/task.aggregate.spec.ts
 * 
 * Note: These are pure TypeScript tests, no Angular TestBed needed
 */

// Simplified test framework for demonstration
function describe(name: string, fn: () => void): void {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any): void {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toThrow(expectedMessage?: string): void {
      let threw = false;
      try {
        actual();
      } catch (error: any) {
        threw = true;
        if (expectedMessage && !error.message.includes(expectedMessage)) {
          throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
        }
      }
      if (!threw) {
        throw new Error('Expected function to throw an error');
      }
    },
    toHaveLength(expected: number): void {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${actual.length} to be ${expected}`);
      }
    }
  };
}

// Actual tests
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
        TaskAggregate.create({
          title: '',
          description: 'Test'
        });
      }).toThrow('title cannot be empty');
    });

    it('should emit TaskCreatedEvent', () => {
      const task = TaskAggregate.create({
        title: 'Test Task',
        description: 'Test Description'
      });

      const events = task.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tasks.task.created');
    });
  });

  describe('complete', () => {
    it('should transition from draft to completed', () => {
      const task = TaskAggregate.create({
        title: 'Test Task',
        description: 'Test Description'
      });

      task.complete();

      expect(task.status).toBe(TaskStatus.Completed);
    });

    it('should throw error if already completed', () => {
      const task = TaskAggregate.create({
        title: 'Test Task',
        description: 'Test'
      });

      task.complete();

      expect(() => task.complete()).toThrow('already completed');
    });
  });
});

// ============================================================================
// Key Takeaways
// ============================================================================

/**
 * Domain Layer Best Practices:
 * 
 * 1. ✅ Pure TypeScript - No framework dependencies
 * 2. ✅ Business logic only - No UI, HTTP, or database code
 * 3. ✅ Value objects for type safety - No primitive obsession
 * 4. ✅ Aggregates enforce invariants - Maintain consistency
 * 5. ✅ Domain events for communication - Decouple layers
 * 6. ✅ Repository interfaces - Define contracts, not implementations
 * 7. ✅ Factory methods - Control object creation
 * 8. ✅ Immutability where appropriate - Value objects are immutable
 * 9. ✅ Testable in isolation - No mocks or test doubles needed
 * 10. ✅ Rich domain model - Behavior, not just data
 */
