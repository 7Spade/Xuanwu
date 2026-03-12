/**
 * shared.kernel/resilience-contract — SK_RESILIENCE_CONTRACT [S5]
 */

export interface RateLimitConfig {
  readonly perUserLimit: number;
  readonly perOrgLimit: number;
  readonly windowMs: number;
}

export interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly openDurationMs: number;
}

export interface BulkheadConfig {
  readonly sliceId: string;
  readonly maxConcurrency: number;
}

export interface ResilienceContract {
  readonly rateLimit: RateLimitConfig;
  readonly circuitBreaker: CircuitBreakerConfig;
  readonly bulkhead: BulkheadConfig;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  perUserLimit: 100,
  perOrgLimit: 1_000,
  windowMs: 60_000,
} as const;

export const DEFAULT_CIRCUIT_BREAKER: CircuitBreakerConfig = {
  failureThreshold: 5,
  openDurationMs: 30_000,
} as const;

export interface ImplementsResilienceContract {
  readonly implementsResilienceContract: true;
}
