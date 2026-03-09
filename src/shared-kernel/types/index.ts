/**
 * Module: index.ts
 * Purpose: Barrel exports for centralized shared-kernel type definitions.
 * Responsibilities: Provide a stable, single-import entry point for all shared domain types.
 * Constraints: deterministic logic, respect module boundaries
 */

// ─── Audit Log ───────────────────────────────────────────────────────────────
export type { AuditLog, AuditLogType } from './audit-log';

// ─── Daily Log ───────────────────────────────────────────────────────────────
export type { DailyLog, DailyLogComment } from './daily-log';

// ─── Document Parser ─────────────────────────────────────────────────────────
export type {
  IntentID,
  SourcePointer,
  ParsedLineItem,
  ParsingIntent,
  ParsingImportStatus,
  ParsingImport,
  ParsingIntentStatus,
  ParsingIntentSourceType,
  ParsingIntentReviewStatus,
} from './document-parser';

// ─── Finance ─────────────────────────────────────────────────────────────────
export type {
  FinanceLifecycleStage,
  FinanceDirectiveItem,
  FinanceClaimDraftEntry,
  FinanceClaimLineItem,
  FinanceStrongReadSnapshot,
  FinanceAggregateState,
} from './finance';

// ─── Notification ────────────────────────────────────────────────────────────
export type {
  NotificationChannel,
  NotificationPriority,
  TagRoutingRule,
  TagRoutingDecision,
  NotificationSourceEvent,
  NotificationDispatch,
  NotificationDispatchResult,
  NotificationDispatchError,
  NotificationSubscription,
  NotificationHubStats,
} from './notification';

// ─── Organization Semantic ───────────────────────────────────────────────────
export type {
  OrgSemanticNamespace,
  OrgSkillTypeEntry,
  OrgTaskTypeEntry,
  OrgSemanticEntry,
  ResolveOrgTaskTypeInput,
  ResolvedOrgTaskType,
} from './organization-semantic';

// ─── Search ──────────────────────────────────────────────────────────────────
export type {
  SearchDomain,
  SemanticSearchHit,
  SemanticSearchQuery,
  SemanticSearchResult,
  DateRangeFilter,
  SearchFilters,
  SearchState,
  ExecuteSearchInput,
  GroupedSearchResult,
  SearchResponse,
} from './search';
export { INITIAL_SEARCH_STATE } from './search';

// ─── Semantic Graph ──────────────────────────────────────────────────────────
export type {
  TaxonomyDimension,
  TaxonomyNode,
  SemanticIndexEntry,
  SemanticIndexStats,
  TemporalTagAssignment,
  TemporalConflict,
  TemporalConflictCheckInput,
  TemporalConflictCheckResult,
  TaxonomyTree,
  TaxonomyValidationResult,
  TaxonomyValidationError,
  TaxonomyErrorCode,
} from './semantic-graph';

// ─── Workspace ───────────────────────────────────────────────────────────────
export type {
  Workspace,
  WorkspaceLifecycleState,
  WorkspacePersonnel,
  CapabilitySpec,
  Capability,
  Address,
  WorkspaceLocation,
} from './workspace';

// ─── Workspace File ──────────────────────────────────────────────────────────
export type {
  WorkspaceFile,
  WorkspaceFileVersion,
  CreateWorkspaceFileInput,
} from './workspace-file';

// ─── Workspace Issue ─────────────────────────────────────────────────────────
export type { WorkspaceIssue, IssueComment } from './workspace-issue';

// ─── Workspace Role ──────────────────────────────────────────────────────────
export type { WorkspaceRole, WorkspaceGrant } from './workspace-role';

// ─── Workspace Task ──────────────────────────────────────────────────────────
export type { WorkspaceTask, TaskWithChildren, Location } from './workspace-task';
