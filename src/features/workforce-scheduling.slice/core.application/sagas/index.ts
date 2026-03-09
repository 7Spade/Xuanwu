/**
 * scheduling-saga ??_saga.ts
 *
 * [VS6] Scheduling orchestration saga.
 *
 * Per 00-logic-overview.md VS6:
 *   WorkspaceScheduleProposed -> OrgEligibilityCheck -> ScheduleAssigned
 *
 * State machine:
 *   pending -> eligibility_check -> assigned | compensated
 *
 * Compensation [A5]: if eligibility check fails, emits ScheduleAssignRejected
 * and transitions the saga to 'compensated'.
 *
 * Persistence: sagaStates/{sagaId} in Firestore.
 */

import {
  getEligibleMembersForScheduleFromGateway,
  getDocumentByPathFromGateway,
} from '@/shared-infra/gateway-query';
import {
  setDocumentByPathThroughGateway,
  updateDocumentByPathThroughGateway,
} from '@/shared-infra/gateway-command';
import type { WorkspaceScheduleProposedPayload } from '@/shared-kernel';

import {
  handleScheduleProposed,
  approveOrgScheduleProposal,
  cancelOrgScheduleAssignment,
} from '../../domain.main/aggregate';
import { findEligibleCandidatesForRequirements } from '../../domain.main/eligibility';
import { executeWriteOp } from '../commands/write-op';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Discrete steps the saga executes in order. */
export type SagaStep =
  | 'receive_proposal'
  | 'eligibility_check'
  | 'assign'
  | 'compensate';

/** Lifecycle states of the saga instance. */
export type SagaStatus =
  | 'pending'
  | 'eligibility_check'
  | 'assigned'
  | 'compensated';

/** Persisted saga state stored in Firestore. */
export interface SagaState {
  readonly sagaId: string;
  readonly scheduleItemId: string;
  readonly workspaceId: string;
  readonly orgId: string;
  status: SagaStatus;
  currentStep: SagaStep;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  compensationReason?: string;
  /** [R8] TraceID propagated from the originating WorkspaceScheduleProposed event. */
  traceId?: string;
}

const SAGA_COLLECTION = 'sagaStates';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sagaPath(sagaId: string): string {
  return `${SAGA_COLLECTION}/${sagaId}`;
}

async function persistSaga(state: SagaState): Promise<void> {
  await setDocumentByPathThroughGateway(
    sagaPath(state.sagaId),
    state as unknown as Record<string, unknown>
  );
}

