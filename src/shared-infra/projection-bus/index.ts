/**
 * projection-bus — Public API
 *
 * VS8 Projection Bus: the unified entry point, version registry, and home for
 * all projection view sub-slices.
 *
 * Nodes:
 *   - EVENT_FUNNEL_INPUT: routes events from all buses to individual projection handlers
 *   - PROJECTION_VERSION: event stream offset + read-model version table
 *   - READ_MODEL_REGISTRY: query handler registration for infra.gateway-query
 *
 * Sub-slices (projection views):
 *   account-audit-view       — ACCOUNT_PROJECTION_AUDIT
 *   account-skill-view       — ACCOUNT_SKILL_VIEW [#12][#13] STD
 *   account-view             — ACCOUNT_PROJECTION_VIEW (FCM token, authority snapshot)
 *   demand-board-view        — DEMAND_BOARD_PROJECTION
 *   global-audit-view        — GLOBAL_AUDIT_VIEW [R8]
 *   org-eligible-member-view — ORG_ELIGIBLE_MEMBER_VIEW [#14–#16]
 *   organization-view        — ORGANIZATION_PROJECTION_VIEW
 *   schedule-calendar-view   — SCHEDULE_CALENDAR_VIEW 日期維度 [S4] STD
 *   schedule-timeline-view   — SCHEDULE_TIMELINE_VIEW 資源維度 [S4] STD
 *   semantic-governance-view — SEMANTIC_GOVERNANCE_VIEW 治理頁 [A6] STD
 *   tag-snapshot-view        — TAG_SNAPSHOT [T5]
 *   workspace-scope-guard-view — WORKSPACE_SCOPE_READ_MODEL [#A9]
 *   workspace-view           — WORKSPACE_PROJECTION_VIEW
 *
 * Per 00-logic-overview.md (VS8 Projection Bus):
 *   WORKSPACE_EVENT_BUS + ORGANIZATION_EVENT_BUS + TAG_LIFECYCLE_BUS
 *     → EVENT_FUNNEL_INPUT → all projection slices
 *
 * External consumers import from '@/shared-infra/projection-bus'.
 * Consumers call once at app startup:
 *   registerWorkspaceFunnel(bus)
 *   registerOrganizationFunnel()
 *   registerTagFunnel()
 *   registerAllQueryHandlers()
 */

// =================================================================
// Event Funnel (EVENT_FUNNEL_INPUT — sole projection write path #9)
// =================================================================
export {
  registerWorkspaceFunnel,
  registerOrganizationFunnel,
  registerTagFunnel,
  replayWorkspaceProjections,
} from './_funnel';

// =================================================================
// Projection Registry (PROJECTION_VERSION — event stream offset)
// =================================================================
export {
  getProjectionVersion,
  upsertProjectionVersion,
  type ProjectionVersionRecord,
} from './_registry';

// =================================================================
// Query Registration (READ_MODEL_REGISTRY — GW_QUERY routes)
// =================================================================
export { registerAllQueryHandlers } from './_query-registration';

// =================================================================
// account-audit-view — ACCOUNT_PROJECTION_AUDIT
// =================================================================
export { getAccountAuditEntries, appendAuditEntry } from './account-audit-view';
export type { AuditProjectionEntry } from './account-audit-view';

// =================================================================
// account-view — ACCOUNT_PROJECTION_VIEW [#6][#8]
// =================================================================
export { getAccountView, getAccountAuthoritySnapshot, getAccountMembershipTag } from './account-view';
export { projectAccountSnapshot, applyOrgRoleChange, applyAuthoritySnapshot } from './account-view';
export type { AccountViewRecord } from './account-view';

// =================================================================
// global-audit-view — GLOBAL_AUDIT_VIEW [R8]
// =================================================================
export { applyAuditEvent } from './global-audit-view';
export { getGlobalAuditEvents, getGlobalAuditEventsByWorkspace } from './global-audit-view';
export type { GlobalAuditRecord, GlobalAuditQuery } from './global-audit-view';

// =================================================================
// org-eligible-member-view — ORG_ELIGIBLE_MEMBER_VIEW [#14–#16][R7]
// =================================================================
export {
  initOrgMemberEntry,
  removeOrgMemberEntry,
  applyOrgMemberSkillXp,
  updateOrgMemberEligibility,
} from './org-eligible-member-view';
export {
  getOrgMemberEligibility,
  getOrgEligibleMembers,
  getOrgMemberEligibilityWithTier,
  getOrgEligibleMembersWithTier,
  getAllOrgMembersView,
} from './org-eligible-member-view';
export type {
  OrgEligibleMemberEntry,
  OrgMemberSkillWithTier,
  OrgEligibleMemberView,
} from './org-eligible-member-view';

// =================================================================
// organization-view — ORGANIZATION_PROJECTION_VIEW
// =================================================================
export { getOrganizationView, getOrganizationMemberIds } from './organization-view';
export { projectOrganizationSnapshot, applyMemberJoined, applyMemberLeft } from './organization-view';
export type { OrganizationViewRecord } from './organization-view';

// =================================================================
// tag-snapshot-view — TAG_SNAPSHOT [T5][S4]
// =================================================================
export {
  applyTagCreated,
  applyTagUpdated,
  applyTagDeprecated,
  applyTagDeleted,
} from './tag-snapshot-view';
export { getTagSnapshot, getAllTagSnapshots, getActiveTagSnapshots } from './tag-snapshot-view';
export type { TagSnapshotEntry } from './tag-snapshot-view';

// =================================================================
// account-schedule-view — ACCOUNT_SCHEDULE_PROJECTION [S2] STD ≤10s
// =================================================================
export {
  initAccountScheduleProjection,
  applyScheduleAssigned,
  applyScheduleCompleted,
} from './account-schedule-view';
export type {
  AccountScheduleProjection,
  AccountScheduleAssignment,
} from './account-schedule-view';
export { getAccountScheduleProjection, getAccountActiveAssignments } from './account-schedule-view';

