/**
 * shared.kernel/read-consistency — SK_READ_CONSISTENCY [S3]
 */

export type ReadConsistencyMode = 'STRONG_READ' | 'EVENTUAL_READ';

export interface ReadConsistencyContext {
  readonly isFinancial: boolean;
  readonly isSecurity: boolean;
  readonly isIrreversible: boolean;
}

export function resolveReadConsistency(ctx: ReadConsistencyContext): ReadConsistencyMode {
  return (ctx.isFinancial || ctx.isSecurity || ctx.isIrreversible)
    ? 'STRONG_READ'
    : 'EVENTUAL_READ';
}

export interface ImplementsReadConsistency {
  readonly readConsistencyMode: ReadConsistencyMode;
}
