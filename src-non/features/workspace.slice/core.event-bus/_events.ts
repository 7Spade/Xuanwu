/**
 * Module: _events.ts
 * Purpose: Define workspace event names and payload contracts.
 * Responsibilities: provide type-safe event bus interfaces.
 * Constraints: deterministic logic, respect module boundaries
 */

// [?·責] 事件?稱??Payload ??TypeScript 類å?定義 (Contract)
import type {
  CostItemType,
  ParserBillingModeValue,
  ParserLineItemTypeValue,
  ParserRoutingStatusValue,
} from "@/features/semantic-graph.slice"
import type { SkillRequirement, WorkspaceScheduleProposedPayload } from "@/shared-kernel"

import type { DailyLog } from "../domain.daily/_types"
import type { WorkspaceTask } from "../domain.tasks/_types"

// WorkspaceScheduleProposedPayload is a cross-BC contract ??defined in shared-kernel.
// Re-exported for consumers that import from workspace-core.event-bus.
export type { WorkspaceScheduleProposedPayload } from '@/shared-kernel';

// =================================================================
// == Payload Interfaces
// =================================================================

export interface WorkspaceTaskCompletedPayload {
  task: WorkspaceTask
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceTaskScheduleRequestedPayload {
  taskName: string
}

export interface QualityAssuranceRejectedPayload {
  task: WorkspaceTask
  rejectedBy: string
  traceId?: string
}

export interface WorkspaceAcceptanceFailedPayload {
  task: WorkspaceTask
  rejectedBy: string
  traceId?: string
}

export interface WorkspaceQualityAssuranceApprovedPayload {
  task: WorkspaceTask
  approvedBy: string
}

export interface WorkspaceAcceptancePassedPayload {
  task: WorkspaceTask
  acceptedBy: string
}

export interface DocumentParserItemsExtractedPayload {
  sourceDocument: string
  intentId: string
  intentVersion: number
  /** When true, import should execute immediately without an extra confirmation toast. */
  autoImport?: boolean
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    discount?: number
    subtotal: number
    /**
     * Layer-2 Semantic Classification (VS8) ??populated during the document parse
      * phase by `classifyCostItem`.  Routing is resolved separately via
      * `routingStatus` so downstream handlers do not overload CostItemType as a
      * process status flag.
     */
    costItemType: CostItemType
    /** Parser-level business type for downstream UI/reporting. */
    lineItemType?: ParserLineItemTypeValue
    /** Parser routing result; TASK_CANDIDATE items are materialized as WorkspaceTask. */
    routingStatus?: ParserRoutingStatusValue
    /** Parser-inferred billing mode for finance lifecycle hints. */
    billingMode?: ParserBillingModeValue
    /**
     * Canonical semantic tag slug aligned with VS8 tag taxonomy.
     */
    semanticTagSlug: string
    /**
     * 0-based original row index from ParsingIntent lineItems.
     */
    sourceIntentIndex: number
    /** Organization-scoped task type slug resolved from VS4 org semantic dictionary. */
    taskTypeSlug?: string
    /** Organization-scoped task type label resolved from VS4 org semantic dictionary. */
    taskTypeName?: string
    /** Task-specific skill requirements resolved from task-type dictionary. */
    requiredSkills?: SkillRequirement[]
  }>
  /** Skill requirements extracted from the document, forwarded to schedule proposals. */
  skillRequirements?: SkillRequirement[]
  /**
   * When this parse supersedes a prior intent, the old intent ID is forwarded so
   * the import handler can reconcile existing tasks instead of creating duplicates [#A4].
   * Tasks linked to the old intent that are still in `todo` state will be updated in-place;
   * tasks in any other state (doing / blocked / completed / ?? will get a new task created.
   */
  oldIntentId?: string
}

/**
 * IntentDeltaProposed ??emitted by a ParsingIntent Digital Twin [#A4].
 *
 * Per 00-logic-overview.md: PARSE_INT -.->|"IntentDeltaProposed [#A4]"| A_TASKS
 * Invariant #A4: ParsingIntent only allows proposing events (CQS ??no direct mutation).
 *
 * This event is persisted to the ws-outbox Firestore collection [S1][E5] for
 * at-least-once delivery via the OUTBOX_RELAY_WORKER [R1].
 */
export interface IntentDeltaProposedPayload {
  /** The ParsingIntent Digital Twin that produced this delta. */
  intentId: string
  intentVersion: number
  workspaceId: string
  sourceFileName: string
  /** Number of line-item task drafts in this delta. */
  taskDraftCount: number
  /**
   * When this parse supersedes a prior intent, the old intent ID is included so
   * consumers can reconcile state (e.g. retract draft tasks linked to the old intent) [#A4].
   */
  oldIntentId?: string
  /** Skill requirements forwarded to the tasks system for eligibility checks [TE_SK]. */
  skillRequirements?: SkillRequirement[]
  /** [R8] TraceID for end-to-end audit trail propagation. */
  traceId?: string
}

export interface DailyLogForwardRequestedPayload {
  log: DailyLog
  targetCapability: "tasks" | "issues"
  action: "create"
}

