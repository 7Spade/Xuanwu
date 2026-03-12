/**
 * Module: i-task-item-repository.ts
 * Purpose: TaskItemRepository domain port (L9)
 * Per docs/architecture/guidelines/infrastructure-spec.md §2.
 */

import type { WorkspaceTask } from '../types/workspace-task';
import type { AggregateRepository, QueryOptions } from './i-aggregate-repository';

export interface TaskItemRepository extends AggregateRepository<WorkspaceTask> {
  findTreeByRootId(rootId: string): Promise<WorkspaceTask[]>;
  findDependencies(taskId: string): Promise<string[]>;
  saveAll(tasks: WorkspaceTask[]): Promise<void>;
  findByWorkspaceId(workspaceId: string, opts?: QueryOptions): Promise<WorkspaceTask[]>;
}
