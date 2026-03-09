/**
 * Module: member-assign-popover.tsx
 * Purpose: Render a searchable member assignment popover for schedule items.
 * Responsibilities: encapsulate assign/unassign item action UI.
 * Constraints: deterministic logic, respect module boundaries
 */
"use client";

import { UserPlus, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shadcn-ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn-ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn-ui/popover";
import { cn } from "@/shadcn-ui/utils/utils";
import type { MemberReference, ScheduleItem } from "@/shared-kernel";

interface MemberAssignPopoverProps {
  item: ScheduleItem;
  members: MemberReference[];
  onAssign: (item: ScheduleItem, memberId: string) => void;
  onUnassign: (item: ScheduleItem, memberId: string) => void;
}

export function MemberAssignPopover({ item, members, onAssign, onUnassign }: MemberAssignPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-5 text-muted-foreground hover:text-primary">
          <UserPlus className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No matching members.</CommandEmpty>
            <CommandGroup heading="Assign Member">
              {members.map((member) => {
                const isAssigned = item.assigneeIds.includes(member.id);
                return (
                  <CommandItem
                    key={member.id}
                    value={member.name}
                    onSelect={() => {
                      if (isAssigned) {
                        onUnassign(item, member.id);
                      } else {
                        onAssign(item, member.id);
                      }
                    }}
                  >
                    <Check className={cn("mr-2 size-3", isAssigned ? "opacity-100" : "opacity-0")} />
                    {member.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
