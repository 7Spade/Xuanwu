/**
 * Module: index.ts
 * Purpose: barrel export for shared-kernel/state-machines
 * Responsibilities: expose L6 canonical state machine specs for all 4 aggregates
 * Constraints: deterministic logic, respect module boundaries
 *
 * Per docs/architecture/models/domain-model.md — 4 aggregate state machines.
 */

export type { TaskItemStatus, TaskItemEvent, TaskItemTransitionResult } from './task-item.machine';
export {
  transitionTaskItem,
  canTransitionTaskItem,
  TASK_ITEM_INVALID_TRANSITION,
} from './task-item.machine';

export type { PostStatus, PostEvent, PostTransitionResult } from './post.machine';
export {
  transitionPost,
  canTransitionPost,
  POST_INVALID_TRANSITION,
} from './post.machine';

export type {
  ScheduleItemStatus,
  ScheduleItemEvent,
  ScheduleItemTransitionResult,
} from './schedule-item.machine';
export {
  transitionScheduleItem,
  canTransitionScheduleItem,
  SCHEDULE_ITEM_INVALID_TRANSITION,
} from './schedule-item.machine';

export type {
  SkillMintLogStage,
  SkillMintLogEvent,
  SkillMintLogTransitionResult,
} from './skill-mint-log.machine';
export {
  transitionSkillMintLog,
  canTransitionSkillMintLog,
  SKILL_MINT_LOG_INVALID_TRANSITION,
} from './skill-mint-log.machine';
