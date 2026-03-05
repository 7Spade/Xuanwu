/**
 * Module: org-schedule-governance.rows
 * Purpose: Row components for schedule governance lists
 * Responsibilities: render proposal/confirmed rows and member assignment interactions
 * Constraints: deterministic logic, respect module boundaries
 */

'use client';

import { CheckCircle, Flag, UserPlus, Users, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import type { OrgEligibleMemberView } from '@/features/projection.bus';
import { tierSatisfies } from '@/features/shared-kernel';
import type { ScheduleItem, SkillRequirement } from '@/features/shared-kernel';
import { findSkill } from '@/shared/constants/skills';
import type { Timestamp } from '@/shared/ports';
import { Avatar, AvatarFallback } from '@/shared/shadcn-ui/avatar';
import { Badge } from '@/shared/shadcn-ui/badge';
import { Button } from '@/shared/shadcn-ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/shadcn-ui/command';
import { toast } from '@/shared/shadcn-ui/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/shadcn-ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/shadcn-ui/tooltip';

import { assignMember, updateScheduleItemStatus } from '../_actions';

function getSkillName(slug: string): string {
  return findSkill(slug)?.name ?? slug;
}

function AssignedMemberAvatars({ members }: { members: Array<{ id: string; name: string }> }) {
  if (members.length === 0) return null;
  return (
    <TooltipProvider>
      <div className="flex -space-x-1">
        {members.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <Avatar className="size-6 border-2 border-background">
                <AvatarFallback className="text-[9px] font-bold">{member.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{member.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function formatTimestamp(ts: Timestamp | string | undefined): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (typeof (ts as Timestamp).toDate === 'function') {
    return (ts as Timestamp).toDate().toLocaleDateString('zh-TW');
  }
  return String(ts);
}

function computeSkillMatch(
  member: OrgEligibleMemberView,
  skillRequirements?: SkillRequirement[]
): [number, number] {
  if (!skillRequirements || skillRequirements.length === 0) return [0, 0];
  const matched = skillRequirements.filter((req) => {
    const skill = member.skills.find((s) => s.skillId === req.tagSlug);
    if (!skill) return false;
    return tierSatisfies(skill.tier, req.minimumTier);
  }).length;
  return [matched, skillRequirements.length];
}

interface ProposalRowProps {
  item: ScheduleItem;
  orgMembers: Array<{ id: string; name: string }>;
  eligibleMembers: OrgEligibleMemberView[];
  orgId: string;
}

export function ProposalRow({ item, orgMembers, eligibleMembers, orgId }: ProposalRowProps) {
  const [openPopoverSlug, setOpenPopoverSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      const result = await updateScheduleItemStatus(orgId, item.id, 'OFFICIAL');
      if (result.success) {
        toast({ title: '排程已核准', description: `「${item.title}」已確認。` });
      } else {
        toast({ variant: 'destructive', title: '核准失敗', description: result.error.message });
      }
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
    }
  }, [orgId, item.id, item.title]);

  const handleAssignMember = useCallback(async (memberId: string) => {
    setLoading(true);
    try {
      const result = await assignMember(orgId, item.id, memberId);
      if (result.success) {
        const memberName = orgMembers.find((member) => member.id === memberId)?.name ?? '';
        toast({ title: '成員已指派', description: `${memberName} 已加入「${item.title}」。` });
      } else {
        toast({ variant: 'destructive', title: '指派失敗', description: result.error.message });
      }
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
      setOpenPopoverSlug(null);
    }
  }, [orgId, item.id, item.title, orgMembers]);

  const handleCancel = useCallback(async () => {
    setLoading(true);
    try {
      const result = await updateScheduleItemStatus(orgId, item.id, 'REJECTED');
      if (result.success) {
        toast({ title: '提案已取消', description: `「${item.title}」已由 HR 撤回。` });
      } else {
        toast({ variant: 'destructive', title: '取消失敗', description: result.error.message });
      }
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
    }
  }, [orgId, item.id, item.title]);

  const hasRequirements = (item.requiredSkills?.length ?? 0) > 0;
  const totalRequired = item.requiredSkills?.reduce((sum, requirement) => sum + (requirement.quantity ?? 1), 0) ?? 0;

  const assignedMembers = useMemo(() => {
    if (!item.assigneeIds?.length) return [];
    return item.assigneeIds.map((id) => ({
      id,
      name: orgMembers.find((member) => member.id === id)?.name ?? id,
    }));
  }, [item.assigneeIds, orgMembers]);

  const isFull = hasRequirements && assignedMembers.length >= totalRequired;
  const assignedIdSet = useMemo(() => new Set(item.assigneeIds ?? []), [item.assigneeIds]);

  const { fullMatch, partialMatch, noMatch } = useMemo(() => {
    const full: Array<{ id: string; name: string }> = [];
    const partial: Array<{ id: string; name: string; matched: number; total: number }> = [];
    const none: Array<{ id: string; name: string }> = [];

    for (const member of orgMembers) {
      if (assignedIdSet.has(member.id)) continue;
      if (!hasRequirements) {
        none.push(member);
        continue;
      }

      const view = eligibleMembers.find((entry) => entry.accountId === member.id);
      if (!view) {
        none.push(member);
        continue;
      }

      const [matched, total] = computeSkillMatch(view, item.requiredSkills);
      if (matched === total) full.push(member);
      else if (matched > 0) partial.push({ ...member, matched, total });
      else none.push(member);
    }

    return { fullMatch: full, partialMatch: partial, noMatch: none };
  }, [orgMembers, eligibleMembers, item.requiredSkills, hasRequirements, assignedIdSet]);

  const noSkillsPopoverId = 'no-skills';

  function MemberPickerPopover({ popoverId }: { popoverId: string }) {
    return (
      <Popover
        open={openPopoverSlug === popoverId}
        onOpenChange={(open) => setOpenPopoverSlug(open ? popoverId : null)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 text-muted-foreground hover:text-primary"
            disabled={loading}
          >
            <UserPlus className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="搜尋成員..." />
            <CommandList>
              <CommandEmpty>無符合成員</CommandEmpty>
              {hasRequirements ? (
                <>
                  {fullMatch.length > 0 && (
                    <CommandGroup heading={`✓ 全部符合技能（${fullMatch.length}）`}>
                      {fullMatch.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.name}
                          onSelect={() => handleAssignMember(member.id)}
                          className="text-xs"
                        >
                          <span className="mr-1 text-green-600">●</span>{member.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {partialMatch.length > 0 && (
                    <CommandGroup heading={`◑ 部分符合（${partialMatch.length}）`}>
                      {partialMatch.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.name}
                          onSelect={() => handleAssignMember(member.id)}
                          className="text-xs"
                        >
                          <span className="mr-1 text-amber-500">●</span>{member.name}
                          <span className="ml-auto text-[9px] font-bold text-amber-500">
                            {member.matched}/{member.total}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {noMatch.length > 0 && (
                    <CommandGroup heading={`其他成員（${noMatch.length}）`}>
                      {noMatch.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={member.name}
                          onSelect={() => handleAssignMember(member.id)}
                          className="text-xs text-muted-foreground"
                        >
                          {member.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              ) : (
                <CommandGroup>
                  {orgMembers
                    .filter((member) => !assignedIdSet.has(member.id))
                    .map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.name}
                        onSelect={() => handleAssignMember(member.id)}
                        className="text-xs"
                      >
                        {member.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {item.workspaceName ? (
              <>
                <span className="text-muted-foreground">{item.workspaceName}</span>
                <span className="mx-0.5 text-muted-foreground">-</span>
                {item.title}
              </>
            ) : (
              item.title
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(item.startDate as unknown as Timestamp)} – {formatTimestamp(item.endDate as unknown as Timestamp)}
          </p>
          {item.proposedBy && <p className="text-xs text-muted-foreground">提案人：{item.proposedBy}</p>}
        </div>
        <Badge variant="outline" className="shrink-0 text-[9px] uppercase tracking-widest">
          待指派
        </Badge>
      </div>

      {hasRequirements && (
        <div className="space-y-1" role="group" aria-label="所需技能">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground" aria-hidden="true">
              所需技能
            </p>
            <Badge variant="secondary" className="flex items-center gap-1 text-[9px]">
              <Users className="size-2.5" />
              共需 {item.requiredSkills!.reduce((sum, requirement) => sum + (requirement.quantity ?? 1), 0)} 人
            </Badge>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {item.requiredSkills?.map((requirement) => (
                <div key={requirement.tagSlug} className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {getSkillName(requirement.tagSlug)} × {requirement.quantity}
                  </Badge>
                  {!isFull && <MemberPickerPopover popoverId={requirement.tagSlug} />}
                </div>
              ))}
            </div>
            <AssignedMemberAvatars members={assignedMembers} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!hasRequirements && <MemberPickerPopover popoverId={noSkillsPopoverId} />}
        {!hasRequirements && <AssignedMemberAvatars members={assignedMembers} />}

        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-green-600 hover:text-green-700"
          disabled={loading}
          onClick={handleApprove}
          title="核准指派"
        >
          <CheckCircle className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-destructive hover:text-destructive/80"
          disabled={loading}
          onClick={handleCancel}
          title="取消提案"
        >
          <XCircle className="size-4" />
        </Button>
      </div>
    </div>
  );
}

interface ConfirmedRowProps {
  item: ScheduleItem;
  orgId: string;
  orgMembers: Array<{ id: string; name: string }>;
}

export function ConfirmedRow({ item, orgId, orgMembers }: ConfirmedRowProps) {
  const [loading, setLoading] = useState(false);

  const assignedMembers = useMemo(() => {
    if (!item.assigneeIds?.length) return [];
    return item.assigneeIds.map((id) => ({
      id,
      name: orgMembers.find((member) => member.id === id)?.name ?? id,
    }));
  }, [item.assigneeIds, orgMembers]);

  const hasRequirements = (item.requiredSkills?.length ?? 0) > 0;
  const totalRequired = item.requiredSkills?.reduce((sum, requirement) => sum + (requirement.quantity ?? 1), 0) ?? 0;

  const handleComplete = useCallback(async () => {
    setLoading(true);
    try {
      const result = await updateScheduleItemStatus(orgId, item.id, 'COMPLETED');
      if (result.success) {
        toast({ title: '排程已完成', description: `「${item.title}」標記完成成功。` });
      } else {
        toast({ variant: 'destructive', title: '操作失敗', description: result.error.message });
      }
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
    }
  }, [orgId, item.id, item.title]);

  return (
    <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-50/10 p-4 dark:bg-green-950/10">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {item.workspaceName ? (
              <>
                <span className="text-muted-foreground">{item.workspaceName}</span>
                <span className="mx-0.5 text-muted-foreground">-</span>
                {item.title}
              </>
            ) : (
              item.title
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(item.startDate as unknown as Timestamp)} – {formatTimestamp(item.endDate as unknown as Timestamp)}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 border-green-500/40 text-[9px] uppercase tracking-widest text-green-600">
          已確認
        </Badge>
      </div>

      {(hasRequirements || assignedMembers.length > 0) && (
        <div className="space-y-1">
          {hasRequirements && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">所需技能</p>
              <span className="text-[10px] text-muted-foreground">已指派 {assignedMembers.length} / {totalRequired} 人</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {item.requiredSkills?.map((requirement) => (
                <div key={requirement.tagSlug} className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {getSkillName(requirement.tagSlug)} × {requirement.quantity}
                  </Badge>
                </div>
              ))}
            </div>
            <AssignedMemberAvatars members={assignedMembers} />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 border-green-500/40 text-[10px] font-bold uppercase tracking-widest text-green-600 hover:bg-green-500/10"
          disabled={loading}
          onClick={handleComplete}
        >
          <Flag className="size-3" />
          標記完成
        </Button>
      </div>
    </div>
  );
}
