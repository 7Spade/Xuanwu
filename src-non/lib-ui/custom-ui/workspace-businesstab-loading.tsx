/**
 * Module: workspace-businesstab-loading
 * Purpose: Provide unified skeleton presets for workspace business-tab route boundaries.
 * Responsibilities: centralize loading optics and keep parallel-route placeholders consistent.
 * Constraints: deterministic logic, respect module boundaries
 */
import { RouteStreamShell } from "@/lib-ui/custom-ui/route-stream-shell";
import { Skeleton } from "@/shadcn-ui/skeleton";

export type WorkspaceBusinessTabLoadingPreset =
  | "overview"
  | "members"
  | "schedule"
  | "tasks"
  | "qualityAssurance"
  | "acceptance"
  | "issues"
  | "files"
  | "audit"
  | "finance"
  | "capabilities"
  | "documentParser"
  | "daily";

interface WorkspaceBusinessTabLoadingProps {
  preset: WorkspaceBusinessTabLoadingPreset;
}

export function WorkspaceBusinessTabLoading({
  preset,
}: WorkspaceBusinessTabLoadingProps) {
  return <RouteStreamShell className="space-y-4 pt-4">{renderPreset(preset)}</RouteStreamShell>;
}

function renderPreset(preset: WorkspaceBusinessTabLoadingPreset) {
  switch (preset) {
    case "overview":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <Skeleton className="h-56 w-full" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24 opacity-90" />
            <Skeleton className="h-24 opacity-80" />
          </div>
        </>
      );
    case "members":
      return (
        <>
          <Skeleton className="h-9 w-72" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </>
      );
    case "schedule":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="flex gap-4">
            <Skeleton className="h-96 flex-1" />
            <Skeleton className="h-96 w-64" />
          </div>
        </>
      );
    case "tasks":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </>
      );
    case "qualityAssurance":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </>
      );
    case "acceptance":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </>
      );
    case "issues":
      return (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-2/5" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </>
      );
    case "files":
      return (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-2/5" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      );
    case "audit":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </>
      );
    case "finance":
      return (
        <>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-7 w-2/5" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      );
    case "capabilities":
      return (
        <>
          <Skeleton className="h-7 w-2/5" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </>
      );
    case "documentParser":
      return (
        <>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-7 w-2/5" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      );
    case "daily":
      return (
        <>
          <Skeleton className="h-24 w-full" />
          <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
            <Skeleton className="h-48 w-full break-inside-avoid" />
            <Skeleton className="h-32 w-full break-inside-avoid" />
            <Skeleton className="h-56 w-full break-inside-avoid" />
            <Skeleton className="h-40 w-full break-inside-avoid" />
          </div>
        </>
      );
  }
}
