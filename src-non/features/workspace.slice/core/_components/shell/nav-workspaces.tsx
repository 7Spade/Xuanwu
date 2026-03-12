
"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";
import Link from "next/link";

import type { Workspace } from "@/features/workspace.slice/core/_types";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/shadcn-ui/sidebar";


interface NavWorkspacesProps {
  workspaces: Workspace[];
  pathname: string;
  t: (key: string) => string;
}

const QUICK_ACCESS_VISIBLE_LIMIT = 10;

export function NavWorkspaces({ workspaces, pathname, t }: NavWorkspacesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (workspaces.length === 0) {
    return null;
  }

  const hasOverflow = workspaces.length > QUICK_ACCESS_VISIBLE_LIMIT;
  const visibleWorkspaces = hasOverflow && !isExpanded
    ? workspaces.slice(0, QUICK_ACCESS_VISIBLE_LIMIT)
    : workspaces;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
        {t('sidebar.quickAccess')}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleWorkspaces.map((workspace) => (
            <SidebarMenuItem key={workspace.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/workspaces/${workspace.id}`}
              >
                <Link href={`/workspaces/${workspace.id}`}>
                  <Terminal className="size-3 text-primary/60" />
                  <span className="truncate text-xs font-medium">{workspace.name}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge className="text-[8px] uppercase">
                {workspace.id.slice(-3).toUpperCase()}
              </SidebarMenuBadge>
            </SidebarMenuItem>
          ))}
          {hasOverflow ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsExpanded((prev) => !prev)}
                className="justify-center text-xs"
              >
                <span>{isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
