/**
 * scheduling.slice — _queries.ts
 *
 * Application-layer read operations for the scheduling bounded context.
 *
 * [D4]  All read queries for scheduling MUST route through projection views.
 * [QGWAY_SCHED] Eligible-member queries use ORG_ELIGIBLE_MEMBER_VIEW
 *   via the projection-bus — never read the Firestore source directly.
 *
 * Per docs/architecture/README.md:
 *   Presentation layer calls these; they delegate to projection-bus read models.
 */

import {
  getOrgEligibleMembers,
  getOrgEligibleMembersWithTier,
  getOrgMemberEligibility,
  getOrgMemberEligibilityWithTier,
} from '@/features/projection.bus';

export type { OrgEligibleMemberView, OrgMemberSkillWithTier } from '@/features/projection.bus';

// ─── Eligible-member queries (QGWAY_SCHED) ────────────────────────────────────

/**
 * Returns all eligible members for a schedule, with skill-tier computation.
 * Routes through ORG_ELIGIBLE_MEMBER_VIEW projection (QGWAY_SCHED).
 */
export async function getEligibleMembersForSchedule(
  orgId: string
): ReturnType<typeof getOrgEligibleMembersWithTier> {
  return getOrgEligibleMembersWithTier(orgId);
}

/**
 * Returns a single eligible member for a schedule, with skill-tier computation.
 * Routes through ORG_ELIGIBLE_MEMBER_VIEW projection (QGWAY_SCHED).
 */
export async function getEligibleMemberForSchedule(
  orgId: string,
  memberId: string
): ReturnType<typeof getOrgMemberEligibilityWithTier> {
  return getOrgMemberEligibilityWithTier(orgId, memberId);
}

// ─── Raw eligibility (internal use, no tier computation) ─────────────────────

export { getOrgEligibleMembers as getRawEligibleMembers };
export { getOrgMemberEligibility as getRawMemberEligibility };
