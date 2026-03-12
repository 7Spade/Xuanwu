/**
 * shared-kernel/ports/i-task-repository.ts
 *
 * ITaskRepository — Port interface for workspace task persistence.
 *
 * Layer: VS0 Shared Kernel — Port (dependency inversion boundary)
 * Per docs/architecture/README.md:
 *   Application Layer calls port interfaces, never infrastructure adapters directly.
 *   Infrastructure Layer implements this interface via FirestoreTaskRepository.
 *
 * Consumers:
 *   - workspace.slice domain.tasks application layer (read/write commands)
 *   - Infrastructure adapter: src/shared-infra/firebase-client (implementation)
 */

import type { WorkspaceTask } from '@/shared-kernel/types/workspace-task';
import type { TaskId } from '@/shared-kernel/value-objects/task-id';
import type { WorkspaceId } from '@/shared-kernel/value-objects/workspace-id';

/**
 * ITaskRepository — port for workspace task aggregate persistence.
 *
 * Implementations MUST be placed in the Infrastructure Layer only.
 * The domain and application layers depend only on this interface.
 */
export interface ITaskRepository {
  /**
   * Fetches all tasks for a workspace (one-time read).
   */
  findAll(workspaceId: WorkspaceId): Promise<WorkspaceTask[]>;

  /**
   * Fetches a single task by its ID.
   * Returns null if not found.
   */
  findById(workspaceId: WorkspaceId, taskId: TaskId): Promise<WorkspaceTask | null>;

  /**
   * Fetches tasks associated with a source intent ID (from document parsing).
   */
  findBySourceIntentId(workspaceId: WorkspaceId, sourceIntentId: string): Promise<WorkspaceTask[]>;

  /**
   * Persists a new task.
   * Returns the assigned task ID on success.
   */
  save(workspaceId: WorkspaceId, task: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;

  /**
   * Updates an existing task (partial update).
   */
  update(workspaceId: WorkspaceId, taskId: TaskId, changes: Partial<WorkspaceTask>): Promise<void>;

  /**
   * Removes a task by ID.
   */
  remove(workspaceId: WorkspaceId, taskId: TaskId): Promise<void>;
}
