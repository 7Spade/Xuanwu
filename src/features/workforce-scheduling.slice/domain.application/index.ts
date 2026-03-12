/**
 * Module: application/index.ts
 * Purpose: Application-layer public exports for VS6 workforce scheduling.
 * Responsibilities: Expose actions, queries, selectors, and saga orchestration.
 * Constraints: deterministic logic, respect module boundaries
 */

export { executeWriteOp } from './commands/write-op';

export {
  createScheduleItem,
  assignMember,
  unassignMember,
  approveScheduleItemWithMember,
  updateScheduleItemStatus,
  updateScheduleItemDateRange,
  manualAssignScheduleMember,
  cancelScheduleProposalAction,
  completeOrgScheduleAction,
} from './commands/index';

export {
  getScheduleItems,
  getOrgScheduleItem,
  getOrgScheduleProposal,
  subscribeToOrgScheduleProposals,
  subscribeToPendingProposals,
  subscribeToConfirmedProposals,
  getAccountScheduleProjection,
  getAccountActiveAssignments,
  subscribeToWorkspaceScheduleItems,
  getEligibleMemberForSchedule,
  getEligibleMembersForSchedule,
} from './queries/index';
export type { OrgEligibleMemberView, OrgMemberSkillWithTier } from './queries/index';

export {
  selectAllScheduleItems,
  selectPendingProposals,
  selectDecisionHistory,
  selectUpcomingEvents,
  selectPresentEvents,
} from './selectors/index';
export type { ScheduleItemWithWorkspace, ScheduleItemWithMembers } from './selectors/index';

export { startSchedulingSaga, getSagaState } from './sagas/index';
export type { SagaState, SagaStep, SagaStatus } from './sagas/index';

// Legacy compatibility: projector handlers are implemented in VS0 projection bus.
export type {
  AccountScheduleProjection,
  AccountScheduleAssignment,
} from './projectors/runtime/account-schedule';
