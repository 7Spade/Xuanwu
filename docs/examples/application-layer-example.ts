/**
 * Application Layer Example
 * 
 * This file demonstrates proper application layer implementation.
 * 
 * Key Characteristics:
 * - Orchestrates use cases
 * - Coordinates domain logic with infrastructure
 * - Maps between domain and DTOs
 * - Uses dependency injection
 * - Contains no business rules (delegates to domain)
 */

// Import from domain (pure business logic)
import { TaskAggregate, TaskId, TaskRepository } from './domain-layer-example';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * CreateTaskDto
 * File: app/application/tasks/dtos/create-task.dto.ts
 */
export interface CreateTaskDto {
  title: string;
  description: string;
}

/**
 * TaskDto (Response)
 * File: app/application/tasks/dtos/task.dto.ts
 */
export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * UpdateTaskDto
 * File: app/application/tasks/dtos/update-task.dto.ts
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
}

// ============================================================================
// Mappers (Domain ↔ DTO Conversion)
// ============================================================================

/**
 * TaskMapper
 * File: app/application/tasks/mappers/task.mapper.ts
 * 
 * Responsibilities:
 * - Convert domain objects to DTOs
 * - Convert DTOs to domain objects
 * - Keep domain isolated from external representations
 */
export class TaskMapper {
  /**
   * Convert domain aggregate to DTO (for API responses)
   */
  static toDto(aggregate: TaskAggregate): TaskDto {
    return {
      id: aggregate.id.toString(),
      title: aggregate.title,
      description: aggregate.description,
      status: aggregate.status,
      createdAt: aggregate.createdAt.toISOString(),
      updatedAt: aggregate.updatedAt.toISOString(),
      completedAt: aggregate.completedAt?.toISOString()
    };
  }

  /**
   * Convert DTO to domain creation props
   */
  static toCreateProps(dto: CreateTaskDto) {
    return {
      title: dto.title,
      description: dto.description
    };
  }

  /**
   * Convert array of aggregates to array of DTOs
   */
  static toDtoList(aggregates: TaskAggregate[]): TaskDto[] {
    return aggregates.map(aggregate => this.toDto(aggregate));
  }
}

// ============================================================================
// Commands (Write Operations)
// ============================================================================

/**
 * CreateTaskCommand
 * File: app/application/tasks/commands/create-task.command.ts
 */
export interface CreateTaskCommand {
  title: string;
  description: string;
}

/**
 * CompleteTaskCommand
 * File: app/application/tasks/commands/complete-task.command.ts
 */
export interface CompleteTaskCommand {
  taskId: string;
}

// ============================================================================
// Queries (Read Operations)
// ============================================================================

/**
 * GetTaskQuery
 * File: app/application/tasks/queries/get-task.query.ts
 */
export interface GetTaskQuery {
  taskId: string;
}

/**
 * ListTasksQuery
 * File: app/application/tasks/queries/list-tasks.query.ts
 */
export interface ListTasksQuery {
  status?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Use Cases (Application Services)
// ============================================================================

/**
 * CreateTaskUseCase
 * File: app/application/tasks/use-cases/create-task.use-case.ts
 * 
 * Responsibilities:
 * - Validate input (DTO validation, not business rules)
 * - Coordinate domain logic
 * - Handle persistence through repository
 * - Map results to DTOs
 * - Handle application-level concerns (transactions, events)
 */
export class CreateTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(dto: CreateTaskDto): Promise<TaskDto> {
    // Step 1: Map DTO to domain creation props
    const createProps = TaskMapper.toCreateProps(dto);

    // Step 2: Create domain aggregate (business logic happens here)
    const task = TaskAggregate.create(createProps);

    // Step 3: Persist through repository
    await this.repository.save(task);

    // Step 4: Handle domain events (if event bus exists)
    // this.eventBus.publishAll(task.getDomainEvents());
    // task.clearDomainEvents();

    // Step 5: Map result to DTO and return
    return TaskMapper.toDto(task);
  }
}

/**
 * GetTaskUseCase
 * File: app/application/tasks/use-cases/get-task.use-case.ts
 */
export class GetTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(query: GetTaskQuery): Promise<TaskDto | null> {
    // Step 1: Parse and validate task ID
    const taskId = TaskId.create(query.taskId);

    // Step 2: Retrieve from repository
    const task = await this.repository.findById(taskId);

    // Step 3: Return null if not found
    if (!task) {
      return null;
    }

    // Step 4: Map to DTO and return
    return TaskMapper.toDto(task);
  }
}

/**
 * CompleteTaskUseCase
 * File: app/application/tasks/use-cases/complete-task.use-case.ts
 */
export class CompleteTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(command: CompleteTaskCommand): Promise<TaskDto> {
    // Step 1: Parse task ID
    const taskId = TaskId.create(command.taskId);

    // Step 2: Retrieve aggregate
    const task = await this.repository.findById(taskId);

    if (!task) {
      throw new Error(`Task with id ${command.taskId} not found`);
    }

    // Step 3: Execute business logic (domain method)
    task.complete();

    // Step 4: Persist changes
    await this.repository.save(task);

    // Step 5: Handle domain events
    // this.eventBus.publishAll(task.getDomainEvents());
    // task.clearDomainEvents();

    // Step 6: Return updated DTO
    return TaskMapper.toDto(task);
  }
}

/**
 * UpdateTaskUseCase
 * File: app/application/tasks/use-cases/update-task.use-case.ts
 */
export class UpdateTaskUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(taskId: string, dto: UpdateTaskDto): Promise<TaskDto> {
    // Step 1: Retrieve task
    const id = TaskId.create(taskId);
    const task = await this.repository.findById(id);

    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    // Step 2: Update with new values (business logic validates)
    if (dto.title !== undefined || dto.description !== undefined) {
      task.updateDetails(
        dto.title ?? task.title,
        dto.description ?? task.description
      );
    }

