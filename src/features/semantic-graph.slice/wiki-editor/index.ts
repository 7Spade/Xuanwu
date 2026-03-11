/**
 * Module: semantic-graph.slice/wiki-editor — Relationship Governance Editor
 *
 * Knowledge governance layer: tag relationship proposals, consensus validation,
 * and the relationship visualiser UI surface.
 *
 * Responsibilities:
 *   - Accept tag-relationship proposals from authorised contributors.
 *   - Route proposals to proposal-stream/ for async review.
 *   - Enforce governance rules before proposals enter proposal-stream.
 *
 * @see docs/architecture/03-Slices/VS8-SemanticBrain/architecture.md
 */

import type { TagSlugRef } from '@/shared-kernel';

import type { SemanticRelationType } from '../_types';
import {
  type ProposalId,
  type RelationshipProposal,
  enqueueProposal,
  listAllProposals,
} from '../proposal-stream';

// ??? Types ????????????????????????????????????????????????????????????????????

export interface ProposalSubmission {
  readonly fromTagSlug: TagSlugRef;
  readonly toTagSlug: TagSlugRef;
  readonly relationType: SemanticRelationType;
  /** Proposed edge weight in (0, 1]. */
  readonly weight: number;
  /** Submitter identifier (userId or service account). */
  readonly submittedBy: string;
}

// ??? Governance validation ????????????????????????????????????????????????????

/**
 * Minimal governance pre-check before a proposal enters proposal-stream.
 *
 * Rules enforced here:
 *   - Self-loops are rejected (from === to).
 *   - Weight must be in (0, 1].
 *   - Duplicate pending proposals for the same edge are rejected.
 */
function _validateSubmission(
  submission: ProposalSubmission,
  existing: readonly RelationshipProposal[],
): void {
  if ((submission.fromTagSlug as string) === (submission.toTagSlug as string)) {
    throw new Error('[SIMA] Self-loop proposals are not allowed');
  }
  if (submission.weight <= 0 || submission.weight > 1) {
    throw new Error(`[SIMA] Proposal weight must be in (0, 1], got: ${submission.weight}`);
  }
  const alreadyPending = existing.some(
    (p) =>
      p.status === 'pending' &&
      (p.fromTagSlug as string) === (submission.fromTagSlug as string) &&
      (p.toTagSlug as string) === (submission.toTagSlug as string) &&
      p.relationType === submission.relationType,
  );
  if (alreadyPending) {
    throw new Error(
      `[SIMA] A pending proposal already exists for edge ${submission.fromTagSlug as string}→${submission.toTagSlug as string}`,
    );
  }
}

// ??? Public API ???????????????????????????????????????????????????????????????

/**
 * Submit a new tag-relationship proposal for async review.
 *
 * Governance pre-checks are applied before the proposal enters the stream.
 * On success returns the assigned ProposalId.
 *
 * @throws if governance validation fails.
 */
export function submitProposal(submission: ProposalSubmission): ProposalId {
  const existing = listAllProposals();
  _validateSubmission(submission, existing);
  return enqueueProposal({
    fromTagSlug: submission.fromTagSlug,
    toTagSlug: submission.toTagSlug,
    relationType: submission.relationType,
    weight: submission.weight,
    proposedBy: submission.submittedBy,
    proposedAt: new Date().toISOString(),
  });
}

/**
 * Return the proposal history for a given tag slug
 * (proposals where the slug appears as source or target).
 */
export function getProposalHistory(tagSlug: TagSlugRef): readonly RelationshipProposal[] {
  return listAllProposals().filter(
    (p) =>
      (p.fromTagSlug as string) === (tagSlug as string) ||
      (p.toTagSlug as string) === (tagSlug as string),
  );
}

