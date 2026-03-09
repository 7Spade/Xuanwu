/**
 * workspace.slice — VS5 Workspace Slice Public API
 *
 * Consolidated workspace domain modules. All VS5 sub-slices are re-exported
 * from this single entry point. External consumers import from '@/features/workspace.slice'.
 *
 * Sub-slices:
 *   core              — workspace aggregate, providers, shell, hooks
 *   core.event-bus    — in-process workspace event bus [E5]
 *   core.event-store  — append-only domain event store (replay/audit only)
 *   application       — command handler, scope guard, policy engine, tx-runner, outbox
 *   gov.role          — workspace-level role management
 *   gov.audit         — workspace and account audit views
 *   gov.audit-convergence — audit bridge / query adapter
 *   gov.members       — workspace member grants + UI
 *   gov.partners      — stub (views at account.slice/org.partner)
 *   gov.teams         — stub (views at account.slice)
 *   domain.files    — workspace file storage
 *   domain.document-parser — document parsing [A4]
 *   domain.parsing-intent  — ParsingIntent digital twin contract
 *   domain.tasks    — workspace task management
 *   domain.daily    — 施工日誌 (A-track daily log)
 *   domain.workflow — workflow aggregate + state machine [R6]
 *   domain.quality-assurance — QA capability
 *   domain.acceptance        — acceptance capability
 *   domain.issues            — B-track issues [A3]
 *
 * Finance capability (VS9) has been migrated to @/features/finance.slice.
 * finance.slice exports are re-exported here for backward compatibility.
 */

// ─── core ────────────────────────────────────────────────────────────────────
export {
  DashboardView,
  WorkspacesView,
  WorkspaceCard,
  WorkspaceGridView,
  WorkspaceNavTabs,
  WorkspaceSettingsDialog,
  WorkspaceStatusBar,
  WorkspaceTableView,
  CreateWorkspaceDialog,
  WorkspaceListHeader,
  WorkspaceProvider,
  useWorkspace,
  useAccount,
  ThemeAdapter,
  Header,
  NotificationCenter,
  AccountSwitcher,
  AccountCreateDialog,
  DashboardSidebar,
  useVisibleWorkspaces,
  useWorkspaceCommands,
  useWorkspaceEventHandler,
  useApp,
  WorkspaceCapabilities,
  handleCreateWorkspace,
  handleUpdateWorkspaceSettings,
  handleDeleteWorkspace,
  createWorkspaceWithCapabilities,
  createWorkspaceLocation,
  updateWorkspaceLocation,
  deleteWorkspaceLocation,
  uploadWorkspaceAvatar,
  WorkspaceLocationsPanel,
} from './core'
// Core workspace-domain types
export type {
  Workspace,
  WorkspaceLifecycleState,
  WorkspacePersonnel,
  CapabilitySpec,
  Capability,
  Address,
  WorkspaceLocation,
} from './core'

// ─── core.event-bus ──────────────────────────────────────────────────────────
export {
  WorkspaceEventBus,
  WorkspaceEventContext,
  useWorkspaceEvents,
  registerWorkspaceFunnel,
  registerOrganizationFunnel,
  replayWorkspaceProjections,
} from './core.event-bus'
export type {
  WorkspaceEventName,
  WorkspaceEventHandler,
  PublishFn,
  SubscribeFn,
  WorkspaceEventPayloadMap,
  WorkspaceEventPayload,
  WorkspaceTaskCompletedPayload,
  WorkspaceTaskScheduleRequestedPayload,
  QualityAssuranceRejectedPayload,
  WorkspaceAcceptanceFailedPayload,
  WorkspaceQualityAssuranceApprovedPayload,
  WorkspaceAcceptancePassedPayload,
  DocumentParserItemsExtractedPayload,
  WorkspaceDocumentParserFailedPayload,
  DailyLogForwardRequestedPayload,
  FileSendToParserPayload,
  WorkspaceIssueResolvedPayload,
  WorkspaceFinanceDisbursementFailedPayload,
  WorkspaceTaskBlockedPayload,
  WorkspaceTaskAssignedPayload,
  WorkspaceScheduleProposedPayload,
  WorkspaceEventContextType,
} from './core.event-bus'

// ─── core.event-store ────────────────────────────────────────────────────────
export {
  appendDomainEvent,
  getDomainEvents,
} from './core.event-store'
export type { StoredWorkspaceEvent } from './core.event-store'

// ─── application ─────────────────────────────────────────────────────────────
export {
  executeCommand,
  checkWorkspaceAccess,
  evaluatePolicy,
  runTransaction,
  createOutbox,
  registerOrgPolicyCache,
  getCachedOrgPolicy,
  getAllCachedPolicies,
  clearOrgPolicyCache,
} from './application'
export type {
  WorkspaceCommand,
  WorkspaceExecutorResult,
  ScopeGuardResult,
  WorkspaceRole,
  PolicyDecision,
  TransactionContext,
  TransactionResult,
  Outbox,
  OutboxEvent,
  OrgPolicyEntry,
} from './application'

// ─── gov.role ────────────────────────────────────────────────────────────────
export {
  assignWorkspaceRole,
  revokeWorkspaceRole,
  getWorkspaceGrant,
  getWorkspaceGrants,
  useWorkspaceRole,
} from './gov.role'
export type { AssignWorkspaceRoleInput, RevokeWorkspaceRoleInput, WorkspaceGrant } from './gov.role'

