/**
 * @test skill-tier pure functions — SK_SKILL_TIER [#12] + SK_SKILL_REQ [A5]
 *
 * Validates the canonical tier computation functions used by:
 *   — scheduling.slice eligibility checks [A5][P4]
 *   — projection.org-eligible-member-view
 *   — workspace.slice staffing requirements
 *
 * Invariant #12: Tier is ALWAYS derived (never persisted to DB).
 * SK_SKILL_REQ: skill-requirement = tagSlug × minimumTier — cross-BC staffing contract.
 */
import { describe, it, expect } from 'vitest';
import {
  getTier,
  getTierRank,
  getTierDefinition,
  tierSatisfies,
  TIER_DEFINITIONS,
  resolveSkillTier,
} from '@/features/shared-kernel/skill-tier';

describe('SK_SKILL_TIER — canonical tier functions [#12]', () => {
  describe('TIER_DEFINITIONS', () => {
    it('defines exactly 7 tiers', () => {
      expect(TIER_DEFINITIONS).toHaveLength(7);
    });

    it('has ranks from 1 to 7 with no gaps', () => {
      const ranks = TIER_DEFINITIONS.map((d) => d.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('has monotonically increasing XP thresholds', () => {
      for (let i = 1; i < TIER_DEFINITIONS.length; i++) {
        expect(TIER_DEFINITIONS[i].minXp).toBeGreaterThan(TIER_DEFINITIONS[i - 1].minXp);
      }
    });
  });

  describe('getTier(xp) — Invariant #12', () => {
    it('returns apprentice for xp = 0', () => {
      expect(getTier(0)).toBe('apprentice');
    });

    it('returns apprentice for xp = 1 (within apprentice band)', () => {
      expect(getTier(1)).toBe('apprentice');
    });

    it('returns journeyman at boundary xp = 75', () => {
      expect(getTier(75)).toBe('journeyman');
    });

    it('returns expert at boundary xp = 150', () => {
      expect(getTier(150)).toBe('expert');
    });

    it('returns artisan at boundary xp = 225', () => {
      expect(getTier(225)).toBe('artisan');
    });

    it('returns grandmaster at boundary xp = 300', () => {
      expect(getTier(300)).toBe('grandmaster');
    });

    it('returns legendary at boundary xp = 375', () => {
      expect(getTier(375)).toBe('legendary');
    });

    it('returns titan at boundary xp = 450', () => {
      expect(getTier(450)).toBe('titan');
    });

    it('returns titan for very high xp', () => {
      expect(getTier(9999)).toBe('titan');
    });
  });

  describe('resolveSkillTier — alias for getTier', () => {
    it('resolveSkillTier is identical to getTier', () => {
      expect(resolveSkillTier(0)).toBe(getTier(0));
      expect(resolveSkillTier(150)).toBe(getTier(150));
      expect(resolveSkillTier(450)).toBe(getTier(450));
    });
  });

  describe('getTierRank', () => {
    it('returns rank 1 for apprentice (lowest)', () => {
      expect(getTierRank('apprentice')).toBe(1);
    });

    it('returns rank 7 for titan (highest)', () => {
      expect(getTierRank('titan')).toBe(7);
    });

    it('returns strictly increasing ranks', () => {
      const tiers = ['apprentice', 'journeyman', 'expert', 'artisan', 'grandmaster', 'legendary', 'titan'] as const;
      for (let i = 1; i < tiers.length; i++) {
        expect(getTierRank(tiers[i])).toBeGreaterThan(getTierRank(tiers[i - 1]));
      }
    });
  });

  describe('getTierDefinition', () => {
    it('returns the full definition for a valid tier', () => {
      const def = getTierDefinition('expert');
      expect(def.tier).toBe('expert');
      expect(def.rank).toBe(3);
      expect(def.minXp).toBe(150);
      expect(def.maxXp).toBe(225);
    });

    it('throws for unknown tier name', () => {
      expect(() => getTierDefinition('unknown' as never)).toThrow();
    });
  });

  describe('tierSatisfies — [A5] VS6 eligibility gate [P4]', () => {
    it('returns true when granted tier equals required tier', () => {
      expect(tierSatisfies('expert', 'expert')).toBe(true);
    });

    it('returns true when granted tier is higher than required', () => {
      expect(tierSatisfies('artisan', 'expert')).toBe(true);
      expect(tierSatisfies('titan', 'apprentice')).toBe(true);
      expect(tierSatisfies('legendary', 'grandmaster')).toBe(true);
    });

    it('returns false when granted tier is lower than required', () => {
      expect(tierSatisfies('apprentice', 'journeyman')).toBe(false);
      expect(tierSatisfies('journeyman', 'expert')).toBe(false);
      expect(tierSatisfies('grandmaster', 'legendary')).toBe(false);
    });

    it('apprentice never satisfies anything higher', () => {
      expect(tierSatisfies('apprentice', 'journeyman')).toBe(false);
      expect(tierSatisfies('apprentice', 'titan')).toBe(false);
    });

    it('titan satisfies all tiers', () => {
      const allTiers = ['apprentice', 'journeyman', 'expert', 'artisan', 'grandmaster', 'legendary', 'titan'] as const;
      allTiers.forEach((tier) => {
        expect(tierSatisfies('titan', tier)).toBe(true);
      });
    });
  });
});