export interface FileSendToParserPayload {
  fileName: string
  fileType: string
  /** Distinguishes OCR extraction vs semantic parsing entry intent. */
  parseMode?: "document-ai" | "genkit-ai"
  /** Describes the selected source object category from Files UI. */
  sourceType?: "original" | "structured-sidecar"
  /** Optional UI trigger marker for audit and diagnostics. */
  triggeredFrom?: "files-table-row" | "files-expanded-panel"
  /** The WorkspaceFile document ID ??used by the parser to record a SourcePointer in ParsingIntent. */
  fileId?: string
  /** The selected file version ID to resolve a deterministic storage object for parsing. */
  versionId?: string
  /** Optional persisted storage path for the selected version. */
  storagePath?: string
  /** Optional legacy URL kept for backwards compatibility and user-side open/download actions. */
  downloadURL?: string
}

export interface WorkspaceIssueResolvedPayload {
  issueId: string
  issueTitle: string
  resolvedBy: string
  /** SourcePointer: ID of the A-track task to unblock after resolution (Discrete Recovery). */
  sourceTaskId?: string
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceDocumentParserFailedPayload {
  sourceDocument: string
  reason: string
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceWorkflowBlockedPayload {
  workflowId: string
  issueId: string
  blockedByCount: number
  traceId?: string
}

export interface WorkspaceWorkflowUnblockedPayload {
  workflowId: string
  issueId: string
  blockedByCount: number
  traceId?: string
}

export interface WorkspaceFinanceDisbursementFailedPayload {
  taskId: string
  taskTitle: string
  amount: number
  reason: string
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceFinanceCompletedPayload {
  cycleIndex: number
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceTaskBlockedPayload {
  task: WorkspaceTask
  reason?: string
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

export interface WorkspaceTaskAssignedPayload {
  taskId: string
  taskName: string
  /** Branded assignee account ID */
  assigneeId: string
  workspaceId: string
  /** SourcePointer: the IntentID that originated this task, if any. */
  sourceIntentId?: string
  /** [TE_SK] Skill requirements from the originating task ??forwarded to the schedule proposal for VS6 eligibility checks. */
  requiredSkills?: SkillRequirement[]
  /** TraceID from the originating EventEnvelope ??required for R8 audit trail. */
  traceId?: string
}

// =================================================================
// Event Name Registry (Discriminated Union)
// =================================================================

export type WorkspaceEventName =
  | "workspace:tasks:completed"
  | "workspace:tasks:scheduleRequested"
  | "workspace:tasks:blocked"
  | "workspace:tasks:assigned"
  | "workspace:schedule:proposed"
  | "workspace:quality-assurance:rejected"
  | "workspace:acceptance:failed"
  | "workspace:quality-assurance:approved"
  | "workspace:acceptance:passed"
  | "workspace:document-parser:itemsExtracted"
  | "workspace:document-parser:failed"
  | "workspace:files:sendToParser"
  | "workspace:issues:resolved"
  | "workspace:workflow:blocked"
  | "workspace:workflow:unblocked"
  | "workspace:finance:disburseFailed"
  | "workspace:finance:completed"
  | "daily:log:forwardRequested"
  | "workspace:parsing-intent:deltaProposed"

// =================================================================
// Event-to-Payload Mapping (Type-Safe Constraint)
// =================================================================

export interface WorkspaceEventPayloadMap {
  "workspace:tasks:completed": WorkspaceTaskCompletedPayload
  "workspace:tasks:scheduleRequested": WorkspaceTaskScheduleRequestedPayload
  "workspace:tasks:blocked": WorkspaceTaskBlockedPayload
  "workspace:tasks:assigned": WorkspaceTaskAssignedPayload
  "workspace:schedule:proposed": WorkspaceScheduleProposedPayload
  "workspace:quality-assurance:rejected": QualityAssuranceRejectedPayload
  "workspace:acceptance:failed": WorkspaceAcceptanceFailedPayload
  "workspace:quality-assurance:approved": WorkspaceQualityAssuranceApprovedPayload
  "workspace:acceptance:passed": WorkspaceAcceptancePassedPayload
  "workspace:document-parser:itemsExtracted": DocumentParserItemsExtractedPayload
  "workspace:document-parser:failed": WorkspaceDocumentParserFailedPayload
  "workspace:files:sendToParser": FileSendToParserPayload
  "workspace:issues:resolved": WorkspaceIssueResolvedPayload
  "workspace:workflow:blocked": WorkspaceWorkflowBlockedPayload
  "workspace:workflow:unblocked": WorkspaceWorkflowUnblockedPayload
  "workspace:finance:disburseFailed": WorkspaceFinanceDisbursementFailedPayload
  "workspace:finance:completed": WorkspaceFinanceCompletedPayload
  "daily:log:forwardRequested": DailyLogForwardRequestedPayload
  "workspace:parsing-intent:deltaProposed": IntentDeltaProposedPayload
}

export type WorkspaceEventPayload<T extends WorkspaceEventName> =
  WorkspaceEventPayloadMap[T]

// =================================================================
// Handler and Function Type Definitions
// =================================================================

export type WorkspaceEventHandler<T extends WorkspaceEventName> = (
  payload: WorkspaceEventPayload<T>
) => Promise<void> | void

export type PublishFn = <T extends WorkspaceEventName>(
  type: T,
  payload: WorkspaceEventPayload<T>
) => void

export type SubscribeFn = <T extends WorkspaceEventName>(
  type: T,
  handler: WorkspaceEventHandler<T>
) => () => void // Returns an unsubscribe function