// ─── gov.audit ───────────────────────────────────────────────────────────────
export {
  WorkspaceAudit,
  AccountAuditComponent,
  AuditDetailSheet,
  AuditEventItem,
  AuditTimeline,
  AuditEventItemContainer,
  AuditTypeIcon,
  writeAuditLog,
  useAccountAudit,
  useWorkspaceAudit,
  useLogger,
  getAuditLogs,
} from './gov.audit'
export type { WriteAuditLogInput, AuditLogType, AuditLog } from './gov.audit'
export { default as AccountAuditView } from './gov.audit'

// ─── gov.audit-convergence ───────────────────────────────────────────────────
export {
  DEFAULT_AUDIT_QUERY_LIMIT,
  toAuditProjectionQuery,
} from './gov.audit-convergence'
export type { AuditConvergenceInput, AuditProjectionQuery } from './gov.audit-convergence'

// ─── gov.members ─────────────────────────────────────────────────────────────
export { WorkspaceMembers } from './gov.members'
// Note: getWorkspaceGrants is already exported from gov.role; gov.members re-exports it too
// Avoiding duplicate export — consumers use gov.role or gov.members via workspace.slice

// ─── domain.files ────────────────────────────────────────────────────────────
export {
  WorkspaceFiles,
  useStorage,
  useWorkspaceFilters,
  uploadDailyPhoto,
  uploadTaskAttachment,
  uploadProfilePicture,
  uploadRawFile,
  subscribeToWorkspaceFiles,
} from './domain.files'
export type { WorkspaceFileVersion, WorkspaceFile } from './domain.files'

// ─── domain.document-parser ──────────────────────────────────────────────────
export {
  WorkspaceDocumentParser,
  saveParsingIntent,
  markParsingIntentImported,
  subscribeToParsingIntents,
} from './domain.document-parser'
export type {
  IntentID,
  SourcePointer,
  ParsedLineItem,
  ParsingIntentSourceType,
  ParsingIntentReviewStatus,
  ParsingIntent,
  ParsingImportStatus,
  ParsingImport,
} from './domain.document-parser'

// ─── domain.parsing-intent ───────────────────────────────────────────────────
// Note: markParsingIntentImported (pure function) is exported as markParsingIntentContract
// to avoid collision with the server action of the same name in domain.document-parser.
export {
  createParsingIntentContract,
  markParsingIntentImported as markParsingIntentContract,
  supersedeParsingIntent,
} from './domain.parsing-intent'
export type {
  ParsingIntentContract,
  ParsingIntentStatus,
  CreateParsingIntentInput,
} from './domain.parsing-intent'

// ─── domain.tasks ────────────────────────────────────────────────────────────
export {
  WorkspaceTasks,
  createTask,
  updateTask,
  deleteTask,
  batchImportTasks,
  getWorkspaceTasks,
  getWorkspaceTask,
} from './domain.tasks'
export type { Location, WorkspaceTask, TaskWithChildren } from './domain.tasks'

// ─── domain.daily ────────────────────────────────────────────────────────────
export {
  WorkspaceDaily,
  AccountDailyComponent,
  DailyLogDialog,
  DailyLogCard,
  DailyLogComposer,
  useWorkspaceDailyLog,
  useAggregatedLogs,
  useDailyActions,
  useBookmarkActions,
  useDailyUpload,
  getDailyLogs,
} from './domain.daily'
export type { DailyLogComment, DailyLog } from './domain.daily'
export { default as AccountDailyView } from './domain.daily'

// ─── domain.workflow ─────────────────────────────────────────────────────────
export {
  WORKFLOW_STAGE_ORDER,
  createWorkflowAggregate,
  canAdvanceWorkflowStage,
  advanceWorkflowStage,
  blockWorkflow,
  isWorkflowUnblocked,
  loadWorkflowState,
  saveWorkflowState,
  updateWorkflowState,
  findWorkflowsBlockedByIssue,
  findWorkflowsByStage,
  listWorkflowStates,
  handleIssueResolvedForWorkflow,
} from './domain.workflow'
export type { WorkflowStage, WorkflowAggregateState } from './domain.workflow'

// ─── domain.quality-assurance ────────────────────────────────────────────────
export { WorkspaceQualityAssurance } from './domain.quality-assurance'

// ─── domain.acceptance ───────────────────────────────────────────────────────
export { WorkspaceAcceptance } from './domain.acceptance'

// ─── domain.finance ──────────────────────────────────────────────────────────
// Finance capability migrated to finance.slice (VS9).
// Re-exported here for backward compatibility.
export {
  WorkspaceFinance,
  getFinanceAggregateState,
  saveFinanceAggregateState,
} from '@/features/finance.slice'
export type { FinanceAggregateState } from '@/features/finance.slice'

// ─── domain.issues ───────────────────────────────────────────────────────────
export {
  WorkspaceIssues,
  createIssue,
  addCommentToIssue,
  resolveIssue,
} from './domain.issues'
export type { IssueComment, WorkspaceIssue } from './domain.issues'

// ─── workspace rules ─────────────────────────────────────────────────────────
export {
  filterVisibleWorkspaces,
  hasWorkspaceAccess,
  isWorkspaceVisibleToUser,
} from './_workspace.rules'
export { buildTaskTree } from './_task.rules'
