/**
 * scheduling.slice — Public API
 *
 * Scheduling bounded context. Exposes queries and types for the scheduling
 * domain. All reads go through projection-bus views.
 *
 * Per docs/architecture/README.md:
 *   - External consumers import exclusively from this file.
 *   - No direct Firestore access — use projection views (QGWAY_SCHED).
 */

export {
  getEligibleMembersForSchedule,
  getEligibleMemberForSchedule,
  getRawEligibleMembers,
  getRawMemberEligibility,
} from './_queries';

export type { OrgEligibleMemberView, OrgMemberSkillWithTier } from './_queries';
