/**
 * Module: ui/index.ts
 * Purpose: UI-layer public exports for VS6 workforce scheduling.
 * Responsibilities: Expose components and React hooks for schedule/timeline screens.
 * Constraints: deterministic logic, respect module boundaries
 */

export {
  useOrgSchedule,
  usePendingScheduleProposals,
  useConfirmedScheduleProposals,
  useGlobalSchedule,
  useScheduleActions,
  useWorkspaceSchedule,
  useScheduleEventHandler,
  useAccountTimeline,
  useWorkspaceTimeline,
  useTimelineCommands,
} from './_hooks/runtime';

export type { TimelineMember } from './_types/_timeline.types';

export { AccountScheduleSection } from './_components/runtime/schedule.account-view';
export { OrgScheduleGovernance } from './_components/runtime/org-schedule-governance';
export { WorkspaceSchedule } from './_components/runtime/schedule.workspace-view';
export { GovernanceSidebar } from './_components/runtime/governance-sidebar';
export { MemberAssignPopover } from './_components/runtime/member-assign-popover';
export { ProposalDialog } from './_components/runtime/proposal-dialog';
export { ScheduleProposalContent } from './_components/runtime/schedule-proposal-content';
export { ScheduleDataTable } from './_components/runtime/schedule-data-table';
export { UnifiedCalendarGrid } from './_components/runtime/unified-calendar-grid';
export { DemandRow } from './_components/runtime/demand-row';
export { TimelineCanvas } from './_components/runtime/timeline-canvas';
export { AccountTimelineSection } from './_components/runtime/timeline.account-view';
export { WorkspaceTimeline } from './_components/runtime/timeline.workspace-view';
