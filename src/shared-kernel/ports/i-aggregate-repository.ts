/**
 * Module: i-aggregate-repository.ts
 * Purpose: define base AggregateRepository port interface (L9)
 * Responsibilities: abstract aggregate persistence operations
 * Constraints: no infrastructure imports, deterministic, respect module boundaries
 *
 * Per docs/architecture/guidelines/infrastructure-spec.md §2 Repository.
 */

export interface QueryOptions {
  readonly limit?: number;
  readonly cursor?: string;
  readonly orderBy?: string;
  readonly direction?: 'asc' | 'desc';
}

export interface AggregateRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  /** Save aggregate; implementation MUST increment version and collect domain events. */
  save(aggregate: T): Promise<void>;
  findByWorkspaceId(workspaceId: string, opts?: QueryOptions): Promise<T[]>;
}
