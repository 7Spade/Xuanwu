/**
 * scheduling.slice — _eligibility.ts
 *
 * Pure eligibility matching utility — extracted from startSchedulingSaga [A5]
 * to enable unit testing without Firestore dependencies.
 *
 * Invariants respected:
 *   #12  — Tier is NEVER stored; only xp is persisted. getTier(xp) computed at runtime.
 *   #14  — Schedule reads ONLY projection.org-eligible-member-view, never Account aggregate.
 *   A5   — Eligibility gate: all SkillRequirements must be satisfied for a candidate match.
 *   P4   — Eligibility check: member.eligible must be true AND all skill tiers satisfied.
 *   TE_SK — skill-requirement = tagSlug × minimumTier.
 */

import type { OrgEligibleMemberView } from '@/features/projection.bus';
import type { SkillRequirement } from '@/features/shared-kernel';

// ─── Canonical tier ordering ─────────────────────────────────────────────────

export const SAGA_TIER_ORDER = [
  'apprentice',
  'journeyman',
  'expert',
  'artisan',
  'grandmaster',
  'legendary',
  'titan',
] as const;

export type SagaTier = (typeof SAGA_TIER_ORDER)[number];

/**
 * Returns the 0-based ordinal index of a tier string within SAGA_TIER_ORDER.
 * Unknown tiers default to 0 (apprentice rank) with a warning.
 */
export function sagaTierIndex(tier: string): number {
  const idx = SAGA_TIER_ORDER.indexOf(tier as SagaTier);
  if (idx === -1) {
    console.warn(`[scheduling-eligibility] Unknown tier value "${tier}", defaulting to 0 (apprentice).`);
    return 0;
  }
  return idx;
}

/**
 * Returns the first OrgEligibleMemberView that satisfies ALL skill requirements.
 *
 * Selection criteria:
 *   1. member.eligible must be true (no conflicting assignments)
 *   2. For each SkillRequirement, member must have a skill entry whose tier index
 *      is >= the required tier index.
 *   3. Empty requirements array means any eligible member matches (no skill filter).
 *
 * Returns undefined if no qualifying candidate exists → saga transitions to 'compensated'.
 *
 * @param members      Eligible member views from projection.org-eligible-member-view [#14]
 * @param requirements Skill requirements from WorkspaceScheduleProposedPayload [TE_SK]
 */
export function findEligibleCandidate(
  members: OrgEligibleMemberView[],
  requirements: SkillRequirement[]
): OrgEligibleMemberView | undefined {
  return members.find((member) => {
    if (!member.eligible) return false;
    return requirements.every((req) => {
      const skill = member.skills.find((s) => s.skillId === req.tagSlug);
      if (!skill) return false;
      return sagaTierIndex(skill.tier) >= sagaTierIndex(req.minimumTier);
    });
  });
}
