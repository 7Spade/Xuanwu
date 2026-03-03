/**
 * @test [A5] Scheduling Saga — eligibility matching logic
 *
 * Validates the pure eligibility-matching logic used by `startSchedulingSaga`
 * to find the best candidate, imported directly from `_eligibility.ts`.
 *
 * [A5] Compensation: if no candidate matches all skill requirements, saga
 *      transitions to 'compensated' state.
 * [P4] Eligibility check: member.eligible must be true AND all skill requirements
 *      must be satisfied by the member's skill tiers.
 * [TE_SK] skill-requirement = tagSlug × minimumTier — cross-BC staffing contract.
 */
import { describe, it, expect } from 'vitest';

import type { OrgEligibleMemberView } from '@/features/projection.bus';
import type { SkillRequirement } from '@/features/shared-kernel';
import { tierSatisfies, TIER_DEFINITIONS } from '@/features/shared-kernel/skill-tier';

import {
  SAGA_TIER_ORDER,
  sagaTierIndex,
  findEligibleCandidate,
} from './_eligibility';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('[A5] Scheduling Saga — eligibility matching [P4][TE_SK]', () => {
  describe('sagaTierIndex helper', () => {
    it('returns 0 for apprentice (lowest)', () => {
      expect(sagaTierIndex('apprentice')).toBe(0);
    });

    it('returns 6 for titan (highest)', () => {
      expect(sagaTierIndex('titan')).toBe(6);
    });

    it('returns 0 for unknown tier (safe default)', () => {
      expect(sagaTierIndex('unknown')).toBe(0);
    });

    it('returns strictly increasing indices for each tier', () => {
      for (let i = 1; i < SAGA_TIER_ORDER.length; i++) {
        expect(sagaTierIndex(SAGA_TIER_ORDER[i])).toBeGreaterThan(sagaTierIndex(SAGA_TIER_ORDER[i - 1]));
      }
    });

    it('each tier index matches its position in SAGA_TIER_ORDER', () => {
      SAGA_TIER_ORDER.forEach((tier, idx) => {
        expect(sagaTierIndex(tier)).toBe(idx);
      });
    });
  });

  describe('findEligibleCandidate — [P4] eligibility gate', () => {
    function makeMember(
      accountId: string,
      eligible: boolean,
      skills: Array<{ skillId: string; tier: string }>
    ): OrgEligibleMemberView {
      return {
        orgId: 'org-test',
        accountId,
        eligible,
        skills: skills.map(({ skillId, tier }) => ({
          skillId,
          xp: 0,
          tier: tier as OrgEligibleMemberView['skills'][number]['tier'],
        })),
      };
    }

    const expertMember = makeMember('member-1', true, [
      { skillId: 'civil-structural:concrete', tier: 'expert' },
      { skillId: 'site-management:safety', tier: 'journeyman' },
    ]);
    const apprenticeMember = makeMember('member-2', true, [
      { skillId: 'civil-structural:concrete', tier: 'apprentice' },
    ]);
    const ineligibleMember = makeMember('member-3', false, [
      { skillId: 'civil-structural:concrete', tier: 'titan' },
    ]);

    it('returns first eligible member when requirements are empty', () => {
      const result = findEligibleCandidate([expertMember, apprenticeMember], []);
      expect(result?.accountId).toBe('member-1');
    });

    it('skips ineligible members regardless of skill tier', () => {
      const result = findEligibleCandidate([ineligibleMember, expertMember], []);
      expect(result?.accountId).toBe('member-1');
    });

    it('matches member with exact tier requirement', () => {
      const reqs: SkillRequirement[] = [{ tagSlug: 'civil-structural:concrete', minimumTier: 'expert', quantity: 1 }];
      expect(findEligibleCandidate([expertMember], reqs)?.accountId).toBe('member-1');
    });

    it('matches member with higher tier than required', () => {
      const reqs: SkillRequirement[] = [{ tagSlug: 'civil-structural:concrete', minimumTier: 'journeyman', quantity: 1 }];
      expect(findEligibleCandidate([expertMember], reqs)?.accountId).toBe('member-1');
    });

    it('rejects member whose tier is below minimum [P4]', () => {
      const reqs: SkillRequirement[] = [{ tagSlug: 'civil-structural:concrete', minimumTier: 'expert', quantity: 1 }];
      expect(findEligibleCandidate([apprenticeMember], reqs)).toBeUndefined();
    });

    it('rejects member missing a required skill entirely', () => {
      const reqs: SkillRequirement[] = [{ tagSlug: 'bim:revit', minimumTier: 'journeyman', quantity: 1 }];
      expect(findEligibleCandidate([expertMember, apprenticeMember], reqs)).toBeUndefined();
    });

    it('evaluates ALL requirements (conjunction) [TE_SK]', () => {
      const reqs: SkillRequirement[] = [
        { tagSlug: 'civil-structural:concrete', minimumTier: 'expert', quantity: 1 },
        { tagSlug: 'site-management:safety', minimumTier: 'expert', quantity: 1 }, // expertMember only has journeyman here
      ];
      expect(findEligibleCandidate([expertMember], reqs)).toBeUndefined();
    });

    it('selects first matching member in list order (deterministic)', () => {
      const titanMember = makeMember('member-titan', true, [
        { skillId: 'civil-structural:concrete', tier: 'titan' },
      ]);
      const reqs: SkillRequirement[] = [{ tagSlug: 'civil-structural:concrete', minimumTier: 'journeyman', quantity: 1 }];
      expect(findEligibleCandidate([titanMember, expertMember], reqs)?.accountId).toBe('member-titan');
    });

    it('[A5] returns undefined when no member satisfies requirements → triggers compensation', () => {
      const result = findEligibleCandidate([ineligibleMember], [
        { tagSlug: 'civil-structural:concrete', minimumTier: 'expert', quantity: 1 },
      ]);
      expect(result).toBeUndefined();
    });
  });

  describe('sagaTierIndex consistency with tierSatisfies', () => {
    it('sagaTierIndex and tierSatisfies agree on ordering for all tier pairs', () => {
      const tiers = SAGA_TIER_ORDER;
      for (let i = 0; i < tiers.length; i++) {
        for (let j = 0; j < tiers.length; j++) {
          const satisfies = tierSatisfies(tiers[i], tiers[j]);
          const byIndex = sagaTierIndex(tiers[i]) >= sagaTierIndex(tiers[j]);
          expect(satisfies).toBe(byIndex);
        }
      }
    });

    it('SAGA_TIER_ORDER matches the rank order in shared-kernel TIER_DEFINITIONS', () => {
      // Ensure the saga's tier ordering never silently diverges from the canonical
      // TIER_DEFINITIONS defined in shared-kernel. If TIER_DEFINITIONS adds, removes,
      // or reorders a tier, this test will catch the mismatch.
      const canonicalOrder = TIER_DEFINITIONS.map((d) => d.tier);
      expect(SAGA_TIER_ORDER).toEqual(canonicalOrder);
    });
  });
});
