/**
 * Module: i-user-skill-repository.ts
 * Purpose: UserSkillRepository domain port (L9)
 * Per docs/architecture/guidelines/infrastructure-spec.md §2.
 */

import type { AggregateRepository, QueryOptions } from './i-aggregate-repository';

/** L6 UserSkill aggregate (aligned with domain-model.md §Aggregate 4). */
export interface UserSkill {
  readonly aggregateId: string;
  readonly userId: string;
  readonly skillId: string;
  readonly xpTotal: number;
  readonly version: number;
}

/** L6 SkillMintLog entity within UserSkill aggregate. */
export interface SkillMintLog {
  readonly mintLogId: string;
  readonly userId: string;
  readonly skillId: string;
  readonly stage: 'declared' | 'practicing' | 'under_validation' | 'validated' | 'settled';
  readonly declaredAt: string;
  readonly version: number;
}

export interface UserSkillRepository extends AggregateRepository<UserSkill> {
  findByUserAndSkill(userId: string, skillId: string): Promise<UserSkill | null>;
  findSkillMintLogById(mintLogId: string): Promise<SkillMintLog | null>;
  findByWorkspaceId(workspaceId: string, opts?: QueryOptions): Promise<UserSkill[]>;
}
