/**
 * Module: application/index.ts
 * Purpose: Application-layer public exports for VS6 workforce scheduling.
 * Responsibilities: Expose actions, queries, selectors, and saga orchestration.
 * Constraints: deterministic logic, respect module boundaries
 */

export { executeWriteOp } from './_commands/_write-op';

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
} from './_commands/index';

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
} from './_queries/index';
export type { OrgEligibleMemberView, OrgMemberSkillWithTier } from './_queries/index';

export {
  selectAllScheduleItems,
  selectPendingProposals,
  selectDecisionHistory,
  selectUpcomingEvents,
  selectPresentEvents,
} from './_selectors/index';
export type { ScheduleItemWithWorkspace, ScheduleItemWithMembers } from './_selectors/index';

export { startSchedulingSaga, getSagaState } from './_sagas/index';
export type { SagaState, SagaStep, SagaStatus } from './_sagas/index';

// Legacy compatibility: projector handlers are implemented in VS0 projection bus.
export type {
  AccountScheduleProjection,
  AccountScheduleAssignment,
} from './_projectors/_runtime/_account-schedule';