    // Step 3: Persist changes
    await this.repository.save(task);

    // Step 4: Return updated DTO
    return TaskMapper.toDto(task);
  }
}

/**
 * ListTasksUseCase
 * File: app/application/tasks/use-cases/list-tasks.use-case.ts
 */
export class ListTasksUseCase {
  constructor(private readonly repository: TaskRepository) {}

  async execute(query: ListTasksQuery): Promise<TaskDto[]> {
    // Step 1: Retrieve all tasks (in real app, apply filters)
    const tasks = await this.repository.findAll();

    // Step 2: Apply optional status filter
    let filteredTasks = tasks;
    if (query.status) {
      filteredTasks = tasks.filter(task => task.status === query.status);
    }

    // Step 3: Apply pagination (simplified)
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 10;
    const paginatedTasks = filteredTasks.slice(offset, offset + limit);

    // Step 4: Map to DTOs
    return TaskMapper.toDtoList(paginatedTasks);
  }
}

// ============================================================================
// Event Handlers (React to domain events)
// ============================================================================

/**
 * TaskCompletedEventHandler
 * File: app/application/tasks/event-handlers/task-completed.handler.ts
 * 
 * Responsibilities:
 * - React to domain events
 * - Coordinate side effects
 * - Call other use cases
 * - Send notifications
 */
export class TaskCompletedEventHandler {
  // In real implementation, inject NotificationPort, AuditLogPort, etc.
  
  async handle(event: { taskId: string; completedAt: Date }): Promise<void> {
    // Side effect 1: Send notification
    // await this.notificationPort.send({
    //   type: 'TaskCompleted',
    //   taskId: event.taskId,
    //   timestamp: event.completedAt
    // });

    // Side effect 2: Log to audit trail
    // await this.auditLogPort.log({
    //   action: 'TaskCompleted',
    //   entityId: event.taskId,
    //   timestamp: event.completedAt
    // });

    console.log(`Task ${event.taskId} completed at ${event.completedAt}`);
  }
}

// ============================================================================
// Ports (Output Interfaces)
// ============================================================================

/**
 * NotificationPort
 * File: app/application/ports/notification.port.ts
 * 
 * Application layer defines the interface,
 * Infrastructure layer provides the implementation
 */
export interface NotificationPort {
  send(notification: {
    type: string;
    taskId: string;
    timestamp: Date;
  }): Promise<void>;
}

/**
 * AuditLogPort
 * File: app/application/ports/audit-log.port.ts
 */
export interface AuditLogPort {
  log(entry: {
    action: string;
    entityId: string;
    timestamp: Date;
  }): Promise<void>;
}

// ============================================================================
// Example Tests (with mocked infrastructure)
// ============================================================================

/**
 * Example test for CreateTaskUseCase
 * File: app/application/tasks/use-cases/create-task.use-case.spec.ts
 */

// Mock repository for testing
class MockTaskRepository implements TaskRepository {
  private tasks: Map<string, TaskAggregate> = new Map();

  async save(task: TaskAggregate): Promise<void> {
    this.tasks.set(task.id.toString(), task);
  }

  async findById(id: TaskId): Promise<TaskAggregate | null> {
    return this.tasks.get(id.toString()) ?? null;
  }

  async findAll(): Promise<TaskAggregate[]> {
    return Array.from(this.tasks.values());
  }

  async delete(id: TaskId): Promise<void> {
    this.tasks.delete(id.toString());
  }

  // Test helper
  getSaved(): TaskAggregate[] {
    return Array.from(this.tasks.values());
  }
}

// Simplified test functions
function describe(name: string, fn: () => void): void {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => Promise<void>): void {
  fn().then(() => {
    console.log(`  ✓ ${name}`);
  }).catch(error => {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error}`);
  });
}

function expect(actual: any) {
  return {
    toBe(expected: any): void {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toHaveLength(expected: number): void {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${actual.length} to be ${expected}`);
      }
    }
  };
}

// Example tests
describe('CreateTaskUseCase', () => {
  it('should create and save task', async () => {
    const mockRepo = new MockTaskRepository();
    const useCase = new CreateTaskUseCase(mockRepo);

    const dto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description'
    };

    const result = await useCase.execute(dto);

    expect(result.title).toBe('Test Task');
    expect(mockRepo.getSaved()).toHaveLength(1);
  });
});

describe('CompleteTaskUseCase', () => {
  it('should complete existing task', async () => {
    const mockRepo = new MockTaskRepository();
    const createUseCase = new CreateTaskUseCase(mockRepo);
    const completeUseCase = new CompleteTaskUseCase(mockRepo);

    // Create task first
    const created = await createUseCase.execute({
      title: 'Test Task',
      description: 'Test'
    });

    // Then complete it
    const completed = await completeUseCase.execute({
      taskId: created.id
    });

    expect(completed.status).toBe('completed');
  });
});

// ============================================================================
// Key Takeaways
// ============================================================================

/**
 * Application Layer Best Practices:
 * 
 * 1. ✅ Orchestrate use cases - Coordinate domain and infrastructure
 * 2. ✅ Use DTOs - Keep domain isolated from external representations
 * 3. ✅ Use mappers - Clean conversion between layers
 * 4. ✅ Depend on interfaces - Repository, ports (not implementations)
 * 5. ✅ Inject dependencies - Use DI for testability
 * 6. ✅ Handle events - React to domain events, coordinate side effects
 * 7. ✅ No business rules - Delegate to domain layer
 * 8. ✅ Transaction boundaries - Define transaction scopes
 * 9. ✅ Mock infrastructure - Test with mock repositories
 * 10. ✅ Commands & Queries - Separate read from write operations
 */
