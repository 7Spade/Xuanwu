/**
 * shared.kernel/token-refresh-contract — SK_TOKEN_REFRESH_CONTRACT [S6]
 */

export type ClaimsRefreshTrigger = 'RoleChanged' | 'PolicyChanged';

export const TOKEN_REFRESH_SIGNAL = 'TOKEN_REFRESH_SIGNAL' as const;
export type TokenRefreshSignal = typeof TOKEN_REFRESH_SIGNAL;

export type ClaimsRefreshOutcome = 'success' | 'failure';

export interface ClaimsRefreshHandshake {
  readonly trigger: ClaimsRefreshTrigger;
  readonly accountId: string;
  readonly outcome: ClaimsRefreshOutcome;
  readonly completedAt: string;
  readonly traceId: string;
}

export interface ClientTokenRefreshObligation {
  readonly signal: TokenRefreshSignal;
  readonly action: 'force_refresh_and_reattach';
}

export const CLIENT_TOKEN_REFRESH_OBLIGATION: ClientTokenRefreshObligation = {
  signal: TOKEN_REFRESH_SIGNAL,
  action: 'force_refresh_and_reattach',
} as const;

export interface ImplementsTokenRefreshContract {
  readonly implementsTokenRefreshContract: true;
}
