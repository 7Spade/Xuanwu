/**
 * Module: gov.semantic/_types
 * Purpose: Domain contracts for organization semantic dictionaries — shim for backward compatibility.
 * Responsibilities: Re-export types from centralized location.
 * Constraints: deterministic logic, respect module boundaries
 *
 * @deprecated 🛑 型別定義已集中管理。
 * 請優先從 `@/shared-kernel/types` 引用。
 * 定義位置：src/shared-kernel/types/organization-semantic.ts
 */
export type {
  OrgSemanticNamespace,
  OrgSkillTypeEntry,
  OrgTaskTypeEntry,
  OrgSemanticEntry,
  ResolveOrgTaskTypeInput,
  ResolvedOrgTaskType,
} from '@/shared-kernel/types/organization-semantic';
