/**
 * Module: index.ts
 * Purpose: expose canonical shared-kernel public API
 * Responsibilities: provide a stable VS0 entrypoint with explicit named exports
 * Constraints: deterministic logic, respect module boundaries
 */

export type {
	EventEnvelope,
	ImplementsEventEnvelopeContract,
} from './data-contracts/event-envelope';

export type {
	AuthoritySnapshot,
	ImplementsAuthoritySnapshotContract,
} from './data-contracts/authority-snapshot';

export type {
	SkillTier,
	TierDefinition,
	SkillRequirement,
	SkillTag,
	SkillGrant,
	WorkspaceScheduleProposedPayload,
	ImplementsScheduleProposedPayloadContract,
} from './data-contracts/skill-tier';
export {
	TIER_DEFINITIONS,
	getTierDefinition,
	resolveSkillTier,
	getTier,
	getTierRank,
	tierSatisfies,
} from './data-contracts/skill-tier';

export type {
	AccountType,
	OrganizationRole,
	Presence,
	InviteState,
	NotificationType,
	Account,
	MemberReference,
	Team,
	ThemeConfig,
	Wallet,
	ExpertiseBadge,
	Notification,
	PartnerInvite,
} from './data-contracts/account/account-contract';

export type {
	DomainError,
	CommandSuccess,
	CommandFailure,
	CommandResult,
} from './data-contracts/command-result-contract';
export {
	commandSuccess,
	commandFailure,
	commandFailureFrom,
} from './data-contracts/command-result-contract';

export type {
	DlqTier,
	OutboxRecord,
	OutboxStatus,
	ImplementsOutboxContract,
} from './infra-contracts/outbox-contract';
export { buildIdempotencyKey } from './infra-contracts/outbox-contract';
export type { OutboxLane, OutboxRouting, OutboxAck } from './types/outbox-routing';
export { OUTBOX_LANES } from './enums/outbox-lane';
export { CostItemType } from './enums/cost-item-type';
export type { CostItemTypeValue } from './enums/cost-item-type';

export type {
	VersionGuardInput,
	VersionGuardResult,
	ImplementsVersionGuard,
} from './infra-contracts/version-guard';
export { applyVersionGuard, versionGuardAllows } from './infra-contracts/version-guard';

export type {
	ReadConsistencyMode,
	ReadConsistencyContext,
	ImplementsReadConsistency,
} from './infra-contracts/read-consistency';
export { resolveReadConsistency } from './infra-contracts/read-consistency';

export type {
	StalenessTier,
	ImplementsStalenessContract,
} from './infra-contracts/staleness-contract';
export { StalenessMs, getSlaMs, isStale } from './infra-contracts/staleness-contract';

export type {
	RateLimitConfig,
	CircuitBreakerConfig,
	BulkheadConfig,
	ResilienceContract,
	ImplementsResilienceContract,
} from './infra-contracts/resilience-contract';
export { DEFAULT_RATE_LIMIT, DEFAULT_CIRCUIT_BREAKER } from './infra-contracts/resilience-contract';

export type {
	ClaimsRefreshTrigger,
	TokenRefreshSignal,
	ClaimsRefreshOutcome,
	ClaimsRefreshHandshake,
	ClientTokenRefreshObligation,
	ImplementsTokenRefreshContract,
} from './infra-contracts/token-refresh-contract';
export {
	TOKEN_REFRESH_SIGNAL,
	CLIENT_TOKEN_REFRESH_OBLIGATION,
} from './infra-contracts/token-refresh-contract';

export { TAG_CATEGORIES, tagSlugRef } from './data-contracts/tag-authority';
export type {
	TagCategory,
	CentralizedTagDeleteRule,
	CentralizedTagEntry,
	TagSlugRef,
	TagCreatedPayload,
	TagUpdatedPayload,
	TagDeprecatedPayload,
	TagDeletedPayload,
	TagLifecycleEventPayloadMap,
	TagLifecycleEventKey,
	ITagReadPort,
	ImplementsTagStaleGuard,
} from './data-contracts/tag-authority';

