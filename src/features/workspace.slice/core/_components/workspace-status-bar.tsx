// [職責] 顯示 Mounted/Isolated 狀態
"use client";

import { AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { Badge } from "@/shadcn-ui/badge";

import { useWorkspace } from "./workspace-provider";

export function WorkspaceStatusBar() {
  const {
    workspace,
    hasBlockedWorkflows,
    blockedWorkflowCount,
    totalBlockedByCount,
  } = useWorkspace();
  const isVisible = workspace.visibility === "visible";
  const workflowStateBaseClass =
    "flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest";
  const workflowStateToneClass = hasBlockedWorkflows
    ? "border-destructive/30 bg-destructive/10 text-destructive"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary"
      >
        ID: {workspace.id.toUpperCase()}
      </Badge>
      <Badge
        variant="outline"
        className="flex items-center gap-1 bg-background/50 text-[9px] font-bold uppercase backdrop-blur-sm"
      >
        {isVisible ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
        {isVisible ? "Mounted" : "Isolated"}
      </Badge>
      <Badge
        variant="outline"
        className={`${workflowStateBaseClass} ${workflowStateToneClass}`}
      >
        {hasBlockedWorkflows ? (
          <AlertTriangle className="size-3.5" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
        {hasBlockedWorkflows
          ? `Blocked (${blockedWorkflowCount} workflows / ${totalBlockedByCount} blockers)`
          : "Flowing"}
      </Badge>
    </div>
  );
}
