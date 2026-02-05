/**
 * Feature Layer (UI) Example
 * 
 * This file demonstrates proper feature/presentation layer implementation.
 * 
 * Key Characteristics:
 * - Uses Angular 20+ features (standalone, signals, control flow)
 * - Depends on application layer (use cases)
 * - Uses Angular dependency injection
 * - Manages UI state with signals
 * - No business logic (delegates to application layer)
 * - OnPush change detection for performance
 */

// Angular imports
import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Application layer imports (use cases)
import { 
  CreateTaskUseCase, 
  CompleteTaskUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
  TaskDto 
} from './application-layer-example';

// ============================================================================
// View Models (UI-specific models)
// ============================================================================

/**
 * TaskViewModel
 * File: app/features/tasks/models/task-view.model.ts
 * 
 * Purpose: UI-specific representation (different from domain/DTO)
 */
export interface TaskViewModel {
  id: string;
  title: string;
  description: string;
  status: string;
  displayStatus: string; // UI-friendly status
  createdAt: Date;
  isCompleted: boolean;
  canBeCompleted: boolean;
}

/**
 * TaskFormData
 * File: app/features/tasks/models/task-form.model.ts
 */
export interface TaskFormData {
  title: string;
  description: string;
}

// ============================================================================
// Presentational Component (Dumb Component)
// ============================================================================

