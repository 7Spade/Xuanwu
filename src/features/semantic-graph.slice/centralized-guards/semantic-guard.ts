/**
 * @deprecated Use invariant-guard.ts instead.
 * Backward-compatibility re-export shim. All canonical exports now live in
 * centralized-guards/invariant-guard.ts [D21-H D21-K].
 */
export {
  validateEdgeProposal,
} from './invariant-guard';
export type {
  EdgeProposal,
  SemanticGuardDecision,
  SemanticGuardRejectionCode,
  SemanticGuardResult,
} from './invariant-guard';
