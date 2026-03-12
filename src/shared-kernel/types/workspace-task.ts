/**
 * Module: workspace-task.ts
 * Purpose: Centralized workspace task domain type definitions.
 * Responsibilities: WorkspaceTask entity and task tree structures.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { SkillRequirement } from '@/shared-kernel/data-contracts/skill-tier';
import type { Location } from '@/shared-kernel/data-contracts/scheduling/schedule-contract';
import type { Timestamp } from '@/shared-kernel';
import type { TaskItemStatus } from '@/shared-kernel/state-machines';

// Location is owned by shared-kernel/schedule-contract [D19], re-exported here for backward compatibility.
export type { Location };

export interface WorkspaceTask {
  id: string;
  name: string;
  description?: string;
  status: TaskItemStatus;
  priority: 'low' | 'medium' | 'high';
  type?: string;
  progress?: number;
  quantity?: number;
  completedQuantity?: number;
  unitPrice?: number;
  unit?: string;
  discount?: number;
  subtotal: number;
  parentId?: string;
  assigneeId?: string;
  dueDate?: Timestamp;
  photoURLs?: string[];
  location?: Location;
  sourceIntentId?: string;
  /** Zero-based position of this task in the original parsed document (line-item order). */
  sourceIntentIndex?: number;
  /** Skill requirements for this task; [TE_SK] tag::skill anchor for VS6 eligibility checks [#A4]. */
  requiredSkills?: SkillRequirement[];
  /** [S2] Monotonic version counter for optimistic concurrency control. */
  aggregateVersion?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  [key: string]: unknown;
}

export type TaskWithChildren = WorkspaceTask & {
  children: TaskWithChildren[];
  descendantSum: number;
  wbsNo: string;
  progress: number;
};