// =================================================================
// demand-board-view — DEMAND_BOARD_PROJECTION
// =================================================================
export {
  applyDemandProposed,
  applyDemandAssigned,
  applyDemandCompleted,
  applyDemandAssignmentCancelled,
  applyDemandProposalCancelled,
  applyDemandAssignRejected,
} from './demand-board-view';
export {
  getDemandBoardItem,
  getOpenDemandBoardItems,
  getDemandBoardItemsByStatus,
} from './demand-board-view';

// =================================================================
// account-skill-view — ACCOUNT_SKILL_VIEW [#12][#13] STD ≤10s
// =================================================================
export { applySkillXpAdded, applySkillXpDeducted } from './account-skill-view';
export { getAccountSkillView, getAccountSkillEntry, getAllAccountSkills } from './account-skill-view';
export type { AccountSkillEntry, AccountSkillView } from './account-skill-view';

// =================================================================
// schedule-calendar-view — SCHEDULE_CALENDAR_VIEW 日期維度 [S4] STD ≤10s
// =================================================================
export { applyScheduleCalendarUpsert, applyScheduleCalendarRemove } from './schedule-calendar-view';
export { getScheduleCalendarDay, getAllScheduleCalendarDays } from './schedule-calendar-view';
export type { CalendarSlot, ScheduleCalendarDayView } from './schedule-calendar-view';

// =================================================================
// schedule-timeline-view — SCHEDULE_TIMELINE_VIEW 資源維度 [S4] STD ≤10s
// =================================================================
export { applyTimelineUpsert, applyTimelineRemove } from './schedule-timeline-view';
export { getScheduleTimelineForMember, getAllScheduleTimelines } from './schedule-timeline-view';
export type { TimelineBlock, ScheduleTimelineMemberView } from './schedule-timeline-view';

// =================================================================
// semantic-governance-view — SEMANTIC_GOVERNANCE_VIEW 治理頁 [A6] STD ≤10s
// =================================================================
export {
  applyTagWikiUpdated,
  applyGovernanceProposalUpserted,
  applyTagRelationshipsUpdated,
} from './semantic-governance-view';
export {
  getSemanticGovernanceView,
  getActiveGovernanceProposals,
  getTagRelationships,
  getAllSemanticGovernanceViews,
} from './semantic-governance-view';
export type {
  ProposalStatus,
  GovernanceProposal,
  TagRelationshipEntry,
  SemanticGovernanceTagView,
} from './semantic-governance-view';

// =================================================================
// workspace-scope-guard-view — WORKSPACE_SCOPE_READ_MODEL [#A9] CRITICAL ≤500ms
// =================================================================
export { getScopeGuardView, queryWorkspaceAccess } from './workspace-scope-guard-view';
export { initScopeGuardView, applyGrantEvent } from './workspace-scope-guard-view';
export { buildAuthoritySnapshot } from './workspace-scope-guard-view';
export type { WorkspaceScopeGuardView, WorkspaceScopeGrantEntry } from './workspace-scope-guard-view';

// =================================================================
// workspace-view — WORKSPACE_PROJECTION_VIEW
// =================================================================
export { getWorkspaceView, getWorkspaceCapabilities } from './workspace-view';
export { projectWorkspaceSnapshot, applyCapabilityUpdate } from './workspace-view';
export type { WorkspaceViewRecord } from './workspace-view';

// =================================================================
// acl-projection-view — ACL_PROJECTION [D31] CRITICAL ≤500ms
// =================================================================
export { applyAclPermissionChanged, applyAclPermissionRevoked } from './acl-projection-view';
export type { AclProjectionEntry, AclPermission } from './acl-projection-view';
export { getAclProjectionEntry, hasAclPermission } from './acl-projection-view';

// =================================================================
// tasks-view — TASKS_VIEW [D27-Order] STD ≤10s
// =================================================================
export { applyTaskUpserted, applyTaskStatusChanged } from './tasks-view';
export type { TaskViewEntry, TaskStatus } from './tasks-view';
export { getTaskViewEntry, getTasksView, getTasksViewByStatus } from './tasks-view';

// =================================================================
// workspace-graph-view — WORKSPACE_GRAPH_VIEW STD ≤10s
// =================================================================
export { applyGraphNodeUpserted, applyGraphEdgeUpserted, applyGraphNodeRemoved } from './workspace-graph-view';
export type { WorkspaceGraphView, GraphNode, GraphEdge } from './workspace-graph-view';
export { getWorkspaceGraphView, getWorkspaceGraphNodes, getWorkspaceGraphEdges } from './workspace-graph-view';

// =================================================================
// finance-staging-pool-view — FINANCE_STAGING_POOL [#A20] STD ≤10s
// =================================================================
export { applyTaskAcceptedToPool, applyFinanceStagingLocked, applyFinanceStagingRemoved } from './finance-staging-pool-view';
export type { FinanceStagingEntry, FinanceStagingStatus } from './finance-staging-pool-view';
export { getFinanceStagingPool, getFinanceStagingByStatus, getPendingFinanceStagingItems } from './finance-staging-pool-view';

// =================================================================
// task-finance-label-view — TASK_FINANCE_LABEL_VIEW [#A22] STD ≤10s
// =================================================================
export { applyFinanceLabelUpdated, applyTaskAcceptedLabel } from './task-finance-label-view';
export type { TaskFinanceLabelEntry, FinanceLabelStatus } from './task-finance-label-view';
export { getTaskFinanceLabel, getTaskFinanceLabels } from './task-finance-label-view';