export type {
	SearchDomain,
	SemanticSearchQuery,
	SemanticSearchHit,
	SemanticSearchResult,
	NotificationChannel,
	NotificationPriority,
	TaxonomyDimension,
	TaxonomyNode,
} from './data-contracts/semantic/semantic-contracts';
export { SEARCH_DOMAINS, TAXONOMY_DIMENSIONS } from './ontologys/semantic-taxonomy';
export {
	FINANCE_LIFECYCLE_STAGES,
	NON_TASK_COST_ITEM_TYPES,
} from './constants/finance';
export {
	isActiveParsingIntentStatus,
	normalizeLifecycleStage,
	getNextStageFromAction,
} from './directives/finance-lifecycle.directive';
export {
	createParsingIntentContract,
	markParsingIntentImported,
	supersedeParsingIntent,
} from './directives/parsing-intent.directive';
export {
	clampRemainingQuantity,
	hasValidClaimSelection,
	buildClaimLineItems,
} from './pipes/finance-claim.pipe';
export {
	formatBytes,
	getCurrentVersion,
	isStructuredSidecarFile,
	getStructuredRelationKey,
	getRelatedStructuredFile,
	parseDateFromUnknown,
	formatVersionDate,
	getStructuredDataSnapshot,
	getProcessingLogEntries,
} from './pipes/workspace-file-structure.pipe';
export type {
	StructuredDataSnapshot,
	FileProcessingLogEntry,
} from './pipes/workspace-file-structure.pipe';
export {
	isSafeFirestoreDocId,
	assertSafeFirestoreDocId,
} from './validators/firestore-doc-id.validator';
export { resolvePreferredTraceId } from './utils/trace.utils';
export * from './constants';
export type {
	TraceContext,
	ITraceProvider,
	EventCounters,
	IMetricsRecorder,
	DomainErrorEntry,
	IErrorLogger,
} from './observability';

export type { IAuthService, AuthUser } from './ports';
export type { IFirestoreRepo, FirestoreDoc, Timestamp, WriteOptions } from './ports';
export type { IMessaging, PushNotificationPayload } from './ports';
export type { IFileStore, UploadOptions } from './ports';

export type {
	ScheduleStatus,
	ScheduleItem,
	Location,
} from './data-contracts/scheduling/schedule-contract';

// ─── Centralized Domain Types ─────────────────────────────────────────────────
// [D19] Canonical cross-BC type definitions — centralized in shared-kernel/types.
export type { AuditLog, AuditLogType } from './types/audit-log';
export type { DailyLog, DailyLogComment } from './types/daily-log';
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
} from './types/document-parser';
export type {
	FinanceLifecycleStage,
	FinanceClaimDraftEntry,
	FinanceClaimLineItem,
	FinanceStrongReadSnapshot,
} from './types/finance';
export type {
	TagRoutingRule,
	TagRoutingDecision,
	NotificationSourceEvent,
	NotificationDispatch,
	NotificationDispatchResult,
	NotificationDispatchError,
	NotificationSubscription,
	NotificationHubStats,
} from './types/notification';
export type {
	OrgSemanticNamespace,
	OrgSkillTypeEntry,
	OrgTaskTypeEntry,
	OrgSemanticEntry,
	ResolveOrgTaskTypeInput,
	ResolvedOrgTaskType,
} from './types/organization-semantic';
export type {
	DateRangeFilter,
	SearchFilters,
	SearchState,
	ExecuteSearchInput,
	GroupedSearchResult,
	SearchResponse,
} from './types/search';
export { INITIAL_SEARCH_STATE } from './types/search';
export type {
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
} from './types/semantic-graph';
export type {
	Workspace,
	WorkspaceLifecycleState,
	WorkspacePersonnel,
	CapabilitySpec,
	Capability,
	Address,
	WorkspaceLocation,
} from './types/workspace';
export type {
	WorkspaceFile,
	WorkspaceFileVersion,
	CreateWorkspaceFileInput,
} from './types/workspace-file';
export type {
	ParsingIntentContract,
	CreateParsingIntentInput,
} from './types/parsing-intent-contract';
export type { WorkspaceIssue, IssueComment } from './types/workspace-issue';
export type { WorkspaceRole, WorkspaceGrant } from './types/workspace-role';
export type { WorkspaceTask, TaskWithChildren } from './types/workspace-task';