/**
 * TaskItemComponent - Presentational Component
 * File: app/features/tasks/components/task-item.component.ts
 * 
 * Characteristics:
 * - Receives data through inputs
 * - Emits events through outputs
 * - No direct dependencies on services
 * - Reusable and testable
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-item" [class.task-item--completed]="task().isCompleted">
      <div class="task-item__header">
        <h3 class="task-item__title">{{ task().title }}</h3>
        <span class="task-item__status">{{ task().displayStatus }}</span>
      </div>
      
      <p class="task-item__description">{{ task().description }}</p>
      
      <div class="task-item__actions">
        @if (task().canBeCompleted) {
          <button 
            class="btn btn--primary" 
            (click)="onComplete()">
            Complete Task
          </button>
        }
        
        <button 
          class="btn btn--secondary" 
          (click)="onView()">
          View Details
        </button>
      </div>
    </div>
  `,
  styles: [`
    .task-item {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .task-item--completed {
      background-color: #f0f8ff;
    }
    
    .task-item__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    
    .task-item__title {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .task-item__status {
      padding: 0.25rem 0.5rem;
      background-color: #e0e0e0;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .task-item__description {
      color: #666;
      margin-bottom: 1rem;
    }
    
    .task-item__actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn--primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn--secondary {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class TaskItemComponent {
  // ✅ Use input() function (Angular 20+)
  task = input.required<TaskViewModel>();
  
  // ✅ Use output() function (Angular 20+)
  completeClicked = output<string>();
  viewClicked = output<string>();
  
  protected onComplete(): void {
    this.completeClicked.emit(this.task().id);
  }
  
  protected onView(): void {
    this.viewClicked.emit(this.task().id);
  }
}

// ============================================================================
// Container Component (Smart Component)
// ============================================================================

/**
 * TaskListContainer - Smart Component
 * File: app/features/tasks/containers/task-list.container.ts
 * 
 * Characteristics:
 * - Injects application services (use cases)
 * - Manages state with signals
 * - Coordinates between presentational components and use cases
 * - Handles business workflows
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-list-container">
      <header class="task-list-header">
        <h1>My Tasks</h1>
        <button 
          class="btn btn--primary" 
          (click)="showCreateForm.set(!showCreateForm())">
          {{ showCreateForm() ? 'Cancel' : 'Create New Task' }}
        </button>
      </header>

      <!-- Create Form -->
      @if (showCreateForm()) {
        <form class="task-form" (ngSubmit)="onCreateTask()">
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              id="title"
              type="text" 
              [(ngModel)]="formData.title"
              name="title"
              required
              class="form-control">
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              [(ngModel)]="formData.description"
              name="description"
              rows="3"
              class="form-control"></textarea>
          </div>
          
          <button 
            type="submit" 
            [disabled]="isCreating()"
            class="btn btn--primary">
            {{ isCreating() ? 'Creating...' : 'Create Task' }}
          </button>
        </form>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading">Loading tasks...</div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <!-- Task List -->
      @if (!isLoading() && !error()) {
        <div class="task-list">
          @if (tasks().length === 0) {
            <p class="empty-state">No tasks yet. Create your first task!</p>
          }
          
          @for (task of tasks(); track task.id) {
            <app-task-item
              [task]="task"
              (completeClicked)="onCompleteTask($event)"
              (viewClicked)="onViewTask($event)" />
          }
        </div>
        
        <div class="task-stats">
          <p>Total: {{ taskCount() }} | Completed: {{ completedCount() }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .task-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .task-form {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .loading, .error {
      padding: 1rem;
      text-align: center;
    }
    
    .error {
      color: #dc3545;
      background-color: #f8d7da;
      border-radius: 4px;
    }
    
    .empty-state {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
    
    .task-stats {
      margin-top: 2rem;
      text-align: center;
      color: #666;
    }
  `]
})
export class TaskListContainer {
  // ✅ Use inject() function (Angular 20+)
  private readonly createTaskUseCase = inject(CreateTaskUseCase);
  private readonly completeTaskUseCase = inject(CompleteTaskUseCase);
  private readonly listTasksUseCase = inject(ListTasksUseCase);

  // ✅ UI State with signals
  protected readonly tasks = signal<TaskViewModel[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isCreating = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showCreateForm = signal(false);

  // ✅ Computed values
  protected readonly taskCount = computed(() => this.tasks().length);
  protected readonly completedCount = computed(() => 
    this.tasks().filter(t => t.isCompleted).length
  );

  // Form data (can also be a signal)
  protected formData: TaskFormData = {
    title: '',
    description: ''
  };

  constructor() {
    // Load tasks on initialization
    this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const dtos = await this.listTasksUseCase.execute({});
      const viewModels = dtos.map(this.mapToViewModel);
      this.tasks.set(viewModels);
    } catch (err) {
      this.error.set('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onCreateTask(): Promise<void> {
    if (!this.formData.title.trim()) {
      return;
    }

    this.isCreating.set(true);
    this.error.set(null);

    try {
      const dto = await this.createTaskUseCase.execute({
        title: this.formData.title,
        description: this.formData.description
      });

      // Add new task to list
      const viewModel = this.mapToViewModel(dto);
      this.tasks.update(tasks => [...tasks, viewModel]);

      // Reset form
      this.formData = { title: '', description: '' };
      this.showCreateForm.set(false);
    } catch (err) {
      this.error.set('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      this.isCreating.set(false);
    }
  }

  protected async onCompleteTask(taskId: string): Promise<void> {
    try {
      const dto = await this.completeTaskUseCase.execute({ taskId });
      
      // Update task in list
      const viewModel = this.mapToViewModel(dto);
      this.tasks.update(tasks => 
        tasks.map(t => t.id === taskId ? viewModel : t)
      );
    } catch (err) {
      this.error.set('Failed to complete task. Please try again.');
      console.error('Error completing task:', err);
    }
  }

  protected onViewTask(taskId: string): void {
    // Navigate to detail view or open modal
    console.log('View task:', taskId);
    // this.router.navigate(['/tasks', taskId]);
  }

  private mapToViewModel(dto: TaskDto): TaskViewModel {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      displayStatus: this.getDisplayStatus(dto.status),
      createdAt: new Date(dto.createdAt),
      isCompleted: dto.status === 'completed',
      canBeCompleted: dto.status === 'draft' || dto.status === 'in_progress'
    };
  }

  private getDisplayStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'archived': 'Archived'
    };
    return statusMap[status] || status;
  }
}

// ============================================================================
// Page Component (Route-level)
// ============================================================================

/**
 * TaskListPage - Route-level Page Component
 * File: app/features/tasks/pages/task-list.page.ts
 * 
 * Characteristics:
 * - Entry point for a route
 * - May compose multiple containers
 * - Handles route parameters
 * - May use @defer for lazy loading
 */
@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [TaskListContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-task-list />
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
  `]
})
export class TaskListPage {}

// ============================================================================
// Routes Configuration
// ============================================================================

/**
 * Task Routes
 * File: app/features/tasks/tasks.routes.ts
 */
import { Routes } from '@angular/router';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    component: TaskListPage
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./task-detail.page').then(m => m.TaskDetailPage)
  }
];

// ============================================================================
// Key Takeaways
// ============================================================================

/**
 * Feature Layer Best Practices:
 * 
 * 1. ✅ Use standalone components - No NgModules
 * 2. ✅ Use signals for state - Not BehaviorSubject
 * 3. ✅ Use computed for derived state - Automatic updates
 * 4. ✅ Use inject() function - Not constructor injection
 * 5. ✅ Use input()/output() - Not @Input()/@Output()
 * 6. ✅ Use @if, @for, @switch - Not *ngIf, *ngFor, *ngSwitch
 * 7. ✅ OnPush change detection - Better performance
 * 8. ✅ Smart vs Dumb components - Clear separation
 * 9. ✅ Depend on application layer - Not infrastructure
 * 10. ✅ No business logic - Delegate to use cases
 */
