/**
 * Module: query.port.ts
 * Purpose: Define VS6 read-side query port contracts.
 * Responsibilities: Describe schedule/timeline reads through L6 gateway-facing interfaces.
 * Constraints: deterministic logic, respect module boundaries
 */

import type {
  ScheduleItem,
  ScheduleStatus,
} from '@/shared-kernel';

import type {
  AccountScheduleAssignment,
  AccountScheduleProjection,
} from '../domain.application/_projectors/_runtime/_account-schedule';
import type { OrgEligibleMemberView, OrgMemberSkillWithTier } from '../domain.application/_queries';

export type QueryUnsubscribe = () => void;

export interface SchedulingQueryPort {
  getScheduleItems(accountId: string, workspaceId?: string): Promise<ScheduleItem[]>;
  getOrgScheduleItem(orgId: string, scheduleItemId: string): Promise<ScheduleItem | null>;
  subscribeToOrgScheduleProposals(
    orgId: string,
    onUpdate: (items: ScheduleItem[]) => void,
    opts?: { status?: ScheduleStatus; maxItems?: number }
  ): QueryUnsubscribe;
  subscribeToPendingProposals(orgId: string, onUpdate: (items: ScheduleItem[]) => void): QueryUnsubscribe;
  subscribeToConfirmedProposals(orgId: string, onUpdate: (items: ScheduleItem[]) => void): QueryUnsubscribe;
  getAccountScheduleProjection(accountId: string): Promise<AccountScheduleProjection | null>;
  getAccountActiveAssignments(accountId: string): Promise<AccountScheduleAssignment[]>;
  subscribeToWorkspaceScheduleItems(
    dimensionId: string,
    workspaceId: string,
    onUpdate: (items: ScheduleItem[]) => void,
    onError?: (err: Error) => void
  ): QueryUnsubscribe;
  getEligibleMemberForSchedule(orgId: string, accountId: string): Promise<OrgEligibleMemberView | null>;
  getEligibleMembersForSchedule(orgId: string): Promise<OrgEligibleMemberView[]>;
}

export type { OrgEligibleMemberView, OrgMemberSkillWithTier };