async function updateSagaStatus(
  sagaId: string,
  patch: Partial<
    Pick<
      SagaState,
      'status' | 'currentStep' | 'completedAt' | 'compensationReason' | 'updatedAt'
    >
  >
): Promise<void> {
  await updateDocumentByPathThroughGateway(sagaPath(sagaId), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve a persisted saga state by ID.
 * Returns null if not found.
 */
export async function getSagaState(sagaId: string): Promise<SagaState | null> {
  return getDocumentByPathFromGateway<SagaState>(sagaPath(sagaId));
}

/**
 * Entry point for the VS6 scheduling saga.
 *
 * Called by the OUTBOX_RELAY_WORKER when it picks up a `workspace:schedule:proposed`
 * event from WORKSPACE_OUTBOX. Orchestrates the full saga:
 *
 *   Step 1 - receive_proposal: persist the OrgScheduleProposal
 *   Step 2 - eligibility_check: find the best eligible member [#14][R7]
 *   Step 3 - assign | compensate [A5]
 *
 * @param event   The WorkspaceScheduleProposedPayload cross-BC event.
 * @param sagaId  Caller-assigned idempotency key (`saga:${scheduleItemId}`).
 */
export async function startSchedulingSaga(
  event: WorkspaceScheduleProposedPayload,
  sagaId: string
): Promise<SagaState> {
  const now = new Date().toISOString();

  const existing = await getSagaState(sagaId);
  if (existing) {
    return existing;
  }

  // Step 1: receive_proposal
  const initialState: SagaState = {
    sagaId,
    scheduleItemId: event.scheduleItemId,
    workspaceId: event.workspaceId,
    orgId: event.orgId,
    status: 'pending',
    currentStep: 'receive_proposal',
    startedAt: now,
    updatedAt: now,
    // [R8] Persist traceId so all subsequent saga steps can propagate it.
    ...(event.traceId ? { traceId: event.traceId } : {}),
  };
  await persistSaga(initialState);
  const proposedWriteOp = handleScheduleProposed(event);
  await executeWriteOp(proposedWriteOp);

  // Step 2: eligibility_check
  await updateSagaStatus(sagaId, {
    status: 'eligibility_check',
    currentStep: 'eligibility_check',
  });

  const eligibleMembers = await getEligibleMembersForScheduleFromGateway(event.orgId);
  // requirements = [] means "any eligible member can be assigned" (no skill filtering)
  const requirements = event.skillRequirements ?? [];

  const assignments = findEligibleCandidatesForRequirements(eligibleMembers, requirements);

  // Step 3: assign or compensate [A5]
  if (!assignments || assignments.length === 0) {
    const totalNeeded = requirements.reduce((sum, r) => sum + r.quantity, 0);
    const reason =
      requirements.length > 0
        ? `Could not find enough eligible members for requirements: ${requirements.map((r) => `${r.quantity}? ${r.tagSlug}@${r.minimumTier}`).join(', ')} (needed ${totalNeeded} total)`
        : 'No eligible members found in org-eligible-member-view.';
    const completedAt = new Date().toISOString();
    await updateSagaStatus(sagaId, {
      status: 'compensated',
      currentStep: 'compensate',
      compensationReason: reason,
      completedAt,
    });
    return { ...initialState, status: 'compensated', currentStep: 'compensate', compensationReason: reason, completedAt, updatedAt: completedAt };
  }

  // Approve each candidate sequentially [A5].
  let compensationReason: string | undefined;
  const confirmedAssignments: string[] = [];
  for (const { candidate, requirement } of assignments) {
    try {
      // Pass only this candidate's specific requirement so downstream validation
      // checks them against their assigned skill slot, not all requirements.
      const approvalResult = await approveOrgScheduleProposal(
        event.scheduleItemId,
        candidate.accountId,
        event.proposedBy,
        {
          workspaceId: event.workspaceId,
          orgId: event.orgId,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          // [R8] Forward traceId from event to the approval step so published events carry the trace.
          ...(event.traceId ? { traceId: event.traceId } : {}),
        },
        requirement ? [requirement] : undefined
      );

      // [D3] Execute the write returned by the aggregate.
      await executeWriteOp(approvalResult.writeOp);

      if (approvalResult.outcome !== 'confirmed') {
        compensationReason = approvalResult.reason;
        break;
      }

      confirmedAssignments.push(candidate.accountId);
    } catch (error) {
      compensationReason =
        error instanceof Error
          ? error.message
          : `Assignment failed for member ${candidate.accountId}`;
      break;
    }
  }

  if (!compensationReason) {
    const completedAt = new Date().toISOString();
    await updateSagaStatus(sagaId, {
      status: 'assigned',
      currentStep: 'assign',
      completedAt,
    });
    return { ...initialState, status: 'assigned', currentStep: 'assign', completedAt, updatedAt: completedAt };
  }

  const rollbackFailures: string[] = [];
  for (const assignedAccountId of confirmedAssignments) {
    try {
      const rollbackWriteOp = await cancelOrgScheduleAssignment(
        event.scheduleItemId,
        event.orgId,
        event.workspaceId,
        assignedAccountId,
        event.proposedBy,
        `Saga rollback after partial failure: ${compensationReason}`,
        event.traceId
      );
      await executeWriteOp(rollbackWriteOp);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown rollback failure';
      rollbackFailures.push(`${assignedAccountId}: ${message}`);
    }
  }

  const finalizedCompensationReason =
    rollbackFailures.length > 0
      ? `${compensationReason} | rollback failures: ${rollbackFailures.join('; ')}`
      : compensationReason;

  const completedAt = new Date().toISOString();
  await updateSagaStatus(sagaId, {
    status: 'compensated',
    currentStep: 'compensate',
    compensationReason: finalizedCompensationReason,
    completedAt,
  });
  return {
    ...initialState,
    status: 'compensated',
    currentStep: 'compensate',
    compensationReason: finalizedCompensationReason,
    completedAt,
    updatedAt: completedAt,
  };
}
