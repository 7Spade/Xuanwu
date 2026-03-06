import type { Timestamp } from '@/shared/ports';
import type { SkillRequirement } from '@/features/shared-kernel/skill-tier';
import type { Location } from './location';
import type { ScheduleStatus, ScheduleTemporalKind } from './status';

export interface ScheduleItem {
  id: string;
  accountId: string;
  workspaceId: string;
  workspaceName?: string;
  title: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  temporalKind?: ScheduleTemporalKind;
  status: ScheduleStatus;
  originType: 'MANUAL' | 'TASK_AUTOMATION';
  originTaskId?: string;
  assigneeIds: string[];
  location?: Location;
  locationId?: string;
  requiredSkills?: SkillRequirement[];
  proposedBy?: string;
  version?: number;
  traceId?: string;
}
