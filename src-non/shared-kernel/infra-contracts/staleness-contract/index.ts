/**
 * shared.kernel/staleness-contract — SK_STALENESS_CONTRACT [S4]
 */

export const StalenessMs = {
  TAG_MAX_STALENESS: 30_000,
  PROJ_STALE_CRITICAL: 500,
  PROJ_STALE_STANDARD: 10_000,
  PROJ_STALE_DEMAND_BOARD: 5_000,
} as const;

export type StalenessTier = 'TAG' | 'CRITICAL' | 'STANDARD' | 'DEMAND_BOARD';

export function getSlaMs(tier: StalenessTier): number {
  switch (tier) {
    case 'TAG':
      return StalenessMs.TAG_MAX_STALENESS;
    case 'CRITICAL':
      return StalenessMs.PROJ_STALE_CRITICAL;
    case 'STANDARD':
      return StalenessMs.PROJ_STALE_STANDARD;
    case 'DEMAND_BOARD':
      return StalenessMs.PROJ_STALE_DEMAND_BOARD;
  }
}

export function isStale(ageMs: number, tier: StalenessTier): boolean {
  return ageMs > getSlaMs(tier);
}

export interface ImplementsStalenessContract {
  readonly stalenessTier: StalenessTier;
}
