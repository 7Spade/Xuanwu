/**
 * Module: i-idempotency-store.ts
 * Purpose: define SK_PORTS IdempotencyStore interface in shared-kernel (L9)
 * Responsibilities: abstract command deduplication and result caching
 * Constraints: deterministic logic, no infrastructure imports, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §4 IdempotencyStore.
 * Used at Step 2 and Step 8 of the L8 7-step Command Handler pattern.
 */

export interface IdempotencyStore {
  /**
   * Check for an existing result for the given idempotency key.
   * If no result exists, atomically acquire the lock for this key.
   *
   * @returns The cached result if the command was already processed,
   *          or null if the lock was acquired (command is safe to execute).
   * @throws If the key is already locked (in-flight duplicate request).
   */
  checkAndLock(key: string, ttlSeconds?: number): Promise<unknown | null>;

  /**
   * Store the result of a completed command.
   * Called at Step 8 of the L8 Command Handler pipeline after all side effects succeed.
   */
  setResult(key: string, result: unknown, ttlSeconds?: number): Promise<void>;

  /**
   * Release the lock for the given key without storing a result.
   * Called in the error path to allow retries after a transient failure.
   */
  releaseLock(key: string): Promise<void>;
}
