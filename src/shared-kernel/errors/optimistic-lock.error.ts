/**
 * Module: optimistic-lock.error.ts
 * Purpose: OptimisticLockException for aggregate write conflict detection (L9)
 * Responsibilities: provide a typed, HTTP-mappable exception for version conflicts
 * Constraints: no infrastructure imports, deterministic, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §5 OptimisticLockGuard.
 * Thrown at Step 4 of the L8 7-step Command Handler pattern when the aggregate
 * version in the command envelope does not match the stored aggregate version.
 * The gateway-command translates this to HTTP 409 Conflict.
 */

export class OptimisticLockException extends Error {
  /** HTTP status code to map this exception to. */
  readonly httpStatus = 409 as const;

  /** Machine-readable error code for gateway error translation. */
  readonly code = 'OPTIMISTIC_LOCK_CONFLICT' as const;

  /** The aggregate ID involved in the conflict. */
  readonly aggregateId: string;

  /** The version the command expected. */
  readonly expectedVersion: number;

  /** The version currently stored for the aggregate. */
  readonly actualVersion: number;

  constructor(aggregateId: string, expectedVersion: number, actualVersion: number) {
    super(
      `Optimistic lock conflict on aggregate "${aggregateId}": ` +
        `expected version ${expectedVersion}, but found ${actualVersion}.`,
    );
    this.name = 'OptimisticLockException';
    this.aggregateId = aggregateId;
    this.expectedVersion = expectedVersion;
    this.actualVersion = actualVersion;
  }
}
