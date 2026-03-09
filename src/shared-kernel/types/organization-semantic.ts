/**
 * Module: organization-semantic.ts
 * Purpose: Centralized organization semantic dictionary domain type definitions.
 * Responsibilities: OrgSemanticEntry, task-type and skill-type dictionary entities managed by VS4.
 * Constraints: deterministic logic, respect module boundaries
 */

import type { SkillRequirement } from '@/shared-kernel/data-contracts/skill-tier';

export type OrgSemanticNamespace = 'task-type' | 'skill-type';

interface OrgSemanticDictionaryBase {
  orgId: string;
  slug: string;
  name: string;
  aliases: string[];
  description?: string;
  active: boolean;
  addedBy: string;
  addedAt: string;
  updatedAt?: string;
}

export interface OrgSkillTypeEntry extends OrgSemanticDictionaryBase {
  namespace: 'skill-type';
}

export interface OrgTaskTypeEntry extends OrgSemanticDictionaryBase {
  namespace: 'task-type';
  requiredSkills: SkillRequirement[];
}

export type OrgSemanticEntry = OrgSkillTypeEntry | OrgTaskTypeEntry;

export interface ResolveOrgTaskTypeInput {
  orgId: string;
  itemName: string;
}

export interface ResolvedOrgTaskType {
  taskTypeSlug: string;
  taskTypeName: string;
  requiredSkills: SkillRequirement[];
}
