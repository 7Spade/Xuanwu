/**
 * Module: semantic-graph.slice/proposal-stream ??— Relationship Proposal Stream
 *
 * Asynchronous proposal review pipeline for Knowledge Graph edge governance (支柱一 🧠).
 *
 * Responsibilities:
 *   - Receive proposals from wiki-editor/.
 *   - Persist proposals as pending items in the proposal queue.
 *   - Drive the consensus-validation lifecycle (pending ??approved / rejected).
 *   - Approved proposals are committed to the Knowledge Graph edge store via _actions.ts [KG-1].
 *
 * @see docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md
 */

import type { TagSlugRef } from '@/shared-kernel';

import type { SemanticRelationType } from '../_types';

// ??? Types ????????????????????????????????????????????????????????????????????

/** Opaque proposal identifier. */
export type ProposalId = string & { readonly _brand: 'ProposalId' };

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface RelationshipProposal {
  readonly proposalId: ProposalId;
  readonly fromTagSlug: TagSlugRef;
  readonly toTagSlug: TagSlugRef;
  readonly relationType: SemanticRelationType;
  /** Proposed edge weight in (0, 1]. */
  readonly weight: number;
  readonly proposedBy: string;
  readonly proposedAt: string;
  status: ProposalStatus;
  rejectionReason?: string;
  resolvedAt?: string;
}

// ??? Internal queue ???????????????????????????????????????????????????????????

const _proposals = new Map<string, RelationshipProposal>();
let _seq = 0;

function _newId(): ProposalId {
  return `proposal-${Date.now()}-${++_seq}` as ProposalId;
}

// ??? Public API ???????????????????????????????????????????????????????????????

/**
 * Persist a new relationship proposal in the pending queue.
 * Returns the assigned ProposalId.
 */
export function enqueueProposal(
  proposal: Omit<RelationshipProposal, 'proposalId' | 'status'>,
): ProposalId {
  const id = _newId();
  _proposals.set(id, { ...proposal, proposalId: id, status: 'pending' });
  return id;
}

/**
 * Approve a pending proposal.
 * The caller is responsible for committing the approved edge via _actions.ts [KG-1].
 */
export function approveProposal(proposalId: ProposalId): void {
  const p = _proposals.get(proposalId);
  if (!p) throw new Error(`[SIMA] Unknown proposal: ${proposalId}`);
  if (p.status !== 'pending') throw new Error(`[SIMA] Proposal ${proposalId} is not pending`);
  p.status = 'approved';
  p.resolvedAt = new Date().toISOString();
}

/**
 * Reject a pending proposal with a reason.
 */
export function rejectProposal(proposalId: ProposalId, reason: string): void {
  const p = _proposals.get(proposalId);
  if (!p) throw new Error(`[SIMA] Unknown proposal: ${proposalId}`);
  if (p.status !== 'pending') throw new Error(`[SIMA] Proposal ${proposalId} is not pending`);
  p.status = 'rejected';
  p.rejectionReason = reason;
  p.resolvedAt = new Date().toISOString();
}

/**
 * Return all proposals currently in the pending state.
 */
export function listPendingProposals(): readonly RelationshipProposal[] {
  return Array.from(_proposals.values()).filter((p) => p.status === 'pending');
}

/** Return all proposals regardless of status. */
export function listAllProposals(): readonly RelationshipProposal[] {
  return Array.from(_proposals.values());
}

/** Clear all proposals (used in tests). */
export function _clearProposalsForTest(): void {
  _proposals.clear();
  _seq = 0;
}

