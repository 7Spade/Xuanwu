/**
 * Module: i-feed-projection-repository.ts
 * Purpose: FeedProjectionRepository read-model port (L9)
 * Per docs/architecture/guidelines/infrastructure-spec.md §2.
 * NOTE: This is a read model — it does NOT extend AggregateRepository.
 */

export interface FeedProjection {
  readonly projectionId: string;
  readonly sourcePostId: string;
  readonly orgId: string;
  readonly authorId: string;
  readonly title: string;
  readonly publishedAt: string;
  readonly hidden: boolean;
}

export interface FeedProjectionRepository {
  upsert(projection: FeedProjection): Promise<void>;
  hide(sourcePostId: string): Promise<void>;
  findByOrgId(orgId: string, cursor?: string, limit?: number): Promise<FeedProjection[]>;
}
