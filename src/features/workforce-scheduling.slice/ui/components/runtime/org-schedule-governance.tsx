'use client';

/**
 * workforce-scheduling.slice ??_components/org-schedule-governance.tsx
 *
 * Org HR governance panel for reviewing and acting on schedule items.
 *
 * Single source of truth: accounts/{orgId}/schedule_items.
 * Reads the same collection as the Calendar tab ??all three schedule tabs
 * (Calendar, DemandBoard, HR Governance) are always consistent.
 *
 * Status mapping:
 *   PROPOSAL   ??待核??(pending assignment / amber)
 *   OFFICIAL   ??已確�?(assigned, can be marked complete / green)
 *   COMPLETED  ??hidden (completed)
 *   REJECTED   ??hidden (cancelled/rejected)
 *
 * FR-S6: Confirmed proposals section ??HR marks confirmed assignments as completed.
 * FR-W2: Skill match indicators ??show per-member skill match against item requirements.
 */

import { useEffect, useMemo, useState } from 'react';

import { useApp } from '@/app-runtime/providers/app-provider';
import { useAccount } from '@/features/workspace.slice';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn-ui/card';
import { PageHeader } from '@/shadcn-ui/custom-ui/page-header';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shadcn-ui/empty';
import { ScrollArea } from '@/shadcn-ui/scroll-area';
import type { ScheduleItem } from '@/shared-kernel';

import { getEligibleMembersForSchedule, type OrgEligibleMemberView } from '../../../application/queries';
import { ConfirmedRow, ProposalRow } from './org-schedule-governance.rows';

// ---------------------------------------------------------------------------
// Main governance panel
// ---------------------------------------------------------------------------

/**
 * Org HR governance panel.
 *
 * Reads accounts/{orgId}/schedule_items via useAccount() ??same collection as
 * Calendar and DemandBoard ??so all three tabs are always in sync.
 *
 * Shows:
 *   PROPOSAL items  ??assign or cancel (待核??
 *   OFFICIAL items  ??mark complete (已確�? FR-S6)
 *   REJECTED/COMPLETED ??hidden
 */
export function OrgScheduleGovernance() {
  const { state: appState } = useApp();
  const { activeAccount, accounts } = appState;
  const { state: accountState } = useAccount();

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null;

  const allItems = useMemo(
    () => Object.values(accountState.schedule_items),
    [accountState.schedule_items]
  );

  const pending = useMemo(
    () => allItems.filter((i) => i.status === 'PROPOSAL'),
    [allItems]
  );
  const confirmed = useMemo(
    () => allItems.filter((i) => i.status === 'OFFICIAL'),
    [allItems]
  );

  const orgMembers = useMemo(() => {
    if (!orgId) return [];
    const org = accounts[orgId];
    return (org?.members ?? []).map((m: { id: string; name: string }) => ({ id: m.id, name: m.name }));
  }, [orgId, accounts]);

  const [eligibleMembers, setEligibleMembers] = useState<OrgEligibleMemberView[]>([]);
  useEffect(() => {
    if (!orgId) return;
    getEligibleMembersForSchedule(orgId)
      .then(setEligibleMembers)
      .catch(() => setEligibleMembers([]));
  }, [orgId]);

  if (!orgId) {
    return (
      <Empty className="rounded-xl border-muted/40 bg-muted/5 py-12">
        <EmptyHeader>
          <EmptyTitle>?��?組�?帳�?</EmptyTitle>
          <EmptyDescription>組�?層�???HR ?��?治�??�在組�?帳�?下可?��?</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        size="compact"
        title="HR ?��?治�?"
        description={`待核??${pending.length} 筆・已確�?${confirmed.length} 筆`}
      />

      <Card className="flex h-full flex-col">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm font-semibold">?��??��?派�???</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-4">
              {pending.length === 0 && confirmed.length === 0 && (
                <Empty className="rounded-xl border-muted/40 bg-muted/5 py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">??</EmptyMedia>
                    <EmptyTitle>?��??��??��??��?</EmptyTitle>
                    <EmptyDescription>?��??��??��??�出?�在?�裡，�? HR ?�派?�核?��?</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            {pending.map((item: ScheduleItem) => (
              <ProposalRow
                key={item.id}
                item={item}
                orgMembers={orgMembers}
                eligibleMembers={eligibleMembers}
                orgId={orgId}
              />
            ))}

            {/* FR-S6 ??Confirmed section */}
            {confirmed.length > 0 && (
              <div className="border-t pt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  已確認�?�????��?記�???
                </p>
                {confirmed.map((item: ScheduleItem) => (
                  <ConfirmedRow
                    key={item.id}
                    item={item}
                    orgId={orgId}
                    orgMembers={orgMembers}
                  />
                ))}
              </div>
            )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
