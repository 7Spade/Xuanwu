/**
 * Module: index.ts
 * Purpose: Public action barrel for scheduling slice.
 * Responsibilities: Re-export workspace, lifecycle, and governance actions.
 * Constraints: deterministic logic, respect module boundaries
 */

export {
  createScheduleItem,
  assignMember,
  unassignMember,
} from './_workspace';

export {
  approveScheduleItemWithMember,
  updateScheduleItemStatus,
  updateScheduleItemDateRange,
} from './_lifecycle';

export { updateTimelineItemDateRange } from './_timeline';

export {
  manualAssignScheduleMember,
  cancelScheduleProposalAction,
  completeOrgScheduleAction,
} from './_governance';
