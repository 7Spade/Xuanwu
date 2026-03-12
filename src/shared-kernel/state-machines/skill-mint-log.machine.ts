/**
 * Module: skill-mint-log.machine.ts
 * Purpose: L6 SkillMintLog aggregate state machine specification (shared-kernel)
 * Responsibilities: define the 5-stage SkillMint lifecycle state machine
 * Constraints: NO I/O, NO async, NO side effects — pure state transition rules only
 *
 * Per docs/architecture/models/domain-model.md §Aggregate 4 UserSkill / SkillMintLog.
 * Per docs/architecture/specs/contract-spec.md §SkillMint commands SC-01..SC-06.
 * Per docs/architecture/blueprints/application-service-spec.md §Saga 1 XP Settlement.
 */

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * L6 canonical stages for the SkillMintLog lifecycle.
 * Maps directly to docs/architecture/models/domain-model.md §Aggregate 4.
 */
export type SkillMintLogStage =
  | 'declared'          // SC-01: DeclareSkillMintCommand issued; intent recorded
  | 'practicing'        // SC-02: SubmitPracticingEvidenceCommand; evidence attached
  | 'under_validation'  // SC-03: SubmitForValidationCommand; validator assigned
  | 'validated'         // SC-04/SC-05: ValidationApproved or ValidationRejected terminal fork
  | 'settled';          // SC-06: XP Settlement Saga completed; XP credited to UserSkill

// ─── Event ────────────────────────────────────────────────────────────────────

export type SkillMintLogEvent =
  | 'SUBMIT_EVIDENCE'    // declared → practicing
  | 'SUBMIT_VALIDATION'  // practicing → under_validation
  | 'APPROVE'            // under_validation → validated
  | 'REJECT'             // under_validation → declared (back to evidence stage)
  | 'SETTLE';            // validated → settled (triggered by XP Settlement Saga)

// ─── Transition table ─────────────────────────────────────────────────────────

const SKILL_MINT_LOG_TRANSITIONS: Record<SkillMintLogStage, readonly SkillMintLogStage[]> = {
  declared:         ['practicing'],
  practicing:       ['under_validation'],
  under_validation: ['validated', 'declared'],   // REJECT loops back to declared
  validated:        ['settled'],
  settled:          [],                           // terminal
};

// ─── Guard ────────────────────────────────────────────────────────────────────

export const SKILL_MINT_LOG_INVALID_TRANSITION = 'SKILL_MINT_LOG_INVALID_TRANSITION' as const;

export interface SkillMintLogTransitionResult {
  readonly ok: boolean;
  readonly next?: SkillMintLogStage;
  readonly error?: typeof SKILL_MINT_LOG_INVALID_TRANSITION;
}

export function transitionSkillMintLog(
  current: SkillMintLogStage,
  target: SkillMintLogStage,
): SkillMintLogTransitionResult {
  const allowed = SKILL_MINT_LOG_TRANSITIONS[current];
  if (allowed.includes(target)) {
    return { ok: true, next: target };
  }
  return { ok: false, error: SKILL_MINT_LOG_INVALID_TRANSITION };
}

export function canTransitionSkillMintLog(
  current: SkillMintLogStage,
  target: SkillMintLogStage,
): boolean {
  return SKILL_MINT_LOG_TRANSITIONS[current].includes(target);
}
